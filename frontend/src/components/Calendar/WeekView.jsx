import PropTypes from 'prop-types';
import { formatDate, getWeekData, isSameDay } from '../../utils/dateUtils';
import { getTasksForDate, getListColor } from '../../utils/taskUtils';

const WeekView = ({ 
  currentDate, 
  tasks, 
  onDateClick, 
  onTaskClick,
  selectedDate 
}) => {
  const weekDays = getWeekData(currentDate);
  const today = new Date();

  const getDayTasks = (date) => {
    return getTasksForDate(tasks, date);
  };

  const renderTask = (task) => (
    <button
      key={task.id}
      onClick={(e) => {
        e.stopPropagation();
        onTaskClick(task);
      }}
      className={`
        w-full text-left p-2 mb-1 rounded text-sm transition-colors
        ${task.completed 
          ? 'bg-gray-100 text-gray-500 line-through' 
          : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
        }
        border-l-4 ${getListColor(task.list)}
      `}
      title={`${task.description} - ${task.list}`}
    >
      <div className="font-medium truncate">{task.description}</div>
      {task.subTasks && (
        <div className="text-xs text-gray-500 truncate mt-1">{task.subTasks}</div>
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {weekDays.map((date, index) => {
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const dayTasks = getDayTasks(date);
          
          return (
            <button
              key={index}
              onClick={() => onDateClick(date)}
              className={`
                p-4 text-center border-r last:border-r-0 transition-colors
                ${isSelected ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-100'}
                ${isToday ? 'bg-blue-50' : ''}
              `}
            >
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`
                  text-lg font-semibold
                  ${isToday ? 'text-blue-600' : 'text-gray-900'}
                `}>
                  {date.getDate()}
                </div>
                {dayTasks.length > 0 && (
                  <div className="flex justify-center">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {dayTasks.length}
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Week Body */}
      <div className="grid grid-cols-7 min-h-[400px]">
        {weekDays.map((date, index) => {
          const dayTasks = getDayTasks(date);
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          
          return (
            <div
              key={index}
              className={`
                p-3 border-r last:border-r-0 space-y-2
                ${isSelected ? 'bg-blue-50' : ''}
                ${isToday ? 'bg-yellow-50' : 'bg-gray-50'}
              `}
            >
              {dayTasks.length === 0 ? (
                <button
                  onClick={() => onDateClick(date)}
                  className="w-full h-full min-h-[100px] border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center text-gray-500 text-sm"
                >
                  Click to add task
                </button>
              ) : (
                <div className="space-y-2">
                  {dayTasks.map(renderTask)}
                  <button
                    onClick={() => onDateClick(date)}
                    className="w-full p-2 border border-dashed border-gray-300 rounded text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    + Add task
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

WeekView.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  tasks: PropTypes.array.isRequired,
  onDateClick: PropTypes.func.isRequired,
  onTaskClick: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
};

export default WeekView;
