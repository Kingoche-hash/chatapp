import { useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMessages } from '../hooks/useMessages';
import { getConversationTitle } from '../utils/conversation';
import { formatTime } from '../utils/formatTime';
import MessageComposer from './MessageComposer';

export default function MessagePane({ conversation, onBack }) {
  const { user } = useAuth();
  const { messages, loading, error, hasMore, loadingOlder, loadOlder, send } = useMessages(
    conversation._id
  );

  const bottomRef = useRef(null);
  const lastId = messages.at(-1)?._id;

  // Scroll to the newest message whenever a new one arrives.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [lastId]);

  const title = getConversationTitle(conversation, user._id);

  return (
    <section className="flex flex-col flex-1 min-w-0">
      <header className="flex items-center gap-3 border-b border-slate-700 px-4 py-3">
        <button
          onClick={onBack}
          aria-label="Back to conversations"
          className="md:hidden rounded-lg px-2 py-1 hover:bg-slate-700"
        >
          ←
        </button>
        <div className="min-w-0">
          <h2 className="font-semibold truncate">{title}</h2>
          {conversation.type === 'group' && (
            <p className="text-xs text-slate-400">{conversation.members.length} members</p>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {hasMore && (
          <div className="text-center">
            <button
              onClick={loadOlder}
              disabled={loadingOlder}
              className="text-sm text-emerald-400 hover:underline disabled:opacity-60"
            >
              {loadingOlder ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}

        {loading && <p className="text-center text-sm text-slate-400">Loading messages...</p>}

        {error && (
          <p role="alert" className="text-center text-sm text-red-400">
            {error}
          </p>
        )}

        {!loading && !error && messages.length === 0 && (
          <p className="text-center text-sm text-slate-500">No messages yet. Say hello!</p>
        )}

        {messages.map((message) => {
          const mine = message.sender._id === user._id;

          return (
            <div key={message._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                  mine ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                {!mine && conversation.type === 'group' && (
                  <p className="text-xs font-semibold text-emerald-300">{message.sender.username}</p>
                )}
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <p className="mt-1 text-right text-[10px] text-slate-300/70">
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <MessageComposer onSend={send} />
    </section>
  );
}