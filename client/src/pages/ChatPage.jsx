import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MessagePane from '../components/MessagePane';
import { useConversations } from '../hooks/useConversations';
import { useDeliveryReceipts } from '../hooks/useDeliveryReceipts';
import { startDirectConversation } from '../services/chat.service';

export default function ChatPage() {
  const { conversations, loading, error, addConversation } = useConversations();
  const [activeId, setActiveId] = useState(null);

  // Set when the person clicks a search result: which message to open the chat around.
  const [jump, setJump] = useState(null);

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

  return (
    <div className="flex h-dvh bg-slate-900 text-slate-100">
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
      />

      <main className={`${active ? 'flex' : 'hidden md:flex'} min-w-0 flex-1`}>
        {active ? (
          <MessagePane
            key={`${active._id}:${jump?.nonce ?? 'latest'}`}
            conversation={active}
            aroundId={aroundId}
            onBack={() => setActiveId(null)}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-slate-500">
            Select a conversation, or search for someone to start chatting.
          </div>
        )}
      </main>
    </div>
  );
}