import { Router } from 'express';
import {
  createPlaylist,
  addSongs,
  migratePlaylist,
  getFavorites,
} from '../controllers/playlist.controller.js';

const router = Router();

router.get('/:platform/favorites', getFavorites);
router.post('/:platform/create', createPlaylist);
router.post('/:platform/add-songs', addSongs);
router.post('/:platform/migrate', migratePlaylist);

export default router;
