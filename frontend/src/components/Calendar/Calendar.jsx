import { useState } from 'react';
import PropTypes from 'prop-types';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import WeekView from './WeekView';
import DayView from './DayView';
import { formatDate } from '../../utils/dateUtils';

const Calendar = ({ 
  tasks, 
  onTaskClick, 
  onDateSelect, 
  selectedDate 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    onDateSelect(date, formatDate(date));
  };

  const handleAddTask = (dateString) => {
    onDateSelect(new Date(dateString), dateString);
  };

  const renderCalendarView = () => {
    switch (view) {
      case 'month':
        return (
          <CalendarGrid
            currentDate={currentDate}
            tasks={tasks}
            onDateClick={handleDateClick}
            onTaskClick={onTaskClick}
            selectedDate={selectedDate}
          />
        );
      case 'week':
        return (
          <WeekView
            currentDate={currentDate}
            tasks={tasks}
            onDateClick={handleDateClick}
            onTaskClick={onTaskClick}
            selectedDate={selectedDate}
          />
        );
      case 'day':
        return (
          <DayView
            currentDate={currentDate}
            tasks={tasks}
            onTaskClick={onTaskClick}
            onAddTask={handleAddTask}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="h-full flex flex-col bg-gray-50"
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      <CalendarHeader
        currentDate={currentDate}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        view={view}
        onViewChange={setView}
      />
      
      <div className="flex-1 p-4 overflow-auto">
        {renderCalendarView()}
      </div>
    </div>
  );
};

Calendar.propTypes = {
  tasks: PropTypes.array.isRequired,
  onTaskClick: PropTypes.func.isRequired,
  onDateSelect: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
};

export default Calendar;
