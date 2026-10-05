import { searchMessages } from '../services/search.service.js';

export const searchMessagesHandler = async (req, res) => {
  const { q, conversationId, senderId, before, limit } = req.valid.query;

  const result = await searchMessages({
    userId: req.user._id,
    query: q,
    conversationId,
    senderId,
    before,
    limit,
  });

  res.status(200).json(result);
};