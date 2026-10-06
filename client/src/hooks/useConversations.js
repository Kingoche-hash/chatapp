import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchConversations } from '../services/chat.service';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useAuth } from './useAuth';
import { useSocket } from './useSocket';

const sortByRecent = (list) =>
  [...list].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

const addIfMissing = (list, conversation) =>
  list.some((c) => c._id === conversation._id) ? list : sortByRecent([conversation, ...list]);

// activeId: the chat that is open, so its new messages do not count as unread while you look at it.
export const useConversations = (activeId = null) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const myId = user?._id;

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const activeIdRef = useRef(activeId);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // Load the list (again, when the person clicks "Retry").
  useEffect(() => {
    let cancelled = false;

    fetchConversations()
      .then((list) => {
        if (cancelled) return;
        setConversations(list);
        setError('');
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
  }, [reloadKey]);

  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    setReloadKey((key) => key + 1);
  }, []);

  // Keep it live.
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      const fromMe = message.sender._id === myId;

      const looking =
        activeIdRef.current === message.conversation &&
        document.visibilityState === 'visible' &&
        document.hasFocus();

      setConversations((prev) => {
        if (!prev.some((c) => c._id === message.conversation)) return prev;

        return sortByRecent(
          prev.map((c) => {
            if (c._id !== message.conversation) return c;

            const unread = c.unreadCount ?? 0;

            return {
              ...c,
              lastMessage: message,
              lastMessageAt: message.createdAt,
              unreadCount: fromMe || looking ? unread : unread + 1,
            };
          })
        );
      });
    };

    const handleCreated = (conversation) => {
      setConversations((prev) => addIfMissing(prev, conversation));
    };

    // When I read a chat (in any of my windows), its unread counter goes back to zero.
    const handleRead = ({ conversationId, userId }) => {
      if (userId !== myId) return;

      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId && c.unreadCount ? { ...c, unreadCount: 0 } : c
        )
      );
    };

    socket.on('receive_message', handleMessage);
    socket.on('conversation_created', handleCreated);
    socket.on('messages_read', handleRead);

    return () => {
      socket.off('receive_message', handleMessage);
      socket.off('conversation_created', handleCreated);
      socket.off('messages_read', handleRead);
    };
  }, [socket, myId]);

  const addConversation = useCallback((conversation) => {
    setConversations((prev) => addIfMissing(prev, conversation));
  }, []);

  return { conversations, loading, error, addConversation, reload };
};