import type { IPlatformAdapter, Song, SearchQuery, SearchResult } from '../types/adapter.js';
import type { MigrateRequest, MigrateResponse } from '../types/api.js';
import { matchSong, checkDuplicate, batchCheckDuplicates } from './matcher.service.js';

/**
 * For each query, search the platform, score candidates, and pick the best match.
 */
async function searchAll(
  adapter: IPlatformAdapter,
  queries: SearchQuery[],
  cookie: string,
  onProgress?: (done: number, total: number) => void
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    try {
      const candidates = await adapter.searchSongs(q, cookie, 10);
      const result = matchSong(q, candidates);
      results.push(result);
    } catch {
      results.push({
        query: q,
        matched: false,
        confidence: 0,
        candidates: [],
        bestMatch: null,
        duplicate: false,
      });
    }
    onProgress?.(i + 1, queries.length);
  }

  return results;
}

/**
 * Full migration pipeline:
 * 1. Fetch user favorites
 * 2. Mark duplicates
 * 3. Search & match on platform
 * 4. Create playlist
 * 5. Add matched songs
 */
export async function migrate(
  adapter: IPlatformAdapter,
  req: MigrateRequest
): Promise<MigrateResponse> {
  const { songs, playlistName, cookie, skipDuplicates } = req;

  const queries: SearchQuery[] = songs.map((s) => ({
    title: s.title.trim(),
    artist: (s.artist || '').trim(),
  }));

  // 1. Fetch user favorites for duplicate detection
  let favorites: Song[] = [];
  try {
    favorites = await adapter.getUserFavorites(cookie, 0, 2000);
  } catch {
    // Non-critical: proceed without duplicate detection
    console.warn('Failed to fetch user favorites, skipping duplicate detection.');
  }

  // 2. Mark duplicates
  const dupResults = batchCheckDuplicates(queries, favorites);

  // 3. Determine which songs to search (skip duplicates if requested)
  const toSearch = skipDuplicates
    ? queries.filter((_, i) => !dupResults[i].duplicate)
    : queries;

  const searchResults = await searchAll(adapter, toSearch, cookie);

  // 4. Merge duplicate info back into search results
  const allResults: SearchResult[] = queries.map((q, i) => {
    const dup = dupResults[i].duplicate;
    if (dup && skipDuplicates) {
      return dupResults[i];
    }
    const searched = searchResults.find(
      (r) => r.query.title === q.title && r.query.artist === q.artist
    );
    if (searched) {
      searched.duplicate = dup;
      return searched;
    }
    return dupResults[i];
  });

  // 5. Collect matched and non-duplicate song IDs
  const songIdsToAdd: string[] = [];
  const details: MigrateResponse['details'] = [];

  for (const r of allResults) {
    if (r.duplicate && skipDuplicates) {
      details.push({
        title: r.query.title,
        artist: r.query.artist,
        status: 'duplicate',
      });
    } else if (r.matched && r.bestMatch) {
      songIdsToAdd.push(r.bestMatch.platformId);
      details.push({
        title: r.query.title,
        artist: r.query.artist,
        status: 'imported',
        platformId: r.bestMatch.platformId,
      });
    } else {
      details.push({
        title: r.query.title,
        artist: r.query.artist,
        status: 'not_found',
      });
    }
  }

  // 6. Create playlist
  const playlistId = await adapter.createPlaylist(playlistName, cookie, false);

  // 7. Add songs to playlist (in batches of 500 due to platform limits)
  let imported = 0;
  const BATCH_SIZE = 500;
  for (let i = 0; i < songIdsToAdd.length; i += BATCH_SIZE) {
    const batch = songIdsToAdd.slice(i, i + BATCH_SIZE);
    const count = await adapter.addSongsToPlaylist(playlistId, batch, cookie);
    imported += count;
    // Small delay to avoid rate limiting
    if (i + BATCH_SIZE < songIdsToAdd.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return {
    playlistId,
    playlistName,
    total: queries.length,
    imported,
    skippedDuplicates: details.filter((d) => d.status === 'duplicate').length,
    notFound: details.filter((d) => d.status === 'not_found').length,
    details,
  };
}
