#!/bin/bash

set -e

cd /content/company-dai

SERVER_PORT=3100
TEST_EMAIL="kayoh67437@inreur.com"
TEST_PASSWORD="kayoh67437"

cleanup() {
    echo "Cleaning up..."
    sleep 1
}
trap cleanup EXIT INT TERM

echo "=== Stopping any existing server ==="
pkill -f "tsx.*index.ts" 2>/dev/null || true
pkill -f "node.*server.js" 2>/dev/null || true
sleep 2

echo "=== Starting server in production mode ==="
export NODE_ENV=production
export PORT=$SERVER_PORT
pnpm -F server start > /tmp/server.log 2>&1 &
SERVER_PID=$!
sleep 5

echo "=== Server log ==="
tail -20 /tmp/server.log

echo "=== Checking server health ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:$SERVER_PORT/ || echo "Server may not be ready"

echo "=== Testing auth/sign-in ==="
SIGN_IN_RESPONSE=$(curl -s -X POST http://localhost:$SERVER_PORT/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "Sign-in response: $SIGN_IN_RESPONSE"

if echo "$SIGN_IN_RESPONSE" | grep -q "error"; then
    echo "ERROR: Sign-in failed"
    exit 1
fi

echo "=== Testing session ==="
SESSION_RESPONSE=$(curl -s http://localhost:$SERVER_PORT/api/auth/session)
echo "Session response: $SESSION_RESPONSE"

echo "=== Testing companies API (should only return user's companies) ==="
COMPANIES_RESPONSE=$(curl -s http://localhost:$SERVER_PORT/api/companies)
echo "Companies response: $COMPANIES_RESPONSE"

COMPANY_COUNT=$(echo "$COMPANIES_RESPONSE" | grep -o '"id"' | wc -l)
echo "Company count for user: $COMPANY_COUNT"

if [ "$COMPANY_COUNT" -eq 0 ]; then
    echo "EXPECTED: User has no company - should redirect to /onboarding"
else
    echo "EXPECTED: User has company($s) - should redirect to /dashboard"
fi

echo "=== Test complete ==="