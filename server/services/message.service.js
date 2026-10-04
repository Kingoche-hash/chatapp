import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { getConversationForMember } from './conversation.service.js';

export const createMessage = async ({ conversationId, senderId, content }) => {
  await getConversationForMember(conversationId, senderId);

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content,
  });

  await Conversation.updateOne(
    { _id: conversationId },
    { lastMessage: message._id, lastMessageAt: message.createdAt }
  );

  return message.populate('sender', 'username avatar');
};

export const getMessages = async ({ conversationId, userId, limit, before }) => {
  await getConversationForMember(conversationId, userId);

  const filter = { conversation: conversationId };
  if (before) filter._id = { $lt: before };

  // Ask for one extra message, just to learn whether older ones exist.
  const found = await Message.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate('sender', 'username avatar');

  const hasMore = found.length > limit;
  const page = hasMore ? found.slice(0, limit) : found;
  const messages = page.reverse(); // oldest first, ready to display

  return {
    messages,
    hasMore,
    nextCursor: hasMore ? messages[0]._id : null,
  };
};

// "I have received everything up to this message." Returns how many messages changed.
export const markDelivered = async ({ conversationId, userId, upToId }) => {
  await getConversationForMember(conversationId, userId);

  const result = await Message.updateMany(
    {
      conversation: conversationId,
      _id: { $lte: upToId },
      sender: { $ne: userId },
      deliveredTo: { $ne: userId },
    },
    { $addToSet: { deliveredTo: userId } }
  );

  return result.modifiedCount;
};

// "I have read everything up to this message." Reading also means delivered.
export const markRead = async ({ conversationId, userId, upToId }) => {
  await getConversationForMember(conversationId, userId);

  const result = await Message.updateMany(
    {
      conversation: conversationId,
      _id: { $lte: upToId },
      sender: { $ne: userId },
      readBy: { $ne: userId },
    },
    { $addToSet: { deliveredTo: userId, readBy: userId } }
  );

  return result.modifiedCount;
};

// Messages that arrived while the user was offline: mark them delivered.
// Returns one { conversationId, upToId } per conversation that changed.
export const markPendingDelivered = async (userId, conversationIds) => {
  if (conversationIds.length === 0) return [];

  const pending = await Message.aggregate([
    {
      $match: {
        conversation: { $in: conversationIds.map((id) => new mongoose.Types.ObjectId(id)) },
        sender: { $ne: userId },
        deliveredTo: { $ne: userId },
      },
    },
    { $group: { _id: '$conversation', upToId: { $max: '$_id' } } },
  ]);

  if (pending.length === 0) return [];

  await Message.bulkWrite(
    pending.map((item) => ({
      updateMany: {
        filter: {
          conversation: item._id,
          _id: { $lte: item.upToId },
          sender: { $ne: userId },
          deliveredTo: { $ne: userId },
        },
        update: { $addToSet: { deliveredTo: userId } },
      },
    }))
  );

  return pending.map((item) => ({
    conversationId: item._id.toString(),
    upToId: item.upToId.toString(),
  }));
};