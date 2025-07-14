#!/bin/bash

echo "🎨 Starting Course Management System Frontend"
echo "============================================="

cd frontend

echo "📦 Installing frontend dependencies..."
npm install

echo ""
echo "🌐 Starting React development server on port 3000..."
echo "   Frontend will be available at: http://localhost:3000"
echo "   Backend API is running at: http://localhost:5001"
echo ""

# Start the frontend development server
npm start 