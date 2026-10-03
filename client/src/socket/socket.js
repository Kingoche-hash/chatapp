import { io } from 'socket.io-client';

export const createSocket = (token) =>
  io(import.meta.env.VITE_SOCKET_URL, {
    auth: { token },
  });