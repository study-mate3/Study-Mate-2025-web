"""
LangGraph Agent Module
Implements Router-First Agentic Architecture with Human-in-the-Loop
"""

import os
import json
import uuid
import re
from typing import Annotated, Literal, Dict, Any, List
from datetime import datetime, timedelta
import logging

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from models import (
    AgentState, TaskData, PendingTask, TaskConfirmation,
    UserRole, TaskList, TaskPriority
)
from firestore_service import firestore_service

logger = logging.getLogger(__name__)

# =========================================================================
# DATE PARSING UTILITIES
# =========================================================================

def parse_natural_date(date_str: str) -> str:
    """
    Parse natural language dates into YYYY-MM-DD format.
    
    Supported formats:
    - "today" -> current date
    - "tomorrow" -> current date + 1 day
    - "next monday", "next friday", etc. -> next occurrence of that day
    - "this afternoon", "this evening" -> today
    - "November 29", "Dec 5", "Jan 15" -> specific date in current/next year
    - "2025-11-29" -> already formatted, return as-is
    
    Args:
        date_str: Natural language date string
        
    Returns:
        Date in YYYY-MM-DD format
    """
    if not date_str or not isinstance(date_str, str):
        return None
    
    date_str = date_str.strip().lower()
    today = datetime.now()
    
    # Already in YYYY-MM-DD format
    if re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
        return date_str
    
    # Today
    if date_str == "today":
        return today.strftime("%Y-%m-%d")
    
    # Tomorrow
    if date_str == "tomorrow":
        return (today + timedelta(days=1)).strftime("%Y-%m-%d")
    
    # This afternoon/evening/morning (treat as today)
    if date_str.startswith("this "):
        return today.strftime("%Y-%m-%d")
    
    # Next [day of week]
    next_day_match = re.match(r'next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)', date_str)
    if next_day_match:
        day_name = next_day_match.group(1)
        days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        target_day = days.index(day_name)
        current_day = today.weekday()
        days_ahead = (target_day - current_day + 7) % 7
        if days_ahead == 0:
            days_ahead = 7
        target_date = today + timedelta(days=days_ahead)
        return target_date.strftime("%Y-%m-%d")
    
    # Month names with day (e.g., "November 29", "Dec 5")
    month_day_match = re.match(r'(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})', date_str)
    if month_day_match:
        month_str = month_day_match.group(1)
        day = int(month_day_match.group(2))
        
        # Map month names to numbers
        month_map = {
            'january': 1, 'jan': 1, 'february': 2, 'feb': 2,
            'march': 3, 'mar': 3, 'april': 4, 'apr': 4,
            'may': 5, 'june': 6, 'jun': 6,
            'july': 7, 'jul': 7, 'august': 8, 'aug': 8,
            'september': 9, 'sep': 9, 'october': 10, 'oct': 10,
            'november': 11, 'nov': 11, 'december': 12, 'dec': 12
        }
        month = month_map[month_str]
        
        # Determine year (use current year if date hasn't passed, otherwise next year)
        year = today.year
        try:
            target_date = datetime(year, month, day)
            if target_date < today:
                year += 1
            return f"{year}-{month:02d}-{day:02d}"
        except ValueError:
            # Invalid date (e.g., Feb 30)
            return None
    
    # In N days
    days_match = re.match(r'in\s+(\d+)\s+days?', date_str)
    if days_match:
        days = int(days_match.group(1))
        return (today + timedelta(days=days)).strftime("%Y-%m-%d")
    
    # Could not parse
    return None

class StudyMateAgent:
    """
    Main agent class implementing Router-First architecture
    with LangGraph state management
    """
    
    def __init__(self, groq_api_key: str):
        """Initialize the agent with LLM and graph"""
        self.llm = ChatGroq(
            groq_api_key=groq_api_key,
            model_name="llama-3.1-8b-instant",
            temperature=0.3,
        )
        
        # Build the state graph
        self.graph = self._build_graph()
        
        # Memory for checkpointing (session management)
        self.memory = MemorySaver()
        
        logger.info("StudyMate Agent initialized successfully")
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow"""
        
        # Create the state graph with dict schema
        workflow = StateGraph(dict)
        
        # Add nodes
        workflow.add_node("router", self.router_node)
        workflow.add_node("conversationalist", self.conversationalist_node)
        workflow.add_node("task_extractor", self.task_extractor_node)
        
        # Set entry point
        workflow.set_entry_point("router")
        
        # Add conditional edges from router
        workflow.add_conditional_edges(
            "router",
            self.route_decision,
            {
                "small_talk": "conversationalist",
                "tool_use": "task_extractor"
            }
        )
        
        # Both nodes end the workflow
        workflow.add_edge("conversationalist", END)
        workflow.add_edge("task_extractor", END)
        
        return workflow.compile()
    
    # =========================================================================
    # ROUTER NODE
    # =========================================================================
    
    def router_node(self, state: dict) -> dict:
        """
        Router Node: Classifies user intent into 'small_talk' or 'tool_use'
        """
        logger.info(f"Router processing message: {state['user_message'][:100]}")
        
        system_prompt = """You are an intent classifier for a task management assistant.

Your job is to determine if the user's message is:
1. **small_talk** - Casual conversation, greetings, questions about the bot, emotional support, or general chitchat
2. **tool_use** - Task management requests (creating, viewing, updating tasks), productivity queries, or anything requiring action

Examples:

small_talk:
- "Hello!"
- "How are you?"
- "What can you do?"
- "I'm feeling tired today"
- "Thanks for your help"
- "Good morning"

tool_use:
- "I need to study for my exam next week"
- "Add a task to buy groceries"
- "Show me my tasks"
- "I have a meeting tomorrow at 3 PM"
- "Remind me to call mom"
- "What are my pending tasks?"

Respond with ONLY a JSON object:
{
    "intent": "small_talk" or "tool_use",
    "confidence": 0.0 to 1.0,
    "reasoning": "brief explanation"
}"""
        
        try:
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Classify this message: '{state['user_message']}'")
            ]
            
            response = self.llm.invoke(messages)
            result = json.loads(response.content)
            
            state["intent"] = result["intent"]
            logger.info(f"Intent classified as: {state['intent']} (confidence: {result['confidence']})")
            
        except Exception as e:
            logger.error(f"Error in router node: {e}")
            # Default to small_talk if classification fails
            state["intent"] = "small_talk"
        
        return state
    
    def route_decision(self, state: dict) -> Literal["small_talk", "tool_use"]:
        """Routing decision based on intent"""
        return state.get("intent") or "small_talk"
    
    # =========================================================================
    # CONVERSATIONALIST NODE
    # =========================================================================
    
    def conversationalist_node(self, state: dict) -> dict:
        """
        Conversationalist Node: Handles casual conversation
        No tool access, pure empathy and helpfulness
        """
        logger.info("Conversationalist handling small talk")
        
        system_prompt = """You are a friendly and empathetic AI assistant for students.

Your role:
- Provide emotional support and encouragement
- Answer questions about how you work
- Engage in friendly conversation
- Be warm, supportive, and helpful
- Guide users toward productivity when appropriate

You do NOT have access to:
- Task databases
- User information
- Calendar systems

Keep responses:
- Short and conversational (2-4 sentences)
- Warm and encouraging
- Honest about your limitations
- Focused on helping the user feel supported

If the user asks about tasks or productivity, gently let them know you can help with that if they tell you what they need to do."""
        
        try:
            # Build conversation context
            messages = [SystemMessage(content=system_prompt)]
            
            # Add recent conversation history
            for msg in state.get("conversation_history", [])[-6:]:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                else:
                    messages.append(AIMessage(content=msg["content"]))
            
            # Add current message
            messages.append(HumanMessage(content=state["user_message"]))
            
            response = self.llm.invoke(messages)
            state["response"] = response.content
            
            logger.info("Conversationalist response generated")
            
        except Exception as e:
            logger.error(f"Error in conversationalist node: {e}")
            state["response"] = "I'm here to help! How can I assist you today?"
        
        return state
    
    # =========================================================================
    # TASK EXTRACTOR NODE (EXECUTOR)
    # =========================================================================
    
    def task_extractor_node(self, state: dict) -> dict:
        """
        Task Extractor Node: Handles task-related operations
        Implements HITL for task creation with confirmation flow
        """
        logger.info("Task extractor processing request")
        
        current_date = datetime.now().strftime("%Y-%m-%d")
        
        system_prompt = f"""You are an AI task management assistant that helps users organize their work.

Today's date: {current_date}

Your responsibilities:
1. Extract actionable tasks from user messages
2. Ask follow-up questions when REQUIRED information is missing
3. A task is COMPLETE only when it has BOTH description AND dueDate
4. Never create tasks for casual statements

CRITICAL RULES:
- **REQUIRED FIELDS**: description AND dueDate
- If EITHER is missing → create a pendingTask and ask for missing info
- Keep asking until you have both pieces of information
- **OPTIONAL FIELDS**: list (default: "Personal"), priority (default: "medium")
- **IMPORTANT**: "list" must be EXACTLY ONE of: Personal, Work, or Study (choose one, not "Personal|Work|Study")
  - Use "Study" for academic/school/learning tasks
  - Use "Work" for professional/job tasks
  - Use "Personal" for everything else
- **IMPORTANT**: "dueDate" must be in YYYY-MM-DD format. Convert natural language dates:
  - "today" → {current_date}
  - "tomorrow" → calculate tomorrow's date
  - "next Friday", "next Monday" → calculate the actual date
  - "November 29", "Dec 5" → convert to YYYY-MM-DD format
  - "this afternoon", "this evening" → use today's date
  - ALWAYS convert to YYYY-MM-DD format, NEVER leave as natural language
- **IMPORTANT**: NO TIME needed. When asking for dates, ask "When?" not "What time?"
- **PRIORITY INFERENCE**: 
  - Use "high" for urgent tasks (words like: urgent, ASAP, deadline, exam, due soon)
  - Use "medium" for normal tasks (default)
  - Use "low" for non-urgent tasks (words like: someday, eventually, when possible)
- Use context from conversation history to complete tasks

RESPONSE FORMAT - JSON ONLY:
{{
    "response": "Your conversational response",
    "tasks": [
        // ONLY include tasks with BOTH description AND dueDate
        {{
            "description": "Clear task description",
            "list": "Study",
            "dueDate": "YYYY-MM-DD (REQUIRED)",
            "subTasks": ["subtask1", "subtask2"] or null,
            "priority": "medium",
            "importance": false
        }}
    ],
    "pendingTasks": [
        // Tasks missing description OR dueDate
        {{
            "description": "...",
            "list": "...",
            "dueDate": null,
            "priority": "...",
            "missingFields": ["dueDate"]
        }}
    ],
    "needsFollowUp": boolean,
    "followUpQuestion": "Question for missing information or null"
}}

EXAMPLES:

User: "I need to study for math exam"
Response:
{{
    "response": "I'll help you create a study task for your math exam. When is the exam or when would you like to complete studying?",
    "tasks": [],
    "pendingTasks": [
        {{
            "description": "Study for math exam",
            "list": "Study",
            "dueDate": null,
            "priority": "high",
            "missingFields": ["dueDate"]
        }}
    ],
    "needsFollowUp": true,
    "followUpQuestion": "When is your math exam scheduled?"
}}

User: "It's next Friday" (Context: pending task about math exam)
Response:
{{
    "response": "Perfect! I've prepared a study task for your math exam on next Friday. Please confirm to add it to your list.",
    "tasks": [
        {{
            "description": "Study for math exam",
            "list": "Study",
            "dueDate": "2025-12-06",
            "subTasks": ["Review chapters", "Practice problems"],
            "priority": "high",
            "importance": false
        }}
    ],
    "pendingTasks": [],
    "needsFollowUp": false,
    "followUpQuestion": null
}}

User: "Submit report by tomorrow"
Response:
{{
    "response": "I've prepared a task to submit your report tomorrow. Please confirm to add it to your list.",
    "tasks": [
        {{
            "description": "Submit report",
            "list": "Work",
            "dueDate": "2025-11-27",
            "subTasks": null,
            "priority": "high",
            "importance": false
        }}
    ],
    "pendingTasks": [],
    "needsFollowUp": false,
    "followUpQuestion": null
}}

User: "I want to complete the programming assignment today"
Response:
{{
    "response": "I've prepared a task to complete the programming assignment today. Please confirm to add it to your list.",
    "tasks": [
        {{
            "description": "Complete the programming assignment",
            "list": "Study",
            "dueDate": "2025-11-26",
            "subTasks": null,
            "priority": "medium",
            "importance": false
        }}
    ],
    "pendingTasks": [],
    "needsFollowUp": false,
    "followUpQuestion": null
}}

User: "Create a task to learn graph neural network by tomorrow"
Response:
{{
    "response": "I've prepared a task to learn graph neural network by tomorrow. Please confirm to add it to your list.",
    "tasks": [
        {{
            "description": "Learn graph neural network",
            "list": "Study",
            "dueDate": "2025-11-27",
            "subTasks": null,
            "priority": "medium",
            "importance": false
        }}
    ],
    "pendingTasks": [],
    "needsFollowUp": false,
    "followUpQuestion": null
}}

User: "Finish the project report by November 29"
Response:
{{
    "response": "I've prepared a task to finish the project report by November 29. Please confirm to add it to your list.",
    "tasks": [
        {{
            "description": "Finish the project report",
            "list": "Work",
            "dueDate": "2025-11-29",
            "subTasks": null,
            "priority": "medium",
            "importance": false
        }}
    ],
    "pendingTasks": [],
    "needsFollowUp": false,
    "followUpQuestion": null
}}

Remember:
- NEVER add incomplete tasks to "tasks" array
- ALWAYS use "pendingTasks" for missing information
- ALWAYS convert natural language dates to YYYY-MM-DD format
- When user says "today", "tomorrow", "next Friday", "November 29", etc., convert to actual date - DO NOT ask "When is tomorrow?" or similar
- Infer "list" based on task context: Study (academic), Work (professional), Personal (other)
- Infer "priority" based on urgency indicators in the text
- Reference conversation history for context
- Be conversational and helpful"""
        
        try:
            # Build conversation context
            messages = [SystemMessage(content=system_prompt)]
            
            # Add conversation history
            context = "Conversation history:\n"
            for msg in state.get("conversation_history", [])[-8:]:
                role = "User" if msg["role"] == "user" else "Assistant"
                context += f"{role}: {msg['content']}\n"
            
            if context != "Conversation history:\n":
                messages.append(HumanMessage(content=context))
            
            # Add current message
            messages.append(HumanMessage(content=f"Current message: {state['user_message']}"))
            
            response = self.llm.invoke(messages)
            
            # Parse JSON response
            try:
                result = json.loads(response.content)
                
                # Validate and process tasks
                valid_tasks = []
                for task in result.get("tasks", []):
                    # CRITICAL: Must have both description and dueDate
                    if task.get("description") and task.get("dueDate"):
                        # Parse and validate dueDate
                        raw_due_date = task.get("dueDate")
                        parsed_due_date = parse_natural_date(raw_due_date)
                        
                        # If date parsing failed, skip this task and ask for clarification
                        if not parsed_due_date:
                            logger.warning(f"Could not parse date '{raw_due_date}', skipping task")
                            continue
                        
                        # Clean and validate list field
                        task_list_raw = task.get("list", "Personal")
                        # If LLM returned pipe-delimited string, take first value
                        if isinstance(task_list_raw, str) and "|" in task_list_raw:
                            task_list_raw = task_list_raw.split("|")[0].strip()
                        # Validate against TaskList enum
                        try:
                            task_list = TaskList(task_list_raw)
                        except ValueError:
                            logger.warning(f"Invalid task list '{task_list_raw}', defaulting to 'Personal'")
                            task_list = TaskList.Personal
                        
                        # Clean and validate priority field
                        task_priority_raw = task.get("priority", "medium")
                        if isinstance(task_priority_raw, str) and "|" in task_priority_raw:
                            task_priority_raw = task_priority_raw.split("|")[0].strip()
                        try:
                            task_priority = TaskPriority(task_priority_raw)
                        except ValueError:
                            logger.warning(f"Invalid priority '{task_priority_raw}', defaulting to 'medium'")
                            task_priority = TaskPriority.medium
                        
                        task_obj = TaskData(
                            description=task["description"],
                            list=task_list,
                            dueDate=parsed_due_date,  # Use parsed date instead of raw
                            subTasks=task.get("subTasks"),
                            priority=task_priority,
                            importance=task.get("importance", False)
                        )
                        valid_tasks.append(task_obj)
                        
                        # Create confirmation object for HITL
                        confirmation = TaskConfirmation(
                            taskId=str(uuid.uuid4()),
                            task=task_obj,
                            status="pending"
                        )
                        if "task_confirmations" not in state:
                            state["task_confirmations"] = []
                        state["task_confirmations"].append(confirmation)
                    else:
                        logger.warning("Task missing required fields, skipping")
                
                # Process pending tasks
                valid_pending = []
                for pending in result.get("pendingTasks", []):
                    # Parse dueDate if present (might be in natural language)
                    pending_due_date = None
                    if pending.get("dueDate"):
                        parsed_date = parse_natural_date(pending["dueDate"])
                        if parsed_date:
                            pending_due_date = parsed_date
                        else:
                            # Keep original if parsing fails
                            pending_due_date = pending["dueDate"]
                    
                    # Clean and validate list field if present
                    pending_list = None
                    if pending.get("list"):
                        pending_list_raw = pending["list"]
                        if isinstance(pending_list_raw, str) and "|" in pending_list_raw:
                            pending_list_raw = pending_list_raw.split("|")[0].strip()
                        try:
                            pending_list = TaskList(pending_list_raw)
                        except ValueError:
                            logger.warning(f"Invalid pending task list '{pending_list_raw}', setting to None")
                            pending_list = None
                    
                    # Clean and validate priority field if present
                    pending_priority = None
                    if pending.get("priority"):
                        pending_priority_raw = pending["priority"]
                        if isinstance(pending_priority_raw, str) and "|" in pending_priority_raw:
                            pending_priority_raw = pending_priority_raw.split("|")[0].strip()
                        try:
                            pending_priority = TaskPriority(pending_priority_raw)
                        except ValueError:
                            logger.warning(f"Invalid pending priority '{pending_priority_raw}', setting to None")
                            pending_priority = None
                    
                    pending_obj = PendingTask(
                        description=pending.get("description"),
                        list=pending_list,
                        dueDate=pending_due_date,
                        subTasks=pending.get("subTasks"),
                        priority=pending_priority,
                        missingFields=pending.get("missingFields", [])
                    )
                    valid_pending.append(pending_obj)
                
                state["extracted_tasks"] = valid_tasks
                state["pending_tasks"] = valid_pending
                state["response"] = result.get("response", "I understand. How can I help you organize your tasks?")
                state["needs_follow_up"] = result.get("needsFollowUp", False)
                state["follow_up_question"] = result.get("followUpQuestion")
                
                logger.info(f"Extracted {len(valid_tasks)} complete tasks, {len(valid_pending)} pending tasks")
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse LLM response: {e}")
                state["response"] = "I understand you want to create a task. Could you tell me what you need to do and when you'd like to complete it?"
                state["needs_follow_up"] = True
                
        except Exception as e:
            logger.error(f"Error in task extractor node: {e}")
            state["response"] = "I'm having trouble processing that. Could you rephrase what you'd like to accomplish?"
            state["error"] = str(e)
        
        return state
    
    # =========================================================================
    # MAIN EXECUTION
    # =========================================================================
    
    def process_message(
        self,
        user_message: str,
        user_id: str,
        session_id: str = None,
        conversation_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Process a user message through the agent workflow
        
        Args:
            user_message: The user's input
            user_id: User ID from Firestore
            session_id: Optional session ID for continuity
            conversation_history: Previous conversation messages
            
        Returns:
            Dictionary with response and extracted data
        """
        try:
            # Get user role from Firestore
            user_role = firestore_service.get_user_role(user_id)
            
            # Create initial state as dictionary
            initial_state = {
                "user_message": user_message,
                "user_id": user_id,
                "user_role": user_role,
                "session_id": session_id or str(uuid.uuid4()),
                "conversation_history": conversation_history or [],
                "intent": None,
                "extracted_tasks": [],
                "pending_tasks": [],
                "task_confirmations": [],
                "response": "",
                "needs_follow_up": False,
                "follow_up_question": None,
                "timestamp": datetime.now().isoformat(),
                "error": None
            }
            
            # Run the graph
            final_state = self.graph.invoke(initial_state)
            
            # LangGraph returns a dictionary, not an AgentState object
            # Access fields as dictionary keys
            response = {
                "response": final_state.get("response", "I'm here to help!"),
                "tasks": [task.dict() if hasattr(task, 'dict') else task for task in final_state.get("extracted_tasks", [])],
                "pendingTasks": [pt.dict() if hasattr(pt, 'dict') else pt for pt in final_state.get("pending_tasks", [])],
                "taskConfirmations": [tc.dict() if hasattr(tc, 'dict') else tc for tc in final_state.get("task_confirmations", [])],
                "needsFollowUp": final_state.get("needs_follow_up", False),
                "followUpQuestion": final_state.get("follow_up_question"),
                "sessionId": final_state.get("session_id"),
                "intentType": final_state.get("intent")
            }
            
            logger.info(f"Agent processing complete. Intent: {final_state.get('intent')}")
            return response
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {
                "response": "I apologize, I'm having trouble processing that right now. Please try again.",
                "tasks": [],
                "pendingTasks": [],
                "taskConfirmations": [],
                "needsFollowUp": False,
                "followUpQuestion": None,
                "sessionId": session_id or str(uuid.uuid4()),
                "error": str(e)
            }
    
    def confirm_task(self, user_id: str, task_id: str, task_data: Dict[str, Any]) -> bool:
        """
        Confirm and add task to Firestore
        Called when user confirms a task
        
        Args:
            user_id: User ID
            task_id: Temporary task ID from confirmation
            task_data: Task data to add
            
        Returns:
            bool: Success status
        """
        try:
            # Check user role (only students can add tasks)
            user_role = firestore_service.get_user_role(user_id)
            if user_role != UserRole.STUDENT:
                logger.warning(f"User {user_id} with role {user_role} attempted to add task")
                return False
            
            # Add task to Firestore
            success = firestore_service.add_task(user_id, task_data)
            
            if success:
                logger.info(f"Task confirmed and added for user {user_id}")
            else:
                logger.error(f"Failed to add confirmed task for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error confirming task: {e}")
            return False
