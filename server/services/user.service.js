import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { filterOnline } from './presence.service.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Finds people by username or display name. Deleted accounts never show up.
export const searchUsers = async ({ search, limit, currentUserId }) => {
  const pattern = { $regex: escapeRegex(search), $options: 'i' };

  return User.find({
    _id: { $ne: currentUserId },
    deletedAt: null,
    $or: [{ username: pattern }, { displayName: pattern }],
  })
    .select('username displayName avatar')
    .sort({ username: 1 })
    .limit(limit);
};

// What anyone may see on someone's profile card. Online status and last seen only if allowed.
export const getPublicProfile = async (userId) => {
  const user = await User.findOne({ _id: userId, deletedAt: null }).select(
    'username displayName avatar bio status createdAt lastSeen privacy.showPresence'
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const showsPresence = user.privacy?.showPresence !== false;
  const online = showsPresence ? (await filterOnline([user._id.toString()])).length > 0 : false;

  return {
    _id: user._id,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    bio: user.bio,
    status: user.status,
    createdAt: user.createdAt,
    showsPresence,
    isOnline: online,
    lastSeen: showsPresence ? user.lastSeen : null,
  };
};