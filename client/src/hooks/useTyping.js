import { useContext } from 'react';
import { TypingContext } from '../context/typingContext';

export const useTyping = () => {
  const context = useContext(TypingContext);

  if (!context) {
    throw new Error('useTyping must be used inside <TypingProvider>');
  }

  return context;
};