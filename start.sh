#!/bin/bash
set -e

cd /content/company-dai/

PORT=${PORT:-3100}

cleanup() {
    echo "Shutting down..."
    kill $SERVER_PID 2>/dev/null || true
    kill $UI_PID 2>/dev/null || true
    kill $TUNNEL_PID 2>/dev/null || true
    exit 0
}
trap cleanup EXIT INT TERM

echo "=== Company-dai Setup ==="

if [ "$1" == "install" ] || [ -z "$1" ]; then
    echo "Installing dependencies..."
    pnpm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        exit 1
    fi
    echo "✓ Dependencies installed"
fi

if [ "$1" == "build" ] || [ "$1" == "prod" ] || [ -z "$1" ]; then
    echo "Building packages..."
    pnpm -r build
    if [ $? -ne 0 ]; then
        echo "Error: Failed to build"
        exit 1
    fi
    echo "✓ Build complete"
fi

if [ "$1" == "dev" ]; then
    echo "Starting in DEVELOPMENT mode..."
    
    echo "Starting server..."
    pnpm -F server dev &
    SERVER_PID=$!
    
    echo "Starting UI..."
    pnpm -F ui dev &
    UI_PID=$!
    
    sleep 3
    
    echo ""
    echo "✓ Server running at http://localhost:3001"
    echo "✓ UI running at http://localhost:5173"
    echo ""
    
    wait
fi

if [ "$1" == "prod" ] || [ -z "$1" ]; then
    echo "Starting in PRODUCTION mode..."
    
    echo "Starting server..."
    pnpm -F server start &
    SERVER_PID=$!
    
    sleep 2
    
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo "Error: Server failed to start"
        exit 1
    fi
    
    echo ""
    echo "✓ Server running at http://localhost:3001"
    echo ""
    
    wait
fi

if [ "$1" == "help" ] || [ "$1" == "--help" ]; then
    echo "Usage: ./start.sh [command]"
    echo ""
    echo "Commands:"
    echo "  install  - Install dependencies only"
    echo "  build   - Build packages only"
    echo "  dev     - Start in development mode"
    echo "  prod    - Start in production mode"
    echo "  help    - Show this help message"
    echo ""
    echo "Default: install + build + prod"
    exit 0
fi

echo "Done! Use './start.sh dev' for development or './start.sh prod' for production"