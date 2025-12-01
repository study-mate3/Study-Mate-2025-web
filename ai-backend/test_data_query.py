"""
Test script for data_query intent handling
"""

import os
from dotenv import load_dotenv
from agent import StudyMateAgent
from firestore_service import firestore_service

# Load environment variables
load_dotenv()

def test_firestore_connection():
    """Test if we can connect to Firestore and fetch tasks"""
    print("=" * 60)
    print("Testing Firestore Connection")
    print("=" * 60)
    
    # Replace with a real user ID from your database
    test_user_id = input("Enter a test user ID: ").strip()
    
    if not test_user_id:
        print("No user ID provided. Exiting.")
        return
    
    # Test fetching all tasks
    print(f"\nFetching all tasks for user: {test_user_id}")
    all_tasks = firestore_service.get_user_tasks(test_user_id, limit=50)
    print(f"Found {len(all_tasks)} tasks")
    
    if all_tasks:
        print("\nSample tasks:")
        for i, task in enumerate(all_tasks[:3], 1):
            print(f"{i}. {task.get('description', 'No description')}")
            print(f"   Due: {task.get('dueDate', 'No date')}")
            print(f"   Completed: {task.get('completed', False)}")
            print(f"   Priority: {task.get('priority', 'medium')}")
            print(f"   List: {task.get('list', 'Personal')}")
    else:
        print("No tasks found for this user.")
        return
    
    # Test query_tasks with different filters
    print("\n" + "=" * 60)
    print("Testing query_tasks with filters")
    print("=" * 60)
    
    # Test 1: Get incomplete tasks
    print("\n1. Testing incomplete tasks:")
    incomplete = firestore_service.query_tasks(test_user_id, completed=False)
    print(f"   Found {len(incomplete)} incomplete tasks")
    
    # Test 2: Get tasks for tomorrow
    from datetime import datetime, timedelta
    import pytz
    sri_lanka_tz = pytz.timezone('Asia/Colombo')
    tomorrow = datetime.now(sri_lanka_tz) + timedelta(days=1)
    tomorrow_str = tomorrow.strftime("%Y-%m-%d")
    
    print(f"\n2. Testing tasks for tomorrow ({tomorrow_str}):")
    tomorrow_tasks = firestore_service.query_tasks(
        test_user_id, 
        start_date=tomorrow_str,
        end_date=tomorrow_str
    )
    print(f"   Found {len(tomorrow_tasks)} tasks")
    for task in tomorrow_tasks:
        print(f"   - {task.get('description', 'No desc')}: {task.get('dueDate', 'No date')}")
    
    # Test 3: Get overdue tasks
    yesterday = datetime.now(sri_lanka_tz) - timedelta(days=1)
    yesterday_str = yesterday.strftime("%Y-%m-%d")
    
    print(f"\n3. Testing overdue tasks (before {yesterday_str}):")
    overdue = firestore_service.query_tasks(
        test_user_id,
        end_date=yesterday_str,
        completed=False
    )
    print(f"   Found {len(overdue)} overdue tasks")
    for task in overdue:
        print(f"   - {task.get('description', 'No desc')}: {task.get('dueDate', 'No date')}")

def test_agent_data_query():
    """Test the agent's data_query intent handling"""
    print("\n" + "=" * 60)
    print("Testing Agent Data Query")
    print("=" * 60)
    
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        print("GROQ_API_KEY not found in environment variables")
        return
    
    agent = StudyMateAgent(groq_api_key)
    
    test_user_id = input("\nEnter the same test user ID: ").strip()
    
    if not test_user_id:
        print("No user ID provided. Exiting.")
        return
    
    test_queries = [
        "What are the tasks I have to do tomorrow?",
        "What are the overdue tasks I had?",
        "Show me my pending tasks",
        "What tasks do I have this week?"
    ]
    
    for query in test_queries:
        print(f"\n{'='*60}")
        print(f"Query: {query}")
        print('='*60)
        
        result = agent.process_message(
            user_message=query,
            user_id=test_user_id,
            session_id="test-session"
        )
        
        print(f"Intent: {result.get('intent', 'unknown')}")
        print(f"\nResponse:\n{result.get('response', 'No response')}")
        print()

if __name__ == "__main__":
    print("StudyMate Data Query Test Script")
    print("=" * 60)
    
    # First test Firestore connection
    test_firestore_connection()
    
    # Then test the agent
    proceed = input("\nProceed to test agent? (y/n): ").strip().lower()
    if proceed == 'y':
        test_agent_data_query()
    
    print("\nTest complete!")
