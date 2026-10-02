import { createMessage, getMessages } from '../services/message.service.js';

export const sendMessage = async (req, res) => {
  const message = await createMessage({
    conversationId: req.params.conversationId,
    senderId: req.user._id,
    content: req.body.content,
  });

  res.status(201).json({ message });
};

export const getConversationMessages = async (req, res) => {
  const { limit, before } = req.valid.query;

  const result = await getMessages({
    conversationId: req.params.conversationId,
    userId: req.user._id,
    limit,
    before,
  });

  res.status(200).json(result);
};