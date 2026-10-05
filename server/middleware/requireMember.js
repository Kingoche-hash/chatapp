import { getConversationForMember } from '../services/conversation.service.js';

// Turns non-members away BEFORE any file is read.
export const requireConversationMember = async (req, res, next) => {
  await getConversationForMember(req.params.conversationId, req.user._id);
  next();
};