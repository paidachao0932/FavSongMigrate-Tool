/**
 * Standalone OCR worker that runs in a child process.
 * If tesseract.js WASM crashes, it only kills this worker, not the main server.
 */
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs';

interface OcrRequest {
  imagePath: string;
  id: number;
}

interface OcrResponse {
  id: number;
  texts: string[];
  error?: string;
}

let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

async function getWorker() {
  if (!worker) {
    process.send?.({ type: 'log', message: 'Loading OCR engine...' });
    worker = await createWorker({
      logger: (m) => {
        if (m.status === 'loading language traineddata') {
          process.send?.({ type: 'progress', status: m.status, progress: m.progress });
        }
      },
    });
    await worker.loadLanguage('chi_sim+eng');
    await worker.initialize('chi_sim+eng');
    await worker.setParameters({ preserve_interword_spaces: '1' });
    process.send?.({ type: 'log', message: 'OCR engine ready' });
  }
  return worker;
}

process.on('message', async (req: OcrRequest) => {
  try {
    const w = await getWorker();

    // Read and aggressively resize image
    let buffer = fs.readFileSync(req.imagePath);
    try {
      buffer = await sharp(buffer)
        .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
        .grayscale()
        .normalize()
        .png()
        .toBuffer();
    } catch {
      // Use original if sharp fails
    }

    const { data } = await w.recognize(buffer);

    const resp: OcrResponse = { id: req.id, texts: data.text.split('\n') };
    process.send?.({ type: 'result', ...resp });

    // Clean up temp file
    fs.unlink(req.imagePath, () => {});
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const resp: OcrResponse = { id: req.id, texts: [], error: msg };
    process.send?.({ type: 'result', ...resp });
    // Clean up temp file
    fs.unlink(req.imagePath, () => {});
  }
});

// Tell parent we're ready
process.send?.({ type: 'ready' });
