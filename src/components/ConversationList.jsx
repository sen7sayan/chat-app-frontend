'use client';

import { formatDistanceToNow } from 'date-fns';

export default function ConversationList({ conversations, selectedChat, onSelectChat, loading }) {
  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border-b border-gray-200 animate-pulse">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-500 text-sm">No conversations yet</p>
          <p className="text-gray-400 text-xs mt-1">Start a new chat to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => {
        const participant = conversation.participants[0];
        const isSelected = selectedChat?._id === conversation._id;
        const displayName = participant.name || participant.phone;
        const lastMessage = conversation.lastMessage;

        return (
          <button
            key={conversation._id}
            onClick={() => onSelectChat(conversation)}
            className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
              isSelected ? 'bg-emerald-50' : ''
            }`}
          >
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {displayName}
                  </h3>
                  {lastMessage && (
                    <span className="text-xs text-gray-500 ml-2">
                      {formatTime(lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                {lastMessage && (
                  <p className="text-sm text-gray-600 truncate">
                    {lastMessage.text}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
