import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  XMarkIcon, 
  PaperAirplaneIcon, 
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import ChatMessage from './ChatMessage';
import { useAuth } from '../../contexts/AuthContext';

const ChatWindow = ({ isOpen, onClose, onTaskCreate }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      message: "Hi! I'm your AI assistant. Tell me about your tasks, plans, or work you need to do, and I'll help you organize them into your task list!",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      message: inputMessage.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Call AI backend API
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.message,
          userId: currentUser?.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      setIsTyping(false);
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        message: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // If AI extracted tasks, create them
      if (data.tasks && data.tasks.length > 0) {
        for (const task of data.tasks) {
          try {
            await onTaskCreate(task);
            // Add success message
            const successMessage = {
              id: Date.now() + Math.random(),
              message: `✅ Created task: "${task.description}"`,
              isUser: false,
              timestamp: new Date(),
              messageType: 'success',
            };
            setMessages(prev => [...prev, successMessage]);
          } catch (error) {
            console.error('Error creating task:', error);
            const errorMessage = {
              id: Date.now() + Math.random(),
              message: `❌ Failed to create task: "${task.description}"`,
              isUser: false,
              timestamp: new Date(),
              messageType: 'error',
            };
            setMessages(prev => [...prev, errorMessage]);
          }
        }
      }

      // If AI has a follow-up question, ask it
      if (data.needsFollowUp && data.followUpQuestion) {
        setTimeout(() => {
          const followUpMessage = {
            id: Date.now() + Math.random(),
            message: data.followUpQuestion,
            isUser: false,
            timestamp: new Date(),
            messageType: 'followUp',
          };
          setMessages(prev => [...prev, followUpMessage]);
        }, 1000); // Delay for better UX
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      const errorMessage = {
        id: Date.now() + 1,
        message: "Sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        message: "Hi! I'm your AI assistant. Tell me about your tasks, plans, or work you need to do, and I'll help you organize them into your task list!",
        isUser: false,
        timestamp: new Date(),
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl z-40 flex flex-col border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="font-semibold">AI Task Assistant</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
            title="Clear chat"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
            title="Close chat"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.message}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
            messageType={msg.messageType}
          />
        ))}
        
        {isTyping && (
          <ChatMessage
            message=""
            isUser={false}
            isTyping={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tell me about your tasks or plans..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`
              p-2 rounded-lg transition-colors
              ${!inputMessage.trim() || isLoading
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

ChatWindow.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onTaskCreate: PropTypes.func.isRequired,
};

export default ChatWindow;
