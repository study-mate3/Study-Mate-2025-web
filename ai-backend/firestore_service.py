"""
Firestore Service Module
Handles all Firebase/Firestore database operations
"""

import os
import json
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from models import Task, User, UserRole, SubTask

logger = logging.getLogger(__name__)

class FirestoreService:
    """Service class for Firestore operations"""
    
    def __init__(self):
        # Check if already initialized
        if not firebase_admin._apps:
            try:
                # Try to get credentials from Environment Variable (Best for Render/Production)
                firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
                
                if firebase_creds_json:
                    cred_dict = json.loads(firebase_creds_json)
                    cred = credentials.Certificate(cred_dict)
                else:
                    # Fallback to local file (Best for Local Development)
                    cred = credentials.Certificate("serviceAccountKey.json")
                
                firebase_admin.initialize_app(cred)
            except Exception as e:
                print(f"Failed to initialize Firebase: {e}")
                
        self.db = firestore.client()
    
    def get_user(self, uid: str) -> Optional[Dict[str, Any]]:
        """Get user document by UID"""
        try:
            if not self.db:
                raise Exception("Firestore not initialized")
            
            doc_ref = self.db.collection('users').document(uid)
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict()
            return None
            
        except Exception as e:
            logger.error(f"Error getting user {uid}: {e}")
            return None
    
    def get_user_role(self, uid: str) -> UserRole:
        """Get user role, defaults to STUDENT"""
        try:
            user = self.get_user(uid)
            if user and 'role' in user:
                return UserRole(user['role'])
            return UserRole.STUDENT
        except Exception as e:
            logger.error(f"Error getting user role: {e}")
            return UserRole.STUDENT
    
    def add_task(self, uid: str, task_data: Dict[str, Any]) -> bool:
        """
        Add a task to user's tasks sub-collection
        
        Args:
            uid: User ID
            task_data: Task data dictionary
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if not self.db:
                raise Exception("Firestore not initialized")
            
            # Prepare task data
            task_to_add = {
                "description": task_data.get("description"),
                "dueDate": task_data.get("dueDate"),
                "priority": task_data.get("priority", "medium"),
                "completed": task_data.get("completed", False),
                "list": task_data.get("list", "Personal"),
                "importance": task_data.get("importance", False),
                "createdDate": datetime.now().isoformat()
            }
            
            # Handle subtasks
            if task_data.get("subTasks"):
                if isinstance(task_data["subTasks"], list):
                    # Convert list of strings to SubTask objects
                    task_to_add["subTasks"] = [
                        {"description": st, "completed": False} 
                        for st in task_data["subTasks"]
                    ]
                elif isinstance(task_data["subTasks"], str):
                    # Single string, convert to list
                    task_to_add["subTasks"] = [
                        {"description": task_data["subTasks"], "completed": False}
                    ]
            else:
                task_to_add["subTasks"] = None
            
            # Add to Firestore
            task_ref = self.db.collection('users').document(uid).collection('tasks').document()
            task_ref.set(task_to_add)
            
            logger.info(f"Task added successfully for user {uid}: {task_to_add['description']}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding task for user {uid}: {e}")
            return False
    
    def get_user_tasks(self, uid: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get user's tasks
        
        Args:
            uid: User ID
            limit: Maximum number of tasks to retrieve
            
        Returns:
            List of task dictionaries
        """
        try:
            if not self.db:
                raise Exception("Firestore not initialized")
            
            tasks_ref = self.db.collection('users').document(uid).collection('tasks')
            query = tasks_ref.order_by('createdDate', direction=firestore.Query.DESCENDING).limit(limit)
            
            tasks = []
            for doc in query.stream():
                task_data = doc.to_dict()
                task_data['id'] = doc.id
                tasks.append(task_data)
            
            logger.info(f"Retrieved {len(tasks)} tasks for user {uid}")
            return tasks
            
        except Exception as e:
            logger.error(f"Error getting tasks for user {uid}: {e}")
            return []
    
    def query_tasks(
        self, 
        uid: str, 
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        completed: Optional[bool] = None,
        importance: Optional[bool] = None,
        task_list: Optional[str] = None,
        priority: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Query user's tasks with filtering and sorting.
        Since Firestore has limitations on compound queries without specific indexes,
        we fetch tasks and filter in Python.
        
        Args:
            uid: User ID
            start_date: Filter tasks with dueDate >= start_date (YYYY-MM-DD)
            end_date: Filter tasks with dueDate <= end_date (YYYY-MM-DD)
            completed: Filter by completion status (True/False/None for all)
            importance: Filter by importance status (True/False/None for all)
            task_list: Filter by list name ("Personal", "Work", "Study", or None for all)
            priority: Filter by priority ("low", "medium", "high", or None for all)
            limit: Maximum number of tasks to fetch initially
            
        Returns:
            List of task dictionaries sorted by dueDate (ascending)
        """
        try:
            if not self.db:
                raise Exception("Firestore not initialized")
            
            logger.info(f"Querying tasks for user {uid} with filters: start_date={start_date}, end_date={end_date}, "
                       f"completed={completed}, importance={importance}, list={task_list}, priority={priority}")
            
            # Fetch all user tasks (or up to limit)
            tasks_ref = self.db.collection('users').document(uid).collection('tasks')
            query = tasks_ref.limit(limit)
            
            tasks = []
            for doc in query.stream():
                task_data = doc.to_dict()
                task_data['id'] = doc.id
                tasks.append(task_data)
            
            logger.info(f"Fetched {len(tasks)} total tasks from Firestore")
            
            # Filter in Python
            filtered_tasks = []
            for task in tasks:
                should_include = True
                
                # Date range filtering
                if start_date and task.get('dueDate'):
                    if task['dueDate'] < start_date:
                        should_include = False
                        logger.debug(f"Filtered out task (dueDate {task['dueDate']} < start_date {start_date}): {task.get('description', 'No description')}")
                
                if should_include and end_date and task.get('dueDate'):
                    if task['dueDate'] > end_date:
                        should_include = False
                        logger.debug(f"Filtered out task (dueDate {task['dueDate']} > end_date {end_date}): {task.get('description', 'No description')}")
                
                # For date range queries, skip tasks without due dates
                if should_include and (start_date or end_date) and not task.get('dueDate'):
                    should_include = False
                    logger.debug(f"Filtered out task (no dueDate for date range query): {task.get('description', 'No description')}")
                
                # Completion status filtering
                if should_include and completed is not None:
                    if task.get('completed', False) != completed:
                        should_include = False
                        logger.debug(f"Filtered out task (completed={task.get('completed', False)} != {completed}): {task.get('description', 'No description')}")
                
                # Importance filtering
                if should_include and importance is not None:
                    if task.get('importance', False) != importance:
                        should_include = False
                        logger.debug(f"Filtered out task (importance={task.get('importance', False)} != {importance}): {task.get('description', 'No description')}")
                
                # List filtering
                if should_include and task_list is not None:
                    if task.get('list', 'Personal') != task_list:
                        should_include = False
                        logger.debug(f"Filtered out task (list={task.get('list', 'Personal')} != {task_list}): {task.get('description', 'No description')}")
                
                # Priority filtering
                if should_include and priority is not None:
                    if task.get('priority', 'medium') != priority:
                        should_include = False
                        logger.debug(f"Filtered out task (priority={task.get('priority', 'medium')} != {priority}): {task.get('description', 'No description')}")
                
                if should_include:
                    filtered_tasks.append(task)
            
            # Sort by dueDate (ascending), tasks without dueDate go to the end
            filtered_tasks.sort(key=lambda x: x.get('dueDate') or '9999-12-31')
            
            logger.info(f"Query returned {len(filtered_tasks)} filtered tasks for user {uid}")
            
            # Log a summary of returned tasks
            if filtered_tasks:
                logger.info(f"Sample tasks: {[{'desc': t.get('description', 'No desc')[:30], 'due': t.get('dueDate', 'No date'), 'completed': t.get('completed', False)} for t in filtered_tasks[:3]]}")
            
            return filtered_tasks
            
        except Exception as e:
            logger.error(f"Error querying tasks for user {uid}: {e}", exc_info=True)
            return []
    
    def get_pomodoro_stats(self, uid: str) -> Dict[str, Any]:
        """
        Get user's pomodoro statistics
        
        Args:
            uid: User ID
            
        Returns:
            Dictionary with pomodoro stats
        """
        try:
            user = self.get_user(uid)
            if user:
                return {
                    "completedPomodoros": user.get("completedPomodoros", 0),
                    "presentTime": user.get("presentTime", 0)
                }
            return {"completedPomodoros": 0, "presentTime": 0}
            
        except Exception as e:
            logger.error(f"Error getting pomodoro stats for user {uid}: {e}")
            return {"completedPomodoros": 0, "presentTime": 0}
    
    def get_quiz_results(self, uid: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get user's quiz results from paper_attempts sub-collection
        
        Args:
            uid: User ID
            limit: Maximum number of results to retrieve
            
        Returns:
            List of paper attempt dictionaries sorted by createdAt (if available)
        """
        try:
            if not self.db:
                raise Exception("Firestore not initialized")
            
            attempts_ref = self.db.collection('users').document(uid).collection('paper_attempts')
            
            # Try to order by createdAt (the actual field name in the database)
            # Fall back to timestamp, and finally to unordered fetch
            try:
                # First try: order by createdAt (actual field in database)
                query = attempts_ref.order_by('createdAt', direction=firestore.Query.DESCENDING).limit(limit)
                results = []
                for doc in query.stream():
                    attempt_data = doc.to_dict()
                    attempt_data['id'] = doc.id
                    results.append(attempt_data)
                logger.info(f"Retrieved {len(results)} quiz results (ordered by createdAt) for user {uid}")
            except Exception as order_error:
                logger.warning(f"Could not order by createdAt, trying timestamp: {order_error}")
                try:
                    # Second try: order by timestamp (for future compatibility)
                    query = attempts_ref.order_by('timestamp', direction=firestore.Query.DESCENDING).limit(limit)
                    results = []
                    for doc in query.stream():
                        attempt_data = doc.to_dict()
                        attempt_data['id'] = doc.id
                        results.append(attempt_data)
                    logger.info(f"Retrieved {len(results)} quiz results (ordered by timestamp) for user {uid}")
                except Exception as timestamp_error:
                    # Final fallback: fetch without ordering
                    logger.warning(f"Could not order by timestamp either, fetching unordered: {timestamp_error}")
                    query = attempts_ref.limit(limit)
                    results = []
                    for doc in query.stream():
                        attempt_data = doc.to_dict()
                        attempt_data['id'] = doc.id
                        results.append(attempt_data)
                    
                    # Sort in Python by createdAt or timestamp if available
                    results.sort(key=lambda x: x.get('createdAt') or x.get('timestamp') or '', reverse=True)
                    logger.info(f"Retrieved {len(results)} quiz results (unordered fetch, sorted in Python) for user {uid}")
            
            # Log sample data for debugging if results exist
            if results:
                logger.info(f"Sample quiz result: {json.dumps(results[0], indent=2, default=str)}")
            else:
                logger.info(f"No quiz results found for user {uid}")
            
            return results
            
        except Exception as e:
            logger.error(f"Error getting quiz results for user {uid}: {e}", exc_info=True)
            return []
    
    def update_task(self, uid: str, task_id: str, updates: Dict[str, Any]) -> bool:
        """
        Update a task
        
        Args:
            uid: User ID
            task_id: Task document ID
            updates: Dictionary of fields to update
            
        Returns:
            bool: True if successful
        """
        try:
            if not self.db:
                raise Exception("Firestore not initialized")
            
            task_ref = self.db.collection('users').document(uid).collection('tasks').document(task_id)
            task_ref.update(updates)
            
            logger.info(f"Task {task_id} updated for user {uid}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating task {task_id} for user {uid}: {e}")
            return False
    
    def delete_task(self, uid: str, task_id: str) -> bool:
        """
        Delete a task
        
        Args:
            uid: User ID
            task_id: Task document ID
            
        Returns:
            bool: True if successful
        """
        try:
            if not self.db:
                raise Exception("Firestore not initialized")
            
            task_ref = self.db.collection('users').document(uid).collection('tasks').document(task_id)
            task_ref.delete()
            
            logger.info(f"Task {task_id} deleted for user {uid}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting task {task_id} for user {uid}: {e}")
            return False

# Global instance
firestore_service = FirestoreService()
