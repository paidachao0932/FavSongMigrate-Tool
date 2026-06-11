/**
 * Standalone OCR worker — runs in an isolated child process.
 * Uses tesseract.js v5 with local traineddata (pre-downloaded by install.bat).
 * Falls back to CDN download if local files are missing.
 */
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

interface OcrRequest {
  imagePath: string;
  id: number;
}

let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

async function getWorker() {
  if (!worker) {
    const tessdataPath = path.resolve('tessdata');
    const hasLocalData = fs.existsSync(path.join(tessdataPath, 'chi_sim.traineddata'));

    process.send?.({ type: 'log', message: hasLocalData
      ? 'Loading OCR engine (local language data)...'
      : 'Downloading OCR language data (this may take a while)...'
    });

    worker = await createWorker('chi_sim+eng', 1, {
      langPath: hasLocalData ? tessdataPath : undefined,
      logger: (m) => {
        if (m.status === 'loading language traineddata' && m.progress) {
          process.send?.({ type: 'progress', status: m.status, progress: m.progress });
        }
        if (m.status === 'initializing api') {
          process.send?.({ type: 'log', message: 'Starting OCR engine...' });
        }
      },
    });

    process.send?.({ type: 'log', message: 'OCR engine ready' });
  }
  return worker;
}

process.on('message', async (req: OcrRequest) => {
  try {
    const w = await getWorker();

    // Read and resize image to reduce memory pressure
    let buffer = fs.readFileSync(req.imagePath);
    try {
      buffer = await sharp(buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .grayscale()
        .normalize()
        .png()
        .toBuffer();
    } catch {
      // Use original if sharp fails
    }

    const { data } = await w.recognize(buffer);

    process.send?.({ type: 'result', id: req.id, texts: data.text.split('\n') });

    // Clean up temp file
    fs.unlink(req.imagePath, () => {});
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.send?.({ type: 'result', id: req.id, texts: [], error: msg });
    try { fs.unlink(req.imagePath, () => {}); } catch {}
  }
});

// Tell parent we're ready
process.send?.({ type: 'ready' });
