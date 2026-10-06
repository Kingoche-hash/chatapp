import { useCallback, useMemo, useRef, useState } from 'react';
import { ToastContext } from './toastContext';

const MAX_TOASTS = 3;
const DURATION_MS = 5000;

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextIdRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // showToast({ title, text, onClick }) pops up a small message in the corner.
  const showToast = useCallback(
    ({ title, text, onClick }) => {
      nextIdRef.current += 1;
      const id = nextIdRef.current;

      setToasts((prev) => [...prev, { id, title, text, onClick }].slice(-MAX_TOASTS));
      setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-2 rounded-xl border border-slate-600 bg-slate-800 p-3 shadow-lg"
          >
            <button
              type="button"
              onClick={() => {
                toast.onClick?.();
                dismiss(toast.id);
              }}
              className="min-w-0 flex-1 text-left"
            >
              <span className="block truncate text-sm font-semibold text-slate-100">{toast.title}</span>
              <span className="line-clamp-2 block break-words text-sm text-slate-300">{toast.text}</span>
            </button>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}