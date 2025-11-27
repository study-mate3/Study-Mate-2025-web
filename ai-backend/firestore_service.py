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
        """Initialize Firebase Admin SDK"""
        try:
            # Check if already initialized
            if not firebase_admin._apps:
                # Load credentials from environment or service account file
                cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH") or os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
                
                if cred_path and os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                    logger.info(f"Firebase initialized with service account file: {cred_path}")
                else:
                    # Try to initialize with default credentials
                    firebase_admin.initialize_app()
                    logger.info("Firebase initialized with default credentials")
            
            self.db = firestore.client()
            logger.info("Firestore client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firestore: {e}")
            self.db = None
    
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
    
    def get_quiz_results(self, uid: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get user's quiz results from paper_attempts sub-collection
        
        Args:
            uid: User ID
            limit: Maximum number of results to retrieve
            
        Returns:
            List of paper attempt dictionaries
        """
        try:
            if not self.db:
                raise Exception("Firestore not initialized")
            
            attempts_ref = self.db.collection('users').document(uid).collection('paper_attempts')
            query = attempts_ref.order_by('timestamp', direction=firestore.Query.DESCENDING).limit(limit)
            
            results = []
            for doc in query.stream():
                attempt_data = doc.to_dict()
                attempt_data['id'] = doc.id
                results.append(attempt_data)
            
            logger.info(f"Retrieved {len(results)} quiz results for user {uid}")
            return results
            
        except Exception as e:
            logger.error(f"Error getting quiz results for user {uid}: {e}")
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
