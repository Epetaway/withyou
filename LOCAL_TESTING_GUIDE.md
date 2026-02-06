# Local Testing Guide - WithYou Application

## Project Status

✅ **All Systems Verified**
- Code pulled from repository
- Dependencies installed
- Linting passed (no errors)
- Database configured and seeded
- API server running on `http://localhost:3000`
- Mobile Expo server running on `http://localhost:19006`
- All test data loaded successfully

---

## Quick Start - Running Locally

### 1. Start the API Server
  
**Terminal 1:**
```bash
cd /Users/earlhickson/Development/withyou
npm run dev:api
```

Expected output:
```
API listening on port 3000
WebSocket server ready on port 3000
```

### 2. Start the Mobile App (Expo)

**Terminal 2:**
```bash
cd /Users/earlhickson/Development/withyou/apps/mobile
npm start
```

After starting, you'll see:
```
› Tunnel ready
› Using Expo Router
› Press i │ open iOS simulator
› Press a │ open Android emulator  
› Press w │ open web setup
```

---

## Test Accounts

All test accounts use password: **`password123`**

### QA Test Couples (Comprehensive Testing)

#### **Couple A - Dating Stage**
- **User A (Alex):** `qa_alex@example.com`
- **User B (Jordan):** `qa_jordan@example.com`
- **Status:** Active relationship (Dating stage)
- **Data Includes:** Check-ins, preferences, saved ideas, activity history

#### **Couple B - Committed Stage**
- **User A (Taylor):** `qa_taylor@example.com`
- **User B (Casey):** `qa_casey@example.com`
- **Status:** Active relationship (Committed stage)
- **Data Includes:** Check-ins, preferences, saved ideas, activity history

#### **Unpaired User**
- **Email:** `qa_unpaired@example.com`
- **Status:** No active relationship
- **Test Use:** Pairing flow testing, invite code generation

### Development Accounts (Minimal Data)

- **Dev User 1:** `dev1@example.com`
- **Dev User 2:** `dev2@example.com`
- **Status:** Active paired relationship

---

## Testing Workflows

### Workflow 1: Authentication & Login

**Steps:**
1. Launch mobile app in simulator
2. Tap "Login"
3. Enter email: `qa_alex@example.com`
4. Enter password: `password123`
5. Tap "Login"

**Expected Result:**
- ✅ User authenticated successfully
- ✅ Navigated to Dashboard screen
- ✅ Relationship stage displays as "Dating"
- ✅ Partner's last check-in visible
- ✅ Navigation tabs appear

---

### Workflow 2: Dashboard & Check-in

**Prerequisites:** Logged in as `qa_alex@example.com`

**Steps:**
1. View Dashboard with:
   - Relationship stage (Dating)
   - Partner's last mood check-in (should show recent data)
   - Recent activity list
2. Tap "Check-in" button
3. Select mood level (1-5 stars)
4. Toggle "Share with partner" 
5. Add optional note
6. Tap "Submit Check-in"

**Expected Results:**
- ✅ Dashboard loads without errors
- ✅ Partner data displays correctly
- ✅ Check-in screen opens properly
- ✅ Mood selection works
- ✅ Check-in saved to database
- ✅ Dashboard updates with new check-in

---

### Workflow 3: Preferences Setup

**Prerequisites:** Logged in as `qa_alex@example.com`

**Steps:**
1. From Dashboard, tap "Preferences"
2. Update the following:
   - **Activity Style:** Select "Active" (options: Chill, Active, Surprise)
   - **Food Types:** Select multiple (e.g., Italian, Japanese, American)
   - **Budget Level:** Select "Medium" (options: Low, Medium, High)
   - **Energy Level:** Select 4/5 (scale 1-5)
3. Tap "Save Preferences"

**Expected Results:**
- ✅ All preference selections save correctly
- ✅ Selected values persist after reload
- ✅ No validation errors
- ✅ Dashboard refreshes with updated preferences

---

### Workflow 4: Ideas & Activity Suggestions

**Prerequisites:** Logged in with preferences set

**Steps:**
1. From Dashboard, tap "Ideas" or "Suggestions"
2. View generated ideas based on:
   - Activity style preference
   - Budget preference
   - Location data (if enabled)
3. Tap heart icon to save an idea
4. Swipe/refresh to see new ideas
5. Tap an idea for more details

**Expected Results:**
- ✅ Ideas load based on preferences
- ✅ Ideas match selected preferences
- ✅ Save/unsave functionality works
- ✅ Multiple ideas available for browsing
- ✅ Scrolling and refresh work smoothly

---

### Workflow 5: Pairing Process (Unpaired User)

**Prerequisites:** Logged in as `qa_unpaired@example.com`

**User A Steps (Code Generator):**
1. From UnpairedHome, tap "Pair with Someone"
2. Tap "Generate Invite Code"
3. Copy the 6-character code shown
4. Share code with partner (in real use, via messaging/link)

**User B Steps (Code Acceptor - in separate simulator):**
1. Login with: `dev1@example.com` / `password123`
2. From UnpairedHome, tap "Enter Invite Code"
3. Paste the code from User A
4. Review pairing details
5. Tap "Accept and Pair"

**Expected Results:**
- ✅ Code generates successfully
- ✅ Code is valid for pairing
- ✅ User B can accept and navigate to Dashboard
- ✅ Both users see each other as paired partners

---

### Workflow 6: New Features (v1.1)

#### **A. Workouts & Fitness Goals**
**Test as:** `qa_taylor@example.com`
1. From Dashboard, navigate to Workouts
2. Create a new fitness goal
3. Set: goal name, duration, target days/week
4. Create workout log entries
5. View progress/leaderboard with partner

**Expected Results:**
- ✅ Workouts tab accessible
- ✅ Can create and edit goals
- ✅ Workout logs save correctly
- ✅ Partner can see shared goals

#### **B. Grocery List Collaboration**
**Test as:** One user creates list, other user updates items
1. Navigate to Grocery List
2. Create a new list
3. Add items with quantities
4. Mark items as completed
5. Share with partner
6. Partner updates items in real-time

**Expected Results:**
- ✅ Grocery list CRUD operations work
- ✅ Real-time updates between partners
- ✅ Item completion tracking works
- ✅ UI refreshes properly on updates

#### **C. Chat Messaging**
**Test as:** `qa_taylor@example.com` and `qa_casey@example.com` (paired couple)
1. Navigate to Chat/Messages
2. Send message from User A
3. Receive message on User B's app (refresh if needed)
4. Reply from User B
5. View message history

**Expected Results:**
- ✅ Messages send successfully
- ✅ Messages appear in real-time (or on refresh)
- ✅ Message history loads
- ✅ Text formatting preserved

---

## API Testing (via curl)

### Test Login Endpoint

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"qa_alex@example.com",
    "password":"password123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGci...",
  "userId": "cmla1p2e...",
  "emailVerified": true
}
```

### Test Dashboard Endpoint

```bash
# Replace TOKEN with the token from login response
curl http://localhost:3000/dashboard \
  -H "Authorization: Bearer TOKEN"
```

**Expected Response:**
```json
{
  "relationshipStage": "dating",
  "partnerLastCheckIn": {
    "mood_level": 5,
    "shared": true,
    "timestamp": "2026-02-05T22:45:50.058Z"
  },
  "recentActivity": [
    "Check-in on 2/5/2026",
    "Preferences updated on 2/5/2026"
  ]
}
```

### Test Ideas Endpoint

```bash
curl http://localhost:3000/ideas \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activityStyle": "active",
    "budgetLevel": "medium",
    "count": 5
  }'
```

---

## QA Testing Tools (Development Only)

### Reset Test Data

Reset all test data back to initial state:

```bash
curl -X POST http://localhost:3000/qa/reset \
  -H "QA-Admin-Token: dev-qa-admin-token" \
  -H "Content-Type: application/json"
```

### Reseed Test Data

Re-populate test data (E2E seed):

```bash
curl -X POST http://localhost:3000/qa/seed \
  -H "QA-Admin-Token: dev-qa-admin-token" \
  -H "Content-Type: application/json"
```

---

## Testing Best Practices

### For Visual/UI Testing

1. **Use two simulators for pairing tests**
   - iOS: Press `i` from Expo menu
   - Android: Press `a` from Expo menu

2. **Test on multiple screen sizes**
   - Test on iPhone (smaller) and iPad (larger) if available
   - Test on different Android devices

3. **Check responsive behavior**
   - Rotate device and verify layout adapts
   - Test with different text sizes

4. **Verify animations**
   - Tab transitions smooth
   - Modal opens/closes properly
   - Scroll performance is smooth

### For Database Testing

1. **Verify data persistence**
   - Create data, close app, reopen - data should persist
   - Check database directly via SQL if needed

2. **Test relationship constraints**
   - Ensure unpaired users can't access paired features
   - Verify relationship isolation (users see only own data)

3. **Test data updates**
   ```bash
   # View database state (if using PostgreSQL client)
   psql -U earlhickson -d withyou
   \d  # List tables
   SELECT * FROM users LIMIT 5;  # View sample data
   ```

### For Network Testing

1. **Offline scenarios**
   - Disable WiFi/Network and test graceful degradation
   - Verify offline messages about connectivity

2. **Slow network simulation**
   - Use Expo dev tools network throttling
   - Test loading states and spinners

3. **Error handling**
   - Test with invalid tokens
   - Test with expired sessions
   - Verify error messages are user-friendly

---

## Troubleshooting

### API Won't Start

```bash
# Check if port 3000 is already in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>

# Try starting again
npm run dev:api
```

### Mobile App Won't Connect to API

1. **Check API is running:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Verify network connectivity:**
   - Ensure mobile and API are on same network (for real devices)
   - For simulators, `localhost` typically works

3. **Check CORS configuration:**
   - API CORS is configured to allow `http://localhost:19006`
   - Check `.env.development` for `ALLOWED_ORIGINS`

### Database Connection Error

```bash
# Reset and resync database
cd /Users/earlhickson/Development/withyou/apps/api
NODE_ENV=development npx prisma db push --force-reset
npm run seed:e2e
```

### Linting Errors

```bash
# Check all linting
npm run lint

# View errors for specific file
npm run lint -- apps/api/src/routes/workouts.ts
```

---

## Test Data Browser

To visually inspect test data in the database:

```bash
# Open PostgreSQL client
psql -U earlhickson -d withyou

# View test users and data
SELECT id, email, "isTestUser", "testTag" FROM "User" WHERE "isTestUser" = true;

# View relationships
SELECT id, "userAId", "userBId", stage, status FROM "Relationship" LIMIT 10;

# View check-ins
SELECT id, "userId", "moodLevel", shared, "createdAt" FROM "Checkin" ORDER BY "createdAt" DESC LIMIT 5;
```

---

## Performance Benchmarks

Initial baseline measurements (as of 2026-02-05):

| Metric | Expected | Status |
|--------|----------|--------|
| API Health Check | <50ms | ✅ Confirmed |
| Dashboard Load | <500ms | ✅ Confirmed |
| Login Response | <200ms | ✅ Confirmed |
| Ideas Generation | <1s | ✅ Ready |
| Workout Sync | Realtime | ✅ Ready |
| Chat Messages | Realtime | ✅ Ready |

---

## Next Steps for Testing

1. **Functional Testing**
   - Work through each workflow systematically
   - Record any UI glitches or unexpected behavior
   - Note any error messages

2. **Performance Testing**
   - Monitor API response times
   - Check mobile app memory usage
   - Test with large datasets (multiple check-ins, ideas, etc.)

3. **Security Testing**
   - Verify JWT tokens expire properly
   - Test unauthorized access prevention
   - Confirm CORS restrictions work

4. **Cross-platform Testing**
   - Test on iOS simulator
   - Test on Android emulator
   - Test on web (if supported)

---

## Contact & Issues

- **API Status:** http://localhost:3000/health
- **Database:** withyou_dev (development)
- **Test Data Tag:** All QA accounts marked with `isTestUser: true` and `testTag: "e2e-test"`
- **Environment:** Development (NODE_ENV=development)

---

*Last Updated: February 5, 2026*
*All systems verified and tested successfully*
