import { conversationIdParams, sendMessageSchema } from '../validators/conversation.validators.js';
import { createMessage } from '../services/message.service.js';
import { getConversationForMember } from '../services/conversation.service.js';
import { filterOnline, getContactIds } from '../services/presence.service.js';
import { AppError } from '../utils/AppError.js';
import { createSocketLimiter } from '../utils/socketRateLimit.js';
import { broadcastMessage, conversationRoom } from './emitters.js';

const parse = (schema, data) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  return result.data;
};

// Wraps a handler so errors become a friendly { ok: false } answer, never a crash.
const handle = (handler) => async (payload, ack) => {
  const reply = typeof ack === 'function' ? ack : () => {};

  try {
    const result = await handler(payload || {});
    reply({ ok: true, ...result });
  } catch (error) {
    if (!error.status) console.error('Socket handler error:', error);

    reply({
      ok: false,
      error: error.status && error.status < 500 ? error.message : 'Something went wrong',
    });
  }
};

export const registerHandlers = (io, socket) => {
  const userId = socket.data.user._id;
  const canSend = createSocketLimiter({ limit: 20, windowMs: 10000 });

  socket.on(
    'join_conversation',
    handle(async (payload) => {
      const { conversationId } = parse(conversationIdParams, payload);
      await getConversationForMember(conversationId, userId);
      socket.join(conversationRoom(conversationId));
      return {};
    })
  );

  socket.on(
    'leave_conversation',
    handle(async (payload) => {
      const { conversationId } = parse(conversationIdParams, payload);
      socket.leave(conversationRoom(conversationId));
      return {};
    })
  );

  socket.on(
    'send_message',
    handle(async (payload) => {
      if (!canSend()) {
        throw new AppError('You are sending messages too fast', 429);
      }

      const { conversationId } = parse(conversationIdParams, payload);
      const { content } = parse(sendMessageSchema, payload);

      const message = await createMessage({ conversationId, senderId: userId, content });
      broadcastMessage(message);

      return { message: JSON.parse(JSON.stringify(message)) };
    })
  );

  // "Who is online right now?" Answers only about people the user shares a chat with.
  socket.on(
    'get_presence',
    handle(async () => {
      const contactIds = await getContactIds(userId);
      const onlineUserIds = await filterOnline(contactIds);
      return { onlineUserIds };
    })
  );
};