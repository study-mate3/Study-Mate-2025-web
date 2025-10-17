import { formatDate, isPastDate, isToday, parseDate } from './dateUtils';

export const getListColor = (listType) => {
  const colors = {
    Personal: 'bg-pink-600',
    Work: 'bg-yellow-500',
    Study: 'bg-green-500',
  };
  return colors[listType] || 'bg-gray-500';
};

export const getListColorLight = (listType) => {
  const colors = {
    Personal: 'bg-pink-100 border-pink-300 text-pink-800',
    Work: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    Study: 'bg-green-100 border-green-300 text-green-800',
  };
  return colors[listType] || 'bg-gray-100 border-gray-300 text-gray-800';
};

export const getPriorityColor = (priority) => {
  const colors = {
    high: 'text-red-600 bg-red-50 border-red-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-green-600 bg-green-50 border-green-200',
  };
  return colors[priority] || colors.low;
};

export const filterTasks = (tasks, filter) => {
  const today = formatDate(new Date());
  
  switch (filter) {
    case 'all':
      return tasks;
    case 'upcoming':
      return tasks.filter(task => task.dueDate > today && !task.completed);
    case 'today':
      return tasks.filter(task => task.dueDate === today && !task.completed);
    case 'completed':
      return tasks.filter(task => task.completed);
    case 'important':
      return tasks.filter(task => task.importance);
    case 'overdue':
      return tasks.filter(task => isPastDate(task.dueDate) && !task.completed);
    case 'Personal':
    case 'Work':
    case 'Study':
      return tasks.filter(task => task.list === filter);
    default:
      return tasks;
  }
};

export const getTasksForDate = (tasks, date) => {
  const dateString = formatDate(date);
  return tasks.filter(task => task.dueDate === dateString);
};

export const getTaskStats = (tasks) => {
  const today = formatDate(new Date());
  
  return {
    total: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    pending: tasks.filter(task => !task.completed).length,
    today: tasks.filter(task => task.dueDate === today && !task.completed).length,
    upcoming: tasks.filter(task => task.dueDate > today && !task.completed).length,
    overdue: tasks.filter(task => isPastDate(task.dueDate) && !task.completed).length,
    important: tasks.filter(task => task.importance).length,
  };
};
