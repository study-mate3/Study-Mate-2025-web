#!/bin/bash

# Start script for AI Backend

echo "Starting StudyMate AI Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please edit .env file and add your GROQ_API_KEY"
    echo "You can get it from: https://console.groq.com/"
    exit 1
fi

# Start the server
echo "Starting FastAPI server..."
python main.py
