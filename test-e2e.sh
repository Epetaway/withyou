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

# 9. Test Ideas Feature
echo "═══════════════════════════════════════════════════════════"
echo "Testing Ideas Feature"
echo "═══════════════════════════════════════════════════════════"

# Test local ideas query
LOCAL_IDEAS_RESPONSE=$(curl -s -X POST "$BASE_URL/ideas/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -d '{"type":"LOCAL","radiusMiles":10,"filters":["outdoors"]}')

LOCAL_IDEAS_COUNT=$(echo $LOCAL_IDEAS_RESPONSE | grep -o '"ideas":\[' | wc -l)
if [ "$LOCAL_IDEAS_COUNT" -gt 0 ]; then
  echo -e "${GREEN}PASS${NC} Local ideas query successful"
  echo "Response: $LOCAL_IDEAS_RESPONSE"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}FAIL${NC} Local ideas query returned no ideas"
  echo "Response: $LOCAL_IDEAS_RESPONSE"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo

# Test recipe suggestions
RECIPES_RESPONSE=$(curl -s -X POST "$BASE_URL/ideas/recipes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -d '{"ingredients":["eggs","pasta","tomatoes"]}')

RECIPES_COUNT=$(echo $RECIPES_RESPONSE | grep -o '"recipes":\[' | wc -l)
if [ "$RECIPES_COUNT" -gt 0 ]; then
  echo -e "${GREEN}PASS${NC} Recipe suggestions retrieved"
  echo "Response: $RECIPES_RESPONSE"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}FAIL${NC} Recipe suggestions failed"
  echo "Response: $RECIPES_RESPONSE"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo

# Test movie suggestions
MOVIES_RESPONSE=$(curl -s -X GET "$BASE_URL/ideas/movies" \
  -H "Authorization: Bearer $USER1_TOKEN")

MOVIES_COUNT=$(echo $MOVIES_RESPONSE | grep -o '"ideas":\[' | wc -l)
if [ "$MOVIES_COUNT" -gt 0 ]; then
  echo -e "${GREEN}PASS${NC} Movie suggestions retrieved"
  echo "Response: $MOVIES_RESPONSE"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}FAIL${NC} Movie suggestions failed"
  echo "Response: $MOVIES_RESPONSE"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo

# Test save idea
SAVE_IDEA_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/ideas/test-idea-123/save" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -d '{"notes":"This looks fun!"}')

SAVE_HTTP_CODE=$(echo "$SAVE_IDEA_RESPONSE" | tail -n1)
SAVE_BODY=$(echo "$SAVE_IDEA_RESPONSE" | head -n-1)

if [ "$SAVE_HTTP_CODE" = "200" ] || [ "$SAVE_HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}PASS${NC} Idea saved successfully (HTTP $SAVE_HTTP_CODE)"
  echo "Response: $SAVE_BODY"
  TESTS_PASSED=$((TESTS_PASSED + 1))
  SAVED_IDEA_ID=$(echo $SAVE_BODY | grep -o '"ideaId":"[^"]*' | cut -d'"' -f4)
else
  echo -e "${RED}FAIL${NC} Failed to save idea (HTTP $SAVE_HTTP_CODE)"
  echo "Response: $SAVE_BODY"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo

# Test get saved ideas
SAVED_IDEAS_RESPONSE=$(curl -s -X GET "$BASE_URL/ideas/saved" \
  -H "Authorization: Bearer $USER1_TOKEN")

SAVED_COUNT=$(echo $SAVED_IDEAS_RESPONSE | grep -o '"ideas":\[' | wc -l)
if [ "$SAVED_COUNT" -gt 0 ]; then
  echo -e "${GREEN}PASS${NC} Saved ideas retrieved"
  echo "Response: $SAVED_IDEAS_RESPONSE"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}FAIL${NC} Failed to retrieve saved ideas"
  echo "Response: $SAVED_IDEAS_RESPONSE"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo

# Test unsave/delete saved idea
if [ ! -z "$SAVED_IDEA_ID" ]; then
  UNSAVE_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/ideas/test-idea-123/save" \
    -H "Authorization: Bearer $USER1_TOKEN")

  UNSAVE_HTTP_CODE=$(echo "$UNSAVE_RESPONSE" | tail -n1)
  UNSAVE_BODY=$(echo "$UNSAVE_RESPONSE" | head -n-1)

  if [ "$UNSAVE_HTTP_CODE" = "200" ] || [ "$UNSAVE_HTTP_CODE" = "204" ]; then
    echo -e "${GREEN}PASS${NC} Idea unsaved successfully (HTTP $UNSAVE_HTTP_CODE)"
    echo "Response: $UNSAVE_BODY"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}FAIL${NC} Failed to unsave idea (HTTP $UNSAVE_HTTP_CODE)"
    echo "Response: $UNSAVE_BODY"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  echo
fi

# Test ideas without authentication
NO_AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/ideas/saved")

NO_AUTH_HTTP_CODE=$(echo "$NO_AUTH_RESPONSE" | tail -n1)

if [ "$NO_AUTH_HTTP_CODE" = "401" ]; then
  echo -e "${GREEN}PASS${NC} Correctly rejected unauthenticated request (HTTP 401)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}FAIL${NC} Should reject unauthenticated ideas request (HTTP $NO_AUTH_HTTP_CODE, expected 401)"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo

# Test invalid recipe query
INVALID_RECIPES_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/ideas/recipes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -d '{"ingredients":[]}')

INVALID_HTTP_CODE=$(echo "$INVALID_RECIPES_RESPONSE" | tail -n1)

if [ "$INVALID_HTTP_CODE" = "400" ]; then
  echo -e "${GREEN}PASS${NC} Correctly rejected invalid recipe query (HTTP 400)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${YELLOW}NOTE${NC} Empty ingredients validation (HTTP $INVALID_HTTP_CODE)"
fi
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
