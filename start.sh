#!/bin/bash

set -e

cd /content/company-dai/

PORT=${PORT:-3001}

cleanup() {
    echo "Shutting down..."
    kill $SERVER_PID 2>/dev/null || true
    kill $UI_PID 2>/dev/null || true
    kill $TUNNEL_PID 2>/dev/null || true
    exit 0
}
trap cleanup EXIT INT TERM

echo "=== Company-dai Setup ==="

if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

if [ "$1" == "install" ] || [ -z "$1" ]; then
    echo "Installing dependencies..."
    pnpm config set enable-pre-post-scripts true
    pnpm install
    pnpm approve-builds all || true
    echo "✓ Dependencies installed"
fi

if [ "$1" == "build" ] || [ "$1" == "prod" ] || [ -z "$1" ]; then
    echo "Building UI..."
    cd ui
    npx vite build
    cd ..
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
    echo "✓ Server running at http://localhost:$PORT"
    echo "✓ UI running at http://localhost:5173"
    
    if command -v cloudflared &> /dev/null; then
        echo ""
        echo "Starting Cloudflare tunnel..."
        cloudflared tunnel --url http://localhost:$PORT &
        TUNNEL_PID=$!
    fi
    
    echo ""
    wait
fi

if [ "$1" == "prod" ] || [ -z "$1" ]; then
    echo "Starting in PRODUCTION mode..."
    
    echo "Starting server..."
    pnpm -F server start &
    SERVER_PID=$!
    
    sleep 2
    
    echo ""
    echo "✓ Server running at http://localhost:$PORT"
    
    if command -v cloudflared &> /dev/null; then
        echo ""
        echo "Starting Cloudflare tunnel..."
        cloudflared tunnel --url http://localhost:$PORT &
        TUNNEL_PID=$!
    fi
    
    echo ""
    wait
fi

if [ "$1" == "help" ] || [ "$1" == "--help" ]; then
    echo "Usage: ./start.sh [command]"
    echo ""
    echo "Commands:"
    echo "  install  - Install dependencies only"
    echo "  build    - Build packages (server uses tsx)"
    echo "  dev      - Start in development mode"
    echo "  prod     - Start in production mode"
    echo "  help     - Show this help message"
    echo ""
    echo "Default: install + build + prod"
    exit 0
fi

echo "Done! Use './start.sh dev' for development or './start.sh prod' for production"