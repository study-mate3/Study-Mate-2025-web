"""
StudyMate AI Backend - FastAPI Application
Implements Router-First Agentic Architecture with LangGraph
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import logging

from models import (
    ChatMessage, ChatResponse, ErrorResponse,
    TaskConfirmationRequest, UserRole
)
from agent import StudyMateAgent
from firestore_service import firestore_service

# Load environment variables
load_dotenv(override=True)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="StudyMate AI Assistant",
    description="AI-powered chat assistant with Router-First Agentic Architecture using LangGraph",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Initialize agent
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    logger.error("GROQ_API_KEY not found in environment variables")
    agent = None
else:
    try:
        agent = StudyMateAgent(groq_api_key)
        logger.info("StudyMate Agent initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize agent: {e}")
        agent = None

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint - API status"""
    return {
        "message": "StudyMate AI Assistant API is running!",
        "version": "2.0.0",
        "architecture": "Router-First Agentic with LangGraph"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "groq_configured": groq_api_key is not None,
        "agent_ready": agent is not None,
        "firestore_ready": firestore_service.db is not None
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_ai(message: ChatMessage):
    """
    Main chat endpoint - processes messages through LangGraph agent
    
    Flow:
    1. Router classifies intent (small_talk vs tool_use)
    2. Routes to appropriate node (conversationalist vs task_extractor)
    3. For tasks: extracts info, asks follow-ups, creates confirmations
    4. Returns response with tasks awaiting confirmation
    """
    try:
        if not agent:
            raise HTTPException(
                status_code=500,
                detail="AI service is not available. Please check GROQ_API_KEY configuration."
            )
        
        # Validate input
        if not message.message or not message.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        if not message.userId:
            raise HTTPException(status_code=400, detail="User ID is required")
        
        logger.info(f"Processing message from user {message.userId}: {message.message[:100]}...")
        
        # Process through agent
        result = agent.process_message(
            user_message=message.message,
            user_id=message.userId,
            session_id=message.sessionId,
            conversation_history=message.conversationHistory or []
        )
        
        # Build response
        response = ChatResponse(
            response=result.get("response", "I'm here to help!"),
            tasks=result.get("tasks", []),
            pendingTasks=result.get("pendingTasks", []),
            taskConfirmations=result.get("taskConfirmations", []),
            needsFollowUp=result.get("needsFollowUp", False),
            followUpQuestion=result.get("followUpQuestion"),
            sessionId=result.get("sessionId"),
            intentType=result.get("intentType")
        )
        
        logger.info(
            f"Response generated - Intent: {result.get('intentType')}, "
            f"Tasks: {len(result.get('tasks', []))}, "
            f"Pending: {len(result.get('pendingTasks', []))}, "
            f"Confirmations: {len(result.get('taskConfirmations', []))}"
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/task/confirm")
async def confirm_task(request: TaskConfirmationRequest):
    """
    Task confirmation endpoint - HITL (Human-in-the-Loop)
    
    User clicks "confirm" or "discard" for a task
    If confirmed: adds to Firestore (RBAC enforced - students only)
    """
    try:
        if not agent:
            raise HTTPException(status_code=500, detail="AI service not available")
        
        logger.info(
            f"Task confirmation request - User: {request.userId}, "
            f"Action: {request.action}, TaskID: {request.taskId}"
        )
        
        if request.action == "discard":
            return {
                "success": True,
                "message": "Task discarded successfully",
                "action": "discarded"
            }
        
        # For confirmation, we need to retrieve the task from session
        # In production, you'd store confirmations in a temporary cache/db
        # For now, return a placeholder response
        
        # TODO: Implement proper task confirmation storage and retrieval
        logger.warning("Task confirmation storage not yet implemented")
        
        return {
            "success": True,
            "message": "Task confirmation received. Full implementation pending.",
            "action": "confirmed"
        }
        
    except Exception as e:
        logger.error(f"Error in task confirmation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/task/add")
async def add_task_directly(task_data: dict, user_id: str):
    """
    Direct task addition endpoint (bypasses confirmation)
    Used for confirmed tasks from frontend
    """
    try:
        if not firestore_service.db:
            raise HTTPException(status_code=500, detail="Firestore not available")
        
        # Check user role
        user_role = firestore_service.get_user_role(user_id)
        if user_role != UserRole.STUDENT:
            raise HTTPException(
                status_code=403,
                detail="Only students can add tasks"
            )
        
        success = firestore_service.add_task(user_id, task_data)
        
        if success:
            return {
                "success": True,
                "message": "Task added successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to add task")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding task: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Global exception handler caught: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )

# ============================================================================
# STARTUP
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    logger.info(f"Starting StudyMate AI Backend on {host}:{port}")
    logger.info(f"Architecture: Router-First Agentic with LangGraph")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )
