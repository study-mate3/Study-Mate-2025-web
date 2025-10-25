# StudyMate 2025 - Quick Start Guide for Chat Assistant

## 🚀 Complete Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- Git
- Groq API key (free at https://console.groq.com/)

### 1. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend will be available at http://localhost:5173

### 2. Backend Setup
```bash
# Navigate to AI backend directory
cd ai-backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Edit .env file and add your Groq API key:
# GROQ_API_KEY=your_groq_api_key_here
nano .env  # or use your preferred editor

# Start the backend server
python main.py
```
The backend will be available at http://localhost:8000

### 3. Get Groq API Key (Free)
1. Visit https://console.groq.com/
2. Sign up for a free account
3. Go to API Keys section
4. Create a new API key
5. Copy and paste it into your `.env` file

### 4. Test the System
```bash
# Test the backend (optional)
cd ai-backend
python test_backend.py
```

## 🎯 How to Use

1. **Start both servers** (frontend and backend)
2. **Open your browser** to http://localhost:5173
3. **Login** to your StudyMate account
4. **Look for the chat icon** in the bottom-right corner
5. **Click the icon** to open the chat assistant
6. **Type your tasks or plans** naturally, like:
   - "I need to study for my math exam tomorrow"
   - "Buy groceries and call mom this evening"
   - "Finish the project report by Friday"

## 💬 Example Conversations

### Creating Study Tasks
**You**: "I have a chemistry test next week and need to review chapters 1-5"

**AI**: "I'll help you create a study task for your chemistry test! I've set it with high priority since it's for next week."

**Result**: Creates a study task with due date, high priority, and sub-tasks

### Multiple Tasks
**You**: "Tomorrow I need to grocery shopping, finish my homework, and call the dentist"

**AI**: "I've identified three tasks for you! Let me organize these for tomorrow."

**Result**: Creates three separate tasks with appropriate categories and priorities

### Casual Conversation
**You**: "How's your day going?"

**AI**: "I'm doing great, thank you! Is there anything you'd like to accomplish today that I can help you organize?"

**Result**: No tasks created, just friendly conversation

## 🔧 Troubleshooting

### Chat Icon Not Visible
- Ensure you're logged into StudyMate
- Refresh the page
- Check browser console for errors

### AI Not Responding
1. Check if backend is running on port 8000
2. Verify Groq API key in `.env` file
3. Check browser network tab for failed requests
4. Look at backend terminal for error messages

### "Connection Error" Messages
- Ensure both frontend (port 5173) and backend (port 8000) are running
- Check if CORS is properly configured
- Verify no firewall is blocking the ports

### Tasks Not Being Created
- Ensure you're logged into Firebase
- Check browser console for Firebase errors
- Verify task creation permissions

## 🛠️ Advanced Configuration

### Custom Backend Port
Edit `.env` file:
```
PORT=8001
```

### Different Frontend URL
Update CORS origins in `ai-backend/main.py`:
```python
allow_origins=["http://localhost:3000", "http://your-frontend-url"]
```

### Production Deployment
1. Set `ENVIRONMENT=production` in backend `.env`
2. Update frontend API URL in `ChatWindow.jsx`
3. Configure proper CORS origins
4. Use process managers like PM2 for backend

## 📱 Mobile Support

The chat assistant is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices
- Progressive Web Apps (PWA)

## 🎨 Customization

### Chat Appearance
Edit `frontend/src/components/ChatAssistant/` files:
- Colors and themes
- Window size and position
- Animation speeds
- Message styling

### AI Behavior
Edit `ai-backend/task_extractor.py`:
- System prompts
- Task categories
- Priority logic
- Date parsing rules

## 📊 Monitoring

### Backend Health Check
Visit http://localhost:8000/health to see:
- Server status
- Groq API configuration
- Task extractor readiness

### API Documentation
Visit http://localhost:8000/docs for interactive API documentation

## 🤝 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Look at console/terminal logs
3. Test with the provided test script
4. Verify all prerequisites are met

## 🎉 You're Ready!

Once both servers are running and you have your Groq API key configured, you should see the chat assistant icon in your StudyMate application. Start chatting and watch as your casual conversation gets converted into organized tasks!

**Happy task managing! 🚀**
