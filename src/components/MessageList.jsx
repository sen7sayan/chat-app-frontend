'use client';

import { useEffect, useRef } from 'react';
import { format, isValid, parseISO } from 'date-fns';

export default function MessageList({ messages, loading, hasMore, onLoadMore, messagesEndRef }) {
  const scrollContainerRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Intersection Observer for infinite scroll
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  const formatMessageTime = (timestamp) => {
    try {
      if (!timestamp) return '';
      const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
      if (!isValid(date)) return '';
      return format(date, 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const formatMessageDate = (timestamp) => {
    try {
      if (!timestamp) return '';
      const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
      if (!isValid(date)) return '';
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const isSameDay = (date1, date2) => {
    try {
      if (!date1 || !date2) return false;
      const d1 = typeof date1 === 'string' ? parseISO(date1) : new Date(date1);
      const d2 = typeof date2 === 'string' ? parseISO(date2) : new Date(date2);
      if (!isValid(d1) || !isValid(d2)) return false;
      return d1.toDateString() === d2.toDateString();
    } catch {
      return false;
    }
  };

  const getCurrentUserId = () => {
    // You might want to store this in context or state
    // For now, we'll determine by checking senderId patterns
    return null;
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1d5db' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {/* Load More Trigger */}
      {hasMore && (
        <div ref={observerRef} className="text-center py-2">
          {loading ? (
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
              Loading more...
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Load more messages
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      {messages.map((message, index) => {
        const isOwnMessage = message.senderId === getCurrentUserId();
        const showDate = index === 0 || !isSameDay(
          messages[index - 1]?.createdAt,
          message.createdAt
        );

        return (
          <div key={message._id}>
            {/* Date Separator */}
            {showDate && (
              <div className="flex items-center justify-center my-4">
                <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-600 shadow-sm">
                  {formatMessageDate(message.createdAt)}
                </div>
              </div>
            )}

            {/* Message Bubble */}
            <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  isOwnMessage
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-gray-900 shadow-sm'
                }`}
              >
                <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
                <div className={`flex items-center gap-1 mt-1 justify-end`}>
                  <span className={`text-xs ${isOwnMessage ? 'text-emerald-100' : 'text-gray-500'}`}>
                    {formatMessageTime(message.createdAt)}
                  </span>
                  {isOwnMessage && (
                    <svg
                      className={`w-4 h-4 ${
                        message.status === 'read' ? 'text-blue-300' : 'text-emerald-100'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
}
