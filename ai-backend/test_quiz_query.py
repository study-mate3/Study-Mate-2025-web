"""
Test script to verify quiz results retrieval functionality
"""

import os
import sys
import json
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import services
from firestore_service import firestore_service
from agent import StudyMateAgent

def test_quiz_retrieval(user_id: str):
    """Test direct quiz results retrieval from Firestore"""
    print("\n" + "="*80)
    print("TEST 1: Direct Firestore Quiz Retrieval")
    print("="*80)
    
    try:
        quiz_results = firestore_service.get_quiz_results(user_id)
        
        print(f"\n✅ Retrieved {len(quiz_results)} quiz results")
        
        if quiz_results:
            print("\nSample Quiz Results:")
            print("-" * 80)
            for i, quiz in enumerate(quiz_results[:3], 1):  # Show first 3 results
                print(f"\nQuiz {i}:")
                print(f"  Paper ID: {quiz.get('paperId', 'N/A')}")
                print(f"  Subject: {quiz.get('subject', 'N/A')}")
                print(f"  Category: {quiz.get('category', 'N/A')}")
                print(f"  Year: {quiz.get('year', 'N/A')}")
                print(f"  Score: {quiz.get('score', 0)}/{quiz.get('totalQuestions', 0)}")
                # Handle percentage as string or float
                percentage = quiz.get('percentage', 0)
                if isinstance(percentage, str):
                    print(f"  Percentage: {percentage}%")
                else:
                    print(f"  Percentage: {percentage:.2f}%")
                print(f"  Created At: {quiz.get('createdAt', 'Not recorded')}")
                print(f"  Timestamp: {quiz.get('timestamp', 'Not recorded')}")
        else:
            print("\n⚠️ No quiz results found for this user")
            
    except Exception as e:
        print(f"\n❌ Error retrieving quiz results: {e}")
        import traceback
        traceback.print_exc()

def test_agent_quiz_query(user_id: str):
    """Test quiz query through the agent"""
    print("\n" + "="*80)
    print("TEST 2: Agent Quiz Query Processing")
    print("="*80)
    
    try:
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            print("❌ GROQ_API_KEY not found in environment variables")
            return
        
        agent = StudyMateAgent(groq_api_key)
        
        test_queries = [
            "Show me my quiz results",
            "How did I do on my quizzes?",
            "What are my quiz scores?",
            "Show my paper attempts"
        ]
        
        for query in test_queries:
            print(f"\n{'='*80}")
            print(f"Query: {query}")
            print(f"{'='*80}")
            
            result = agent.process_message(
                user_message=query,
                user_id=user_id,
                session_id="test_session_001",
                conversation_history=[],
                pending_tasks=[]
            )
            
            print(f"\nIntent Type: {result.get('intentType', 'unknown')}")
            print(f"\nAgent Response:")
            print("-" * 80)
            print(result.get('response', 'No response'))
            print("-" * 80)
            
    except Exception as e:
        print(f"\n❌ Error in agent quiz query: {e}")
        import traceback
        traceback.print_exc()

def main():
    """Main test function"""
    print("\n" + "="*80)
    print("Quiz Results Retrieval Test Suite")
    print("="*80)
    
    # Get user ID from command line or use default
    if len(sys.argv) > 1:
        user_id = sys.argv[1]
    else:
        # Use a test user ID - replace with actual user ID from your Firestore
        user_id = input("\nEnter a user ID to test (or press Enter for default): ").strip()
        if not user_id:
            print("\n⚠️ No user ID provided. Please run with: python test_quiz_query.py <user_id>")
            return
    
    print(f"\n📋 Testing with User ID: {user_id}")
    
    # Run tests
    test_quiz_retrieval(user_id)
    test_agent_quiz_query(user_id)
    
    print("\n" + "="*80)
    print("Test Suite Complete")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()
