import PropTypes from 'prop-types';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

const CalendarHeader = ({ 
  currentDate, 
  onPrevious, 
  onNext, 
  onToday, 
  view, 
  onViewChange 
}) => {
  const formatDate = () => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    } else if (view === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return `${weekStart.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })} - ${weekEnd.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric' 
      })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric' 
      });
    }
  };

  const viewButtons = [
    { id: 'month', label: 'Month', icon: Squares2X2Icon },
    { id: 'week', label: 'Week', icon: ViewColumnsIcon },
    { id: 'day', label: 'Day', icon: CalendarIcon },
  ];

  return (
    <div 
      className="flex items-center justify-between p-4 bg-white border-b"
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      {/* Left side - Navigation */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <button
            onClick={onPrevious}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Previous"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={onNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Next"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <button
          onClick={onToday}
          className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Today
        </button>

        <h2 className="text-xl font-semibold text-gray-900">
          {formatDate()}
        </h2>
      </div>

      {/* Right side - View controls */}
      <div className="flex items-center space-x-2">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {viewButtons.map((button) => {
            const Icon = button.icon;
            return (
              <button
                key={button.id}
                onClick={() => onViewChange(button.id)}
                className={`
                  px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-1
                  ${view === button.id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{button.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

CalendarHeader.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onToday: PropTypes.func.isRequired,
  view: PropTypes.oneOf(['month', 'week', 'day']).isRequired,
  onViewChange: PropTypes.func.isRequired,
};

export default CalendarHeader;
