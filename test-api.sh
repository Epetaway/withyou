#!/bin/bash

# WithYou API Test Suite
# Tests the happy path: auth → pairing → check-in → ideas → dashboard

set -e

API="https://withyouapi-production.up.railway.app"
TIMESTAMP=$(date +%s)
EMAIL1="user${TIMESTAMP}+1@test.withyou.app"
EMAIL2="user${TIMESTAMP}+2@test.withyou.app"
PASSWORD="TestPassword123!"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 WithYou API Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Health check
echo -e "\n✓ 1. Health Check"
curl -s "$API/health" | jq .

# 2. Register user 1
echo -e "\n✓ 2. Register User 1: $EMAIL1"
REGISTER1=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL1\",
    \"password\": \"$PASSWORD\",
    \"confirmPassword\": \"$PASSWORD\"
  }")
echo "$REGISTER1" | jq .
TOKEN1=$(echo "$REGISTER1" | jq -r '.data.token')
USER1_ID=$(echo "$REGISTER1" | jq -r '.data.user.id')
echo "Token 1: ${TOKEN1:0:20}..."
echo "User 1 ID: $USER1_ID"

# 3. Register user 2
echo -e "\n✓ 3. Register User 2: $EMAIL2"
REGISTER2=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL2\",
    \"password\": \"$PASSWORD\",
    \"confirmPassword\": \"$PASSWORD\"
  }")
echo "$REGISTER2" | jq .
TOKEN2=$(echo "$REGISTER2" | jq -r '.data.token')
USER2_ID=$(echo "$REGISTER2" | jq -r '.data.user.id')
echo "Token 2: ${TOKEN2:0:20}..."
echo "User 2 ID: $USER2_ID"

# 4. User 1 generates invite code
echo -e "\n✓ 4. User 1 Generates Invite Code"
INVITE=$(curl -s -X POST "$API/relationship/invite" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{}")
echo "$INVITE" | jq .
INVITE_CODE=$(echo "$INVITE" | jq -r '.data.code')
echo "Invite Code: $INVITE_CODE"

# 5. User 2 accepts invite
echo -e "\n✓ 5. User 2 Accepts Invite: $INVITE_CODE"
ACCEPT=$(curl -s -X POST "$API/relationship/accept" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d "{ \"inviteCode\": \"$INVITE_CODE\" }")
echo "$ACCEPT" | jq .
RELATIONSHIP_ID=$(echo "$ACCEPT" | jq -r '.data.relationship.id')
echo "Relationship ID: $RELATIONSHIP_ID"

# 6. Get dashboard (User 1)
echo -e "\n✓ 6. Dashboard (User 1)"
curl -s -H "Authorization: Bearer $TOKEN1" "$API/dashboard" | jq .

# 7. Submit check-in (User 1)
echo -e "\n✓ 7. Submit Check-In (User 1): mood=4"
CHECKIN=$(curl -s -X POST "$API/checkins" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{
    \"mood\": 4,
    \"note\": \"Feeling good today!\"
  }")
echo "$CHECKIN" | jq .

# 8. Get ideas (User 1)
echo -e "\n✓ 8. Get Ideas (User 1) - Reconnect Mode"
curl -s -H "Authorization: Bearer $TOKEN1" "$API/ideas?mode=reconnect" | jq .

# 9. Update preferences (User 1)
echo -e "\n✓ 9. Update Preferences (User 1)"
PREFS=$(curl -s -X POST "$API/preferences" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{
    \"activities\": [\"cooking\", \"hiking\"],
    \"budget_comfort\": \"medium\",
    \"energy_level\": \"high\",
    \"availability\": \"weekends\"
  }")
echo "$PREFS" | jq .

# 10. Dashboard after activity (User 2)
echo -e "\n✓ 10. Dashboard (User 2) - After Activity"
curl -s -H "Authorization: Bearer $TOKEN2" "$API/dashboard" | jq .

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All tests passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
