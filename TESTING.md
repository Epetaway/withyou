# WithYou Testing Guide

This document outlines how to test the WithYou application.

## Prerequisites

- Node.js 18+
- PostgreSQL running locally
- Environment variables configured (.env files in each workspace)

## Setup for Testing

### 1. Database Setup

```bash
cd apps/api

# Create and migrate database
npm run prisma:migrate

# (Optional) Seed database with test data
npm run prisma:seed
```

### 2. Start the API Server

```bash
cd apps/api
npm run dev
```

The API server should start on `http://localhost:3000`

### 3. Start the Mobile App (Expo)

```bash
cd apps/mobile
npm start

# For iOS simulator
# Press 'i' to open iOS simulator

# For Android emulator
# Press 'a' to open Android emulator
```

## Manual Testing

### Auth Flow

1. **Register**: Create a new account
   - Email: any valid email
   - Password: minimum 8 characters

2. **Login**: Log in with registered credentials
   - Verify token is stored securely
   - Verify navigation to UnpairedHome screen

### Pairing Flow (Two Users Required)

1. **User A - Generate Invite**:
   - Tap "Pair" button on UnpairedHome
   - Tap "Generate invite code"
   - Copy code (or copy link)

2. **User B - Accept Invite**:
   - Tap "Enter invite code"
   - Paste the code received from User A
   - Tap "Accept and pair"
   - Should navigate to Dashboard

### Paired Features (After Successful Pairing)

#### Dashboard
- Displays relationship stage (Dating, Committed, Engaged, Married)
- Shows partner's last shared check-in
- Provides quick access to Check-in, Preferences, and Ideas

#### Check-In
- Select mood level (1-5)
- Add optional note
- Toggle sharing with partner
- Submit and return to Dashboard

#### Preferences
- Select activity style (Chill, Active, Surprise)
- Select food types (multiple selection)
- Select budget level (Low, Medium, High)
- Select energy level (1-5)
- Submit preferences

#### Ideas
- View generated ideas based on preferences
- Save ideas for later
- Refresh to get new ideas
- Navigate to preferences if none generated

#### Settings
- **End Pairing**: Breaks the relationship and returns to UnpairedHome
- **Logout**: Clears session and returns to Login screen

## Automated Testing

### E2E Test Script

Run the comprehensive E2E test suite:

```bash
# Start API server in one terminal
cd apps/api
npm run dev

# In another terminal, run the test script
./test-e2e.sh
```

This tests:
- Health check endpoint
- User registration (2 users)
- User login
- Invite generation
- Invite acceptance
- Dashboard retrieval
- Preferences creation
- Check-in creation
- Ideas retrieval

## Common Test Scenarios

### Scenario 1: Complete Pairing Journey
1. Register User A
2. Register User B
3. User A generates invite code
4. User B enters and accepts code
5. Both users see Dashboard with relationship
6. Both set preferences
7. Both create check-ins
8. Both view ideas

### Scenario 2: Error Handling
Test invalid inputs:
- Invalid email format
- Password mismatch on registration
- Duplicate email registration
- Invalid/expired invite code
- Pairing while already paired

### Scenario 3: Rate Limiting
- Make 5+ authentication requests in rapid succession → Should be rate limited
- Make 100+ general API requests in 15 minutes → Should be rate limited

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test health endpoint
ab -n 100 -c 10 http://localhost:3000/health

# Test dashboard (requires valid token)
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/dashboard
```

## Debugging

### API Logs
- Morgan logs all HTTP requests to console
- Check for rate limiting headers in responses
- Verify JWT tokens with `jsonwebtoken` package

### Mobile Debugging
- Use Expo DevTools: `d` in terminal
- Check Network tab to inspect API requests
- Verify token storage in Secure Store

### Database State
```bash
# Connect to PostgreSQL
psql postgres -U earlhickson -d withyou

# View users
SELECT id, email FROM "User";

# View relationships
SELECT * FROM "Relationship";

# View check-ins
SELECT * FROM "Checkin";
```

## Test Coverage

Currently the application has:
- Manual E2E test script (bash)
- Postman collection ready for import (if available)
- Console logging for debugging

Future improvements:
- Jest unit tests for API routes
- React Native Testing Library for components
- Cypress for mobile E2E testing

## Known Issues & Workarounds

1. **Logout not immediately updating UI**: Requires app restart to fully reset auth state
2. **Slow Expo bundling**: First build takes longer, subsequent builds are faster
3. **Rate limiting may block rapid test requests**: Add delays between requests in load tests

## Support & Debugging

For issues during testing:
1. Check `.env` files are properly configured
2. Ensure PostgreSQL is running
3. Clear cache: `npm cache clean --force`
4. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
5. Check API is listening on port 3000
6. Verify mobile app can reach `EXPO_PUBLIC_API_BASE_URL`
