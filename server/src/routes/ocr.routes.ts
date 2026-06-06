import { Router } from 'express';
import multer from 'multer';
import { ocrImages, getOcrStatus } from '../services/ocr.service.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per image
});

const router = Router();

// OCR status check
router.get('/status', (_req, res) => {
  res.json(getOcrStatus());
});

router.post('/', upload.array('images', 5), async (req, res, next) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const status = getOcrStatus();
    if (!status.ready && status.loading) {
      return res.status(503).json({
        error: 'OCR engine is still downloading language data (~15MB). Please wait and try again in a minute.',
        status,
      });
    }

    const songs = await ocrImages(files);
    res.json({ songs });
  } catch (err) {
    next(err);
  }
});

export default router;
