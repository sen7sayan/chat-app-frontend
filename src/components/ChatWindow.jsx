'use client';

import { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatWindow({ conversation, onBack, showBackButton, onRefreshConversations }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, hasMore: false });
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  const participant = conversation.participants[0];
  const displayName = participant.name || participant.phone;
  const receiverId = participant.id;

  useEffect(() => {
    if (receiverId) {
      fetchMessages(1, true);
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [receiverId]);

  const startPolling = () => {
    stopPolling();
    pollingIntervalRef.current = setInterval(() => {
      fetchLatestMessages();
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const fetchLatestMessages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FRONT_URL}/user/conversation/${receiverId}?page=1&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.data) {
        // API returns oldest first, we keep that order (oldest to newest)
        const latestMessages = data.data;
        
        if (latestMessages.length > 0) {
          const lastMessageId = messages.length > 0 ? messages[messages.length - 1]._id : null;
          const newMessages = lastMessageId 
            ? latestMessages.filter(msg => {
                const lastIndex = latestMessages.findIndex(m => m._id === lastMessageId);
                return lastIndex === -1 || latestMessages.indexOf(msg) > lastIndex;
              })
            : latestMessages;

          if (newMessages.length > 0) {
            setMessages(latestMessages);
            const scrollContainer = messagesEndRef.current?.parentElement;
            if (scrollContainer) {
              const isNearBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 100;
              if (isNearBottom) {
                setTimeout(() => scrollToBottom(), 100);
              }
            }
            onRefreshConversations();
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch latest messages:', error);
    }
  };

  const fetchMessages = async (page = 1, isInitial = false) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FRONT_URL}/user/conversation/${receiverId}?page=${page}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        if (isInitial) {
          // Keep original order from API (oldest to newest)
          setMessages(data.data || []);
          setTimeout(() => scrollToBottom(), 100);
        } else {
          // Prepend older messages to the top
          setMessages(prev => [...data.data, ...prev]);
        }
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    setSending(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FRONT_URL}/user/messages/first`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            receiverId: receiverId.toString(),
            text: text,
            type: 'text',
            attachments: [],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Append new message to the end
        setMessages(prev => [...prev, data.data]);
        scrollToBottom();
        onRefreshConversations();
        setTimeout(() => fetchLatestMessages(), 500);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && !loading) {
      fetchMessages(pagination.page + 1, false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={onBack}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{displayName}</h2>
          <p className="text-sm text-gray-500">+91 {participant.phone}</p>
        </div>
        <button className="w-10 h-10 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        loading={loading}
        hasMore={pagination.hasMore}
        onLoadMore={handleLoadMore}
        messagesEndRef={messagesEndRef}
        currentUserId={localStorage.getItem('userId')}
      />

      {/* Input */}
      <MessageInput onSend={handleSendMessage} sending={sending} />
    </div>
  );
}
