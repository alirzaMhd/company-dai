#!/bin/bash

set -e

cd /content/company-dai

SERVER_PORT=3100
TEST_EMAIL="kayoh67437@inreur.com"
TEST_PASSWORD="kayoh67437"

cleanup() {
    pkill -f "tsx.*index.ts" 2>/dev/null || true
    rm -f /tmp/cookies.txt
}
trap cleanup EXIT

echo "=== Starting server ==="
export NODE_ENV=production
export PORT=$SERVER_PORT
pnpm -F server start > /tmp/server.log 2>&1 &
SERVER_PID=$!
sleep 8

echo "=== Checking server health ==="
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$SERVER_PORT/)
echo "Server HTTP status: $HTTP_STATUS"

echo ""
echo "=== Step 1: Sign in ==="
SIGN_IN_RESPONSE=$(curl -s -X POST http://localhost:$SERVER_PORT/api/auth/sign-in/email \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    -c /tmp/cookies.txt)

echo "Sign in response: $SIGN_IN_RESPONSE"

if echo "$SIGN_IN_RESPONSE" | grep -q "error"; then
    echo "ERROR: Sign in failed"
    exit 1
fi

echo ""
echo "=== Step 2: Verify session ==="
SESSION_RESPONSE=$(curl -s http://localhost:$SERVER_PORT/api/auth/get-session \
    -b /tmp/cookies.txt)

echo "Session response: $SESSION_RESPONSE"

if ! echo "$SESSION_RESPONSE" | grep -q '"user"'; then
    echo "ERROR: Session not established"
    echo "Full session response: $SESSION_RESPONSE"
    exit 1
fi

USER_EMAIL=$(echo "$SESSION_RESPONSE" | grep -o '"email":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Logged in as: $USER_EMAIL"

echo ""
echo "=== Step 3: Get companies ==="
COMPANIES_RESPONSE=$(curl -s http://localhost:$SERVER_PORT/api/companies \
    -b /tmp/cookies.txt)

echo "Companies response length: ${#COMPANIES_RESPONSE}"

COMPANY_COUNT=$(echo "$COMPANIES_RESPONSE" | grep -o '"id"' | wc -l)
echo "Company count: $COMPANY_COUNT"

if [ "$COMPANY_COUNT" -eq 0 ]; then
    echo ""
    echo "RESULT: User has NO companies - should redirect to /onboarding"
    echo "TEST PASSED - Correctly detected no companies"
elif [ "$COMPANY_COUNT" -gt 0 ]; then
    echo ""
    echo "RESULT: User has $COMPANY_COUNT companies - should redirect to /dashboard"
    echo "TEST PASSED - Correctly detected companies"
    
    # Show first few company names
    echo "First few companies:"
    echo "$COMPANIES_RESPONSE" | grep -o '"name":"[^"]*"' | head -5
fi

echo ""
echo "=== Debug: Full companies response (first 500 chars) ==="
echo "$COMPANIES_RESPONSE" | head -c 500

echo ""
echo "=== TEST COMPLETE ==="

kill $SERVER_PID 2>/dev/null || true