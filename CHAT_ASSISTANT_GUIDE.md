# StudyMate 2025 - Chat Assistant Integration

This document explains the new AI-powered chat assistant feature that helps users create tasks through natural language conversations.

## 🚀 Features

### Chat Assistant UI
- **Floating Chat Icon**: Visible on all pages for logged-in users
- **Interactive Chat Window**: Clean, modern chat interface
- **Real-time Messaging**: Instant responses from AI assistant
- **Authentication Guard**: Only available for authenticated users
- **Task Creation**: Automatically creates tasks from conversation

### AI-Powered Task Extraction
- **Natural Language Processing**: Uses Llama 3.1 8B instant via Groq
- **Smart Task Detection**: Identifies actionable items from casual conversation
- **Automatic Categorization**: Classifies tasks as Personal, Work, or Study
- **Date Recognition**: Understands relative dates (today, tomorrow, next week)
- **Priority Assessment**: Assigns appropriate priority levels
- **Sub-task Support**: Extracts additional task details

## 🛠️ Technical Implementation

### Frontend Components

**Location**: `frontend/src/components/ChatAssistant/`

1. **ChatAssistant.jsx** - Main container component
2. **ChatIcon.jsx** - Floating chat button with animations
3. **ChatWindow.jsx** - Chat interface with message handling
4. **ChatMessage.jsx** - Individual message display component

### Backend API

**Location**: `ai-backend/`

- **FastAPI Server**: Handles chat requests and AI processing
- **LangChain Integration**: Manages AI model interactions
- **Groq API**: Powers the Llama 3.1 8B instant model
- **Task Extraction**: Converts natural language to structured task data

### Integration Points

1. **AuthContext**: Ensures chat is only available to logged-in users
2. **useTasks Hook**: Creates tasks in Firebase from AI suggestions
3. **Layout Component**: Global chat assistant placement

## 📋 Task Attributes

The AI can extract and create tasks with these attributes:

```javascript
{
  description: string,     // What needs to be done
  list: string,           // "Personal", "Work", or "Study"
  dueDate: string,        // YYYY-MM-DD format (optional)
  subTasks: string,       // Additional details (optional)
  priority: string,       // "low", "medium", or "high"
  completed: boolean      // Always false for new tasks
}
```

## 🔧 Setup Instructions

### 1. Frontend Setup (Already Integrated)

The chat assistant is already integrated into the main application:
- Components created in `/components/ChatAssistant/`
- Added to Layout component for global availability
- Connected to existing authentication and task management

### 2. Backend Setup

1. **Navigate to AI backend directory**:
   ```bash
   cd ai-backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

4. **Get Groq API Key**:
   - Visit https://console.groq.com/
   - Create account and generate API key
   - Add to `.env` file:
     ```
     GROQ_API_KEY=your_api_key_here
     ```

5. **Start the backend server**:
   ```bash
   python main.py
   ```
   Or use the start script:
   ```bash
   ./start.sh
   ```

### 3. Testing the Integration

1. **Start both servers**:
   - Frontend: `npm run dev` (port 5173)
   - Backend: `python main.py` (port 8000)

2. **Login to the application**

3. **Look for the chat icon** in the bottom-right corner

4. **Test with sample messages**:
   - "I need to study for my math exam tomorrow"
   - "Buy groceries and finish the project report by Friday"
   - "Schedule a meeting with the team next week"

## 💬 Example Conversations

### Example 1: Study Tasks
**User**: "I have a math exam next Friday and need to review chapters 5-7"

**AI Response**: "I'll help you create a study task for your math exam! I've set it up with high priority since it's coming up soon."

**Created Task**:
```javascript
{
  description: "Study for math exam",
  list: "Study",
  dueDate: "2024-10-25",
  subTasks: "Review chapters 5-7",
  priority: "high",
  completed: false
}
```

### Example 2: Multiple Tasks
**User**: "Tomorrow I need to buy groceries, call mom, and work on my presentation"

**AI Response**: "I've identified three tasks for you! Let me organize these for tomorrow."

**Created Tasks**:
1. Buy groceries (Personal, medium priority)
2. Call mom (Personal, low priority) 
3. Work on presentation (Work, medium priority)

### Example 3: No Tasks
**User**: "How are you doing today?"

**AI Response**: "I'm doing great, thank you for asking! Is there anything you'd like to accomplish today that I can help you organize?"

**Created Tasks**: None

## 🔍 API Endpoints

### POST /api/chat
Process chat messages and extract tasks.

**Request**:
```json
{
  "message": "I need to study for my exam",
  "userId": "firebase_user_id"
}
```

**Response**:
```json
{
  "response": "I'll help you create a study task!",
  "tasks": [
    {
      "description": "Study for exam",
      "list": "Study",
      "dueDate": null,
      "subTasks": null,
      "priority": "medium",
      "completed": false
    }
  ]
}
```

### GET /health
Check API status and configuration.

## 🎨 UI Features

### Chat Icon
- Animated floating button
- Unread message indicators
- Hover effects and transitions
- X button when chat is open

### Chat Window
- Modern chat interface
- Typing indicators
- Message timestamps
- Clear chat functionality
- Auto-scroll to new messages

### Message Types
- User messages (right-aligned, blue)
- AI responses (left-aligned, gray)
- Success confirmations (green checkmark)
- Error messages (red warning)

## 🛡️ Security & Privacy

1. **Authentication Required**: Chat only works for logged-in users
2. **User ID Tracking**: Messages tied to Firebase user ID
3. **API Key Security**: Groq API key stored securely in backend
4. **CORS Protection**: Configured for allowed origins only
5. **Input Validation**: All messages validated before processing

## 🐛 Troubleshooting

### Chat Icon Not Visible
- Ensure user is logged in
- Check console for authentication errors
- Verify ChatAssistant import in Layout.jsx

### AI Not Responding
- Check if backend server is running (port 8000)
- Verify GROQ_API_KEY is set correctly
- Check network connectivity
- Look at browser console for API errors

### Tasks Not Creating
- Verify useTasks hook is working
- Check Firebase authentication
- Look for error messages in chat
- Check browser console for task creation errors

### Backend Errors
- Check Python dependencies are installed
- Verify .env file configuration
- Look at backend server logs
- Ensure Groq API key is valid

## 🔄 Development Notes

### Extending the AI Capabilities
The AI prompt can be customized in `task_extractor.py` to:
- Add new task categories
- Change priority logic
- Improve date extraction
- Add more conversation patterns

### UI Customization
Chat components use Tailwind CSS and can be easily styled:
- Colors in `ChatIcon.jsx` and `ChatWindow.jsx`
- Animations and transitions
- Window size and positioning
- Message bubble styling

### API Integration
The chat system is designed to be extensible:
- Add user preferences
- Implement conversation history
- Add file attachments
- Integration with calendar systems

This completes the AI-powered chat assistant integration for StudyMate 2025!
