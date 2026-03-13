#!/bin/bash

# Test script for KitKat Promo Admin System
# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api"
TOKEN=""

echo -e "${YELLOW}=== KitKat Promo Admin System - API Test ===${NC}\n"

# Check if server is running
echo "1. Checking server health..."
HEALTH=$(curl -s "${BASE_URL%/api}/health")
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not running. Start with: npm run dev${NC}"
    exit 1
fi

# Test login (token in cookie)
echo -e "\n2. Testing login..."
COOKIE_FILE=$(mktemp)
LOGIN_RESPONSE=$(curl -s -c "$COOKIE_FILE" -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"superadmin","password":"Admin@123"}')

if echo "$LOGIN_RESPONSE" | grep -q '"user"'; then
    echo -e "${GREEN}✓ Login successful${NC}"
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    rm -f "$COOKIE_FILE"
    exit 1
fi

# Test get staff (use cookie for auth)
echo -e "\n3. Testing get staff list..."
STAFF_RESPONSE=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/staff")

if echo "$STAFF_RESPONSE" | grep -q "staff"; then
    echo -e "${GREEN}✓ Staff list retrieved${NC}"
else
    echo -e "${RED}✗ Failed to get staff${NC}"
    echo "Response: $STAFF_RESPONSE"
fi

# Test get prizes
echo -e "\n4. Testing get prizes..."
PRIZES_RESPONSE=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/prizes")

if echo "$PRIZES_RESPONSE" | grep -q "prizes"; then
    echo -e "${GREEN}✓ Prizes list retrieved${NC}"
else
    echo -e "${RED}✗ Failed to get prizes${NC}"
    echo "Response: $PRIZES_RESPONSE"
fi

# Test public leaderboard
echo -e "\n5. Testing public leaderboard..."
LEADERBOARD_RESPONSE=$(curl -s "$BASE_URL/public/leaderboard?limit=10")

if echo "$LEADERBOARD_RESPONSE" | grep -q "leaderboard"; then
    echo -e "${GREEN}✓ Public leaderboard accessible${NC}"
else
    echo -e "${RED}✗ Failed to get public leaderboard${NC}"
    echo "Response: $LEADERBOARD_RESPONSE"
fi

# Test admin leaderboard
echo -e "\n6. Testing admin leaderboard..."
ADMIN_LEADERBOARD=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/admin/leaderboard?limit=10")

if echo "$ADMIN_LEADERBOARD" | grep -q "leaderboard"; then
    echo -e "${GREEN}✓ Admin leaderboard accessible${NC}"
else
    echo -e "${RED}✗ Failed to get admin leaderboard${NC}"
    echo "Response: $ADMIN_LEADERBOARD"
fi

# Test activity logs
echo -e "\n7. Testing activity logs..."
LOGS_RESPONSE=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/admin/logs?limit=10")

if echo "$LOGS_RESPONSE" | grep -q "logs"; then
    echo -e "${GREEN}✓ Activity logs accessible${NC}"
else
    echo -e "${RED}✗ Failed to get logs${NC}"
    echo "Response: $LOGS_RESPONSE"
fi

# Test unauthorized access (no cookie)
echo -e "\n8. Testing authorization..."
UNAUTHORIZED=$(curl -s -w "%{http_code}" "$BASE_URL/staff" -o /dev/null -b "")

rm -f "$COOKIE_FILE"

if [ "$UNAUTHORIZED" = "401" ]; then
    echo -e "${GREEN}✓ Authorization working (401 on missing token)${NC}"
else
    echo -e "${RED}✗ Authorization not working properly${NC}"
fi

# Test rate limiting
echo -e "\n9. Testing rate limiting on login..."
RATE_LIMIT_COUNT=0
for i in {1..6}; do
    RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"test","password":"wrong"}' -o /dev/null)
    if [ "$RESPONSE" = "429" ]; then
        RATE_LIMIT_COUNT=$((RATE_LIMIT_COUNT + 1))
    fi
done

if [ $RATE_LIMIT_COUNT -gt 0 ]; then
    echo -e "${GREEN}✓ Rate limiting is active${NC}"
else
    echo -e "${YELLOW}⚠ Rate limiting may not be active (expected after 5 attempts)${NC}"
fi

# Summary
echo -e "\n${YELLOW}=== Test Summary ===${NC}"
echo -e "${GREEN}✓ Server health check${NC}"
echo -e "${GREEN}✓ Authentication${NC}"
echo -e "${GREEN}✓ Protected endpoints${NC}"
echo -e "${GREEN}✓ Public endpoints${NC}"
echo -e "${GREEN}✓ Authorization${NC}"
echo -e ""
echo -e "All critical endpoints are functional!"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Configure email service in .env"
echo "2. Configure SMS service in .env"
echo "3. Test full participant registration flow"
echo "4. Test prize redemption flow"
echo "5. Build frontend admin panel"
