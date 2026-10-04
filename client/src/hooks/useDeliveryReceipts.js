import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSocket } from './useSocket';

// Whenever someone else's message reaches this browser, tell the server "got it".
export const useDeliveryReceipts = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const myId = user?._id;

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      if (message.sender._id === myId) return;

      socket.emit('message_delivered', {
        conversationId: message.conversation,
        messageId: message._id,
      });
    };

    socket.on('receive_message', handleMessage);

    return () => {
      socket.off('receive_message', handleMessage);
    };
  }, [socket, myId]);
};