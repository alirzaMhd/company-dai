#!/bin/bash
cd /content/company-dai
pkill -f "node.*server.js" 2>/dev/null
sleep 1
echo "Starting server..."
PORT=3100 node src/server.js > /tmp/server.log 2>&1 &
sleep 3
echo "Testing server..."
echo "=== Main Page ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3100/
echo "=== CSS File ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}, Content-Type: %{content_type}\n" http://localhost:3100/assets/index-BgeviYDu.css
echo "=== JS File ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}, Content-Type: %{content_type}\n" http://localhost:3100/assets/index-BRQxYT6u.js
echo ""
echo "Server log:"
tail -10 /tmp/server.log
