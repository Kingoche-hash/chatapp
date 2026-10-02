import User from '../models/User.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const searchUsers = async ({ search, limit, currentUserId }) => {
  return User.find({
    _id: { $ne: currentUserId },
    username: { $regex: escapeRegex(search), $options: 'i' },
  })
    .select('username avatar isOnline lastSeen')
    .sort({ username: 1 })
    .limit(limit);
};