import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import { verifyToken } from '../utils/token.js';

// Runs once for every new phone line, before it is allowed to connect.
export const authenticateSocket = async (socket, next) => {
  try {
    const headerToken = socket.handshake.headers.authorization?.replace('Bearer ', '');
    const token = socket.handshake.auth?.token || headerToken;

    if (!token) {
      return next(new Error('Not authenticated'));
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub).select('username avatar');

    if (!user) {
      return next(new Error('Not authenticated'));
    }

    const conversations = await Conversation.find({ members: user._id }).select('_id').lean();

    socket.data.user = user;
    socket.data.conversationIds = conversations.map((c) => c._id.toString());

    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
};