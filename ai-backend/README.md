# AI Backend for StudyMate Chat Assistant

This backend provides AI-powered task extraction and chat functionality using Groq's Llama 3.1 8B instant model.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

3. Get Groq API Key:
- Visit https://console.groq.com/
- Create an account and get your API key
- Add it to your .env file

4. Run the server:
```bash
python main.py
```

The server will start on http://localhost:8000

## API Endpoints

### POST /api/chat
Process chat messages and extract tasks.

**Request:**
```json
{
  "message": "I need to study for my math exam tomorrow and buy groceries",
  "userId": "user123"
}
```

**Response:**
```json
{
  "response": "I've identified two tasks for you! Let me help you create them.",
  "tasks": [
    {
      "description": "Study for math exam",
      "list": "Study",
      "dueDate": "2024-10-25",
      "subTasks": "Review chapters, practice problems",
      "priority": "high",
      "completed": false
    },
    {
      "description": "Buy groceries",
      "list": "Personal",
      "dueDate": null,
      "subTasks": null,
      "priority": "medium",
      "completed": false
    }
  ]
}
```

### GET /health
Check API health status.

## Features

- **Natural Language Processing**: Understands user intentions and extracts actionable tasks
- **Smart Task Classification**: Automatically categorizes tasks as Personal, Work, or Study
- **Date Recognition**: Extracts due dates from natural language (today, tomorrow, next week, etc.)
- **Priority Assessment**: Assigns priority levels based on context
- **Conversational Responses**: Provides helpful, human-like responses

## Task Attributes

Each extracted task includes:
- `description`: What needs to be done
- `list`: Category (Personal, Work, Study)
- `dueDate`: When it's due (YYYY-MM-DD format or null)
- `subTasks`: Additional details or sub-tasks
- `priority`: Urgency level (low, medium, high)
- `completed`: Always false for new tasks

## Error Handling

The API includes comprehensive error handling:
- Invalid API key configuration
- Empty or malformed messages
- JSON parsing errors
- Rate limiting from Groq API
- Network connectivity issues

## Development

For development, set `ENVIRONMENT=development` in your .env file to enable auto-reload.
