#!/bin/bash

echo "🚀 Starting Course Management System Development Environment"
echo "=================================================="

# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is already running"
else
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "📝 To start MongoDB, you can:"
    echo "   1. Install MongoDB locally: https://docs.mongodb.com/manual/installation/"
    echo "   2. Use MongoDB Atlas (cloud): https://www.mongodb.com/atlas"
    echo "   3. Use Docker: docker run -d -p 27017:27017 --name mongodb mongo:6.0"
    echo ""
    echo "Exiting as MongoDB connection is now required."
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🌱 Seeding database with initial data..."
npm run seed

echo ""
echo "🌐 Starting backend server on port 5001..."
echo "   API will be available at: http://localhost:5001"
echo "   Health check: http://localhost:5001/api/health"
echo ""

# Start the backend server
npm run dev 