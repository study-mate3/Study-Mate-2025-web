import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import ChatIcon from './ChatIcon';
import ChatWindow from './ChatWindow';

const ChatAssistant = () => {
  const { currentUser } = useAuth();
  const { addTask, refetch } = useTasks();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Don't render if user is not logged in
  if (!currentUser) {
    return null;
  }

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadCount(0); // Clear unread count when opening chat
    }
  };

  const handleTaskCreate = async (taskData) => {
    try {
      const newTask = await addTask(taskData);
      // Auto-refresh the task list to show the new task immediately
      await refetch();
      return { success: true, task: newTask };
    } catch (error) {
      console.error('Error creating task from chat:', error);
      throw error;
    }
  };

  return (
    <>
      <ChatIcon
        onClick={handleToggleChat}
        isOpen={isChatOpen}
        unreadCount={unreadCount}
      />
      
      <ChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onTaskCreate={handleTaskCreate}
      />
    </>
  );
};

export default ChatAssistant;
