import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { DEFAULT_STATE, getStatesById } from './conversationState.service.js';

const MEMBER_FIELDS = 'username avatar isOnline lastSeen';

const populateConversation = (query) =>
  query
    .populate('members', MEMBER_FIELDS)
    .populate({ path: 'lastMessage', select: 'content sender createdAt attachments' });

// The access check used everywhere: is this user sitting at this table?
export const getConversationForMember = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({ _id: conversationId, members: userId });

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  return conversation;
};

export const createDirectConversation = async (currentUserId, otherUserId) => {
  if (currentUserId.toString() === otherUserId) {
    throw new AppError('You cannot start a conversation with yourself', 400);
  }

  const otherExists = await User.exists({ _id: otherUserId });
  if (!otherExists) {
    throw new AppError('User not found', 404);
  }

  const directKey = [currentUserId.toString(), otherUserId].sort().join('_');

  let conversation = await Conversation.findOne({ directKey });
  let created = false;

  if (!conversation) {
    try {
      conversation = await Conversation.create({
        type: 'direct',
        members: [currentUserId, otherUserId],
        createdBy: currentUserId,
        directKey,
      });
      created = true;
    } catch (error) {
      // Two requests at once: the unique index stopped the second one. Use the first.
      if (error.code !== 11000) throw error;
      conversation = await Conversation.findOne({ directKey });
    }
  }

  const populated = await populateConversation(Conversation.findById(conversation._id));
  return { conversation: populated, created };
};

export const createGroupConversation = async (currentUserId, { name, memberIds }) => {
  const ids = [...new Set([currentUserId.toString(), ...memberIds])];

  if (ids.length < 2) {
    throw new AppError('A group needs at least one other member', 400);
  }

  const found = await User.countDocuments({ _id: { $in: ids } });
  if (found !== ids.length) {
    throw new AppError('One or more users do not exist', 404);
  }

  const conversation = await Conversation.create({
    type: 'group',
    name,
    members: ids,
    createdBy: currentUserId,
  });

  return populateConversation(Conversation.findById(conversation._id));
};

// My conversations, newest first. Each has my unread count and my private settings (pinned, muted...).
export const listConversations = async (userId) => {
  const conversations = await populateConversation(
    Conversation.find({ members: userId }).sort({ lastMessageAt: -1 })
  );

  if (conversations.length === 0) return [];

  const ids = conversations.map((conversation) => conversation._id);

  const [counts, states] = await Promise.all([
    Message.aggregate([
      {
        $match: {
          conversation: { $in: ids },
          sender: { $ne: userId },
          readBy: { $ne: userId },
        },
      },
      { $group: { _id: '$conversation', count: { $sum: 1 } } },
    ]),
    getStatesById(userId, ids),
  ]);

  const unreadById = new Map(counts.map((item) => [item._id.toString(), item.count]));

  return conversations.map((conversation) => {
    const id = conversation._id.toString();

    return {
      ...conversation.toJSON(),
      unreadCount: unreadById.get(id) ?? 0,
      state: states.get(id) ?? { ...DEFAULT_STATE },
    };
  });
};

export const getConversation = async (conversationId, userId) => {
  const conversation = await populateConversation(
    Conversation.findOne({ _id: conversationId, members: userId })
  );

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  return conversation;
};