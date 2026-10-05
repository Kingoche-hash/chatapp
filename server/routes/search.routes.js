import { Router } from 'express';
import { searchMessagesHandler } from '../controllers/search.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { searchLimiter } from '../middleware/searchLimiter.js';
import { searchQuerySchema } from '../validators/search.validators.js';

const router = Router();

router.use(protect);

router.get('/messages', searchLimiter, validate(searchQuerySchema, 'query'), searchMessagesHandler);

export default router;