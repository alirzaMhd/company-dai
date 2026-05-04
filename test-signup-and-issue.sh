#!/bin/bash

set -e

cd /content/company-dai

SERVER_PORT=3100

RANDOM_SUFFIX=$(date +%s)
TEST_EMAIL="testuser${RANDOM_SUFFIX}@example.com"
TEST_PASSWORD="TestPass123!"
TEST_NAME="Test User"

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

echo "=== Sign up new user ==="
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:$SERVER_PORT/api/auth/sign-up/email \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"$TEST_NAME\"}" \
    -c /tmp/cookies.txt)

echo "Sign up response: $SIGNUP_RESPONSE"

if echo "$SIGN_UP_RESPONSE" | grep -q "error"; then
    echo "ERROR: Sign up failed"
    exit 1
fi

echo ""
echo "=== Verify session ==="
SESSION_RESPONSE=$(curl -s http://localhost:$SERVER_PORT/api/auth/get-session \
    -b /tmp/cookies.txt)

echo "Session: $SESSION_RESPONSE"

if ! echo "$SESSION_RESPONSE" | grep -q '"user"'; then
    echo "ERROR: Session not established"
    exit 1
fi

USER_ID=$(echo "$SESSION_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "User ID: $USER_ID"

echo ""
echo "=== Check companies (should be 0) ==="
COMPANIES_RESPONSE=$(curl -s http://localhost:$SERVER_PORT/api/companies \
    -b /tmp/cookies.txt)

COMPANY_COUNT=$(echo "$COMPANIES_RESPONSE" | grep -o '"id"' | wc -l)
echo "Company count: $COMPANY_COUNT"

if [ "$COMPANY_COUNT" -ne 0 ]; then
    echo "ERROR: Expected 0 companies for new user"
    exit 1
fi

echo ""
echo "=== Create a company ==="
CREATE_COMPANY_RESPONSE=$(curl -s -X POST http://localhost:$SERVER_PORT/api/companies \
    -H "Content-Type: application/json" \
    -b /tmp/cookies.txt \
    -d '{"name":"Test Company","description":"Test description"}')

echo "Create company response: $CREATE_COMPANY_RESPONSE"

COMPANY_ID=$(echo "$CREATE_COMPANY_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
COMPANY_PREFIX=$(echo "$CREATE_COMPANY_RESPONSE" | grep -o '"issuePrefix":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "Created company ID: $COMPANY_ID, prefix: $COMPANY_PREFIX"

if [ -z "$COMPANY_ID" ]; then
    echo "ERROR: Failed to create company"
    exit 1
fi

echo ""
echo "=== Verify company was created ==="
COMPANIES_RESPONSE=$(curl -s http://localhost:$SERVER_PORT/api/companies \
    -b /tmp/cookies.txt)

COMPANY_COUNT=$(echo "$COMPANIES_RESPONSE" | grep -o '"id"' | wc -l)
echo "Company count after creation: $COMPANY_COUNT"

if [ "$COMPANY_COUNT" -eq 0 ]; then
    echo "ERROR: Company was not created"
    exit 1
fi

echo ""
echo "=== Create an issue ==="
CREATE_ISSUE_RESPONSE=$(curl -s -X POST "http://localhost:$SERVER_PORT/api/companies/$COMPANY_ID/issues" \
    -H "Content-Type: application/json" \
    -b /tmp/cookies.txt \
    -d '{"title":"Test Issue","description":"Test description"}')

echo "Create issue response: $CREATE_ISSUE_RESPONSE"

ISSUE_ID=$(echo "$CREATE_ISSUE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created issue ID: $ISSUE_ID"

echo ""
echo "=== Get the issue detail ==="
if [ -n "$ISSUE_ID" ]; then
    ISSUE_RESPONSE=$(curl -s "http://localhost:$SERVER_PORT/api/companies/$COMPANY_ID/issues/$ISSUE_ID" \
        -b /tmp/cookies.txt)
    echo "Issue detail: $ISSUE_RESPONSE"
else
    echo "Trying to access existing issue /FRG2/issues/ISS-1777890083828"
    ISSUE_RESPONSE=$(curl -s "http://localhost:$SERVER_PORT/api/companies/82d99894-97ea-4211-8cff-e5cac22cb931/issues/ISS-1777890083828" \
        -b /tmp/cookies.txt)
    echo "Existing issue: $ISSUE_RESPONSE"
fi

echo ""
echo "=== TEST COMPLETE ==="
echo "Email: $TEST_EMAIL"
echo "Password: $TEST_PASSWORD"
echo "Company ID: $COMPANY_ID"
echo "Issue ID: $ISSUE_ID"

kill $SERVER_PID 2>/dev/null || true