# TodoApp with Calendar Integration

## Overview
A comprehensive task management application with an integrated calendar system, built using React and Firebase. The application has been refactored following industry best practices with a modular component architecture.

## Features

### 📅 Calendar Features
- **Multiple Views**: Month, Week, and Day views
- **Visual Task Display**: Tasks shown directly on calendar dates
- **Color Coding**: Tasks color-coded by list type (Personal, Work, Study)
- **Click to Add**: Click on any date to add tasks for that specific day
- **Task Count Indicators**: Shows number of tasks per date
- **Overdue Highlighting**: Visual indicators for overdue tasks
- **Today Highlighting**: Current date clearly marked

### ✅ Task Management
- **CRUD Operations**: Create, Read, Update, Delete tasks
- **Task Categories**: Personal, Work, Study lists
- **Priority Levels**: High, Medium, Low priority tasks
- **Due Date Tracking**: Date-based task organization
- **Completion Status**: Mark tasks as complete/incomplete
- **Importance Marking**: Star important tasks
- **Sub-tasks Support**: Add sub-task descriptions

### 🎨 User Interface
- **Responsive Design**: Mobile-first responsive layout
- **Modern UI**: Clean, professional interface using Tailwind CSS
- **Sidebar Navigation**: Collapsible sidebar with task filters
- **Modal Forms**: User-friendly task creation and editing
- **Loading States**: Smooth loading indicators
- **Error Handling**: Comprehensive error management

### 🏗️ Architecture
- **Modular Components**: Separated concerns with reusable components
- **Custom Hooks**: Centralized state management and business logic
- **Utility Functions**: Helper functions for dates and task operations
- **TypeScript-ready**: PropTypes validation for better development experience

## Component Structure

```
src/
├── components/
│   ├── TodoApp/
│   │   ├── TodoApp.jsx          # Main application container
│   │   ├── TaskCard.jsx         # Individual task display
│   │   ├── TaskForm.jsx         # Task creation/editing modal
│   │   ├── TaskList.jsx         # Task list with filtering
│   │   ├── TaskSidebar.jsx      # Navigation and filters
│   │   └── index.js             # Component exports
│   ├── Calendar/
│   │   ├── Calendar.jsx         # Main calendar container
│   │   ├── CalendarHeader.jsx   # Calendar navigation and view controls
│   │   ├── CalendarGrid.jsx     # Monthly grid view
│   │   ├── WeekView.jsx         # Weekly view layout
│   │   ├── DayView.jsx          # Daily detailed view
│   │   └── index.js             # Component exports
├── hooks/
│   ├── useTasks.js              # Firebase task operations
│   ├── useResponsive.js         # Responsive design utilities
│   └── index.js                 # Hook exports
├── utils/
│   ├── dateUtils.js             # Date manipulation functions
│   ├── taskUtils.js             # Task filtering and utilities
│   └── index.js                 # Utility exports
└── pages/
    └── ToDoAfterLogin.jsx       # Main page component
```

## Usage

### Adding Tasks
1. Click the "Add Task" button or the "+" floating button (mobile)
2. Fill in task details: description, list, due date, sub-tasks, priority
3. Click "Create Task" to save

### Using Calendar
1. Click "Show Calendar" in the sidebar to open calendar view
2. Switch between Month, Week, and Day views using the header buttons
3. Click on any date to add tasks for that specific day
4. Tasks appear as colored bars/cards on their due dates
5. Click on tasks in the calendar to edit them

### Task Filtering
- Use the sidebar to filter tasks by:
  - All Tasks
  - Today's Tasks
  - Upcoming Tasks
  - Overdue Tasks
  - Task Lists (Personal, Work, Study)
  - Important Tasks
  - Completed Tasks

### Navigation
- **Previous/Next**: Navigate between time periods
- **Today Button**: Jump to current date
- **View Selector**: Switch between Month/Week/Day views

## Technical Features

### State Management
- Firebase Firestore integration for real-time data
- Custom hooks for clean state management
- Optimistic UI updates for better user experience

### Responsive Design
- Mobile-first approach
- Collapsible sidebar for mobile devices
- Touch-friendly interface elements
- Adaptive layouts for different screen sizes

### Performance
- Efficient task filtering and sorting
- Lazy loading where appropriate
- Optimized re-renders with proper dependency arrays

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast color schemes
- Proper ARIA labels

## Firebase Integration

The application uses Firebase Firestore with the following structure:

```
users/{userId}/tasks/{taskId}
├── description: string
├── list: string ('Personal' | 'Work' | 'Study')
├── dueDate: string (YYYY-MM-DD)
├── subTasks: string
├── priority: string ('low' | 'medium' | 'high')
├── completed: boolean
├── importance: boolean
└── createdDate: string (ISO date)
```

## Development

### Getting Started
1. Install dependencies: `npm install`
2. Configure Firebase in `src/firebase/firebaseConfig.js`
3. Start development server: `npm run dev`

### Key Dependencies
- React 18+
- Firebase v11+
- Tailwind CSS
- Heroicons
- PropTypes

### Component Guidelines
- Each component has clear prop validation
- Consistent styling with Tailwind CSS
- Modular and reusable design
- Proper error boundaries and loading states

## Future Enhancements

### Planned Features
- [ ] Drag and drop task reordering
- [ ] Task time tracking
- [ ] Recurring tasks
- [ ] Task templates
- [ ] Export to PDF/CSV
- [ ] Team collaboration features
- [ ] Notification system
- [ ] Dark mode theme
- [ ] Offline support with PWA

### Technical Improvements
- [ ] TypeScript migration
- [ ] Unit test coverage
- [ ] Performance optimizations
- [ ] Accessibility audit
- [ ] SEO optimization
