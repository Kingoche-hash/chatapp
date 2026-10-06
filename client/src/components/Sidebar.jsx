import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePresence } from '../hooks/usePresence';
import { useSocket } from '../hooks/useSocket';
import { useTyping } from '../hooks/useTyping';
import { getConversationTitle, getOtherMember } from '../utils/conversation';
import { formatTime } from '../utils/formatTime';
import { formatTyping } from '../utils/formatTyping';
import { getMessagePreview } from '../utils/messagePreview';
import Avatar from './Avatar';
import SearchPanel from './SearchPanel';
import { ConversationListSkeleton } from './Skeleton';
import UserSearch from './UserSearch';

const tabClass = (selected) =>
  `flex-1 py-2 text-sm font-medium ${
    selected ? 'border-b-2 border-emerald-400 text-white' : 'text-slate-400 hover:text-slate-200'
  }`;

export default function Sidebar({
  conversations,
  activeConversation,
  loading,
  error,
  activeId,
  onSelect,
  onStartChat,
  onOpenResult,
  onRetry,
  className = '',
}) {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const { isOnline } = usePresence();
  const { getTypingNames } = useTyping();

  const [tab, setTab] = useState('chats');

  // Desktop notifications need the person's permission first.
  const [permission, setPermission] = useState(() =>
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  const enableNotifications = async () => {
    setPermission(await Notification.requestPermission());
  };

  return (
    <aside
      className={`${className} w-full md:w-80 shrink-0 flex-col border-r border-slate-700 bg-slate-800`}
    >
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={user.username} size="sm" />
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
        </div>
        <button
          onClick={logout}
          className="rounded-lg bg-slate-700 px-3 py-1 text-sm hover:bg-slate-600"
        >
          Log out
        </button>
      </div>

      {permission === 'default' && (
        <button
          type="button"
          onClick={enableNotifications}
          className="border-b border-slate-700 bg-slate-700/40 px-4 py-2 text-left text-xs text-emerald-300 hover:bg-slate-700"
        >
          🔔 Turn on desktop notifications
        </button>
      )}

      <div className="flex border-b border-slate-700">
        <button type="button" onClick={() => setTab('chats')} className={tabClass(tab === 'chats')}>
          Chats
        </button>
        <button type="button" onClick={() => setTab('search')} className={tabClass(tab === 'search')}>
          Search
        </button>
      </div>

      {tab === 'search' ? (
        <SearchPanel
          conversations={conversations}
          activeConversation={activeConversation}
          onOpen={onOpenResult}
        />
      ) : (
        <>
          <UserSearch onPick={onStartChat} />

          {loading && <ConversationListSkeleton />}

          {error && (
            <div role="alert" className="px-4 py-3 text-sm text-red-400">
              <p>{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 rounded-lg bg-slate-700 px-3 py-1 text-slate-100 hover:bg-slate-600"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && conversations.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              <p className="text-3xl" aria-hidden="true">💬</p>
              <p className="mt-2 font-medium text-slate-300">No conversations yet</p>
              <p className="mt-1">Search for someone above to start one.</p>
            </div>
          )}

          <ul className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => {
              const other =
                conversation.type === 'direct' ? getOtherMember(conversation, user._id) : null;
              const title = getConversationTitle(conversation, user._id);
              const typingText = formatTyping(getTypingNames(conversation._id));
              const unread = conversation.unreadCount || 0;

              return (
                <li key={conversation._id}>
                  <button
                    onClick={() => onSelect(conversation._id)}
                    className={`flex w-full items-center gap-3 border-b border-slate-700/50 px-4 py-3 text-left hover:bg-slate-700/60 ${
                      conversation._id === activeId ? 'bg-slate-700' : ''
                    }`}
                  >
                    <Avatar name={title} online={other ? isOnline(other._id) : null} />

                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={`truncate ${unread > 0 ? 'font-semibold' : 'font-medium'}`}>
                          {title}
                        </span>
                        {conversation.lastMessage && (
                          <span className="shrink-0 text-xs text-slate-400">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </span>

                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        {typingText ? (
                          <span className="block truncate text-sm italic text-emerald-400">
                            {typingText}
                          </span>
                        ) : (
                          <span
                            className={`block truncate text-sm ${
                              unread > 0 ? 'text-slate-200' : 'text-slate-400'
                            }`}
                          >
                            {getMessagePreview(conversation.lastMessage)}
                          </span>
                        )}

                        {unread > 0 && (
                          <span
                            aria-label={`${unread} unread messages`}
                            className="shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white"
                          >
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </aside>
  );
}