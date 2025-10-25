import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import logging
from models import ChatMessage, ChatResponse, ErrorResponse, TaskData
from task_extractor import TaskExtractor

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="StudyMate AI Task Assistant",
    description="AI-powered chat assistant for task management using Llama 3.1 8B",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Initialize task extractor
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    logger.error("GROQ_API_KEY not found in environment variables")
    task_extractor = None
else:
    try:
        task_extractor = TaskExtractor(groq_api_key)
        logger.info("Task extractor initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize task extractor: {e}")
        task_extractor = None

@app.get("/")
async def root():
    return {"message": "StudyMate AI Task Assistant API is running!"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "groq_configured": groq_api_key is not None,
        "task_extractor_ready": task_extractor is not None
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_ai(message: ChatMessage):
    """Process chat message and extract tasks using AI."""
    try:
        if not task_extractor:
            raise HTTPException(
                status_code=500, 
                detail="AI service is not available. Please check GROQ_API_KEY configuration."
            )
        
        if not message.message or not message.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        if not message.userId:
            raise HTTPException(status_code=400, detail="User ID is required")
        
        logger.info(f"Processing message from user {message.userId}: {message.message[:100]}...")
        
        # Extract tasks using AI
        result = task_extractor.extract_tasks_from_message(message.message, message.userId)
        
        # Convert task dictionaries to TaskData models
        tasks = []
        for task_dict in result.get("tasks", []):
            try:
                task = TaskData(**task_dict)
                tasks.append(task)
            except Exception as e:
                logger.error(f"Error creating TaskData: {e}")
                continue
        
        response = ChatResponse(
            response=result.get("response", "I understand your message and I'm here to help!"),
            tasks=tasks,
            needsFollowUp=result.get("needsFollowUp", False),
            followUpQuestion=result.get("followUpQuestion", None)
        )
        
        logger.info(f"Generated response with {len(tasks)} tasks")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception handler caught: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "localhost")
    port = int(os.getenv("PORT", 8000))
    
    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )
