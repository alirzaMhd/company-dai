#!/bin/bash
cd /content/company-dai/

# Kill any existing process on port 3100 (or PORT env)
PORT=${PORT:-3100}
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Port $PORT is in use, killing existing process..."
    kill $(lsof -t -i:$PORT) 2>/dev/null
    sleep 1
fi

# Kill any existing Vite dev server on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Port 3000 is in use, killing existing process..."
    kill $(lsof -t -i:3000) 2>/dev/null
    sleep 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Function to cleanup on exit
cleanup() {
    echo "Shutting down..."
    kill $SERVER_PID 2>/dev/null
    kill $DEV_PID 2>/dev/null
    kill $TUNNEL_PID 2>/dev/null
    exit 0
}
trap cleanup EXIT INT TERM

# Check if we should run in dev mode
if [ "$1" == "dev" ] || [ "$1" == "everything" ]; then
    echo "Starting in DEVELOPMENT mode..."
    
    # Start dev server (runs both backend and Vite)
    npm run dev &
    DEV_PID=$!
    echo "Dev server started with PID: $DEV_PID"
    
    sleep 2
    
    # Check if dev server is running
    if ! kill -0 $DEV_PID 2>/dev/null; then
        echo "Error: Dev server failed to start"
        exit 1
    fi
    
    echo ""
    echo "✓ API Server running at http://localhost:3100"
    echo "✓ React Dev Server running at http://localhost:3000"
    
    if [ "$1" == "everything" ]; then
        sleep 2
        
        # Start Cloudflare tunnel
        cloudflared tunnel --url http://localhost:$PORT &
        TUNNEL_PID=$!
        echo "Tunnel started with PID: $TUNNEL_PID"
        
        echo ""
        echo "✓ Application running at http://localhost:$PORT"
        echo "✓ Dev server running at http://localhost:3000"
    fi
    
    wait
else
    echo "Starting in PRODUCTION mode..."
    
    # Build the React app if needed
    if [ ! -d "dist" ] || [ "$1" == "build" ]; then
        echo "Building React app..."
        npm run build
        if [ $? -ne 0 ]; then
            echo "Error: Failed to build React app"
            exit 1
        fi
    fi
    
    # Start the server
    node src/server.js &
    SERVER_PID=$!
    echo "Server started with PID: $SERVER_PID"
    
    sleep 2
    
    # Check if server is running
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo "Error: Server failed to start"
        exit 1
    fi
    
    # Start Cloudflare tunnel
    cloudflared tunnel --url http://localhost:$PORT &
    TUNNEL_PID=$!
    echo "Tunnel started with PID: $TUNNEL_PID"
    
    echo ""
    echo "✓ Application running at http://localhost:$PORT"
    echo ""
    
    wait
fi
