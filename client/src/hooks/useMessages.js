import { useCallback, useEffect, useState } from 'react';
import { fetchMessages } from '../services/chat.service';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useSocket } from './useSocket';

// Joins lists together without duplicates, oldest first.
const mergeMessages = (...lists) => {
  const byId = new Map();
  lists.flat().forEach((message) => byId.set(message._id, message));

  return [...byId.values()].sort((a, b) => (a._id < b._id ? -1 : a._id > b._id ? 1 : 0));
};

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