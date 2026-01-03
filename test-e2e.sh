#!/usr/bin/env bash
# End-to-end test script for WithYou API

set -e

BASE_URL="http://localhost:3000"

echo "═══════════════════════════════════════════════════════════"
echo "WithYou API E2E Test Suite"
echo "═══════════════════════════════════════════════════════════"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to test endpoints
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_status=$4
  local test_name=$5

  echo -n "Testing: $test_name... "

  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      "$BASE_URL$endpoint" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "$expected_status" ]; then
    echo -e "${GREEN}PASS${NC} (HTTP $http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo "$body"
  else
    echo -e "${RED}FAIL${NC} (HTTP $http_code, expected $expected_status)"
    echo "Response: $body"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  echo
}

# 1. Health check
test_endpoint "GET" "/health" "" "200" "Health check"

# 2. Register users
echo "═══════════════════════════════════════════════════════════"
echo "Testing Authentication Flow"
echo "═══════════════════════════════════════════════════════════"

USER1_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com","password":"password123","passwordConfirmation":"password123"}')

USER1_TOKEN=$(echo $USER1_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER1_ID=$(echo $USER1_RESPONSE | grep -o '"userId":"[^"]*' | cut -d'"' -f4)

if [ -z "$USER1_TOKEN" ]; then
  echo -e "${RED}FAIL${NC} Failed to register user 1"
  exit 1
fi
echo -e "${GREEN}PASS${NC} User 1 registered (ID: $USER1_ID)"
TESTS_PASSED=$((TESTS_PASSED + 1))

USER2_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"password456","passwordConfirmation":"password456"}')

USER2_TOKEN=$(echo $USER2_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER2_ID=$(echo $USER2_RESPONSE | grep -o '"userId":"[^"]*' | cut -d'"' -f4)

if [ -z "$USER2_TOKEN" ]; then
  echo -e "${RED}FAIL${NC} Failed to register user 2"
  exit 1
fi
echo -e "${GREEN}PASS${NC} User 2 registered (ID: $USER2_ID)"
TESTS_PASSED=$((TESTS_PASSED + 1))

# 3. Test pairing flow
echo
echo "═══════════════════════════════════════════════════════════"
echo "Testing Pairing Flow"
echo "═══════════════════════════════════════════════════════════"

# User 1 generates invite
INVITE_RESPONSE=$(curl -s -X POST "$BASE_URL/relationship/invite" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER1_TOKEN")

INVITE_CODE=$(echo $INVITE_RESPONSE | grep -o '"inviteCode":"[^"]*' | cut -d'"' -f4)

if [ -z "$INVITE_CODE" ]; then
  echo -e "${RED}FAIL${NC} Failed to generate invite"
  echo "Response: $INVITE_RESPONSE"
  exit 1
fi
echo -e "${GREEN}PASS${NC} Invite generated (Code: $INVITE_CODE)"
TESTS_PASSED=$((TESTS_PASSED + 1))

# User 2 accepts invite
ACCEPT_RESPONSE=$(curl -s -X POST "$BASE_URL/relationship/accept" \
  -H "Content-Type: application/json" \
  -d "{\"inviteCode\":\"$INVITE_CODE\"}")

RELATIONSHIP_ID=$(echo $ACCEPT_RESPONSE | grep -o '"relationshipId":"[^"]*' | cut -d'"' -f4)

if [ -z "$RELATIONSHIP_ID" ]; then
  echo -e "${RED}FAIL${NC} Failed to accept invite"
  echo "Response: $ACCEPT_RESPONSE"
  exit 1
fi
echo -e "${GREEN}PASS${NC} Invite accepted (Relationship: $RELATIONSHIP_ID)"
TESTS_PASSED=$((TESTS_PASSED + 1))

# 4. Test dashboard
echo
echo "═══════════════════════════════════════════════════════════"
echo "Testing Core Functionality"
echo "═══════════════════════════════════════════════════════════"

DASHBOARD=$(curl -s -X GET "$BASE_URL/dashboard" \
  -H "Authorization: Bearer $USER1_TOKEN")

echo -e "${GREEN}PASS${NC} Dashboard retrieved"
echo "Response: $DASHBOARD"
TESTS_PASSED=$((TESTS_PASSED + 1))
echo

# 5. Test preferences
PREF_RESPONSE=$(curl -s -X POST "$BASE_URL/preferences" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -d '{"activity_style":"active","food_types":["Italian","Japanese"],"budget_level":"medium","energy_level":4}')

echo -e "${GREEN}PASS${NC} Preferences saved"
echo "Response: $PREF_RESPONSE"
TESTS_PASSED=$((TESTS_PASSED + 1))
echo

# 6. Test check-in
CHECKIN_RESPONSE=$(curl -s -X POST "$BASE_URL/checkins" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -d '{"mood_level":4,"note":"Had a great day!","shared":true}')

echo -e "${GREEN}PASS${NC} Check-in created"
echo "Response: $CHECKIN_RESPONSE"
TESTS_PASSED=$((TESTS_PASSED + 1))
echo

# 7. Test ideas
IDEAS=$(curl -s -X GET "$BASE_URL/ideas" \
  -H "Authorization: Bearer $USER1_TOKEN")

echo -e "${GREEN}PASS${NC} Ideas retrieved"
echo "Response: $IDEAS"
TESTS_PASSED=$((TESTS_PASSED + 1))
echo

# 8. Test login
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com","password":"password123"}')

LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$LOGIN_TOKEN" ]; then
  echo -e "${RED}FAIL${NC} Failed to login"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi
echo -e "${GREEN}PASS${NC} Login successful"
TESTS_PASSED=$((TESTS_PASSED + 1))
echo

# Summary
echo "═══════════════════════════════════════════════════════════"
echo "Test Summary"
echo "═══════════════════════════════════════════════════════════"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "\n${RED}Some tests failed!${NC}"
  exit 1
fi
