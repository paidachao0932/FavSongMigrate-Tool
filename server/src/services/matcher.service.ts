import uFuzzy from '@leeoniya/ufuzzy';
import type { Song, SearchQuery, SearchResult } from '../types/adapter.js';
import { normalize } from '../utils/normalize.js';

const uf = new uFuzzy({ intraMode: 1 });

const CONFIDENCE_THRESHOLD = 0.55;

/**
 * Score a candidate song against the query.
 * Returns confidence between 0 and 1.
 */
function scoreCandidate(query: SearchQuery, candidate: Song): number {
  const qTitle = normalize(query.title);
  const qArtist = normalize(query.artist);
  const cTitle = normalize(candidate.title);
  const cArtist = normalize(candidate.artist);

  // Exact match
  if (qTitle === cTitle && qArtist === cArtist) return 1.0;

  // Title exact, artist fuzzy
  if (qTitle === cTitle) {
    const haystack = [cArtist];
    const [_idxs, info] = uf.filter(haystack, qArtist);
    if (info && _idxs && _idxs.length > 0) return 0.85;
  }

  // Combined fuzzy
  const haystack = [`${cTitle} ${cArtist}`];
  const [_idxs, info] = uf.filter(haystack, `${qTitle} ${qArtist}`);
  if (info && _idxs && _idxs.length > 0) return 0.7;

  // Title-only fuzzy
  const [tIdxs, tInfo] = uf.filter([cTitle], qTitle);
  if (tInfo && tIdxs && tIdxs.length > 0) return 0.5;

  return 0;
}

/**
 * Match a single search query against candidate songs from the platform.
 */
export function matchSong(query: SearchQuery, candidates: Song[]): SearchResult {
  if (candidates.length === 0) {
    return { query, matched: false, confidence: 0, candidates: [], bestMatch: null, duplicate: false };
  }

  let bestScore = 0;
  let bestSong: Song | null = null;

  for (const c of candidates) {
    const score = scoreCandidate(query, c);
    if (score > bestScore) {
      bestScore = score;
      bestSong = c;
    }
    if (score === 1.0) break;
  }

  const matched = bestScore >= CONFIDENCE_THRESHOLD;

  return {
    query,
    matched,
    confidence: bestScore,
    candidates,
    bestMatch: matched ? bestSong : null,
    duplicate: false,
  };
}

/**
 * Check if a song exists in the user's favorites list.
 */
export function checkDuplicate(query: SearchQuery, favorites: Song[]): boolean {
  const qTitle = normalize(query.title);
  const qArtist = normalize(query.artist);

  for (const fav of favorites) {
    const fTitle = normalize(fav.title);
    const fArtist = normalize(fav.artist);

    if (qTitle === fTitle && qArtist === fArtist) return true;

    // Title match + artist fuzzy
    if (qTitle === fTitle && uf.filter([fArtist], qArtist)[0]?.length) return true;
  }

  return false;
}

/**
 * Batch match: mark each song as duplicate or not, then search and match.
 */
export function batchCheckDuplicates(
  queries: SearchQuery[],
  favorites: Song[]
): SearchResult[] {
  return queries.map((q) => ({
    query: q,
    matched: false,
    confidence: 0,
    candidates: [],
    bestMatch: null,
    duplicate: checkDuplicate(q, favorites),
  }));
}
