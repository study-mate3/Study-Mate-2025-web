import PropTypes from 'prop-types';
import TaskCard from './TaskCard';
import { filterTasks } from '../../utils/taskUtils';

const TaskList = ({ 
  tasks, 
  currentFilter, 
  onTaskEdit, 
  onTaskDelete, 
  onTaskToggleComplete, 
  onTaskToggleImportance,
  loading = false 
}) => {
  const filteredTasks = filterTasks(tasks, currentFilter);

  const getFilterTitle = () => {
    switch (currentFilter) {
      case 'all':
        return 'All Tasks';
      case 'today':
        return 'Today\'s Tasks';
      case 'upcoming':
        return 'Upcoming Tasks';
      case 'overdue':
        return 'Overdue Tasks';
      case 'completed':
        return 'Completed Tasks';
      case 'important':
        return 'Important Tasks';
      case 'Personal':
      case 'Work':
      case 'Study':
        return `${currentFilter} Tasks`;
      default:
        return 'Tasks';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full flex flex-col bg-gray-50"
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      {/* Header */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {getFilterTitle()}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredTasks.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500">
                {currentFilter === 'all' 
                  ? 'Start by creating your first task!'
                  : `No tasks match the "${getFilterTitle().toLowerCase()}" filter.`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onTaskEdit}
                onDelete={onTaskDelete}
                onToggleComplete={onTaskToggleComplete}
                onToggleImportance={onTaskToggleImportance}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

TaskList.propTypes = {
  tasks: PropTypes.array.isRequired,
  currentFilter: PropTypes.string.isRequired,
  onTaskEdit: PropTypes.func.isRequired,
  onTaskDelete: PropTypes.func.isRequired,
  onTaskToggleComplete: PropTypes.func.isRequired,
  onTaskToggleImportance: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default TaskList;
