import os
import json
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage
from models import TaskData
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TaskExtractor:
    def __init__(self, groq_api_key: str):
        self.llm = ChatGroq(
            groq_api_key=groq_api_key,
            model_name="llama-3.1-8b-instant",
            temperature=0.1,
        )
        
    def _create_system_prompt(self) -> str:
        return """You are an AI task assistant that helps users organize their work and plans into structured tasks.

Your job is to:
1. Understand what the user wants to accomplish
2. Extract actionable tasks from their message
3. Provide helpful responses
4. Convert tasks into proper JSON format
5. Ask follow-up questions when important details are missing

TASK EXTRACTION RULES:
- Only extract clear, actionable tasks
- Each task should have a clear description
- Assign appropriate list category: "Personal", "Work", or "Study"
- Set priority based on urgency/importance: "low", "medium", or "high"
- Extract due dates if mentioned (format: YYYY-MM-DD)
- Include sub-tasks if mentioned
- DO NOT create tasks for vague statements like "I'm tired" or "having a good day"

FOLLOW-UP QUESTIONS:
- If user mentions tasks without task descriptions, due dates, ask to mention them and when they'd like to complete them
- If tasks seem urgent but no deadline mentioned, suggest asking for timing
- Keep follow-up questions natural and conversational

RESPONSE FORMAT:
Always respond with a JSON object containing:
{
    "response": "Your conversational response to the user",
    "tasks": [
        {
            "description": "Task description",
            "list": "Personal|Work|Study",
            "dueDate": "YYYY-MM-DD or null",
            "subTasks": "Sub-task details or null",
            "priority": "low|medium|high",
            "completed": false
        }
    ],
    "needsFollowUp": boolean,
    "followUpQuestion": "Optional follow-up question if needsFollowUp is true"
}

EXAMPLES:

User: "I need to study for my math exam next week and also buy groceries"
Response:
{
    "response": "I've identified two tasks for you! I'll help you create a study task for your math exam and a personal task for grocery shopping.",
    "tasks": [
        {
            "description": "Study for math exam",
            "list": "Study",
            "dueDate": "2024-11-01",
            "subTasks": "Review chapters, practice problems, create study notes",
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
    ],
    "needsFollowUp": true,
    "followUpQuestion": "When would you like to go grocery shopping? Today, tomorrow, or do you have a specific day in mind?"
}

User: "How are you doing today?"
Response:
{
    "response": "I'm doing great, thank you for asking! I'm here to help you organize your tasks and plans. Is there anything specific you'd like to accomplish today?",
    "tasks": [],
    "needsFollowUp": false,
    "followUpQuestion": null
}

Remember: Be helpful, conversational, and ask meaningful follow-up questions when important details like due dates are missing. This helps users create more complete and actionable tasks."""

    def extract_tasks_from_message(self, user_message: str, user_id: str) -> Dict[str, Any]:
        """Extract tasks from user message using Groq/Llama model."""
        try:
            system_prompt = self._create_system_prompt()
            
            # Add current date context
            current_date = datetime.now().strftime("%Y-%m-%d")
            context_message = f"Today's date is {current_date}. User message: {user_message}"
            
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
                
                if "needsFollowUp" not in parsed_response:
                    parsed_response["needsFollowUp"] = False
                    
                if "followUpQuestion" not in parsed_response:
                    parsed_response["followUpQuestion"] = None
                
                # Validate and clean tasks
                valid_tasks = []
                for task in parsed_response.get("tasks", []):
                    try:
                        # Ensure required fields
                        if "description" not in task or not task["description"]:
                            continue
                            
                        # Clean and validate task data
                        task_data = {
                            "description": str(task["description"]).strip(),
                            "list": task.get("list", "Personal"),
                            "dueDate": task.get("dueDate"),
                            "subTasks": task.get("subTasks"),
                            "priority": task.get("priority", "low"),
                            "completed": False
                        }
                        
                        # Validate list category
                        if task_data["list"] not in ["Personal", "Work", "Study"]:
                            task_data["list"] = "Personal"
                            
                        # Validate priority
                        if task_data["priority"] not in ["low", "medium", "high"]:
                            task_data["priority"] = "low"
                            
                        # Validate date format
                        if task_data["dueDate"]:
                            try:
                                datetime.strptime(task_data["dueDate"], "%Y-%m-%d")
                            except ValueError:
                                task_data["dueDate"] = None
                        
                        valid_tasks.append(task_data)
                        
                    except Exception as e:
                        logger.error(f"Error validating task: {e}")
                        continue
                
                parsed_response["tasks"] = valid_tasks
                return parsed_response
                
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error: {e}")
                # Try to extract JSON from response if it's wrapped in other text
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    try:
                        parsed_response = json.loads(json_match.group())
                        return parsed_response
                    except json.JSONDecodeError:
                        pass
                        
                # Fallback response
                return {
                    "response": "I understand your message, but I'm having trouble processing it right now. Could you please rephrase what you'd like to accomplish?",
                    "tasks": []
                }
                
        except Exception as e:
            logger.error(f"Error in task extraction: {e}")
            return {
                "response": "I'm sorry, I'm having trouble processing your request right now. Please try again.",
                "tasks": []
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
