import { Router } from 'express';
import { getUserProfileHandler, searchUsersHandler } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { userIdParams, userSearchQuerySchema } from '../validators/user.validators.js';

const router = Router();

router.use(protect);

router.get('/', validate(userSearchQuerySchema, 'query'), searchUsersHandler);
router.get('/:userId', validate(userIdParams, 'params'), getUserProfileHandler);

export default router;