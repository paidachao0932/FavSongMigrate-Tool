/**
 * Normalize a string for comparison:
 * - lowercase
 * - full-width to half-width
 * - remove common punctuation and whitespace
 * - trim
 */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[！-～]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
    )
    .replace(/[《》「」『』【】""''、，。；：？！—…·\s\-_/\\|()（）\[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if a string looks like a duration (e.g., "3:45", "04:12")
 */
export function isDuration(s: string): boolean {
  return /^\d{1,2}:\d{2}(:\d{2})?$/.test(s.trim());
}

/**
 * Check if a string looks like metadata (track number, date, etc.)
 */
export function isMetadata(s: string): boolean {
  const trimmed = s.trim();
  if (/^\d+\.?\s*$/.test(trimmed)) return true; // Just a number
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return true; // Date
  if (/^\d+\s*(首|首歌曲|个视频|个歌单)/.test(trimmed)) return true; // Count headers
  return false;
}
