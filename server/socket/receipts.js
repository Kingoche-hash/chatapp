import { markPendingDelivered } from '../services/message.service.js';
import { conversationRoom } from './emitters.js';

// When someone connects, everything that arrived while they were away counts as delivered now.
export const syncDelivered = async (io, socket) => {
  try {
    const userId = socket.data.user._id;
    const updates = await markPendingDelivered(userId, socket.data.conversationIds);

    updates.forEach(({ conversationId, upToId }) => {
      io.to(conversationRoom(conversationId)).emit('messages_delivered', {
        conversationId,
        userId: userId.toString(),
        upToId,
      });
    });
  } catch (error) {
    console.error('Delivery sync error:', error.message);
  }
};