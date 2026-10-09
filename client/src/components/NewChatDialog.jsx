import { useEffect, useState } from 'react';
import { searchUsersRequest } from '../services/chat.service';
import { getErrorMessage } from '../utils/getErrorMessage';
import Avatar from './Avatar';
import Modal from './Modal';

const modeButtonClass = (selected) =>
  `flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
    selected ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
  }`;

export default function NewChatDialog({ onClose, onStartChat, onCreateGroup }) {
  const [mode, setMode] = useState('direct');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const term = query.trim();

  // Wait 300ms after the last key press, then search.
  useEffect(() => {
    if (!term) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const users = await searchUsersRequest(term);

        if (!cancelled) {
          setResults(users);
          setError('');
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term]);

  const run = async (task) => {
    setBusy(true);
    setError('');

    try {
      await task();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  const toggle = (person) => {
    setSelected((prev) =>
      prev.some((p) => p._id === person._id)
        ? prev.filter((p) => p._id !== person._id)
        : [...prev, person]
    );
  };

  const handlePick = (person) => {
    if (mode === 'direct') {
      run(() => onStartChat(person._id));
      return;
    }

    toggle(person);
  };

  const canCreateGroup = groupName.trim().length > 0 && selected.length > 0 && !busy;

  return (
    <Modal title={mode === 'direct' ? 'New chat' : 'New group'} onClose={onClose}>
      <div className="mb-3 flex gap-2">
        <button type="button" onClick={() => setMode('direct')} className={modeButtonClass(mode === 'direct')}>
          One person
        </button>
        <button type="button" onClick={() => setMode('group')} className={modeButtonClass(mode === 'group')}>
          New group
        </button>
      </div>

      {mode === 'group' && (
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          maxLength={50}
          placeholder="Group name"
          aria-label="Group name"
          className="mb-3 w-full rounded-lg bg-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
      )}

      {mode === 'group' && selected.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2">
          {selected.map((person) => (
            <li key={person._id} className="flex items-center gap-1 rounded-full bg-slate-700 py-1 pl-3 pr-2 text-xs">
              {person.username}
              <button
                type="button"
                onClick={() => toggle(person)}
                aria-label={`Remove ${person.username}`}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        type="search"
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search people by username"
        aria-label="Search people"
        className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
      />

      {!term && <p className="mt-3 text-sm text-slate-500">Type a username to find people.</p>}

      {term && (
        <ul className="mt-3 max-h-60 overflow-y-auto rounded-lg bg-slate-700/50">
          {results === null && <li className="px-3 py-2 text-sm text-slate-400">Searching...</li>}

          {results?.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-400">No one found with that name.</li>
          )}

          {results?.map((person) => {
            const picked = selected.some((p) => p._id === person._id);

            return (
              <li key={person._id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handlePick(person)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-700 disabled:opacity-60"
                >
                  <Avatar name={person.username} size="sm" />
                  <span className="flex-1 truncate">{person.username}</span>
                  {mode === 'group' && picked && <span aria-hidden="true">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {mode === 'group' && (
        <button
          type="button"
          disabled={!canCreateGroup}
          onClick={() =>
            run(() =>
              onCreateGroup({ name: groupName.trim(), memberIds: selected.map((person) => person._id) })
            )
          }
          className="mt-4 w-full rounded-lg bg-emerald-600 py-2 font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Creating...' : 'Create group'}
        </button>
      )}
    </Modal>
  );
}