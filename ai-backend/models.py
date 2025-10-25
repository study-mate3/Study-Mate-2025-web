from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TaskData(BaseModel):
    description: str
    list: str = "Personal"  # Personal, Work, Study
    dueDate: Optional[str] = None  # YYYY-MM-DD format
    subTasks: Optional[str] = None
    priority: str = "low"  # low, medium, high
    completed: bool = False

class ChatMessage(BaseModel):
    message: str
    userId: str

class ChatResponse(BaseModel):
    response: str
    tasks: List[TaskData] = []
    needsFollowUp: bool = False
    followUpQuestion: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
