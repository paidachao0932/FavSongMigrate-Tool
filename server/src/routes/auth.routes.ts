import { Router } from 'express';
import { generateQRKey, createQRCode, checkQRStatus } from '../controllers/auth.controller.js';

const router = Router();

router.post('/:platform/qr-key', generateQRKey);
router.post('/:platform/qr-create', createQRCode);
router.post('/:platform/qr-check', checkQRStatus);

export default router;
