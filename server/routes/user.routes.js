import { Router } from 'express';
import { searchUsersHandler } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { userSearchQuerySchema } from '../validators/user.validators.js';

const router = Router();

router.use(protect);

router.get('/', validate(userSearchQuerySchema, 'query'), searchUsersHandler);

export default router;