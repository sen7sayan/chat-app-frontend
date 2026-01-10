'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConversationList from '@/components/ConversationList';
import ChatWindow from '@/components/ChatWindow';
import NewChatModal from '@/components/NewChatModal';

export default function ChatDashboard() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_FRONT_URL}/user/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setConversations(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (conversation) => {
    setSelectedChat(conversation);
  };

  const handleNewChat = (user) => {
    // Check if conversation already exists
    const existing = conversations.find(
      conv => conv.participants.some(p => p.id === user.id)
    );
    
    if (existing) {
      setSelectedChat(existing);
    } else {
      // Create a temporary conversation object
      setSelectedChat({
        participants: [{ id: user.id, phone: user.phone, name: user.name }],
        type: 'private',
        _id: null, // Will be created on first message
      });
    }
    setShowNewChat(false);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className={`${
        isMobile ? (selectedChat ? 'hidden' : 'w-full') : 'w-full lg:w-96'
      } bg-white border-r border-gray-200 flex flex-col`}>
        {/* Header */}
        <div className="bg-emerald-600 p-4 flex items-center justify-between">
          <h1 className="text-white text-xl font-semibold">Convoo</h1>
          <button
            onClick={() => setShowNewChat(true)}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <ConversationList
          conversations={conversations}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          loading={loading}
        />
      </div>

      {/* Main Chat Area */}
      <div className={`${
        isMobile ? (selectedChat ? 'w-full' : 'hidden') : 'flex-1'
      } bg-gray-100 flex flex-col`}>
        {selectedChat ? (
          <ChatWindow
            conversation={selectedChat}
            onBack={handleBackToList}
            showBackButton={isMobile}
            onRefreshConversations={fetchConversations}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-6 bg-emerald-50 rounded-full flex items-center justify-center">
                <svg className="w-24 h-24 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Convoo</h2>
              <p className="text-gray-500 mb-6">Select a chat to start messaging</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onSelectUser={handleNewChat}
        />
      )}
    </div>
  );
}
