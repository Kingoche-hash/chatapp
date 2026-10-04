import { useContext } from 'react';
import { PresenceContext } from '../context/presenceContext';

export const usePresence = () => {
  const context = useContext(PresenceContext);

  if (!context) {
    throw new Error('usePresence must be used inside <PresenceProvider>');
  }

  return context;
};