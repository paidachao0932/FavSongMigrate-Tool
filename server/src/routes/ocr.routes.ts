import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Save uploads to client/dist/uploads for serving
const uploadsDir = path.resolve('../client/dist/uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const router = Router();

router.post('/', upload.array('images', 5), async (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No images uploaded' });
  }

  const urls = files.map((f) => `/uploads/${f.filename}`);
  res.json({ urls });
});

export default router;
