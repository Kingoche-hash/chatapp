import { useEffect, useMemo, useRef, useState } from 'react';
import { TypingContext } from './typingContext';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';

// If nothing refreshes a "typing" signal for this long, we hide it.
const TYPING_EXPIRES_MS = 5000;

export default function TypingProvider({ children }) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const myId = user?._id;

  // { [conversationId]: { [userId]: username } }
  const [typing, setTyping] = useState({});
  const timersRef = useRef(new Map());

  useEffect(() => {
    if (!socket) return;

    const timers = timersRef.current;

    const removeTyping = (conversationId, userId) => {
      setTyping((prev) => {
        const forConversation = prev[conversationId];
        if (!forConversation || !(userId in forConversation)) return prev;

        const next = { ...forConversation };
        delete next[userId];
        return { ...prev, [conversationId]: next };
      });
    };

    const handleStart = ({ conversationId, userId, username }) => {
      if (userId === myId) return;

      setTyping((prev) => ({
        ...prev,
        [conversationId]: { ...prev[conversationId], [userId]: username },
      }));

      const key = `${conversationId}:${userId}`;
      clearTimeout(timers.get(key));
      timers.set(
        key,
        setTimeout(() => {
          timers.delete(key);
          removeTyping(conversationId, userId);
        }, TYPING_EXPIRES_MS)
      );
    };

    const handleStop = ({ conversationId, userId }) => {
      const key = `${conversationId}:${userId}`;
      clearTimeout(timers.get(key));
      timers.delete(key);
      removeTyping(conversationId, userId);
    };

    // Sending a message means the person stopped typing.
    const handleMessage = (message) => {
      handleStop({ conversationId: message.conversation, userId: message.sender._id });
    };

    socket.on('typing_start', handleStart);
    socket.on('typing_stop', handleStop);
    socket.on('receive_message', handleMessage);

    return () => {
      socket.off('typing_start', handleStart);
      socket.off('typing_stop', handleStop);
      socket.off('receive_message', handleMessage);
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      setTyping({});
    };
  }, [socket, myId]);

  const value = useMemo(
    () => ({
      getTypingNames: (conversationId) => Object.values(typing[conversationId] || {}),
    }),
    [typing]
  );

  return <TypingContext.Provider value={value}>{children}</TypingContext.Provider>;
}