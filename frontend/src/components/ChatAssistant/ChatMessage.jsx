import React from 'react';
import PropTypes from 'prop-types';
import { UserIcon, CpuChipIcon } from '@heroicons/react/24/outline';

const ChatMessage = ({ message, isUser, isTyping = false, timestamp, messageType = 'normal' }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${isUser ? 'bg-blue-600' : 'bg-gray-600'}
          `}>
            {isUser ? (
              <UserIcon className="w-5 h-5 text-white" />
            ) : (
              <CpuChipIcon className="w-5 h-5 text-white" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`
          flex flex-col ${isUser ? 'items-end' : 'items-start'}
        `}>
          <div className={`
            px-4 py-2 rounded-lg max-w-full
            ${isUser 
              ? 'bg-blue-600 text-white rounded-br-none' 
              : messageType === 'success'
                ? 'bg-green-100 text-green-800 rounded-bl-none border border-green-200'
                : messageType === 'error'
                  ? 'bg-red-100 text-red-800 rounded-bl-none border border-red-200'
                  : messageType === 'followUp'
                    ? 'bg-yellow-50 text-yellow-800 rounded-bl-none border border-yellow-200'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
            }
          `}>
            {isTyping ? (
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words">
                {message}
              </div>
            )}
          </div>
          
          {/* Timestamp */}
          {timestamp && !isTyping && (
            <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
              {formatTime(timestamp)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.string.isRequired,
  isUser: PropTypes.bool.isRequired,
  isTyping: PropTypes.bool,
  messageType: PropTypes.oneOf(['normal', 'success', 'error', 'followUp']),
  timestamp: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
};

export default ChatMessage;
