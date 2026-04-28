#!/bin/bash
cd /content/company-dai
pkill -f "node src/server.js" 2>/dev/null || true
sleep 1
PORT=3100 node src/server.js
