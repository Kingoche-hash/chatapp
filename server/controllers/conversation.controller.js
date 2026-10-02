import {
  createDirectConversation,
  createGroupConversation,
  listConversations,
  getConversation,
} from '../services/conversation.service.js';

export const createConversation = async (req, res) => {
  const body = req.body;

  if (body.type === 'direct') {
    const { conversation, created } = await createDirectConversation(req.user._id, body.userId);
    return res.status(created ? 201 : 200).json({ conversation });
  }

  const conversation = await createGroupConversation(req.user._id, body);
  res.status(201).json({ conversation });
};

export const getMyConversations = async (req, res) => {
  const conversations = await listConversations(req.user._id);
  res.status(200).json({ conversations });
};

export const getConversationById = async (req, res) => {
  const conversation = await getConversation(req.params.conversationId, req.user._id);
  res.status(200).json({ conversation });
};