import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  XMarkIcon, 
  PaperAirplaneIcon, 
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import ChatMessage from './ChatMessage';
import { useAuth } from '../../contexts/AuthContext';

const ChatWindow = ({ isOpen, onClose, onTaskCreate }) => {
  const { currentUser } = useAuth();
  
  // Initialize messages from localStorage or use default
  const getInitialMessages = () => {
    try {
      const savedMessages = localStorage.getItem(`chat_messages_${currentUser?.uid}`);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        return parsed.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    return [
      {
        id: 1,
        message: "Hi! I'm your AI assistant. Tell me about your tasks, plans, or work you need to do, and I'll help you organize them into your task list!",
        isUser: false,
        timestamp: new Date(),
      }
    ];
  };
  
  const [messages, setMessages] = useState(getInitialMessages());
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    try {
      return localStorage.getItem(`chat_session_${currentUser?.uid}`) || null;
    } catch {
      return null;
    }
  });
  const [pendingConfirmations, setPendingConfirmations] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]); // Store pending tasks from bot
  const [showClearModal, setShowClearModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (currentUser?.uid && messages.length > 0) {
      try {
        localStorage.setItem(`chat_messages_${currentUser.uid}`, JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [messages, currentUser]);
  
  // Save session ID to localStorage whenever it changes
  useEffect(() => {
    if (currentUser?.uid && sessionId) {
      try {
        localStorage.setItem(`chat_session_${currentUser.uid}`, sessionId);
      } catch (error) {
        console.error('Error saving session ID:', error);
      }
    }
  }, [sessionId, currentUser]);

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
      // Call AI backend API with session ID and pending tasks
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.message,
          userId: currentUser?.uid,
          sessionId: sessionId, // Include session ID to maintain context
          pendingTasks: pendingTasks, // Include pending tasks for context continuity
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Store session ID for future messages
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
      
      // Store pending tasks for next request - CRITICAL for memory!
      if (data.pendingTasks) {
        setPendingTasks(data.pendingTasks);
      } else {
        setPendingTasks([]); // Clear if no pending tasks
      }
      
      setIsTyping(false);
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        message: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Show pending tasks info if any
      if (data.pendingTasks && data.pendingTasks.length > 0) {
        const pendingInfo = {
          id: Date.now() + Math.random(),
          message: `ℹ️ I'm gathering information for ${data.pendingTasks.length} task(s). I'll create them once I have all the details needed.`,
          isUser: false,
          timestamp: new Date(),
          messageType: 'info',
        };
        setMessages(prev => [...prev, pendingInfo]);
      }

      // If AI extracted COMPLETE tasks, show confirmation UI
      if (data.tasks && data.tasks.length > 0) {
        // Add tasks to pending confirmations
        const newConfirmations = data.tasks.map((task, index) => ({
          id: Date.now() + index,
          task: task,
          confirmed: false,
        }));
        setPendingConfirmations(prev => [...prev, ...newConfirmations]);

        // Show confirmation message
        const confirmMessage = {
          id: Date.now() + Math.random(),
          message: `📋 I've prepared ${data.tasks.length} task(s) for you. Please confirm below to add them to your task list.`,
          isUser: false,
          timestamp: new Date(),
          messageType: 'confirm',
        };
        setMessages(prev => [...prev, confirmMessage]);
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

  const handleConfirmTask = async (confirmationId) => {
    const confirmation = pendingConfirmations.find(c => c.id === confirmationId);
    if (!confirmation) return;

    try {
      const result = await onTaskCreate(confirmation.task);
      
      // Mark as confirmed
      setPendingConfirmations(prev => 
        prev.map(c => c.id === confirmationId ? { ...c, confirmed: true } : c)
      );

      // Add success message with more details
      const successMessage = {
        id: Date.now() + Math.random(),
        message: `✅ Task added to your To-Do list: "${confirmation.task.description}"`,
        isUser: false,
        timestamp: new Date(),
        messageType: 'success',
      };
      setMessages(prev => [...prev, successMessage]);

      // Remove from pending after a delay
      setTimeout(() => {
        setPendingConfirmations(prev => prev.filter(c => c.id !== confirmationId));
      }, 2000);

    } catch (error) {
      console.error('Error creating task:', error);
      const errorMessage = {
        id: Date.now() + Math.random(),
        message: `❌ Failed to create task: "${confirmation.task.description}". Please try again.`,
        isUser: false,
        timestamp: new Date(),
        messageType: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleUndoTask = (confirmationId) => {
    const confirmation = pendingConfirmations.find(c => c.id === confirmationId);
    if (!confirmation) return;

    // Remove from pending confirmations
    setPendingConfirmations(prev => prev.filter(c => c.id !== confirmationId));

    // Add undo message
    const undoMessage = {
      id: Date.now() + Math.random(),
      message: `🚫 Cancelled: "${confirmation.task.description}"`,
      isUser: false,
      timestamp: new Date(),
      messageType: 'info',
    };
    setMessages(prev => [...prev, undoMessage]);
  };

  const handleConfirmAll = async () => {
    const unconfirmed = pendingConfirmations.filter(c => !c.confirmed);
    let successCount = 0;
    let failCount = 0;

    for (const confirmation of unconfirmed) {
      try {
        await onTaskCreate(confirmation.task);
        // Mark as confirmed
        setPendingConfirmations(prev => 
          prev.map(c => c.id === confirmation.id ? { ...c, confirmed: true } : c)
        );
        successCount++;
        // Small delay between creations
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('Error creating task:', error);
        failCount++;
      }
    }

    // Add summary message
    if (successCount > 0) {
      const summaryMessage = {
        id: Date.now() + Math.random(),
        message: `✅ Successfully added ${successCount} task(s) to your To-Do list!${failCount > 0 ? ` (${failCount} failed)` : ''}`,
        isUser: false,
        timestamp: new Date(),
        messageType: 'success',
      };
      setMessages(prev => [...prev, summaryMessage]);
    }

    // Clear confirmed tasks after a delay
    setTimeout(() => {
      setPendingConfirmations(prev => prev.filter(c => !c.confirmed));
    }, 2000);
  };

  const handleUndoAll = () => {
    const count = pendingConfirmations.length;
    setPendingConfirmations([]);

    const undoMessage = {
      id: Date.now() + Math.random(),
      message: `🚫 Cancelled all ${count} pending task(s)`,
      isUser: false,
      timestamp: new Date(),
      messageType: 'info',
    };
    setMessages(prev => [...prev, undoMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClearChat = () => {
    // Permanently delete all chat history
    const defaultMessage = {
      id: 1,
      message: "Hi! I'm your AI assistant. Tell me about your tasks, plans, or work you need to do, and I'll help you organize them into your task list!",
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages([defaultMessage]);
    setSessionId(null);
    setPendingConfirmations([]);
    setPendingTasks([]);
    
    // Clear from localStorage
    try {
      localStorage.removeItem(`chat_messages_${currentUser?.uid}`);
      localStorage.removeItem(`chat_session_${currentUser?.uid}`);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
    
    setShowClearModal(false);
  };
  
  const handleNewChat = () => {
    // Start a new conversation while keeping old messages in storage (archived)
    const defaultMessage = {
      id: Date.now(),
      message: "Hi! I'm your AI assistant. Tell me about your tasks, plans, or work you need to do, and I'll help you organize them into your task list!",
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages([defaultMessage]);
    setSessionId(null); // Start fresh session
    setPendingConfirmations([]);
    setPendingTasks([]);
    
    // Archive old conversation
    try {
      const oldMessages = localStorage.getItem(`chat_messages_${currentUser?.uid}`);
      if (oldMessages) {
        const archiveKey = `chat_archive_${currentUser?.uid}_${Date.now()}`;
        localStorage.setItem(archiveKey, oldMessages);
      }
      // Clear current session
      localStorage.removeItem(`chat_session_${currentUser?.uid}`);
    } catch (error) {
      console.error('Error archiving chat:', error);
    }
    
    setShowNewChatModal(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .chat-window {
          animation: slideUp 0.3s ease-out;
        }
        .chat-message {
          animation: fadeIn 0.4s ease-out;
        }
        .typing-dot {
          animation: bounce 1.4s infinite;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        .modal-overlay {
          animation: fadeIn 0.2s ease-out;
        }
        .modal-content {
          animation: scaleIn 0.3s ease-out;
        }
        .scrollbar-custom::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .gradient-blue {
          background: linear-gradient(135deg, #0984e3 0%, #0652DD 100%);
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }
      `}</style>
      
      <div className="chat-window fixed bottom-24 right-6 w-full max-w-[420px] h-[650px] bg-white rounded-[24px] shadow-2xl z-40 flex flex-col border border-gray-200">
        {/* Header */}
        <div className="gradient-blue text-white rounded-t-[24px] p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* AI Icon */}
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Chat Assistant</h3>
              <p className="text-xs text-white text-opacity-80">Always here to help</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* New Chat Button */}
            <button
              onClick={() => setShowNewChatModal(true)}
              className="glass-effect p-2 hover:bg-white hover:bg-opacity-30 rounded-[12px] transition-all duration-200"
              title="Start New Chat (keeps current history)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className={`glass-effect p-2 hover:bg-white hover:bg-opacity-30 rounded-[12px] transition-all duration-200 ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
            
            {/* Clear Chat Button */}
            <button
              onClick={() => setShowClearModal(true)}
              className="glass-effect p-2 hover:bg-white hover:bg-opacity-30 rounded-[12px] transition-all duration-200"
              title="Clear All Chat History (permanent)"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f9fa] scrollbar-custom">
          {messages.map((msg) => (
            <div key={msg.id} className="chat-message">
              <ChatMessage
                message={msg.message}
                isUser={msg.isUser}
                timestamp={msg.timestamp}
                messageType={msg.messageType}
              />
            </div>
          ))}
          
          {/* Pending Task Confirmations */}
          {pendingConfirmations.length > 0 && (
            <div className="space-y-3 mt-4 chat-message">
              {pendingConfirmations.map((confirmation) => (
                <div
                  key={confirmation.id}
                  className={`
                    p-4 rounded-[16px] border-2 shadow-sm transition-all duration-300
                    ${confirmation.confirmed 
                      ? 'bg-green-50 border-green-300 opacity-75' 
                      : 'bg-white border-blue-300'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900">
                          {confirmation.task.description}
                        </span>
                        {confirmation.confirmed && (
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center space-x-1">
                            <span>📅</span>
                            <span>{confirmation.task.dueDate}</span>
                          </span>
                          <span className="inline-flex items-center space-x-1">
                            <span>📁</span>
                            <span>{confirmation.task.list}</span>
                          </span>
                        </div>
                        <div className="inline-flex items-center space-x-1">
                          <span>🎯</span>
                          <span className={`
                            px-2 py-0.5 rounded-full text-xs font-medium
                            ${confirmation.task.priority === 'High' ? 'bg-red-100 text-red-700' : 
                              confirmation.task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-green-100 text-green-700'}
                          `}>
                            {confirmation.task.priority}
                          </span>
                        </div>
                      </div>
                      {confirmation.task.subTasks && (
                        <div className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-2">
                          <span className="font-medium">📝 Subtasks:</span>
                          <span className="ml-1">{confirmation.task.subTasks}</span>
                        </div>
                      )}
                    </div>
                    
                    {!confirmation.confirmed && (
                      <div className="flex flex-col space-y-2 ml-3">
                        <button
                          onClick={() => handleConfirmTask(confirmation.id)}
                          className="p-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-[12px] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                          title="Confirm and create task"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleUndoTask(confirmation.id)}
                          className="p-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-[12px] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                          title="Cancel this task"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Confirm/Undo All Buttons */}
              {pendingConfirmations.some(c => !c.confirmed) && (
                <div className="flex space-x-2 justify-end pt-2">
                  <button
                    onClick={handleConfirmAll}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-[12px] transition-all duration-200 text-sm font-semibold flex items-center space-x-2 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>Confirm All</span>
                  </button>
                  <button
                    onClick={handleUndoAll}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-[12px] transition-all duration-200 text-sm font-semibold flex items-center space-x-2 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    <span>Cancel All</span>
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="chat-message flex items-center space-x-2 px-4 py-3 bg-white rounded-[16px] rounded-bl-none max-w-[70%] shadow-sm">
              <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="p-4 bg-white border-t border-gray-200 rounded-b-[24px]">
          <div className="flex items-end space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me about your tasks or plans..."
              className="flex-1 px-4 py-3 bg-[#f7fafc] border border-gray-200 rounded-[16px] focus:outline-none focus:border-[#0984e3] focus:ring-2 focus:ring-[#0984e3] focus:ring-opacity-20 transition-all duration-200 text-gray-800 placeholder-gray-400"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className={`
                w-11 h-11 rounded-[16px] flex items-center justify-center transition-all duration-300
                ${!inputMessage.trim() || isLoading
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'gradient-blue text-white hover:shadow-lg hover:-translate-y-1'
                }
              `}
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* New Chat Confirmation Modal */}
      {showNewChatModal && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="modal-content bg-white rounded-[24px] p-6 max-w-[360px] mx-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Start New Chat?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Your current conversation will be archived and you'll start fresh. You can continue with a clean slate while keeping your history safe.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-[16px] font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleNewChat}
                className="flex-1 px-4 py-3 gradient-blue text-white rounded-[16px] font-medium hover:shadow-lg transition-all duration-200"
              >
                New Chat
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="modal-content bg-white rounded-[24px] p-6 max-w-[360px] mx-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Clear All History?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This will <span className="font-semibold text-red-600">permanently delete</span> all messages and chat history. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-[16px] font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleClearChat}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-[16px] font-medium hover:shadow-lg transition-all duration-200"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

ChatWindow.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onTaskCreate: PropTypes.func.isRequired,
};

export default ChatWindow;
