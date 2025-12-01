"""
LangGraph Agent Module
Implements Router-First Agentic Architecture with Human-in-the-Loop
"""

import os
import json
import uuid
from typing import Annotated, Literal, Dict, Any, List
from datetime import datetime, timedelta
import logging
import dateparser
import pytz

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
    Parse natural language dates into YYYY-MM-DD format using dateparser library.
    Timezone: Asia/Colombo (Sri Lanka)
    
    Supported formats:
    - "today" -> current date in Sri Lanka timezone
    - "tomorrow" -> current date + 1 day
    - "next monday", "next friday", etc. -> next occurrence of that day
    - "this afternoon", "this evening" -> today
    - "November 29", "Dec 5", "Jan 15" -> specific date in current/next year
    - "2025-11-29" -> already formatted, return as-is
    - "in 3 days", "in a week" -> relative dates
    - And many more natural language formats
    
    Args:
        date_str: Natural language date string
        
    Returns:
        Date in YYYY-MM-DD format or None if parsing fails
    """
    if not date_str or not isinstance(date_str, str):
        return None
    
    date_str = date_str.strip()
    
    # Get current time in Sri Lanka timezone
    sri_lanka_tz = pytz.timezone('Asia/Colombo')
    now_sri_lanka = datetime.now(sri_lanka_tz)
    
    # Try dateparser first with standard settings
    parsed_date = dateparser.parse(
        date_str,
        settings={
            'PREFER_DATES_FROM': 'future',  # Prefer future dates for ambiguous inputs
            'RELATIVE_BASE': now_sri_lanka,  # Base date for relative dates (Sri Lanka time)
            'TIMEZONE': 'Asia/Colombo',  # Sri Lanka timezone
            'RETURN_AS_TIMEZONE_AWARE': True,  # Return timezone-aware datetime
            'PARSERS': ['relative-time', 'absolute-time', 'timestamp'],  # Enable all parsers
        },
        languages=['en']  # Explicitly set English language
    )
    
    # If dateparser failed, try removing "next" and parsing just the day name
    # dateparser handles "wednesday" better than "next wednesday"
    if not parsed_date and date_str.lower().startswith('next '):
        # Extract the day name after "next "
        day_name = date_str[5:].strip()  # Remove "next " prefix
        parsed_date = dateparser.parse(
            day_name,
            settings={
                'PREFER_DATES_FROM': 'future',
                'RELATIVE_BASE': now_sri_lanka,
                'TIMEZONE': 'Asia/Colombo',
                'RETURN_AS_TIMEZONE_AWARE': True,
            },
            languages=['en']
        )
    
    # Return formatted date if parsing succeeded
    if parsed_date:
        # Convert to Sri Lanka timezone if not already
        if parsed_date.tzinfo is None:
            parsed_date = sri_lanka_tz.localize(parsed_date)
        else:
            parsed_date = parsed_date.astimezone(sri_lanka_tz)
        
        return parsed_date.strftime("%Y-%m-%d")
    
    # Could not parse - log for debugging
    logger.warning(f"Failed to parse date string: '{date_str}'")
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
        workflow.add_node("knowledge_retriever", self.knowledge_retriever_node)
        
        # Set entry point
        workflow.set_entry_point("router")
        
        # Add conditional edges from router
        workflow.add_conditional_edges(
            "router",
            self.route_decision,
            {
                "small_talk": "conversationalist",
                "tool_use": "task_extractor",
                "data_query": "knowledge_retriever"
            }
        )
        
        # All nodes end the workflow
        workflow.add_edge("conversationalist", END)
        workflow.add_edge("task_extractor", END)
        workflow.add_edge("knowledge_retriever", END)
        
        return workflow.compile()
    
    # =========================================================================
    # ROUTER NODE
    # =========================================================================
    
    def router_node(self, state: dict) -> dict:
        """
        Router Node: Classifies user intent into 'small_talk', 'tool_use', or 'data_query'
        """
        logger.info(f"Router processing message: {state['user_message'][:100]}")
        
        system_prompt = """You are an intent classifier for a task management assistant.

Your job is to determine if the user's message is:
1. **small_talk** - Casual conversation, greetings, questions about the bot, emotional support, or general chitchat
2. **tool_use** - Task management requests (creating, adding, updating, deleting tasks), or anything requiring task creation/modification
3. **data_query** - Requests to KNOW SOMETHING from the database (asking about existing tasks, pomodoro stats, quiz results, or any information retrieval)

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
- "I have a meeting tomorrow at 3 PM"
- "Remind me to call mom"
- "Create a task to finish my homework"

data_query:
- "Show me my tasks"
- "What are my pending tasks?"
- "What tasks do I have this week?"
- "How many pomodoros did I complete?"
- "What are my quiz scores?"
- "Show me my completed tasks"
- "What tasks are due tomorrow?"
- "How much time have I studied?"

Respond with ONLY a JSON object:
{
    "intent": "small_talk" or "tool_use" or "data_query",
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
    
    def route_decision(self, state: dict) -> Literal["small_talk", "tool_use", "data_query"]:
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
    # KNOWLEDGE RETRIEVER NODE (DATA QUERY)
    # =========================================================================
    
    def knowledge_retriever_node(self, state: dict) -> dict:
        """
        Knowledge Retriever Node: Handles data query requests
        Retrieves information from the database and generates natural language responses
        """
        logger.info("Knowledge retriever processing data query")
        
        # Get current date in Sri Lanka timezone
        sri_lanka_tz = pytz.timezone('Asia/Colombo')
        current_date = datetime.now(sri_lanka_tz)
        current_date_str = current_date.strftime("%Y-%m-%d")
        
        # Calculate helper dates
        from datetime import timedelta
        tomorrow = current_date + timedelta(days=1)
        tomorrow_str = tomorrow.strftime("%Y-%m-%d")
        
        yesterday = current_date - timedelta(days=1)
        yesterday_str = yesterday.strftime("%Y-%m-%d")
        
        # Week calculations
        week_start = current_date - timedelta(days=current_date.weekday())
        week_end = week_start + timedelta(days=6)
        week_start_str = week_start.strftime("%Y-%m-%d")
        week_end_str = week_end.strftime("%Y-%m-%d")
        
        # Phase 1: Analyze user query and extract parameters
        analysis_prompt = f"""You are a query analyzer for a student task management system.
Current date (Sri Lanka time): {current_date_str} ({current_date.strftime("%A, %B %d, %Y")})
Tomorrow: {tomorrow_str}
Yesterday: {yesterday_str}
This week: {week_start_str} to {week_end_str}

Your job is to analyze the user's question and extract query parameters.

Query types:
- "tasks" - Questions about tasks (e.g., "Show my tasks", "What's due this week?", "overdue tasks")
- "timer_stats" - Questions about pomodoro/study time (e.g., "How many pomodoros?", "Study time?")
- "quizzes" - Questions about quiz results (e.g., "My quiz scores", "How did I do on quizzes?")

Date range calculations (USE THESE EXACT VALUES):
- "today" -> start_date: "{current_date_str}", end_date: "{current_date_str}"
- "tomorrow" -> start_date: "{tomorrow_str}", end_date: "{tomorrow_str}"
- "yesterday" -> start_date: "{yesterday_str}", end_date: "{yesterday_str}"
- "this week" -> start_date: "{week_start_str}", end_date: "{week_end_str}"
- "overdue" or "past due" -> start_date: null, end_date: "{yesterday_str}"
- No date mentioned -> start_date: null, end_date: null (all tasks)

Task filters:
- completed: true (for completed tasks), false (for pending/incomplete tasks), null (all tasks)
- importance: true (important only), false (not important), null (all tasks)
- list: "Personal"/"Work"/"Study"/null (null = all lists)
- priority: "low"/"medium"/"high"/null (null = all priorities)

IMPORTANT RULES:
1. For "overdue tasks" questions: set end_date to yesterday ({yesterday_str}) and completed to false
2. For "tomorrow" questions: set BOTH start_date AND end_date to {tomorrow_str}
3. For "pending" or "incomplete" tasks: set completed to false
4. For "completed" tasks: set completed to true
5. If no completion status mentioned: set completed to null (shows all tasks)

Respond with ONLY a JSON object:
{{
    "query_type": "tasks" or "timer_stats" or "quizzes",
    "date_range": {{
        "start_date": "YYYY-MM-DD or null",
        "end_date": "YYYY-MM-DD or null"
    }},
    "filters": {{
        "completed": true/false/null,
        "importance": true/false/null,
        "list": "Personal"/"Work"/"Study"/null,
        "priority": "low"/"medium"/"high"/null
    }},
    "reasoning": "brief explanation of your analysis"
}}

Examples:

User: "What are the tasks I have to do tomorrow?"
Response:
{{
    "query_type": "tasks",
    "date_range": {{
        "start_date": "{tomorrow_str}",
        "end_date": "{tomorrow_str}"
    }},
    "filters": {{
        "completed": null,
        "importance": null,
        "list": null,
        "priority": null
    }},
    "reasoning": "User wants all tasks due tomorrow"
}}

User: "What are the overdue tasks I had?"
Response:
{{
    "query_type": "tasks",
    "date_range": {{
        "start_date": null,
        "end_date": "{yesterday_str}"
    }},
    "filters": {{
        "completed": false,
        "importance": null,
        "list": null,
        "priority": null
    }},
    "reasoning": "User wants incomplete tasks with due dates before today"
}}

User: "Show me my pending tasks"
Response:
{{
    "query_type": "tasks",
    "date_range": {{
        "start_date": null,
        "end_date": null
    }},
    "filters": {{
        "completed": false,
        "importance": null,
        "list": null,
        "priority": null
    }},
    "reasoning": "User wants all incomplete tasks"
}}

User: "How many pomodoros did I complete?"
Response:
{{
    "query_type": "timer_stats",
    "date_range": {{
        "start_date": null,
        "end_date": null
    }},
    "filters": {{}},
    "reasoning": "User asking for pomodoro statistics"
}}

User message: {state['user_message']}"""
        
        try:
            # Step 1: Analyze query
            messages = [HumanMessage(content=analysis_prompt)]
            analysis_response = self.llm.invoke(messages)
            
            # Try to extract JSON from the response
            response_content = analysis_response.content.strip()
            
            # Remove markdown code blocks if present
            if response_content.startswith("```"):
                response_content = response_content.split("```")[1]
                if response_content.startswith("json"):
                    response_content = response_content[4:]
                response_content = response_content.strip()
            
            query_params = json.loads(response_content)
            
            logger.info(f"Query analysis: {json.dumps(query_params, indent=2)}")
            
            # Step 2: Execute database query based on query_type
            retrieved_data = None
            query_type = query_params.get("query_type")
            
            if query_type == "tasks":
                # Extract filter parameters
                date_range = query_params.get("date_range", {})
                filters = query_params.get("filters", {})
                
                start_date = date_range.get("start_date")
                end_date = date_range.get("end_date")
                completed = filters.get("completed")
                importance = filters.get("importance")
                task_list = filters.get("list")
                priority = filters.get("priority")
                
                # Log the query parameters
                logger.info(f"Querying tasks with params - start_date: {start_date}, end_date: {end_date}, "
                           f"completed: {completed}, importance: {importance}, list: {task_list}, priority: {priority}")
                
                retrieved_data = firestore_service.query_tasks(
                    uid=state["user_id"],
                    start_date=start_date,
                    end_date=end_date,
                    completed=completed,
                    importance=importance,
                    task_list=task_list,
                    priority=priority
                )
                
                logger.info(f"Retrieved {len(retrieved_data)} tasks from Firestore")
                
                # Log sample task if available for debugging
                if retrieved_data and len(retrieved_data) > 0:
                    logger.info(f"Sample task: {json.dumps(retrieved_data[0], indent=2, default=str)}")
                
            elif query_type == "timer_stats":
                retrieved_data = firestore_service.get_pomodoro_stats(state["user_id"])
                logger.info(f"Retrieved pomodoro stats: {retrieved_data}")
                
            elif query_type == "quizzes":
                retrieved_data = firestore_service.get_quiz_results(state["user_id"])
                logger.info(f"Retrieved {len(retrieved_data)} quiz results")
            
            # Step 3: Generate natural language response
            answer_prompt = f"""You are a helpful AI assistant for a student task management system.
Current date: {current_date_str}

The user asked: "{state['user_message']}"

Retrieved data from database:
{json.dumps(retrieved_data, indent=2, default=str)}

Generate a friendly, conversational response that answers the user's question based on the retrieved data.

Guidelines:
- Be natural and conversational
- If data is found, present it clearly with bullet points or numbering
- Show task descriptions, due dates, priority, and completion status
- If NO data found (empty list or no results), acknowledge it briefly but positively
- For pomodoro stats, convert presentTime (seconds) to hours/minutes if needed
- Keep response concise but informative (3-8 sentences)
- DO NOT make up information - only use the retrieved data

Response:"""
            
            messages = [HumanMessage(content=answer_prompt)]
            answer_response = self.llm.invoke(messages)
            
            state["response"] = answer_response.content
            logger.info("Knowledge retriever response generated")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response: {e}")
            logger.error(f"Raw LLM response: {analysis_response.content if 'analysis_response' in locals() else 'N/A'}")
            state["response"] = "I'd be happy to help you find that information. Could you rephrase your question?"
            
        except Exception as e:
            logger.error(f"Error in knowledge retriever node: {e}", exc_info=True)
            state["response"] = "I'm having trouble retrieving that information right now. Please try again."
            state["error"] = str(e)
        
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
        
        # Get current date in Sri Lanka timezone
        sri_lanka_tz = pytz.timezone('Asia/Colombo')
        current_date = datetime.now(sri_lanka_tz).strftime("%Y-%m-%d")
        
        # Check if there are pending tasks from previous interactions
        pending_tasks_context = ""
        if state.get("pending_tasks"):
            pending_tasks_context = "\n\n**IMPORTANT - ACTIVE PENDING TASKS:**\n"
            pending_tasks_context += "You have the following incomplete tasks that need missing information:\n\n"
            for idx, pending in enumerate(state["pending_tasks"], 1):
                pending_tasks_context += f"{idx}. Task: {pending.get('description', 'Unknown')}\n"
                if pending.get('list'):
                    pending_tasks_context += f"   - List: {pending['list']}\n"
                if pending.get('dueDate'):
                    pending_tasks_context += f"   - Due Date: {pending['dueDate']}\n"
                if pending.get('priority'):
                    pending_tasks_context += f"   - Priority: {pending['priority']}\n"
                pending_tasks_context += f"   - Missing: {', '.join(pending.get('missingFields', []))}\n\n"
            
            pending_tasks_context += "**YOUR IMMEDIATE GOAL**: If the user's current message provides the missing information for any of these pending tasks, complete them by moving them to the 'tasks' array with all required fields filled. DO NOT ask for information that was already provided in these pending tasks!\n"
        
        system_prompt = f"""You are an AI task management assistant that helps users organize their work.

Today's date (Sri Lanka time): {current_date}
{pending_tasks_context}

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
- **IMPORTANT**: "dueDate" - if user mentions ANY time reference (today, tomorrow, next Friday, in 3 days, etc.), include it in dueDate:
  - Extract date references like: "today", "tomorrow", "next Friday", "November 29", "in 3 days", etc.
  - DO NOT ask "When is next Friday?" if user already said "next Friday" - that IS the date information!
  - Put the date reference in dueDate field (e.g., "next Friday", "tomorrow", "November 29")
  - The system will automatically convert it to YYYY-MM-DD format
  - ONLY mark dueDate as missing if user provides NO time reference at all
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

User: "It's next Friday" (Context: pending task about math exam that was missing dueDate)
Response:
{{
    "response": "Perfect! I've prepared a study task for your math exam on next Friday. Please confirm to add it to your list.",
    "tasks": [
        {{
            "description": "Study for math exam",
            "list": "Study",
            "dueDate": "next Friday",
            "subTasks": null,
            "priority": "high",
            "importance": false
        }}
    ],
    "pendingTasks": [],
    "needsFollowUp": false,
    "followUpQuestion": null
}}

User: "November 29" (Context: pending task about project report that was missing dueDate)
Response:
{{
    "response": "Got it! I've prepared a task to complete your project report by November 29. Please confirm to add it to your list.",
    "tasks": [
        {{
            "description": "Complete project report",
            "list": "Work",
            "dueDate": "November 29",
            "subTasks": null,
            "priority": "medium",
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

User: "I want to complete my intern report by next Friday"
Response:
{{
    "response": "I've prepared a task to complete your intern report by next Friday. Please confirm to add it to your list.",
    "tasks": [
        {{
            "description": "Complete intern report",
            "list": "Work",
            "dueDate": "next Friday",
            "subTasks": null,
            "priority": "medium",
            "importance": false
        }}
    ],
    "pendingTasks": [],
    "needsFollowUp": false,
    "followUpQuestion": null
}}

User: "Prepare for the meeting in 3 days"
Response:
{{
    "response": "I've prepared a task to prepare for the meeting in 3 days. Please confirm to add it to your list.",
    "tasks": [
        {{
            "description": "Prepare for the meeting",
            "list": "Work",
            "dueDate": "in 3 days",
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
- **HANDLING PENDING TASKS**: If there are active pending tasks (shown above), check if the user's message provides missing information:
  - If user provides a date/time → complete the pending task by filling dueDate and moving it to "tasks" array
  - If user provides task description → complete the pending task by filling description and moving it to "tasks" array
  - Keep all other fields (list, priority, etc.) from the pending task
  - Clear the pending task from "pendingTasks" array once completed
  - DO NOT ask for information that's already in the pending task object!
- NEVER add incomplete tasks to "tasks" array
- ALWAYS use "pendingTasks" for missing information
- **CRITICAL**: If user mentions ANY date reference (today, tomorrow, next Friday, in 3 days, November 29, etc.), that IS valid date information!
- **CRITICAL**: Extract the date phrase exactly as user said it and put it in dueDate field (e.g., "next Friday", "tomorrow", "in 3 days")
- **DO NOT** ask "When is next Friday?" - if user said "next Friday", that's already date information! Just extract it!
- **DO NOT** ask for clarification on dates like "tomorrow", "next week", "in 5 days" - these are valid date references!
- Only mark dueDate as missing/null if user provides absolutely NO date or time reference at all
- The system automatically converts natural language dates to YYYY-MM-DD format
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
        conversation_history: List[Dict[str, str]] = None,
        pending_tasks: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a user message through the agent workflow
        
        Args:
            user_message: The user's input
            user_id: User ID from Firestore
            session_id: Optional session ID for continuity
            conversation_history: Previous conversation messages
            pending_tasks: Pending tasks from previous interaction that need completion
            
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
                "pending_tasks": pending_tasks or [],  # Pass pending tasks from frontend
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
