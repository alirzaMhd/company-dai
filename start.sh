#!/bin/bash
cd /content/company-dai/

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
    
    # Start backend server
    node src/server.js &
    SERVER_PID=$!
    echo "Server started with PID: $SERVER_PID"
    
    sleep 2
    
    # Check if server is running
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo "Error: Server failed to start"
        exit 1
    fi
    
    # Start Vite dev server
    cd client && npm run dev &
    DEV_PID=$!
    echo "Vite dev server started with PID: $DEV_PID"
    
    echo ""
    echo "✓ Application running at http://localhost:3100"
    echo "✓ Dev server running at http://localhost:5173"
    
    if [ "$1" == "everything" ]; then
        sleep 2
        
        # Start Cloudflare tunnel
        cloudflared tunnel --url http://localhost:3100 &
        TUNNEL_PID=$!
        echo "Tunnel started with PID: $TUNNEL_PID"
        
        echo ""
        echo "✓ Application running at http://localhost:3100"
        echo "✓ Dev server running at http://localhost:5173"
    fi
    
    wait
else
    echo "Starting in PRODUCTION mode..."
    
    # Build the React app if needed
    if [ ! -d "client/dist" ] || [ "$1" == "build" ]; then
        echo "Building React app..."
        cd client && npm run build && cd ..
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
    cloudflared tunnel --url http://localhost:3100 &
    TUNNEL_PID=$!
    echo "Tunnel started with PID: $TUNNEL_PID"
    
    echo ""
    echo "✓ Application running at http://localhost:3100"
    echo ""
    
    wait
fi
