import PropTypes from 'prop-types';
import { formatDate, getMonthData, isSameDay, parseDate } from '../../utils/dateUtils';
import { getTasksForDate, getListColor } from '../../utils/taskUtils';

const CalendarGrid = ({ 
  currentDate, 
  tasks, 
  onDateClick, 
  onTaskClick,
  selectedDate 
}) => {
  const monthData = getMonthData(currentDate.getFullYear(), currentDate.getMonth());
  const today = new Date();

  const getDayTasks = (date) => {
    return getTasksForDate(tasks, date);
  };

  const getDayStatus = (date, dayTasks) => {
    const hasOverdue = dayTasks.some(task => {
      const taskDate = parseDate(task.dueDate);
      return taskDate < today && !task.completed;
    });
    const hasCompleted = dayTasks.some(task => task.completed);
    const hasPending = dayTasks.some(task => !task.completed);
    
    if (hasOverdue) return 'overdue';
    if (hasPending) return 'pending';
    if (hasCompleted) return 'completed';
    return 'none';
  };

  const renderTask = (task) => (
    <button
      key={task.id}
      onClick={(e) => {
        e.stopPropagation();
        onTaskClick(task);
      }}
      className={`
        w-full text-left px-1 py-0.5 mb-0.5 rounded text-xs truncate transition-colors
        ${task.completed 
          ? 'bg-gray-100 text-gray-500 line-through' 
          : 'bg-white text-gray-700 hover:bg-gray-50'
        }
        border-l-2 ${getListColor(task.list)}
      `}
      title={task.description}
    >
      {task.description}
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-3 text-center">
            <span className="text-sm font-medium text-gray-500">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Body */}
      <div className="grid grid-cols-7">
        {monthData.days.map((date, index) => {
          const dayTasks = getDayTasks(date);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const dayStatus = getDayStatus(date, dayTasks);
          
          return (
            <button
              key={index}
              onClick={() => onDateClick(date)}
              className={`
                min-h-[100px] p-2 border-r border-b text-left transition-colors relative
                ${!isCurrentMonth 
                  ? 'bg-gray-50 text-gray-400' 
                  : 'bg-white hover:bg-gray-50'
                }
                ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
                ${isToday ? 'bg-blue-50' : ''}
              `}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-1">
                <span className={`
                  text-sm font-medium
                  ${isToday ? 'text-blue-600' : ''}
                  ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                `}>
                  {date.getDate()}
                </span>
                
                {/* Task count indicator */}
                {dayTasks.length > 0 && (
                  <span className={`
                    text-xs px-1.5 py-0.5 rounded-full font-medium
                    ${dayStatus === 'overdue' 
                      ? 'bg-red-100 text-red-700' 
                      : dayStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }
                  `}>
                    {dayTasks.length}
                  </span>
                )}
              </div>

              {/* Tasks */}
              <div className="space-y-0.5 max-h-16 overflow-hidden">
                {dayTasks.slice(0, 3).map(renderTask)}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500 px-1">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>

              {/* Today indicator */}
              {isToday && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

CalendarGrid.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  tasks: PropTypes.array.isRequired,
  onDateClick: PropTypes.func.isRequired,
  onTaskClick: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
};

export default CalendarGrid;
