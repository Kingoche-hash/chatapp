import { useCallback, useEffect, useState } from 'react';
import { fetchMessages } from '../services/chat.service';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useSocket } from './useSocket';

const union = (a = [], b = []) => [...new Set([...a, ...b])];

// Joins lists together without duplicates, oldest first.
// If a message appears twice, the receipts from both copies are combined.
const mergeMessages = (...lists) => {
  const byId = new Map();

  lists.flat().forEach((message) => {
    const existing = byId.get(message._id);

    byId.set(
      message._id,
      existing
        ? {
            ...message,
            deliveredTo: union(existing.deliveredTo, message.deliveredTo),
            readBy: union(existing.readBy, message.readBy),
          }
        : message
    );
  });

  return [...byId.values()].sort((a, b) => (a._id < b._id ? -1 : a._id > b._id ? 1 : 0));
};

const withReceipt = (message, field, userId) =>
  message[field]?.includes(userId)
    ? message
    : { ...message, [field]: [...(message[field] || []), userId] };

export const useMessages = (conversationId) => {
  const { socket } = useSocket();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const addMessage = useCallback((message) => {
    setMessages((prev) => mergeMessages(prev, [message]));
  }, []);

  // Load the newest page of history.
  useEffect(() => {
    let cancelled = false;

    fetchMessages(conversationId)
      .then((data) => {
        if (cancelled) return;
        setMessages((prev) => mergeMessages(data.messages, prev));
        setHasMore(data.hasMore);
        setNextCursor(data.nextCursor);
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
  }, [conversationId]);

  // Listen for live messages in this conversation.
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_conversation', { conversationId });

    const handleMessage = (message) => {
      if (message.conversation === conversationId) addMessage(message);
    };

    socket.on('receive_message', handleMessage);

    return () => {
      socket.off('receive_message', handleMessage);
    };
  }, [socket, conversationId, addMessage]);

  // Listen for receipts: "this person got / read everything up to this message".
  useEffect(() => {
    if (!socket) return;

    const handleDelivered = ({ conversationId: id, userId, upToId }) => {
      if (id !== conversationId) return;

      setMessages((prev) =>
        prev.map((message) =>
          message._id <= upToId && message.sender._id !== userId
            ? withReceipt(message, 'deliveredTo', userId)
            : message
        )
      );
    };

    const handleRead = ({ conversationId: id, userId, upToId }) => {
      if (id !== conversationId) return;

      setMessages((prev) =>
        prev.map((message) =>
          message._id <= upToId && message.sender._id !== userId
            ? withReceipt(withReceipt(message, 'deliveredTo', userId), 'readBy', userId)
            : message
        )
      );
    };

    socket.on('messages_delivered', handleDelivered);
    socket.on('messages_read', handleRead);

    return () => {
      socket.off('messages_delivered', handleDelivered);
      socket.off('messages_read', handleRead);
    };
  }, [socket, conversationId]);

  const loadOlder = useCallback(async () => {
    if (!hasMore || loadingOlder) return;

    setLoadingOlder(true);

    try {
      const data = await fetchMessages(conversationId, { before: nextCursor });
      setMessages((prev) => mergeMessages(data.messages, prev));
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, hasMore, loadingOlder, nextCursor]);

  // Sends through the live line and waits for the server's "got it".
  const send = useCallback(
    (content) =>
      new Promise((resolve, reject) => {
        if (!socket || !socket.connected) {
          reject(new Error('Not connected to the server yet'));
          return;
        }

        socket.timeout(8000).emit('send_message', { conversationId, content }, (err, response) => {
          if (err) return reject(new Error('The server did not answer. Please try again.'));
          if (!response.ok) return reject(new Error(response.error));

          addMessage(response.message);
          resolve();
        });
      }),
    [socket, conversationId, addMessage]
  );

  return { messages, loading, error, hasMore, loadingOlder, loadOlder, send };
};