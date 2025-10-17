export const formatDate = (date) => {
  // Use local date instead of UTC to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDate = (dateString) => {
  // Parse date string in local timezone to avoid timezone shift
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isSameDay = (date1, date2) => {
  return formatDate(date1) === formatDate(date2);
};

export const isToday = (date) => {
  const today = new Date();
  const compareDate = typeof date === 'string' ? parseDate(date) : date;
  return isSameDay(today, compareDate);
};

export const isPastDate = (dateString) => {
  const today = new Date();
  const date = parseDate(dateString);
  // Set both dates to start of day for proper comparison
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

export const getMonthData = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const current = new Date(startDate);
  
  // Generate 42 days (6 weeks) for calendar grid
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return {
    days,
    firstDay,
    lastDay,
    daysInMonth,
    monthName: firstDay.toLocaleDateString('en-US', { month: 'long' }),
    year: firstDay.getFullYear(),
  };
};

export const getWeekData = (date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }
  
  return days;
};

export const getDayHours = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push({
      hour: i,
      time12: new Date(0, 0, 0, i).toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true,
      }),
      time24: `${i.toString().padStart(2, '0')}:00`,
    });
  }
  return hours;
};
