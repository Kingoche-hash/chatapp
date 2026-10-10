import crypto from 'crypto';
import { cloudinary } from '../config/cloudinary.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { hasValidSignature } from '../utils/fileSignature.js';

const AVATAR_FOLDER = 'chatapp/avatars';

// Changes the details the person sent. Returns the updated user.
export const updateProfile = async (userId, patch) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (patch.username !== undefined && patch.username !== user.username) {
    const taken = await User.exists({ username: patch.username, _id: { $ne: userId } });

    if (taken) {
      throw new AppError('Username already taken', 409);
    }

    user.username = patch.username;
  }

  if (patch.displayName !== undefined) user.displayName = patch.displayName;
  if (patch.bio !== undefined) user.bio = patch.bio;
  if (patch.status !== undefined) user.status = patch.status;

  if (patch.privacy) {
    Object.entries(patch.privacy).forEach(([key, value]) => {
      if (value !== undefined) user.privacy[key] = value;
    });
  }

  await user.save();
  return user;
};

// Uploads the picture to Cloudinary, cropped to a 256 px square around the face or centre.
const uploadAvatarBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: AVATAR_FOLDER,
        resource_type: 'image',
        public_id: crypto.randomUUID(),
        transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'auto' }],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );

    stream.end(buffer);
  });

const deleteOldAvatar = (publicId) => {
  if (!publicId) return;

  cloudinary.uploader.destroy(publicId, { resource_type: 'image' }).catch((error) => {
    console.error('Could not delete old avatar:', error.message);
  });
};

export const setAvatar = async (userId, file) => {
  // Second lock: is it really an image, whatever the file's label says?
  if (!hasValidSignature(file)) {
    throw new AppError('That file is not a real image', 415);
  }

  const user = await User.findById(userId).select('+avatarPublicId');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  let result;

  try {
    result = await uploadAvatarBuffer(file.buffer);
  } catch (error) {
    console.error('Cloudinary avatar upload error:', error.message);
    throw new AppError('Upload failed. Please try again.', 502);
  }

  const oldPublicId = user.avatarPublicId;

  user.avatar = result.secure_url;
  user.avatarPublicId = result.public_id;
  await user.save();

  deleteOldAvatar(oldPublicId);
  return user;
};

export const removeAvatar = async (userId) => {
  const user = await User.findById(userId).select('+avatarPublicId');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const oldPublicId = user.avatarPublicId;

  user.avatar = '';
  user.avatarPublicId = '';
  await user.save();

  deleteOldAvatar(oldPublicId);
  return user;
};

// Wrong password answers 400, not 401, because a 401 would log the person out of the app.
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');

  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();
};

// The account is wiped but kept, so other people's conversations do not break.
export const deleteAccount = async (userId, password) => {
  const user = await User.findById(userId).select('+password +avatarPublicId');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Password is incorrect', 400);
  }

  const id = user._id.toString();
  const oldPublicId = user.avatarPublicId;

  user.username = `deleted_${id.slice(-12)}`;
  user.displayName = 'Deleted user';
  user.email = `deleted_${id}@deleted.invalid`;
  user.bio = '';
  user.status = '';
  user.avatar = '';
  user.avatarPublicId = '';
  user.password = crypto.randomBytes(32).toString('hex');
  user.isOnline = false;
  user.deletedAt = new Date();

  await user.save();

  deleteOldAvatar(oldPublicId);
};