import {
  addConnection,
  removeConnection,
  countConnections,
  markOnline,
  markOffline,
  getConversationIdsFor,
} from '../services/presence.service.js';
import { conversationRoom } from './emitters.js';

// After the last connection closes, wait a little in case it was just a page refresh.
const OFFLINE_GRACE_MS = 5000;

// Shout into every room the user belongs to, so only people who share a chat hear it.
const broadcastToContacts = async (io, userId, event, payload) => {
  const conversationIds = await getConversationIdsFor(userId);
  if (conversationIds.length === 0) return;

  io.to(conversationIds.map(conversationRoom)).emit(event, payload);
};

export const handlePresenceConnect = async (io, socket) => {
  try {
    const userId = socket.data.user._id.toString();
    const isFirstConnection = await addConnection(userId, socket.id);

    if (!isFirstConnection) return;

    await markOnline(userId);
    await broadcastToContacts(io, userId, 'user_online', { userId });
  } catch (error) {
    console.error('Presence connect error:', error.message);
  }
};

export const handlePresenceDisconnect = async (io, socket) => {
  try {
    const userId = socket.data.user._id.toString();
    const remaining = await removeConnection(userId, socket.id);

    if (remaining > 0) return;

    setTimeout(async () => {
      try {
        // Did they come back during the grace period?
        if ((await countConnections(userId)) > 0) return;

        const lastSeen = await markOffline(userId);
        await broadcastToContacts(io, userId, 'user_offline', { userId, lastSeen });
      } catch (error) {
        console.error('Presence offline error:', error.message);
      }
    }, OFFLINE_GRACE_MS);
  } catch (error) {
    console.error('Presence disconnect error:', error.message);
  }
};