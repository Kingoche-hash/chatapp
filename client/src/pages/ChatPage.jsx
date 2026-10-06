import { useEffect, useState } from 'react';
import ConnectionBanner from '../components/ConnectionBanner';
import MessagePane from '../components/MessagePane';
import Sidebar from '../components/Sidebar';
import { useConversations } from '../hooks/useConversations';
import { useDeliveryReceipts } from '../hooks/useDeliveryReceipts';
import { useMessageNotifications } from '../hooks/useMessageNotifications';
import { startDirectConversation } from '../services/chat.service';

export default function ChatPage() {
  const [activeId, setActiveId] = useState(null);

  // Set when the person clicks a search result: which message to open the chat around.
  const [jump, setJump] = useState(null);

  const { conversations, loading, error, addConversation, reload } = useConversations(activeId);

  // Tells the server "delivered" for every incoming message, even in chats that are not open.
  useDeliveryReceipts();

  const active = conversations.find((c) => c._id === activeId) || null;
  const aroundId = jump && active && jump.conversationId === active._id ? jump.messageId : null;

  const handleSelect = (id) => {
    setJump(null);
    setActiveId(id);
  };

  const handleOpenResult = (result) => {
    setJump({ conversationId: result.conversation, messageId: result._id, nonce: Date.now() });
    setActiveId(result.conversation);
  };

  const handleStartChat = async (userId) => {
    const conversation = await startDirectConversation(userId);
    addConversation(conversation);
    setJump(null);
    setActiveId(conversation._id);
  };

  // "Try again" inside a chat: opening it afresh loads its messages again.
  const handleRetryMessages = () => {
    setJump({ conversationId: activeId, messageId: null, nonce: Date.now() });
  };

  // Pop-ups and desktop notifications for chats that are not in front.
  useMessageNotifications({ conversations, activeId, onOpen: handleSelect });

  // The browser tab shows the number of unread messages, like "(3) CHATAPP".
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  useEffect(() => {
    document.title = totalUnread > 0 ? `(${totalUnread}) CHATAPP` : 'CHATAPP';

    return () => {
      document.title = 'CHATAPP';
    };
  }, [totalUnread]);

  return (
    <div className="flex h-dvh flex-col bg-slate-900 text-slate-100">
      <ConnectionBanner />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          className={active ? 'hidden md:flex' : 'flex'}
          conversations={conversations}
          activeConversation={active}
          loading={loading}
          error={error}
          activeId={activeId}
          onSelect={handleSelect}
          onStartChat={handleStartChat}
          onOpenResult={handleOpenResult}
          onRetry={reload}
        />

        <main className={`${active ? 'flex' : 'hidden md:flex'} min-h-0 min-w-0 flex-1`}>
          {active ? (
            <MessagePane
              key={`${active._id}:${jump?.nonce ?? 'latest'}`}
              conversation={active}
              aroundId={aroundId}
              onBack={() => setActiveId(null)}
              onRetry={handleRetryMessages}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-slate-500">
              <p className="text-5xl" aria-hidden="true">💬</p>
              <p className="font-medium text-slate-300">Welcome to CHATAPP</p>
              <p className="text-sm">Select a conversation, or search for someone to start chatting.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}