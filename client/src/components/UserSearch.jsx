import { useEffect, useState } from 'react';
import { searchUsersRequest } from '../services/chat.service';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function UserSearch({ onPick }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

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

  const handlePick = async (userId) => {
    try {
      await onPick(userId);
      setQuery('');
      setResults(null);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="border-b border-slate-700 p-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search people to chat with"
        aria-label="Search people"
        className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
      />

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}

      {term && (
        <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-slate-700">
          {results === null && <li className="px-3 py-2 text-sm text-slate-400">Searching...</li>}

          {results?.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-400">No users found</li>
          )}

          {results?.map((person) => (
            <li key={person._id}>
              <button
                onClick={() => handlePick(person._id)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-600"
              >
                {person.username}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}