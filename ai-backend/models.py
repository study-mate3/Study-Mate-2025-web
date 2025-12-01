from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from enum import Enum

# ============================================================================
# FIRESTORE SCHEMA MODELS
# ============================================================================

class UserRole(str, Enum):
    """User role enumeration"""
    STUDENT = "student"
    PARENT = "parent"
    ADMIN = "admin"

class TaskList(str, Enum):
    """Task list categories"""
    PERSONAL = "Personal"
    WORK = "Work"
    STUDY = "Study"

class TaskPriority(str, Enum):
    """Task priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

# User Models
class PaperAttempt(BaseModel):
    """Sub-collection: users/{uid}/paper_attempts"""
    paperId: str
    score: int
    percentage: float
    category: str
    subject: str
    year: int
    totalQuestions: int
    selectedAnswers: Dict[str, Any]

class SubTask(BaseModel):
    """Sub-task model for nested task structure"""
    description: str
    completed: bool = False

class Task(BaseModel):
    """Sub-collection: users/{uid}/tasks"""
    description: str
    dueDate: Optional[str] = None  # YYYY-MM-DD format
    priority: TaskPriority = TaskPriority.MEDIUM
    completed: bool = False
    list: TaskList = TaskList.PERSONAL
    subTasks: Optional[List[SubTask]] = None
    createdDate: Optional[str] = None  # ISO format
    importance: bool = False
    
class User(BaseModel):
    """Firestore users collection document"""
    uid: str
    name: str
    studentId: Optional[str] = None
    createdAt: str  # ISO format timestamp
    email: str
    role: UserRole
    completedPomodoros: int = 0
    grade: Optional[str] = None
    gender: Optional[str] = None
    paid: bool = False
    presentTime: Optional[int] = 0  # in seconds

# Notification Model
class NotificationRecipientType(str, Enum):
    """Notification recipient types"""
    ALL = "all"
    STUDENT = "student"
    PARENT = "parent"
    ADMIN = "admin"

class Notification(BaseModel):
    """Firestore notifications collection"""
    message: str
    recipientType: NotificationRecipientType
    importance: str  # Could be enum: "low", "medium", "high"
    timestamp: str  # ISO format

# Issue Model
class Issue(BaseModel):
    """Firestore issues collection"""
    category: str
    details: str
    solved: bool = False
    remarks: Optional[str] = None
    userId: str
    timestamp: str  # ISO format

# ============================================================================
# CHAT & TASK EXTRACTION MODELS
# ============================================================================

class TaskData(BaseModel):
    """Complete task data for extraction"""
    description: str
    list: TaskList = TaskList.PERSONAL
    dueDate: Optional[str] = None  # YYYY-MM-DD format
    subTasks: Optional[List[str]] = None  # Will be converted to SubTask objects
    priority: TaskPriority = TaskPriority.MEDIUM
    completed: bool = False
    importance: bool = False
    createdDate: Optional[str] = None

class PendingTask(BaseModel):
    """Task with incomplete information that needs follow-up"""
    description: Optional[str] = None
    list: Optional[TaskList] = None
    dueDate: Optional[str] = None
    subTasks: Optional[List[str]] = None
    priority: Optional[TaskPriority] = None
    missingFields: List[str] = []
    importance: bool = False

class TaskConfirmation(BaseModel):
    """Task confirmation request/response"""
    taskId: str  # Temporary ID for confirmation
    task: TaskData
    status: Literal["pending", "confirmed", "discarded"] = "pending"

# ============================================================================
# CHAT API MODELS
# ============================================================================

class ChatMessage(BaseModel):
    """Incoming chat message from client"""
    message: str
    userId: str
    sessionId: Optional[str] = None
    conversationHistory: Optional[List[Dict[str, str]]] = None
    pendingTasks: Optional[List[Dict[str, Any]]] = None  # Pending tasks from previous interaction

class ChatResponse(BaseModel):
    """Response from chat endpoint"""
    response: str
    tasks: List[TaskData] = []
    pendingTasks: List[PendingTask] = []
    taskConfirmations: List[TaskConfirmation] = []  # Tasks awaiting user confirmation
    needsFollowUp: bool = False
    followUpQuestion: Optional[str] = None
    sessionId: Optional[str] = None
    intentType: Optional[Literal["small_talk", "tool_use", "data_query"]] = None

class TaskConfirmationRequest(BaseModel):
    """User's confirmation decision"""
    userId: str
    sessionId: str
    taskId: str
    action: Literal["confirm", "discard"]

# ============================================================================
# LANGGRAPH STATE MODEL
# ============================================================================

class AgentState(BaseModel):
    """LangGraph agent state"""
    # Input
    user_message: str
    user_id: str
    user_role: UserRole = UserRole.STUDENT
    session_id: Optional[str] = None
    conversation_history: List[Dict[str, str]] = []
    
    # Processing
    intent: Optional[Literal["small_talk", "tool_use", "data_query"]] = None
    extracted_tasks: List[TaskData] = []
    pending_tasks: List[PendingTask] = []
    task_confirmations: List[TaskConfirmation] = []
    
    # Output
    response: str = ""
    needs_follow_up: bool = False
    follow_up_question: Optional[str] = None
    
    # Metadata
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    error: Optional[str] = None

# ============================================================================
# ERROR MODELS
# ============================================================================

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
