import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  XMarkIcon, 
  PaperAirplaneIcon, 
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XCircleIcon
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
  const [sessionId, setSessionId] = useState(null);
  const [pendingConfirmations, setPendingConfirmations] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]); // Store pending tasks from bot
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

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        message: "Hi! I'm your AI assistant. Tell me about your tasks, plans, or work you need to do, and I'll help you organize them into your task list!",
        isUser: false,
        timestamp: new Date(),
      }
    ]);
    setSessionId(null); // Clear session to start fresh
    setPendingConfirmations([]); // Clear any pending confirmations
    setPendingTasks([]); // Clear pending tasks
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
        
        {/* Pending Task Confirmations */}
        {pendingConfirmations.length > 0 && (
          <div className="space-y-2 mt-4">
            {pendingConfirmations.map((confirmation) => (
              <div
                key={confirmation.id}
                className={`
                  p-3 rounded-lg border-2 
                  ${confirmation.confirmed 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-blue-50 border-blue-300'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-800">
                        {confirmation.task.description}
                      </span>
                      {confirmation.confirmed && (
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="inline-block mr-3">
                        📅 {confirmation.task.dueDate}
                      </span>
                      <span className="inline-block mr-3">
                        📁 {confirmation.task.list}
                      </span>
                      <span className="inline-block">
                        🎯 {confirmation.task.priority}
                      </span>
                    </div>
                    {confirmation.task.subTasks && (
                      <div className="text-sm text-gray-500 mt-1">
                        📝 {confirmation.task.subTasks}
                      </div>
                    )}
                  </div>
                  
                  {!confirmation.confirmed && (
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => handleConfirmTask(confirmation.id)}
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        title="Confirm and create task"
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUndoTask(confirmation.id)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        title="Cancel this task"
                      >
                        <XCircleIcon className="w-4 h-4" />
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
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Confirm All</span>
                </button>
                <button
                  onClick={handleUndoAll}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
                >
                  <XCircleIcon className="w-4 h-4" />
                  <span>Cancel All</span>
                </button>
              </div>
            )}
          </div>
        )}
        
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
