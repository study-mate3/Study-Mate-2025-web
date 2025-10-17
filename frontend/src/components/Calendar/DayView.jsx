import PropTypes from 'prop-types';
import { formatDate, getDayHours, isSameDay } from '../../utils/dateUtils';
import { getTasksForDate, getListColorLight, getPriorityColor } from '../../utils/taskUtils';

const DayView = ({ 
  currentDate, 
  tasks, 
  onTaskClick,
  onAddTask 
}) => {
  const dayTasks = getTasksForDate(tasks, currentDate);
  const hours = getDayHours();
  const today = new Date();
  const isToday = isSameDay(currentDate, today);

  const getTasksForHour = (hour) => {
    // For now, we'll distribute tasks evenly across business hours (9 AM - 5 PM)
    // In a real app, you'd have time-specific tasks
    const businessHours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
    if (!businessHours.includes(hour)) return [];
    
    const tasksPerHour = Math.ceil(dayTasks.length / businessHours.length);
    const hourIndex = businessHours.indexOf(hour);
    return dayTasks.slice(hourIndex * tasksPerHour, (hourIndex + 1) * tasksPerHour);
  };

  const renderTask = (task) => (
    <button
      key={task.id}
      onClick={() => onTaskClick(task)}
      className={`
        w-full text-left p-2 mb-1 rounded-lg text-sm transition-colors border
        ${task.completed 
          ? 'bg-gray-50 text-gray-500 line-through border-gray-200' 
          : 'bg-white text-gray-700 hover:shadow-md border-gray-200 hover:border-blue-300'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{task.description}</div>
          {task.subTasks && (
            <div className="text-xs text-gray-500 truncate mt-1">{task.subTasks}</div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded ${getListColorLight(task.list)}`}>
              {task.list}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
        </div>
        {task.importance && (
          <div className="text-yellow-500 ml-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Day Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric',
                year: 'numeric' 
              })}
            </h3>
            {isToday && (
              <span className="text-sm text-blue-600 font-medium">Today</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
            </span>
            <button
              onClick={() => onAddTask(formatDate(currentDate))}
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Day Body */}
      <div className="max-h-[600px] overflow-y-auto">
        {dayTasks.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks for this day</h3>
            <p className="text-gray-500 mb-4">Start planning your day by adding some tasks.</p>
            <button
              onClick={() => onAddTask(formatDate(currentDate))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Task
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {hours.map((hourData) => {
              const hourTasks = getTasksForHour(hourData.hour);
              const isCurrentHour = isToday && new Date().getHours() === hourData.hour;
              
              return (
                <div 
                  key={hourData.hour}
                  className={`
                    flex border-b last:border-b-0
                    ${isCurrentHour ? 'bg-blue-50' : ''}
                  `}
                >
                  {/* Time column */}
                  <div className="w-20 p-3 border-r bg-gray-50 flex-shrink-0">
                    <div className={`
                      text-sm font-medium
                      ${isCurrentHour ? 'text-blue-600' : 'text-gray-500'}
                    `}>
                      {hourData.time12}
                    </div>
                  </div>
                  
                  {/* Tasks column */}
                  <div className="flex-1 p-3 min-h-[60px]">
                    {hourTasks.length > 0 ? (
                      <div className="space-y-2">
                        {hourTasks.map(renderTask)}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-300 text-sm">
                        {isCurrentHour && <span className="text-blue-400">Current time</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

DayView.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  tasks: PropTypes.array.isRequired,
  onTaskClick: PropTypes.func.isRequired,
  onAddTask: PropTypes.func.isRequired,
};

export default DayView;
