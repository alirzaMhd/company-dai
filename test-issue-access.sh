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

echo "=== Sign in ==="
curl -s -X POST http://localhost:$SERVER_PORT/api/auth/sign-in/email \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    -c /tmp/cookies.txt > /dev/null

echo "=== Get user's companies ==="
COMPANIES_RESPONSE=$(curl -s http://localhost:$SERVER_PORT/api/companies -b /tmp/cookies.txt)
echo "$COMPANIES_RESPONSE" | head -c 2000

# Find issues from each company
echo ""
echo "=== Getting issues from first company ==="

# Get first company ID
COMPANY_ID=$(echo "$COMPANIES_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Company ID: $COMPANY_ID"

if [ -n "$COMPANY_ID" ]; then
    echo "=== Issues for company $COMPANY_ID ==="
    ISSUES_RESPONSE=$(curl -s "http://localhost:$SERVER_PORT/api/companies/$COMPANY_ID/issues" -b /tmp/cookies.txt)
    echo "Issues: $ISSUES_RESPONSE" | head -c 1000
    
    # Get first issue ID
    ISSUE_ID=$(echo "$ISSUES_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    ISSUE_IDEAL=$(echo "$ISSUES_RESPONSE" | grep -o '"idealid":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    echo ""
    echo "First issue ID: $ISSUE_ID"
    echo "First issue ideal ID: $ISSUE_IDEAL"
    
    if [ -n "$ISSUE_ID" ]; then
        echo ""
        echo "=== Get issue detail ==="
        ISSUE_DETAIL=$(curl -s "http://localhost:$SERVER_PORT/api/companies/$COMPANY_ID/issues/$ISSUE_ID" -b /tmp/cookies.txt)
        echo "Issue detail: $ISSUE_DETAIL" | head -c 2000
    fi
fi

echo ""
echo "=== TEST COMPLETE ==="

kill $SERVER_PID 2>/dev/null || true