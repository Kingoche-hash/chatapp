import { getIO } from './io.js';

export const userRoom = (userId) => `user:${userId}`;
export const conversationRoom = (conversationId) => `conversation:${conversationId}`;

// Turns a Mongoose document into plain JSON that is safe to send.
const toPlain = (doc) => JSON.parse(JSON.stringify(doc));

// Shout a new message into its conversation room.
export const broadcastMessage = (message) => {
  const io = getIO();
  if (!io) return;

  const plain = toPlain(message);
  io.to(conversationRoom(plain.conversation)).emit('receive_message', plain);
};

// Put every member's open sockets into the new room, and tell them about it.
export const announceConversation = (conversation) => {
  const io = getIO();
  if (!io) return;

  const plain = toPlain(conversation);

  for (const member of plain.members) {
    io.in(userRoom(member._id)).socketsJoin(conversationRoom(plain._id));
    io.to(userRoom(member._id)).emit('conversation_created', plain);
  }
};