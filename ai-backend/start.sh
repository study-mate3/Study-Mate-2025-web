#!/bin/bash

# Start script for StudyMate AI Backend
# Router-First Agentic Architecture with LangGraph

echo "🚀 Starting StudyMate AI Backend..."
echo "Architecture: Router-First with LangGraph"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Virtual environment not found. Running setup..."
    ./setup.sh
    if [ $? -ne 0 ]; then
        echo "❌ Setup failed. Please run ./setup.sh manually"
        exit 1
    fi
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  Please edit .env file and add:"
    echo "   1. GROQ_API_KEY (get from: https://console.groq.com/)"
    echo "   2. FIREBASE_SERVICE_ACCOUNT_KEY_PATH (path to your Firebase service account JSON)"
    echo ""
    echo "Then run ./start.sh again"
    exit 1
fi

# Check if GROQ_API_KEY is set
if ! grep -q "GROQ_API_KEY=gsk_" .env; then
    echo "⚠️  GROQ_API_KEY not configured in .env file"
    echo "   Get your API key from: https://console.groq.com/"
    echo ""
fi

# Check if FIREBASE_SERVICE_ACCOUNT_KEY_PATH is set
if grep -q "FIREBASE_SERVICE_ACCOUNT_KEY_PATH=path/to/" .env; then
    echo "⚠️  FIREBASE_SERVICE_ACCOUNT_KEY_PATH not configured in .env file"
    echo "   Download your Firebase service account JSON and update the path"
    echo ""
fi

# Start the server
echo "🌟 Starting FastAPI server..."
echo "📡 Server will be available at: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python main.py
