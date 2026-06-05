import { Router } from 'express';
import authRouter from './auth.routes.js';
import searchRouter from './search.routes.js';
import playlistRouter from './playlist.routes.js';
import { listAdapters } from '../adapters/adapter-registry.js';

const router = Router();

// Platform discovery
router.get('/platforms', (_req, res) => {
  res.json({ platforms: listAdapters() });
});

router.use('/auth', authRouter);
router.use('/search', searchRouter);
router.use('/playlist', playlistRouter);

export default router;
