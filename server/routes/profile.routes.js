import { Router } from 'express';
import {
  changeMyPassword,
  deleteMyAccount,
  removeMyAvatar,
  updateMyProfile,
  uploadMyAvatar,
} from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.js';
import { authLimiter, uploadLimiter } from '../middleware/rateLimiter.js';
import { uploadAvatar } from '../middleware/uploadAvatar.js';
import { validate } from '../middleware/validate.js';
import {
  changePasswordSchema,
  deleteAccountSchema,
  updateProfileSchema,
} from '../validators/profile.validators.js';

const router = Router();

router.use(protect);

router.patch('/', validate(updateProfileSchema), updateMyProfile);

router.post('/avatar', uploadLimiter, uploadAvatar, uploadMyAvatar);
router.delete('/avatar', removeMyAvatar);

router.post('/password', authLimiter, validate(changePasswordSchema), changeMyPassword);
router.delete('/', authLimiter, validate(deleteAccountSchema), deleteMyAccount);

export default router;