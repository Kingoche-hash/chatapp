import { useCallback, useEffect, useRef } from 'react';
import { useSocket } from './useSocket';

// How often we repeat "still typing", and how long silence means "stopped".
const REPEAT_MS = 2000;
const IDLE_MS = 2000;

export const useTypingEmitter = (conversationId) => {
  const { socket } = useSocket();

  const typingRef = useRef(false);
  const lastSentRef = useRef(0);
  const stopTimerRef = useRef(null);

  const stopTyping = useCallback(() => {
    clearTimeout(stopTimerRef.current);

    if (typingRef.current && socket) {
      socket.emit('typing_stop', { conversationId });
    }

    typingRef.current = false;
  }, [socket, conversationId]);

  const notifyTyping = useCallback(() => {
    if (!socket) return;

    const now = Date.now();

    if (!typingRef.current || now - lastSentRef.current > REPEAT_MS) {
      socket.emit('typing_start', { conversationId });
      lastSentRef.current = now;
      typingRef.current = true;
    }

    clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(stopTyping, IDLE_MS);
  }, [socket, conversationId, stopTyping]);

  // Leaving the chat also means "stopped typing".
  useEffect(() => stopTyping, [stopTyping]);

  return { notifyTyping, stopTyping };
};