import { Request, Response } from 'express';
import { getAdapter } from '../adapters/adapter-registry.js';
import { matchSong } from '../services/matcher.service.js';
import type { BatchSearchRequest, BatchSearchResponse } from '../types/api.js';

export async function batchSearch(req: Request, res: Response) {
  const { platform } = req.params;
  const { songs, cookie } = req.body as BatchSearchRequest;
  const adapter = getAdapter(platform);
  if (!adapter) return res.status(404).json({ error: '平台不存在' });

  const results: BatchSearchResponse['results'] = [];

  for (const song of songs) {
    try {
      const candidates = await adapter.searchSongs(
        { title: song.title, artist: song.artist || '' },
        cookie,
        10
      );
      const result = matchSong(
        { title: song.title, artist: song.artist || '' },
        candidates
      );
      results.push({
        query: { title: song.title, artist: song.artist || '' },
        matched: result.matched,
        confidence: result.confidence,
        bestMatch: result.bestMatch
          ? {
              platformId: result.bestMatch.platformId,
              title: result.bestMatch.title,
              artist: result.bestMatch.artist,
              album: result.bestMatch.album,
            }
          : null,
        duplicate: false,
      });
    } catch {
      results.push({
        query: { title: song.title, artist: song.artist || '' },
        matched: false,
        confidence: 0,
        bestMatch: null,
        duplicate: false,
      });
    }
  }

  res.json({ results } satisfies BatchSearchResponse);
}
