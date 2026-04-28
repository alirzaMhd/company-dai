#!/bin/bash
cd /content/company-dai/

# Start the server in background
node src/server.js &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

sleep 2

# Start the tunnel in background
cloudflared tunnel --url http://localhost:3100 &
TUNNEL_PID=$!
echo "Tunnel started with PID: $TUNNEL_PID"

# Keep the script running
wait