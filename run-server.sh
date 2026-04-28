#!/bin/bash
cd /content/company-dai
pkill -f "node src/server.js" 2>/dev/null
nohup node src/server.js > /tmp/server.log 2>&1 &
sleep 2
echo "Server started"
cat /tmp/server.log
curl -s --max-time 3 http://localhost:3100/api || echo "API not responding yet"
