import { fork, type ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { logger } from '../utils/logger.js';
import { isDuration, isMetadata } from '../utils/normalize.js';

let workerProcess: ChildProcess | null = null;
let workerReady = false;
let pendingRequests = new Map<number, { resolve: (texts: string[]) => void; reject: (err: Error) => void }>();
let reqId = 0;

export function preloadWorker(): void {
  logger.info('Preloading OCR worker...');
  getWorker();
}

function getWorkerPath(): string {
  return path.resolve(import.meta.dirname, 'ocr-worker.ts');
}

function getWorker(): ChildProcess {
  if (workerProcess && workerProcess.connected) return workerProcess;

  workerReady = false;

  // Kill old worker if exists
  if (workerProcess) {
    workerProcess.kill();
  }

  const workerPath = getWorkerPath();
  logger.info('Starting OCR worker process...');

  workerProcess = fork(workerPath, [], {
    execArgv: ['--import', 'tsx'],
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
  });

  workerProcess.on('message', (msg: any) => {
    if (msg.type === 'ready') {
      workerReady = true;
      logger.info('OCR worker ready');
    } else if (msg.type === 'log') {
      logger.info('OCR worker: ' + msg.message);
    } else if (msg.type === 'progress') {
      logger.info(`OCR worker: ${msg.status} ${Math.round(msg.progress * 100)}%`);
    } else if (msg.type === 'result') {
      const pending = pendingRequests.get(msg.id);
      if (pending) {
        pendingRequests.delete(msg.id);
        if (msg.error) {
          pending.reject(new Error(msg.error));
        } else {
          pending.resolve(msg.texts || []);
        }
      }
    }
  });

  workerProcess.on('exit', (code, signal) => {
    logger.warn(`OCR worker exited (code=${code}, signal=${signal})`);
    workerReady = false;
    workerProcess = null;

    // Reject all pending requests
    for (const [id, { reject }] of pendingRequests) {
      pendingRequests.delete(id);
      reject(new Error('OCR worker crashed. Please try again.'));
    }
  });

  // Wait for worker to be ready
  return workerProcess;
}

function recognizeImage(imagePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const worker = getWorker();
    const id = ++reqId;

    pendingRequests.set(id, { resolve, reject });

    const sendRequest = () => {
      if (workerReady) {
        worker.send({ imagePath, id });
      } else {
        setTimeout(sendRequest, 200);
      }
    };
    sendRequest();

    // Timeout after 120s
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error('OCR recognition timed out after 120 seconds'));
      }
    }, 120000);
  });
}

interface SongEntry {
  id: string;
  title: string;
  artist: string;
}

export async function ocrImages(files: Express.Multer.File[]): Promise<SongEntry[]> {
  const allSongs: SongEntry[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    logger.info(`OCR processing image ${i + 1}/${files.length}: ${file.originalname} (${(file.size / 1024).toFixed(0)}KB)`);

    // Write to temp file (worker needs file path)
    const tmpDir = os.tmpdir();
    const tmpPath = path.join(tmpDir, `ocr-${Date.now()}-${i}.png`);
    fs.writeFileSync(tmpPath, file.buffer);

    try {
      const lines = await recognizeImage(tmpPath);
      const songs = parseOcrLines(lines);
      for (const s of songs) {
        allSongs.push({ id: `song-${allSongs.length}`, ...s });
      }
      logger.info(`Image ${i + 1}: recognized ${songs.length} songs`);
    } catch (err) {
      logger.error(`OCR failed for image ${i + 1}: ${err}`);
      // Clean up temp file on error
      try { fs.unlinkSync(tmpPath); } catch {}
    }
  }

  logger.info(`OCR complete: ${allSongs.length} total songs`);
  return allSongs;
}

function parseOcrLines(lines: string[]): { title: string; artist: string }[] {
  const cleaned = lines
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !isDuration(l) && !isMetadata(l));

  const songs: { title: string; artist: string }[] = [];

  // Strategy 1: "title - artist"
  const dashLine = /^(.{1,80})\s*[-–—]\s*(.{1,50})$/;
  const remaining: string[] = [];

  for (const line of cleaned) {
    const m = line.match(dashLine);
    if (m) {
      songs.push({ title: m[1].trim(), artist: m[2].trim() });
    } else {
      remaining.push(line);
    }
  }

  // Strategy 2: pair lines
  const paired: string[] = [];
  for (const line of remaining) {
    if (
      /^(播放|收藏|下载|分享|歌曲|歌手|专辑|时长|全部|随机|单曲|循环)/.test(line) ||
      /^(歌单|列表|音乐|排行|推荐|热门|最新|我的|喜欢)/.test(line) ||
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
