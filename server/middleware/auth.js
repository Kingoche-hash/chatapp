import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../utils/token.js';

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Not authenticated', 401);
  }

  const token = header.split(' ')[1];
  const payload = verifyToken(token);

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  req.user = user;
  next();
};