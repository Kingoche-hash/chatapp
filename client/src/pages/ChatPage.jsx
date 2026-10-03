import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MessagePane from '../components/MessagePane';
import { useConversations } from '../hooks/useConversations';
import { startDirectConversation } from '../services/chat.service';

export default function ChatPage() {
  const { conversations, loading, error, addConversation } = useConversations();
  const [activeId, setActiveId] = useState(null);

  const active = conversations.find((c) => c._id === activeId) || null;

  const handleStartChat = async (userId) => {
    const conversation = await startDirectConversation(userId);
    addConversation(conversation);
    setActiveId(conversation._id);
  };

  return (
    <div className="flex h-dvh bg-slate-900 text-slate-100">
      <Sidebar
        className={active ? 'hidden md:flex' : 'flex'}
        conversations={conversations}
        loading={loading}
        error={error}
        activeId={activeId}
        onSelect={setActiveId}
        onStartChat={handleStartChat}
      />

      <main className={`${active ? 'flex' : 'hidden md:flex'} min-w-0 flex-1`}>
        {active ? (
          <MessagePane
            key={active._id}
            conversation={active}
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