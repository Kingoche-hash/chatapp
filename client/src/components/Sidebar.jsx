import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { getConversationTitle } from '../utils/conversation';
import { formatTime } from '../utils/formatTime';
import UserSearch from './UserSearch';

export default function Sidebar({
  conversations,
  loading,
  error,
  activeId,
  onSelect,
  onStartChat,
  className = '',
}) {
  const { user, logout } = useAuth();
  const { connected } = useSocket();

  return (
    <aside
      className={`${className} w-full md:w-80 shrink-0 flex-col border-r border-slate-700 bg-slate-800`}
    >
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{user.username}</p>
          <p className="flex items-center gap-1 text-xs text-slate-400">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                connected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            {connected ? 'Live' : 'Connecting...'}
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg bg-slate-700 px-3 py-1 text-sm hover:bg-slate-600"
        >
          Log out
        </button>
      </div>

      <UserSearch onPick={onStartChat} />

      <ul className="flex-1 overflow-y-auto">
        {loading && <li className="px-4 py-3 text-sm text-slate-400">Loading conversations...</li>}

        {error && (
          <li role="alert" className="px-4 py-3 text-sm text-red-400">
            {error}
          </li>
        )}

        {!loading && !error && conversations.length === 0 && (
          <li className="px-4 py-3 text-sm text-slate-500">
            No conversations yet. Search for someone above to start one.
          </li>
        )}

        {conversations.map((conversation) => (
          <li key={conversation._id}>
            <button
              onClick={() => onSelect(conversation._id)}
              className={`w-full border-b border-slate-700/50 px-4 py-3 text-left hover:bg-slate-700/60 ${
                conversation._id === activeId ? 'bg-slate-700' : ''
              }`}
            >
              <div className="flex justify-between gap-2">
                <span className="truncate font-medium">
                  {getConversationTitle(conversation, user._id)}
                </span>
                {conversation.lastMessage && (
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatTime(conversation.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-slate-400">
                {conversation.lastMessage?.content || 'No messages yet'}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}