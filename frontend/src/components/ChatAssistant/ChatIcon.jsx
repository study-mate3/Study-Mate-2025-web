import React from 'react';
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

const ChatIcon = ({ onClick, isOpen, unreadCount = 0 }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={onClick}
        className={`
          relative w-16 h-16 rounded-full shadow-lg transition-all duration-300 ease-in-out
          ${isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-blue-600 hover:bg-blue-700 hover:scale-110'
          }
        `}
        aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
      >
        {isOpen ? (
          <div className="w-8 h-8 mx-auto">
            <div className="w-full h-0.5 bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-0.5 h-full bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        ) : (
          <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8 text-white mx-auto" />
        )}
        
        {/* Unread message indicator */}
        {!isOpen && unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        )}
        
        {/* Pulse animation when closed */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20"></div>
        )}
      </button>
    </div>
  );
};

ChatIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  unreadCount: PropTypes.number,
};

export default ChatIcon;
