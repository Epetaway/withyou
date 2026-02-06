#!/bin/bash

echo "Testing Wearables API"
echo "===================="

# Get token
echo "Getting authentication token..."
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev1@example.com","password":"password123"}' | jq -r .token)

echo "Token: ${TOKEN:0:30}..."
echo ""

# Test wearables devices endpoint
echo "Testing GET /wearables/devices"
curl -s -X GET http://localhost:3000/wearables/devices \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test activity challenges endpoint  
echo "Testing GET /activity-challenges"
curl -s -X GET http://localhost:3000/activity-challenges \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "Wearables API tests complete!"
