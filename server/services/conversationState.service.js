import ConversationState from '../models/ConversationState.js';

export const DEFAULT_STATE = {
  pinned: false,
  mutedUntil: null,
  spam: false,
  deletedAt: null,
  wallpaper: 'default',
};

const MUTE_DURATIONS = {
  '8h': 8 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
};

const FOREVER = new Date('2999-01-01T00:00:00.000Z');

export const toPublicState = (doc) =>
  doc
    ? {
        pinned: doc.pinned,
        mutedUntil: doc.mutedUntil,
        spam: doc.spam,
        deletedAt: doc.deletedAt,
        wallpaper: doc.wallpaper,
      }
    : { ...DEFAULT_STATE };

// The settings of one person for several chats, as a Map keyed by conversation id.
export const getStatesById = async (userId, conversationIds) => {
  const states = await ConversationState.find({
    user: userId,
    conversation: { $in: conversationIds },
  }).lean();

  return new Map(states.map((state) => [state.conversation.toString(), toPublicState(state)]));
};

// Changes some settings. The caller must already have checked the person belongs to the chat.
export const updateState = async (userId, conversationId, patch) => {
  const changes = {};

  if (patch.pinned !== undefined) changes.pinned = patch.pinned;
  if (patch.spam !== undefined) changes.spam = patch.spam;
  if (patch.wallpaper !== undefined) changes.wallpaper = patch.wallpaper;
  if (patch.deleted !== undefined) changes.deletedAt = patch.deleted ? new Date() : null;

  if (patch.muted !== undefined) {
    if (patch.muted === 'off') changes.mutedUntil = null;
    else if (patch.muted === 'forever') changes.mutedUntil = FOREVER;
    else changes.mutedUntil = new Date(Date.now() + MUTE_DURATIONS[patch.muted]);
  }

  const doc = await ConversationState.findOneAndUpdate(
    { user: userId, conversation: conversationId },
    { $set: changes },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return toPublicState(doc);
};