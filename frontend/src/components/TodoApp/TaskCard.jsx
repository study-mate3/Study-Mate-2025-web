import PropTypes from 'prop-types';
import { StarIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { getListColorLight, getPriorityColor } from '../../utils/taskUtils';
import { isPastDate, isToday } from '../../utils/dateUtils';

const TaskCard = ({ 
  task, 
  onDelete, 
  onToggleComplete, 
  onToggleImportance, 
  onEdit,
  compact = false,
  showDate = true 
}) => {
  const isOverdue = isPastDate(task.dueDate) && !task.completed;
  const isDueToday = isToday(task.dueDate);

  return (
    <div 
      className={`
        bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md
        ${task.completed ? 'opacity-60 bg-gray-50' : ''}
        ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'}
        ${isDueToday && !task.completed ? 'border-blue-300 bg-blue-50' : ''}
        ${compact ? 'p-3' : 'p-4'}
      `}
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'} ${task.completed ? 'line-through' : ''}`}>
            {task.description}
          </h3>
          {showDate && (
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${getListColorLight(task.list)}`}>
                {task.list}
              </span>
              {task.dueDate && (
                <span className={`text-xs font-medium ${
                  isOverdue ? 'text-red-600' : 
                  isDueToday ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleComplete(task.id)}
              className="sr-only"
            />
            <div className={`
              w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
              ${task.completed 
                ? 'bg-blue-600 border-blue-600' 
                : 'border-gray-300 hover:border-blue-400'
              }
            `}>
              {task.completed && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Details (only in non-compact mode) */}
      {!compact && (
        <div className="space-y-2 text-sm text-gray-600 mb-3">
          {task.subTasks && (
            <div>
              <span className="font-medium">Sub-tasks:</span> {task.subTasks}
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority} priority
            </span>
            {isOverdue && (
              <span className="text-red-600 text-xs font-medium">Overdue</span>
            )}
            {isDueToday && !task.completed && (
              <span className="text-blue-600 text-xs font-medium">Due Today</span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => onToggleImportance(task.id)}
          className={`p-1 rounded hover:bg-gray-100 transition-colors ${
            task.importance ? 'text-yellow-500' : 'text-gray-400'
          }`}
          title={task.importance ? 'Remove from important' : 'Mark as important'}
        >
          {task.importance ? (
            <StarSolidIcon className="w-4 h-4" />
          ) : (
            <StarIcon className="w-4 h-4" />
          )}
        </button>
        
        <button
          onClick={() => onEdit(task)}
          className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-600"
          title="Edit task"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 rounded hover:bg-gray-100 transition-colors text-red-600"
          title="Delete task"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    list: PropTypes.string.isRequired,
    dueDate: PropTypes.string.isRequired,
    subTasks: PropTypes.string,
    priority: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    importance: PropTypes.bool,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleComplete: PropTypes.func.isRequired,
  onToggleImportance: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  compact: PropTypes.bool,
  showDate: PropTypes.bool,
};

export default TaskCard;
