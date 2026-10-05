import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMessageSearch } from '../hooks/useMessageSearch';
import { getConversationTitle } from '../utils/conversation';
import { formatDateTime } from '../utils/formatDateTime';
import HighlightedText from './HighlightedText';

const scopeButtonClass = (selected) =>
  `flex-1 rounded-md px-2 py-1 text-xs ${
    selected ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
  }`;

export default function SearchPanel({ conversations, activeConversation, onOpen }) {
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('all');
  const [senderId, setSenderId] = useState('');

  const searchInChat = scope === 'chat' && Boolean(activeConversation);
  const conversationId = searchInChat ? activeConversation._id : undefined;

  // Who can be picked in the "From" menu.
  const senderOptions = [
    { _id: '', username: 'Anyone' },
    { _id: user._id, username: 'Me' },
  ];

  if (searchInChat) {
    activeConversation.members
      .filter((member) => member._id !== user._id)
      .forEach((member) => senderOptions.push(member));
  }

  // A person who is no longer in the menu falls back to "Anyone".
  const effectiveSenderId = senderOptions.some((option) => option._id === senderId) ? senderId : '';

  const { active, results, hasMore, loading, error, searched, loadMore } = useMessageSearch({
    query,
    conversationId,
    senderId: effectiveSenderId || undefined,
  });

  const conversationById = new Map(conversations.map((conversation) => [conversation._id, conversation]));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-2 border-b border-slate-700 p-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search messages"
          aria-label="Search messages"
          className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <div className="flex gap-2">
          <button type="button" onClick={() => setScope('all')} className={scopeButtonClass(!searchInChat)}>
            All chats
          </button>
          <button
            type="button"
            onClick={() => setScope('chat')}
            disabled={!activeConversation}
            title={activeConversation ? 'Search only the open chat' : 'Open a chat first'}
            className={`${scopeButtonClass(searchInChat)} disabled:opacity-40`}
          >
            This chat
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-400">
          From
          <select
            value={effectiveSenderId}
            onChange={(e) => setSenderId(e.target.value)}
            className="flex-1 rounded-md bg-slate-700 px-2 py-1 text-xs text-slate-200"
          >
            {senderOptions.map((option) => (
              <option key={option._id || 'anyone'} value={option._id}>
                {option.username}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {!active && (
          <li className="px-4 py-3 text-sm text-slate-500">
            Type at least 2 letters. Search finds whole words. Put quotes around words to find an exact
            phrase.
          </li>
        )}

        {active && !searched && loading && (
          <li className="px-4 py-3 text-sm text-slate-400">Searching...</li>
        )}

        {error && (
          <li role="alert" className="px-4 py-3 text-sm text-red-400">
            {error}
          </li>
        )}

        {active && searched && !loading && !error && results.length === 0 && (
          <li className="px-4 py-3 text-sm text-slate-500">No messages found.</li>
        )}

        {results.map((result) => {
          const conversation = conversationById.get(result.conversation);

          return (
            <li key={result._id}>
              <button
                type="button"
                onClick={() => onOpen(result)}
                className="w-full border-b border-slate-700/50 px-4 py-3 text-left hover:bg-slate-700/60"
              >
                <div className="flex justify-between gap-2 text-xs text-slate-400">
                  <span className="truncate font-medium text-slate-200">
                    {conversation ? getConversationTitle(conversation, user._id) : 'Chat'}
                  </span>
                  <span className="shrink-0">{formatDateTime(result.createdAt)}</span>
                </div>
                <p className="text-xs text-emerald-300">
                  {result.sender._id === user._id ? 'You' : result.sender.username}
                </p>
                <p className="line-clamp-2 break-words text-sm">
                  <HighlightedText text={result.content} query={query} />
                </p>
              </button>
            </li>
          );
        })}

        {hasMore && (
          <li className="px-4 py-3 text-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              className="text-sm text-emerald-400 hover:underline disabled:opacity-60"
            >
              {loading ? 'Loading...' : 'Load more results'}
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}