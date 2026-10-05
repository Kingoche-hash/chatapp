import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMessages } from '../hooks/useMessages';
import { usePresence } from '../hooks/usePresence';
import { useReadReceipts } from '../hooks/useReadReceipts';
import { useTyping } from '../hooks/useTyping';
import { useTypingEmitter } from '../hooks/useTypingEmitter';
import { getConversationTitle, getOtherMember } from '../utils/conversation';
import { formatLastSeen } from '../utils/formatLastSeen';
import { formatTime } from '../utils/formatTime';
import { formatTyping } from '../utils/formatTyping';
import { getMessageStatus } from '../utils/messageStatus';
import AttachmentList from './AttachmentList';
import MessageComposer from './MessageComposer';
import MessageStatus from './MessageStatus';

export default function MessagePane({ conversation, onBack, aroundId = null }) {
  const { user } = useAuth();
  const { isOnline, getLastSeen } = usePresence();
  const { getTypingNames } = useTyping();
  const {
    messages,
    loading,
    error,
    hasMore,
    loadingOlder,
    loadOlder,
    hasNewer,
    loadingNewer,
    loadNewer,
    jumpToLatest,
    send,
    sendFiles,
  } = useMessages(conversation._id, aroundId);
  const { notifyTyping, stopTyping } = useTypingEmitter(conversation._id);

  // Reports "read" while this chat is open and the window is in front.
  useReadReceipts(conversation._id, messages);

  const bottomRef = useRef(null);
  const jumpedRef = useRef(false);
  const lastId = messages.at(-1)?._id;

  // The message we jumped to glows for a few seconds.
  const [highlightId, setHighlightId] = useState(aroundId);

  useEffect(() => {
    if (!aroundId) return;

    const timer = setTimeout(() => setHighlightId(null), 3000);
    return () => clearTimeout(timer);
  }, [aroundId]);

  // Scrolling: first to the message we jumped to, otherwise to the newest message.
  useEffect(() => {
    if (loading) return;

    if (aroundId && !jumpedRef.current) {
      const target = document.getElementById(`message-${aroundId}`);

      if (target) {
        target.scrollIntoView({ block: 'center' });
        jumpedRef.current = true;
        return;
      }
    }

    if (!hasNewer) bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [loading, lastId, aroundId, hasNewer]);

  const title = getConversationTitle(conversation, user._id);
  const typingText = formatTyping(getTypingNames(conversation._id));

  // The line under the title: "Online", "Last seen ...", or "3 members, 2 online".
  let status = '';
  let statusIsOnline = false;

  if (conversation.type === 'direct') {
    const other = getOtherMember(conversation, user._id);

    if (other) {
      statusIsOnline = isOnline(other._id);
      status = statusIsOnline ? 'Online' : formatLastSeen(getLastSeen(other));
    }
  } else {
    const onlineCount = conversation.members.filter(
      (member) => member._id === user._id || isOnline(member._id)
    ).length;

    status = `${conversation.members.length} members, ${onlineCount} online`;
  }

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
          {status && (
            <p className={`text-xs ${statusIsOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
              {status}
            </p>
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
          const glowing = highlightId === message._id;

          return (
            <div
              key={message._id}
              id={`message-${message._id}`}
              className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 transition-shadow ${
                  mine ? 'bg-emerald-600' : 'bg-slate-700'
                } ${glowing ? 'ring-2 ring-amber-300' : ''}`}
              >
                {!mine && conversation.type === 'group' && (
                  <p className="text-xs font-semibold text-emerald-300">{message.sender.username}</p>
                )}

                <AttachmentList attachments={message.attachments} />

                {message.content && (
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                )}

                <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-300/70">
                  <span>{formatTime(message.createdAt)}</span>
                  {mine && (
                    <MessageStatus status={getMessageStatus(message, conversation, user._id)} />
                  )}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {hasNewer && (
        <div className="flex items-center justify-center gap-4 border-t border-slate-700 bg-slate-800 px-4 py-2 text-sm">
          <span className="text-slate-400">You are reading older messages</span>
          <button
            onClick={loadNewer}
            disabled={loadingNewer}
            className="text-emerald-400 hover:underline disabled:opacity-60"
          >
            {loadingNewer ? 'Loading...' : 'Load newer'}
          </button>
          <button onClick={jumpToLatest} className="text-emerald-400 hover:underline">
            Jump to latest
          </button>
        </div>
      )}

      <div className="h-5 px-4 text-xs italic text-emerald-400">{typingText}</div>

      <MessageComposer
        onSend={send}
        onSendFiles={sendFiles}
        onTyping={notifyTyping}
        onStopTyping={stopTyping}
      />
    </section>
  );
}