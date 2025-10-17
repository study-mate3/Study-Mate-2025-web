import { useState } from 'react';
import { Bars3Icon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useTasks } from '../../hooks/useTasks';
import { useResponsive } from '../../hooks/useResponsive';
import { formatDate } from '../../utils/dateUtils';

import TaskSidebar from './TaskSidebar';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import Calendar from '../Calendar/Calendar';

const TodoApp = () => {
  const { isMobile } = useResponsive();
  
  // Task management
  const {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    toggleImportance,
  } = useTasks();

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [initialFormDate, setInitialFormDate] = useState(null);

  // Task operations
  const handleTaskSubmit = async (taskData, taskId = null) => {
    try {
      if (taskId) {
        await updateTask(taskId, taskData);
        setEditingTask(null);
      } else {
        await addTask(taskData);
      }
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  const handleTaskEdit = (task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleTaskDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  // Calendar operations
  const handleDateSelect = (date, dateString) => {
    setSelectedDate(date);
    setInitialFormDate(dateString);
    setIsTaskFormOpen(true);
  };

  const handleTaskClick = (task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleCalendarToggle = () => {
    setIsCalendarOpen(!isCalendarOpen);
    if (!isCalendarOpen && isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setInitialFormDate(null);
    setIsTaskFormOpen(true);
  };

  const handleFormClose = () => {
    setIsTaskFormOpen(false);
    setEditingTask(null);
    setInitialFormDate(null);
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full flex bg-gray-100 overflow-hidden"
      style={{ fontFamily: '"Inter", sans-serif', maxHeight: 'calc(100vh - 200px)' }}
    >
      {/* Mobile overlay */}
      {isMobile && (isSidebarOpen || isCalendarOpen) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsCalendarOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'relative'} 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        ${isMobile ? 'z-50' : 'z-0'}
        w-80 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out
        ${!isMobile ? 'border-r' : ''}
      `}>
        <TaskSidebar
          tasks={tasks}
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          onCalendarToggle={handleCalendarToggle}
          isCalendarOpen={isCalendarOpen}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isSidebarOpen ? (
                  <XMarkIcon className="w-5 h-5" />
                ) : (
                  <Bars3Icon className="w-5 h-5" />
                )}
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
          </div>
          
          <button
            onClick={handleAddTask}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 flex min-h-0">
          {/* Task list */}
          <div className={`${isCalendarOpen ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
            <TaskList
              tasks={tasks}
              currentFilter={currentFilter}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
              onTaskToggleComplete={toggleComplete}
              onTaskToggleImportance={toggleImportance}
              loading={loading}
            />
          </div>

          {/* Calendar */}
          {isCalendarOpen && (
            <div className="w-1/2 border-l">
              <Calendar
                tasks={tasks}
                onTaskClick={handleTaskClick}
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating add button for mobile */}
      {isMobile && !isTaskFormOpen && (
        <button
          onClick={handleAddTask}
          className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      )}

      {/* Task form modal */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={handleFormClose}
        onSubmit={handleTaskSubmit}
        editingTask={editingTask}
        initialDate={initialFormDate}
      />
    </div>
  );
};

export default TodoApp;
