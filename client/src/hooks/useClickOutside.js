import { useEffect } from 'react';

// Calls `onOutside` when the person clicks outside the element, or presses Escape.
export const useClickOutside = (ref, onOutside, active = true) => {
  useEffect(() => {
    if (!active) return;

    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onOutside();
    };

    const handleKey = (event) => {
      if (event.key === 'Escape') onOutside();
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, onOutside, active]);
};
