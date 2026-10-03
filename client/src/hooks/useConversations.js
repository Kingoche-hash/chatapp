import { useCallback, useEffect, useState } from 'react';
import { fetchConversations } from '../services/chat.service';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useSocket } from './useSocket';

const sortByRecent = (list) =>
  [...list].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

const addIfMissing = (list, conversation) =>
  list.some((c) => c._id === conversation._id) ? list : sortByRecent([conversation, ...list]);

export const useConversations = () => {
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load the list once.
  useEffect(() => {
    let cancelled = false;

    fetchConversations()
      .then((list) => {
        if (!cancelled) setConversations(list);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Keep it live.
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      setConversations((prev) => {
        if (!prev.some((c) => c._id === message.conversation)) return prev;

        return sortByRecent(
          prev.map((c) =>
            c._id === message.conversation
              ? { ...c, lastMessage: message, lastMessageAt: message.createdAt }
              : c
          )
        );
      });
    };

    const handleCreated = (conversation) => {
      setConversations((prev) => addIfMissing(prev, conversation));
    };

    socket.on('receive_message', handleMessage);
    socket.on('conversation_created', handleCreated);

    return () => {
      socket.off('receive_message', handleMessage);
      socket.off('conversation_created', handleCreated);
    };
  }, [socket]);

  const addConversation = useCallback((conversation) => {
    setConversations((prev) => addIfMissing(prev, conversation));
  }, []);

  return { conversations, loading, error, addConversation };
};