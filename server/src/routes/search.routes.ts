import { Router } from 'express';
import { batchSearch } from '../controllers/search.controller.js';

const router = Router();

router.post('/:platform/batch', batchSearch);

export default router;
