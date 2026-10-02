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