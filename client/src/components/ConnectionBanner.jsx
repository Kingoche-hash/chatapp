import { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';

// A yellow strip that appears when the live connection has been down for a couple of seconds.
export default function ConnectionBanner() {
  const { connected } = useSocket();
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    if (connected) return;

    const timer = setTimeout(() => setWaited(true), 2000);

    return () => {
      clearTimeout(timer);
      setWaited(false);
    };
  }, [connected]);

  if (connected || !waited) return null;

  return (
    <div
      role="status"
      className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-slate-900"
    >
      Connection lost. Trying to reconnect...
    </div>
  );
}