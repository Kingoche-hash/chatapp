import { useEffect, useMemo, useRef } from 'react';
import { useAuth } from './useAuth';
import { useSocket } from './useSocket';

// Tells the server "I have read up to here", but only while this window is in front.
export const useReadReceipts = (conversationId, messages) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const myId = user._id;

  const lastReportedRef = useRef(null);

  // The newest message from someone else that I have not read yet.
  const unreadId = useMemo(() => {
    const latestOther = [...messages].reverse().find((message) => message.sender._id !== myId);

    if (!latestOther || latestOther.readBy?.includes(myId)) return null;
    return latestOther._id;
  }, [messages, myId]);

  useEffect(() => {
    if (!socket || !unreadId) return;

    const report = () => {
      if (document.visibilityState !== 'visible' || !document.hasFocus()) return;
      if (lastReportedRef.current === unreadId) return;

      lastReportedRef.current = unreadId;
      socket.emit('message_read', { conversationId, messageId: unreadId });
    };

    report();

    // If the window was not in front, report as soon as it comes to the front.
    window.addEventListener('focus', report);
    document.addEventListener('visibilitychange', report);

    return () => {
      window.removeEventListener('focus', report);
      document.removeEventListener('visibilitychange', report);
    };
  }, [socket, conversationId, unreadId]);
};