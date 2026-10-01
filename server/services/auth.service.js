import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/token.js';

export const registerUser = async ({ username, email, password }) => {
  const existing = await User.findOne({ $or: [{ email }, { username }] });

  if (existing) {
    const message = existing.email === email ? 'Email already in use' : 'Username already taken';
    throw new AppError(message, 409);
  }

  const user = await User.create({ username, email, password });
  return { user, token: signToken(user._id.toString()) };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  return { user, token: signToken(user._id.toString()) };
};