import os
import json
import re
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage
from models import TaskData, PendingTask
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConversationSession:
    """Manages conversation context and pending tasks"""
    def __init__(self, session_id: str, user_id: str):
        self.session_id = session_id
        self.user_id = user_id
        self.conversation_history: List[Dict[str, str]] = []
        self.pending_tasks: List[Dict[str, Any]] = []
        self.created_at = datetime.now()
        self.last_updated = datetime.now()
    
    def add_message(self, role: str, content: str):
        """Add a message to conversation history"""
        self.conversation_history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        self.last_updated = datetime.now()
    
    def add_pending_task(self, task_data: Dict[str, Any]):
        """Add a task that's waiting for more information"""
        self.pending_tasks.append(task_data)
        self.last_updated = datetime.now()
    
    def update_pending_task(self, index: int, updates: Dict[str, Any]):
        """Update a pending task with new information"""
        if 0 <= index < len(self.pending_tasks):
            self.pending_tasks[index].update(updates)
            self.last_updated = datetime.now()
    
    def get_conversation_context(self) -> str:
        """Get formatted conversation history"""
        context = "Previous conversation:\n"
        for msg in self.conversation_history[-6:]:  # Last 6 messages (3 exchanges)
            role = "User" if msg["role"] == "user" else "Assistant"
            context += f"{role}: {msg['content']}\n"
        
        if self.pending_tasks:
            context += "\nPending tasks awaiting more information:\n"
            for i, task in enumerate(self.pending_tasks):
                context += f"{i+1}. {json.dumps(task)}\n"
        
        return context

class TaskExtractor:
    def __init__(self, groq_api_key: str):
        self.llm = ChatGroq(
            groq_api_key=groq_api_key,
            model_name="llama-3.1-8b-instant",
            temperature=0.1,
        )
        self.sessions: Dict[str, ConversationSession] = {}
        
    def _get_or_create_session(self, user_id: str, session_id: str = None) -> ConversationSession:
        """Get existing session or create new one"""
        if session_id and session_id in self.sessions:
            session = self.sessions[session_id]
            # Update last_updated time
            session.last_updated = datetime.now()
            return session
        
        # Create new session
        new_session_id = session_id or str(uuid.uuid4())
        session = ConversationSession(new_session_id, user_id)
        self.sessions[new_session_id] = session
        
        # Clean up old sessions (older than 1 hour)
        self._cleanup_old_sessions()
        
        return session
    def _cleanup_old_sessions(self):
        """Remove sessions older than 1 hour"""
        current_time = datetime.now()
        expired_sessions = [
            sid for sid, session in self.sessions.items()
            if (current_time - session.last_updated).total_seconds() > 3600
        ]
        for sid in expired_sessions:
            del self.sessions[sid]
            logger.info(f"Cleaned up expired session: {sid}")
        
    def _create_system_prompt(self) -> str:
        return """You are an AI task assistant that helps users organize their work and plans into structured tasks.

Your job is to:
1. Understand what the user wants to accomplish
2. Extract actionable tasks from their message
3. Provide helpful responses
4. Convert tasks into proper JSON format
5. Ask follow-up questions when REQUIRED details are missing
6. Maintain conversation context to gather all necessary information

CRITICAL RULES FOR TASK CREATION:
- **NEVER create a complete task without BOTH description AND dueDate**
- A task is only complete when it has: description (or title) AND dueDate
- If either is missing, mark it as a pendingTask and ask for the missing information
- Keep asking follow-up questions until you have both pieces of information
- DO NOT create tasks for vague statements like "I'm tired" or "having a good day"

FOLLOW-UP QUESTIONS (MANDATORY):
- If user mentions tasks WITHOUT due dates → MUST ask when they want to complete them
- If user mentions tasks WITHOUT clear descriptions → MUST ask for more details
- If user provides a due date but no task → MUST ask what they want to accomplish
- Keep follow-up questions natural and conversational
- Reference the pending task in your follow-up to maintain context

RESPONSE FORMAT:
Always respond with a JSON object containing:
{
    "response": "Your conversational response to the user",
    "tasks": [
        // ONLY include tasks that have BOTH description AND dueDate
        {
            "description": "Task description",
            "list": "Personal|Work|Study",
            "dueDate": "YYYY-MM-DD (REQUIRED)",
            "subTasks": "Sub-task details or null",
            "priority": "low|medium|high",
            "completed": false
        }
    ],
    "pendingTasks": [
        // Include tasks missing description OR dueDate
        {
            "description": "Task description or null",
            "list": "Personal|Work|Study or null",
            "dueDate": "YYYY-MM-DD or null",
            "subTasks": null,
            "priority": "low|medium|high or null",
            "missingFields": ["description", "dueDate"] // List what's missing
        }
    ],
    "needsFollowUp": boolean (true if ANY task is incomplete),
    "followUpQuestion": "Question asking for missing information"
}

EXAMPLES:

Example 1 - Missing due date:
User: "I need to study for my math exam"
Response:
{
    "response": "I'll help you create a study task for your math exam. To add it to your task list, I need to know when you plan to study or when the exam is.",
    "tasks": [],
    "pendingTasks": [
        {
            "description": "Study for math exam",
            "list": "Study",
            "dueDate": null,
            "subTasks": null,
            "priority": "high",
            "missingFields": ["dueDate"]
        }
    ],
    "needsFollowUp": true,
    "followUpQuestion": "When is your math exam, or when would you like to complete your studying?"
}

Example 2 - User provides missing information:
User: "It's next Friday"
(Context: Previous pending task was "Study for math exam")
Response:
{
    "response": "Perfect! I've created a study task for your math exam due next Friday.",
    "tasks": [
        {
            "description": "Study for math exam",
            "list": "Study",
            "dueDate": "2024-11-01",
            "subTasks": "Review chapters, practice problems",
            "priority": "high",
            "completed": false
        }
    ],
    "pendingTasks": [],
    "needsFollowUp": false,
    "followUpQuestion": null
}

Example 3 - Complete information provided:
User: "I need to submit my report by tomorrow"
Response:
{
    "response": "I've created a task for submitting your report tomorrow. Good luck!",
    "tasks": [
        {
            "description": "Submit report",
            "list": "Work",
            "dueDate": "2024-10-26",
            "subTasks": null,
            "priority": "high",
            "completed": false
        }
    ],
    "pendingTasks": [],
    "needsFollowUp": false,
    "followUpQuestion": null
}

Example 4 - Missing task description:
User: "I have something to do next Monday"
Response:
{
    "response": "You mentioned you have something to do next Monday. Could you tell me more about what you need to accomplish?",
    "tasks": [],
    "pendingTasks": [
        {
            "description": null,
            "list": null,
            "dueDate": "2024-10-28",
            "subTasks": null,
            "priority": null,
            "missingFields": ["description"]
        }
    ],
    "needsFollowUp": true,
    "followUpQuestion": "What do you need to do next Monday?"
}

Example 5 - Casual conversation:
User: "How are you doing today?"
Response:
{
    "response": "I'm doing great, thank you for asking! I'm here to help you organize your tasks and plans. Is there anything specific you'd like to accomplish?",
    "tasks": [],
    "pendingTasks": [],
    "needsFollowUp": false,
    "followUpQuestion": null
}

Remember: 
- NEVER add a task to the "tasks" array without BOTH description AND dueDate
- ALWAYS use "pendingTasks" for incomplete information
- ALWAYS ask follow-up questions for missing required fields
- Maintain conversation context - reference what was discussed before
- Be helpful and conversational"""

    def extract_tasks_from_message(self, user_message: str, user_id: str, session_id: str = None) -> Dict[str, Any]:
        """Extract tasks from user message using Groq/Llama model with conversation context."""
        try:
            # Get or create session
            session = self._get_or_create_session(user_id, session_id)
            
            # Add user message to conversation history
            session.add_message("user", user_message)
            
            system_prompt = self._create_system_prompt()
            
            # Add current date context and conversation history
            current_date = datetime.now().strftime("%Y-%m-%d")
            conversation_context = session.get_conversation_context()
            
            context_message = f"""Today's date is {current_date}.

{conversation_context}

Current user message: {user_message}

Remember: 
- Review the conversation history and pending tasks
- If this message provides missing information for a pending task, complete that task
- NEVER create a task without BOTH description AND dueDate
- Use pendingTasks for incomplete information
- Ask follow-up questions for missing required fields"""
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=context_message)
            ]
            
            response = self.llm.invoke(messages)
            response_text = response.content
            
            logger.info(f"LLM Response: {response_text}")
            
            # Parse JSON response
            try:
                parsed_response = json.loads(response_text)
                
                # Validate response structure
                if not isinstance(parsed_response, dict):
                    raise ValueError("Response is not a dictionary")
                
                if "response" not in parsed_response:
                    parsed_response["response"] = "I understand you want to organize some tasks. Let me help you with that!"
                
                if "tasks" not in parsed_response:
                    parsed_response["tasks"] = []
                
                if "pendingTasks" not in parsed_response:
                    parsed_response["pendingTasks"] = []
                
                if "needsFollowUp" not in parsed_response:
                    parsed_response["needsFollowUp"] = False
                    
                if "followUpQuestion" not in parsed_response:
                    parsed_response["followUpQuestion"] = None
                
                # Add assistant response to conversation history
                session.add_message("assistant", parsed_response["response"])
                
                # Validate and clean tasks (ONLY tasks with description AND dueDate)
                valid_tasks = []
                for task in parsed_response.get("tasks", []):
                    try:
                        # CRITICAL: Ensure task has BOTH description AND dueDate
                        if "description" not in task or not task["description"]:
                            logger.warning("Task missing description, moving to pending")
                            continue
                        
                        if "dueDate" not in task or not task["dueDate"]:
                            logger.warning("Task missing dueDate, moving to pending")
                            continue
                            
                        # Clean and validate task data
                        task_data = {
                            "description": str(task["description"]).strip(),
                            "list": task.get("list", "Personal"),
                            "dueDate": task.get("dueDate"),
                            "subTasks": task.get("subTasks"),
                            "priority": task.get("priority", "medium"),
                            "completed": False
                        }
                        
                        # Validate list category
                        if task_data["list"] not in ["Personal", "Work", "Study"]:
                            task_data["list"] = "Personal"
                            
                        # Validate priority
                        if task_data["priority"] not in ["low", "medium", "high"]:
                            task_data["priority"] = "medium"
                            
                        # Validate date format
                        if task_data["dueDate"]:
                            try:
                                datetime.strptime(task_data["dueDate"], "%Y-%m-%d")
                            except ValueError:
                                logger.warning(f"Invalid date format: {task_data['dueDate']}")
                                continue
                        
                        valid_tasks.append(task_data)
                        
                    except Exception as e:
                        logger.error(f"Error validating task: {e}")
                        continue
                
                # Validate pending tasks
                valid_pending_tasks = []
                for pending in parsed_response.get("pendingTasks", []):
                    try:
                        missing_fields = []
                        
                        if not pending.get("description"):
                            missing_fields.append("description")
                        if not pending.get("dueDate"):
                            missing_fields.append("dueDate")
                        
                        pending_task = {
                            "description": pending.get("description"),
                            "list": pending.get("list"),
                            "dueDate": pending.get("dueDate"),
                            "subTasks": pending.get("subTasks"),
                            "priority": pending.get("priority"),
                            "missingFields": missing_fields
                        }
                        
                        valid_pending_tasks.append(pending_task)
                        session.add_pending_task(pending_task)
                        
                    except Exception as e:
                        logger.error(f"Error validating pending task: {e}")
                        continue
                
                parsed_response["tasks"] = valid_tasks
                parsed_response["pendingTasks"] = valid_pending_tasks
                parsed_response["sessionId"] = session.session_id
                
                return parsed_response
                
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error: {e}")
                # Try to extract JSON from response if it's wrapped in other text
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    try:
                        parsed_response = json.loads(json_match.group())
                        parsed_response["sessionId"] = session.session_id
                        return parsed_response
                    except json.JSONDecodeError:
                        pass
                        
                # Fallback response
                return {
                    "response": "I understand your message, but I'm having trouble processing it right now. Could you please rephrase what you'd like to accomplish?",
                    "tasks": [],
                    "pendingTasks": [],
                    "sessionId": session.session_id
                }
                
        except Exception as e:
            logger.error(f"Error in task extraction: {e}")
            return {
                "response": "I'm sorry, I'm having trouble processing your request right now. Please try again.",
                "tasks": [],
                "pendingTasks": [],
                "sessionId": session_id
            }
    
    def _extract_date_from_text(self, text: str) -> str:
        """Extract and convert relative dates to YYYY-MM-DD format."""
        text_lower = text.lower()
        today = datetime.now()
        
        # Handle relative dates
        if "today" in text_lower:
            return today.strftime("%Y-%m-%d")
        elif "tomorrow" in text_lower:
            return (today + timedelta(days=1)).strftime("%Y-%m-%d")
        elif "next week" in text_lower:
            return (today + timedelta(weeks=1)).strftime("%Y-%m-%d")
        elif "next month" in text_lower:
            return (today + timedelta(days=30)).strftime("%Y-%m-%d")
        
        # Try to extract specific dates (basic patterns)
        date_patterns = [
            r'(\d{4}-\d{2}-\d{2})',  # YYYY-MM-DD
            r'(\d{1,2}/\d{1,2}/\d{4})',  # MM/DD/YYYY
            r'(\d{1,2}-\d{1,2}-\d{4})',  # MM-DD-YYYY
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                date_str = match.group(1)
                try:
                    if '/' in date_str:
                        date_obj = datetime.strptime(date_str, "%m/%d/%Y")
                    elif '-' in date_str and len(date_str.split('-')[0]) == 4:
                        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
                    else:
                        date_obj = datetime.strptime(date_str, "%m-%d-%Y")
                    return date_obj.strftime("%Y-%m-%d")
                except ValueError:
                    continue
        
        return None
