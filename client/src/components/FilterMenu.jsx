import { useRef, useState } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import { FILTERS } from '../utils/conversationFilters';

// The drop-down at the top left of the chat list: All messages, Unread, Spam, Recently deleted...
export default function FilterMenu({ value, onChange, counts }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useClickOutside(menuRef, () => setOpen(false), open);

  const current = FILTERS.find((filter) => filter.key === value) || FILTERS[0];

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium hover:bg-slate-700"
      >
        <span aria-hidden="true">☰</span>
        <span>{current.label}</span>
        <span aria-hidden="true" className="text-xs">▾</span>
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute left-0 top-full z-30 mt-1 w-60 overflow-hidden rounded-xl border border-slate-600 bg-slate-800 py-1 shadow-xl"
        >
          {FILTERS.map((filter) => (
            <li key={filter.key} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onChange(filter.key);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-slate-700"
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden="true">{filter.icon}</span>
                  {filter.label}
                </span>
                <span className="flex items-center gap-2">
                  {counts[filter.key] > 0 && (
                    <span className="text-xs text-slate-400">{counts[filter.key]}</span>
                  )}
                  {value === filter.key && <span aria-hidden="true">✓</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}