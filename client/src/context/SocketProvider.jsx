import { useEffect, useMemo, useState } from 'react';
import { SocketContext } from './socketContext';
import { useAuth } from '../hooks/useAuth';
import { createSocket } from '../socket/socket';
import { getToken } from '../services/tokenStorage';

export default function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  const userId = user?._id;

  // Open the phone line when someone logs in. Hang up when they log out.
  useEffect(() => {
    if (!userId) return;

    const token = getToken();
    if (!token) return;

    const instance = createSocket(token);

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleError = (error) => console.warn('Socket connection failed:', error.message);

    instance.on('connect', handleConnect);
    instance.on('disconnect', handleDisconnect);
    instance.on('connect_error', handleError);

    setSocket(instance);

    return () => {
      instance.off('connect', handleConnect);
      instance.off('disconnect', handleDisconnect);
      instance.off('connect_error', handleError);
      instance.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [userId]);

  const value = useMemo(() => ({ socket, connected }), [socket, connected]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}