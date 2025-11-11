from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class TaskData(BaseModel):
    description: str
    list: str = "Personal"  # Personal, Work, Study
    dueDate: Optional[str] = None  # YYYY-MM-DD format
    subTasks: Optional[str] = None
    priority: str = "low"  # low, medium, high
    completed: bool = False

class PendingTask(BaseModel):
    """Task with incomplete information that needs follow-up"""
    description: Optional[str] = None
    list: Optional[str] = None
    dueDate: Optional[str] = None
    subTasks: Optional[str] = None
    priority: Optional[str] = None
    missingFields: List[str] = []

class ChatMessage(BaseModel):
    message: str
    userId: str
    sessionId: Optional[str] = None  # To maintain conversation context

class ChatResponse(BaseModel):
    response: str
    tasks: List[TaskData] = []
    pendingTasks: List[PendingTask] = []  # Tasks waiting for more info
    needsFollowUp: bool = False
    followUpQuestion: Optional[str] = None
    sessionId: Optional[str] = None  # Return session ID to client

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
