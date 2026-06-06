import { createWorker, type Worker } from 'tesseract.js';
import { logger } from '../utils/logger.js';
import { isDuration, isMetadata } from '../utils/normalize.js';

let worker: Worker | null = null;

export async function initWorker(): Promise<Worker> {
  return getWorker();
}

async function getWorker(): Promise<Worker> {
  if (!worker) {
    logger.info('Initializing Tesseract.js worker (chi_sim+eng)...');
    worker = await createWorker('chi_sim+eng', 1, {
      logger: (m) => {
        if (m.status === 'loading tesseract core' || m.status === 'loading language traineddata') {
          logger.debug(`OCR init: ${m.status} ${Math.round(m.progress * 100)}%`);
        }
      },
    });
    await worker.setParameters({
      preserve_interword_spaces: '1',
    });
    logger.info('Tesseract.js worker ready.');
  }
  return worker;
}

interface SongEntry {
  id: string;
  title: string;
  artist: string;
}

export async function ocrImages(files: Express.Multer.File[]): Promise<SongEntry[]> {
  const w = await getWorker();

  const allSongs: SongEntry[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    logger.info(`OCR processing image ${i + 1}/${files.length}: ${file.originalname}`);

    const { data } = await w.recognize(file.buffer);
    const songs = parseOcrText(data.text);

    for (const s of songs) {
      allSongs.push({ id: `song-${allSongs.length}`, ...s });
    }
  }

  logger.info(`OCR complete: ${allSongs.length} songs recognized`);
  return allSongs;
}

function parseOcrText(raw: string): { title: string; artist: string }[] {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !isDuration(l) && !isMetadata(l));

  const songs: { title: string; artist: string }[] = [];

  // Strategy 1: "title - artist"
  const dashLine = /^(.{1,80})\s*[-–—]\s*(.{1,50})$/;
  const remaining: string[] = [];

  for (const line of lines) {
    const m = line.match(dashLine);
    if (m) {
      songs.push({ title: m[1].trim(), artist: m[2].trim() });
    } else {
      remaining.push(line);
    }
  }

  // Strategy 2: pair lines (every 2 lines = title + artist)
  const paired: string[] = [];
  for (const line of remaining) {
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
    const a = paired[i];
    const b = paired[i + 1];
    if (a.length > 80 || b.length > 50) continue;
    if (isDuration(a) || isDuration(b)) continue;
    songs.push({ title: a, artist: b });
  }

  return songs;
}
