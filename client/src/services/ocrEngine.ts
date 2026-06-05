import { createWorker, type Worker } from 'tesseract.js';
import { isDuration, isMetadata } from './utils';

let worker: Worker | null = null;

/**
 * Initialize the Tesseract worker (lazy singleton).
 */
async function getWorker(): Promise<Worker> {
  if (!worker) {
    worker = await createWorker('chi_sim+eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const progress = Math.round(m.progress * 100);
          onProgressCallback?.(progress);
        }
      },
    });
    await worker.setParameters({
      tessedit_char_whitelist: undefined,
      preserve_interword_spaces: '1',
    });
  }
  return worker;
}

let onProgressCallback: ((p: number) => void) | null = null;

/**
 * Preprocess an image file for better OCR:
 * - Resize to max 2000px wide (maintaining aspect ratio)
 * - Convert to grayscale
 * - Enhance contrast
 */
async function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);

      // Resize if too wide
      let { width, height } = img;
      const MAX = 2000;
      if (width > MAX) {
        height = Math.round(height * (MAX / width));
        width = MAX;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      // Sharp downscale
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to grayscale + contrast enhance
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Find min/max brightness for auto-contrast
      let min = 255, max = 0;
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        if (gray < min) min = gray;
        if (gray > max) max = gray;
      }

      const range = max - min || 1;
      for (let i = 0; i < data.length; i += 4) {
        let gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        // Auto-contrast stretch
        gray = ((gray - min) / range) * 255;
        // Slight threshold for sharper text
        gray = gray < 100 ? 0 : gray > 200 ? 255 : gray;
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
      ctx.putImageData(imageData, 0, 0);

      resolve(canvas.toDataURL('image/png'));
    };
    img.src = url;
  });
}

/**
 * Parse raw OCR text into song entries: { title, artist }.
 * Tries multiple heuristics.
 */
function parseOcrText(raw: string): { title: string; artist: string }[] {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !isDuration(l) && !isMetadata(l));

  const songs: { title: string; artist: string }[] = [];

  // Strategy 1: Look for "title - artist" pattern
  const dashLine = /^(.{1,60})\s*[-–—]\s*(.{1,40})$/;
  const remaining: string[] = [];

  for (const line of lines) {
    const m = line.match(dashLine);
    if (m) {
      songs.push({ title: m[1].trim(), artist: m[2].trim() });
    } else {
      remaining.push(line);
    }
  }

  // Strategy 2: Pair lines (every 2 non-metadata lines = title + artist)
  const paired: string[] = [];
  for (const line of remaining) {
    // Skip lines that look like UI elements
    if (
      /^(播放|收藏|下载|分享|歌曲|歌手|专辑|时长|全部播放|随机播放|单曲循环)/.test(line) ||
      /^(歌单|列表|音乐|排行榜|推荐|热门|最新)/.test(line) ||
      /^\d+首/.test(line)
    ) {
      continue;
    }
    paired.push(line);
  }

  for (let i = 0; i < paired.length - 1; i += 2) {
    // Heuristic: title usually has more Chinese chars, artist may have English
    const a = paired[i];
    const b = paired[i + 1];
    // Skip if either looks like not a song
    if (a.length > 60 || b.length > 40) continue;
    if (isDuration(a) || isDuration(b)) continue;
    songs.push({ title: a, artist: b });
  }

  return songs;
}

/**
 * Run OCR on a list of image files.
 * Returns recognized songs with unique IDs.
 */
export async function runOCR(
  files: File[],
  onProgress?: (p: number) => void
): Promise<{ id: string; title: string; artist: string }[]> {
  onProgressCallback = onProgress || null;
  const w = await getWorker();

  const allSongs: { id: string; title: string; artist: string }[] = [];
  let idx = 0;

  for (const file of files) {
    const preprocessed = await preprocessImage(file);
    const { data } = await w.recognize(preprocessed);

    const songs = parseOcrText(data.text);
    for (const s of songs) {
      allSongs.push({ id: `song-${idx++}`, ...s });
    }
  }

  return allSongs;
}

/**
 * Terminate the OCR worker to free memory.
 */
export async function terminateOCR(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
