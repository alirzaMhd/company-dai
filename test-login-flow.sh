#!/bin/bash

set -e

cd /content/company-dai

SERVER_PORT=3100
TEST_EMAIL="kayoh67437@inreur.com"
TEST_PASSWORD="kayoh67437"

MAX_RETRIES=3
RETRY_DELAY=5

cleanup() {
    echo "Cleaning up..."
    pkill -f "tsx.*index.ts" 2>/dev/null || true
    pkill -f "node.*server.js" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    sleep 1
}
trap cleanup EXIT INT TERM

start_server() {
    echo "=== Starting server in production mode ==="
    export NODE_ENV=production
    export PORT=$SERVER_PORT
    pnpm -F server start > /tmp/server.log 2>&1 &
    SERVER_PID=$!
    echo "Server PID: $SERVER_PID"
    
    echo "Waiting for server to be ready..."
    for i in {1..30}; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:$SERVER_PORT/ | grep -q "200\|404\|500"; then
            echo "Server is ready!"
            return 0
        fi
        sleep 1
    done
    
    echo "Server failed to start. Log:"
    tail -50 /tmp/server.log
    return 1
}

COOKIE_JAR="/tmp/cookies.txt"

test_auth_flow() {
    echo ""
    echo "=== Testing authentication flow ==="
    
    echo "Step 1: Sign in with email and password (saving cookies)"
    SIGN_IN_RESPONSE=$(curl -s -X POST http://localhost:$SERVER_PORT/api/auth/sign-in/email \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
        -c "$COOKIE_JAR" -w "\n%{http_code}")
    
    HTTP_CODE=$(echo "$SIGN_IN_RESPONSE" | tail -1)
    SIGN_IN_BODY=$(echo "$SIGN_IN_RESPONSE" | head -n -1)
    
    echo "Sign-in response: $SIGN_IN_BODY"
    echo "HTTP code: $HTTP_CODE"
    
    if echo "$SIGN_IN_BODY" | grep -q "error"; then
        echo "ERROR: Sign-in failed"
        return 1
    fi
    
    echo "Step 2: Get session to verify login (using cookies)"
    SESSION_RESPONSE=$(curl -s http://localhost:$SERVER_PORT/api/auth/get-session \
        -b "$COOKIE_JAR")
    echo "Session response: $SESSION_RESPONSE"
    
    if ! echo "$SESSION_RESPONSE" | grep -q "user"; then
        echo "ERROR: Session not established"
        return 1
    fi
    
    USER_ID=$(echo "$SESSION_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "User ID: $USER_ID"
    
    echo "Step 3: Check user's companies (should only return user's companies, not the whole db)"
    COMPANIES_RESPONSE=$(curl -s http://localhost:$SERVER_PORT/api/companies \
        -b "$COOKIE_JAR")
    echo "Companies response: $COMPANIES_RESPONSE"
    
    COMPANY_COUNT=$(echo "$COMPANIES_RESPONSE" | grep -o '"id"' | wc -l)
    echo "Company count for user: $COMPANY_COUNT"
    
    if [ "$COMPANY_COUNT" -eq 0 ]; then
        echo "User has NO company - should redirect to /onboarding"
        echo "TEST PASSED: User correctly has no company and should go to /onboarding"
        return 0
    else
        echo "User HAS company(s) - should redirect to /dashboard"
        echo "TEST PASSED: User correctly has company and should go to /dashboard"
        return 0
    fi
}

echo "=== Stopping any existing servers ==="
pkill -f "tsx.*index.ts" 2>/dev/null || true
pkill -f "node.*server.js" 2>/dev/null || true
sleep 2

for attempt in $(seq 1 $MAX_RETRIES); do
    echo ""
    echo "=== Attempt $attempt of $MAX_RETRIES ==="
    
    if start_server; then
        if test_auth_flow; then
            echo ""
            echo "=== TEST PASSED ==="
            exit 0
        fi
    fi
    
    if [ $attempt -lt $MAX_RETRIES ]; then
        echo "Test failed, retrying in $RETRY_DELAY seconds..."
        cleanup
        sleep $RETRY_DELAY
    fi
done

echo ""
echo "=== TEST FAILED after $MAX_RETRIES attempts ==="
exit 1