import React from 'react';
import PropTypes from 'prop-types';

const ChatIcon = ({ onClick, isOpen, unreadCount = 0 }) => {
  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .chat-icon-button {
          background: linear-gradient(135deg, #0984e3 0%, #0652DD 100%);
        }
        .chat-icon-button:hover {
          animation: float 2s ease-in-out infinite;
        }
        .pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onClick}
          className={`
            chat-icon-button relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ease-in-out
            ${isOpen 
              ? 'rotate-0 scale-95' 
              : 'hover:scale-110'
            }
          `}
          aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
        >
          {/* Icon */}
          {isOpen ? (
            <svg className="w-8 h-8 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
            </svg>
          )}
          
          {/* Unread message indicator */}
          {!isOpen && unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
          
          {/* Pulse rings when closed */}
          {!isOpen && (
            <>
              <div className="pulse-ring absolute inset-0 rounded-full border-4 border-[#0984e3]"></div>
              <div className="pulse-ring absolute inset-0 rounded-full border-4 border-[#0984e3]" style={{ animationDelay: '1s' }}></div>
            </>
          )}
        </button>
      </div>
    </>
  );
};

ChatIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  unreadCount: PropTypes.number,
};

export default ChatIcon;
