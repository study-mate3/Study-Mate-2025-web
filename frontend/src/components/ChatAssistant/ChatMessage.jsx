import React from 'react';
import PropTypes from 'prop-types';

const ChatMessage = ({ message, isUser, timestamp, messageType = 'normal' }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%]`}>
        {/* Message Bubble */}
        <div className={`
          px-4 py-3 shadow-sm
          ${isUser 
            ? 'bg-gradient-to-r from-[#0984e3] to-[#0652DD] text-white rounded-[16px] rounded-br-none' 
            : messageType === 'success'
              ? 'bg-green-50 text-green-800 rounded-[16px] rounded-bl-none border border-green-200'
              : messageType === 'error'
                ? 'bg-red-50 text-red-800 rounded-[16px] rounded-bl-none border border-red-200'
                : messageType === 'info'
                  ? 'bg-blue-50 text-blue-800 rounded-[16px] rounded-bl-none border border-blue-200'
                  : messageType === 'followUp'
                    ? 'bg-yellow-50 text-yellow-800 rounded-[16px] rounded-bl-none border border-yellow-200'
                    : messageType === 'confirm'
                      ? 'bg-purple-50 text-purple-800 rounded-[16px] rounded-bl-none border border-purple-200'
                      : 'bg-white text-gray-800 rounded-[16px] rounded-bl-none'
          }
        `}>
          <div className="whitespace-pre-wrap break-words leading-relaxed">
            {message}
          </div>
        </div>
        
        {/* Timestamp */}
        {timestamp && (
          <div className={`text-[11px] text-gray-400 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(timestamp)}
          </div>
        )}
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.string.isRequired,
  isUser: PropTypes.bool.isRequired,
  messageType: PropTypes.oneOf(['normal', 'success', 'error', 'info', 'followUp', 'confirm']),
  timestamp: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
};

export default ChatMessage;
