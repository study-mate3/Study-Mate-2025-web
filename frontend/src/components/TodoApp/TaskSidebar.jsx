import PropTypes from 'prop-types';
import { 
  CalendarIcon,
  RectangleStackIcon,
  ArrowRightIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { getListColor } from '../../utils/taskUtils';

const TaskSidebar = ({ 
  tasks, 
  currentFilter, 
  onFilterChange, 
  onCalendarToggle,
  isCalendarOpen 
}) => {
  const getTaskCount = (filter) => {
    const today = new Date().toISOString().split('T')[0];
    
    switch (filter) {
      case 'all':
        return tasks.length;
      case 'upcoming':
        return tasks.filter(task => task.dueDate > today && !task.completed).length;
      case 'today':
        return tasks.filter(task => task.dueDate === today && !task.completed).length;
      case 'completed':
        return tasks.filter(task => task.completed).length;
      case 'important':
        return tasks.filter(task => task.importance).length;
      case 'overdue':
        return tasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          const currentDate = new Date();
          return taskDate < currentDate && !task.completed && task.dueDate !== today;
        }).length;
      case 'Personal':
      case 'Work':
      case 'Study':
        return tasks.filter(task => task.list === filter).length;
      default:
        return 0;
    }
  };

  const menuItems = [
    {
      id: 'all',
      label: 'All Tasks',
      icon: RectangleStackIcon,
      count: getTaskCount('all'),
    },
    {
      id: 'today',
      label: 'Today',
      icon: CalendarIcon,
      count: getTaskCount('today'),
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: ArrowRightIcon,
      count: getTaskCount('upcoming'),
    },
    {
      id: 'overdue',
      label: 'Overdue',
      icon: ExclamationTriangleIcon,
      count: getTaskCount('overdue'),
      highlight: getTaskCount('overdue') > 0,
    },
  ];

  const listItems = [
    { id: 'Personal', color: 'pink' },
    { id: 'Work', color: 'yellow' },
    { id: 'Study', color: 'green' },
  ];

  const specialItems = [
    {
      id: 'important',
      label: 'Important',
      icon: StarIcon,
      count: getTaskCount('important'),
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircleIcon,
      count: getTaskCount('completed'),
    },
  ];

  const MenuItem = ({ item, onClick, isActive }) => {
    const Icon = item.icon;
    return (
      <button
        onClick={onClick}
        className={`
          w-full px-4 py-3 flex items-center justify-between rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-blue-100 text-blue-700 font-medium' 
            : 'text-gray-600 hover:bg-gray-100'
          }
          ${item.highlight ? 'bg-red-50 text-red-700 hover:bg-red-100' : ''}
        `}
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5" />
          <span className="text-sm font-medium">{item.label}</span>
        </div>
        {item.count > 0 && (
          <span className={`
            px-2 py-1 text-xs rounded-full font-medium
            ${isActive 
              ? 'bg-blue-200 text-blue-800' 
              : item.highlight 
                ? 'bg-red-200 text-red-800'
                : 'bg-gray-200 text-gray-700'
            }
          `}>
            {item.count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div 
      className="bg-blue-50 h-full p-4 space-y-6 overflow-y-auto"
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      {/* Calendar Toggle */}
      <button
        onClick={onCalendarToggle}
        className={`
          w-full px-4 py-3 flex items-center justify-center space-x-2 rounded-lg transition-all duration-200 font-medium
          ${isCalendarOpen 
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
          }
        `}
      >
        <CalendarDaysIcon className="w-5 h-5" />
        <span>{isCalendarOpen ? 'Hide Calendar' : 'Show Calendar'}</span>
      </button>

      {/* Tasks Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
          Tasks
        </h3>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              onClick={() => onFilterChange(item.id)}
              isActive={currentFilter === item.id}
            />
          ))}
        </div>
      </div>

      {/* Lists Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
          Lists
        </h3>
        <div className="space-y-1">
          {listItems.map((list) => (
            <button
              key={list.id}
              onClick={() => onFilterChange(list.id)}
              className={`
                w-full px-4 py-3 flex items-center justify-between rounded-lg transition-all duration-200
                ${currentFilter === list.id 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded ${getListColor(list.id)}`}></div>
                <span className="text-sm font-medium">{list.id}</span>
              </div>
              {getTaskCount(list.id) > 0 && (
                <span className={`
                  px-2 py-1 text-xs rounded-full font-medium
                  ${currentFilter === list.id 
                    ? 'bg-blue-200 text-blue-800' 
                    : 'bg-gray-200 text-gray-700'
                  }
                `}>
                  {getTaskCount(list.id)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Special Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
          Special
        </h3>
        <div className="space-y-1">
          {specialItems.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              onClick={() => onFilterChange(item.id)}
              isActive={currentFilter === item.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

TaskSidebar.propTypes = {
  tasks: PropTypes.array.isRequired,
  currentFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onCalendarToggle: PropTypes.func.isRequired,
  isCalendarOpen: PropTypes.bool.isRequired,
};

export default TaskSidebar;
