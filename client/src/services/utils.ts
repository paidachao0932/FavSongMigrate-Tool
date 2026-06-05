/**
 * Check if a string looks like a duration (e.g., "3:45", "04:12")
 */
export function isDuration(s: string): boolean {
  return /^\d{1,2}:\d{2}(:\d{2})?$/.test(s.trim());
}

/**
 * Check if a string looks like metadata (track number, date, count headers)
 */
export function isMetadata(s: string): boolean {
  const trimmed = s.trim();
  if (/^\d+\.?\s*$/.test(trimmed)) return true;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return true;
  if (/^\d+\s*(首|首歌曲|个视频|个歌单)/.test(trimmed)) return true;
  return false;
}
