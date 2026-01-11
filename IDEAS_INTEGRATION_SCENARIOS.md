# Ideas Feature - Integration Test Scenarios

Detailed step-by-step test scenarios for validating the Ideas feature across all modes.

## Scenario 1: Complete User Journey - Local Mode

**Objective**: User discovers and saves a local activity idea

### Setup
- User: test1@example.com (token obtained from auth flow)
- Relationship: Active pairing with test2@example.com

### Steps
1. Navigate to Ideas tab
2. View Ideas home screen
3. Select "Local activities" section
4. Set radius to 10 miles
5. Select "Outdoors" filter
6. Tap "See local ideas"
7. Verify local ideas load with location data
8. Find "Sunset hiking at Eagle Peak"
9. Tap "Save" button
10. Verify "Saved" label appears
11. Navigate to "Saved ideas"
12. Verify saved idea appears in list

### Expected Results
- ✓ Local ideas query returns 3+ ideas
- ✓ Each idea has address and distance
- ✓ Save operation succeeds (HTTP 200)
- ✓ Saved ideas list shows the idea
- ✓ Unsave removes it from saved list

### API Calls Made
1. `POST /ideas/query` - Get local ideas
2. `POST /ideas/{id}/save` - Save idea
3. `GET /ideas/saved` - Get saved ideas
4. `DELETE /ideas/{id}/save` - Unsave idea

---

## Scenario 2: Complete User Journey - Food Mode

**Objective**: User finds recipes based on available ingredients

### Setup
- User: test1@example.com (authenticated)
- Fresh session

### Steps
1. Navigate to Ideas tab
2. View Ideas home screen
3. Tap "Food mode" button
4. See Food & Cooking screen
5. Enter ingredients: "eggs, pasta, tomatoes"
6. Tap "Get recipes"
7. Wait for recipes to load
8. Verify recipes display with cook time and difficulty
9. Select "Homemade Pasta Carbonara"
10. Tap "Open" to view full recipe
11. Tap "Save"
12. Verify save succeeds
13. Go back to Ideas home
14. Tap "Saved ideas"
15. Verify recipe is in saved list

### Expected Results
- ✓ Recipe endpoint accepts comma-separated ingredients
- ✓ Returns 3+ relevant recipes
- ✓ Each recipe shows cook time and difficulty
- ✓ Open link launches recipe URL
- ✓ Save/unsave works for recipes

### API Calls Made
1. `POST /ideas/recipes` - Get recipes
2. `POST /ideas/{id}/save` - Save recipe
3. `GET /ideas/saved` - Get saved ideas

---

## Scenario 3: Complete User Journey - Movie Mode

**Objective**: User finds a movie to watch together

### Setup
- User: test1@example.com (authenticated)
- Paired with another user

### Steps
1. Navigate to Ideas tab
2. View Ideas home screen
3. Tap "Movie mode" button
4. Screen loads with movie suggestions
5. Verify 3+ movies display
6. Check first movie has genre and provider
7. Tap "Open" on first movie
8. Verify movie link launches
9. Tap "Save" on second movie
10. Go to "Saved ideas"
11. Verify both saved movies appear
12. Tap unsave on one movie
13. Verify it removes from list

### Expected Results
- ✓ Movies load on screen enter
- ✓ Each movie shows genre, provider, title
- ✓ Movies can be saved/unsaved
- ✓ Deep link URLs are valid
- ✓ Save state persists across navigation

### API Calls Made
1. `GET /ideas/movies` - Get movies
2. `POST /ideas/{id}/save` - Save movie
3. `DELETE /ideas/{id}/save` - Unsave movie
4. `GET /ideas/saved` - Get saved ideas

---

## Scenario 4: Saved Ideas Management

**Objective**: User manages their collection of saved ideas

### Setup
- User: test1@example.com (authenticated)
- Pre-saved: 2 local ideas, 1 recipe, 1 movie

### Steps
1. Navigate to Ideas tab
2. Tap "Saved ideas"
3. View all 4 saved ideas
4. Tap unsave on local idea #1
5. Verify it disappears immediately
6. Verify count decreases to 3
7. Navigate away and back
8. Verify unsaved idea stays removed
9. Tap "Add to calendar" on recipe
10. Grant calendar permission (if needed)
11. Verify event created

### Expected Results
- ✓ All saved ideas display correctly
- ✓ Unsave removes item immediately
- ✓ Unsave persists across navigation
- ✓ Different idea types all appear
- ✓ Calendar integration (if implemented)

### API Calls Made
1. `GET /ideas/saved` - Get all saved ideas
2. `DELETE /ideas/{id}/save` - Remove from saved
3. (Calendar API if integrated)

---

## Scenario 5: Local Ideas with Filters

**Objective**: User refines local ideas by category

### Setup
- User: test1@example.com
- Location context: Denver, CO

### Steps
1. Navigate to Ideas > Local activities
2. Set radius to 5 miles
3. No filters selected initially
4. Tap "See local ideas"
5. Note ideas returned (e.g., 5 ideas)
6. Go back to filters
7. Select "Outdoors" only
8. Tap "See local ideas"
9. Verify filtered results (e.g., 2-3 outdoor ideas)
10. Go back and select "Entertainment" instead
11. Verify different filtered results
12. Go back and select both "Outdoors" + "Entertainment"
13. Verify combined results

### Expected Results
- ✓ No filters returns all ideas
- ✓ Single filter narrows results
- ✓ Multiple filters work as OR logic
- ✓ Results update without full reload
- ✓ Filter state persists until changed

### API Calls Made
1. `POST /ideas/query` (type=LOCAL, filters=[])
2. `POST /ideas/query` (type=LOCAL, filters=["outdoors"])
3. `POST /ideas/query` (type=LOCAL, filters=["entertainment"])
4. `POST /ideas/query` (type=LOCAL, filters=["outdoors","entertainment"])

---

## Scenario 6: Error Handling - Network Errors

**Objective**: App gracefully handles network/API errors

### Setup
- User: test1@example.com
- API temporarily unavailable or slow

### Steps
1. Navigate to Food mode
2. Enter ingredients
3. Tap "Get recipes"
4. Observe loading spinner for 3+ seconds
5. API times out or returns 500 error
6. Verify error message displays: "Couldn't load recipes"
7. Tap "Try again" button
8. Assume API is back up
9. Verify recipes load successfully

### Expected Results
- ✓ Loading state shows for 500ms+
- ✓ Error message is user-friendly
- ✓ Retry button is functional
- ✓ Original search inputs preserved
- ✓ No app crash or hang

### API Calls Made
1. `POST /ideas/recipes` - Gets timeout/error
2. `POST /ideas/recipes` - Retry succeeds

---

## Scenario 7: Authentication - Session Expiry

**Objective**: Verify app handles expired tokens

### Setup
- User: test1@example.com (authenticated, token expiring in 30 seconds)

### Steps
1. Navigate to Ideas > Food mode
2. Enter ingredients
3. Tap "Get recipes"
4. Wait for results to load
5. Save a recipe (while token still valid)
6. Wait 31+ seconds for token to expire
7. Navigate to Saved ideas
8. App detects expired token
9. Redirects to login screen
10. Log in again
11. Verify saved ideas still exist

### Expected Results
- ✓ Token refresh happens before timeout
- ✓ Seamless UX if still within session
- ✓ Clear auth error if token fully expired
- ✓ Saved data persists after re-auth
- ✓ User not forced to re-save ideas

---

## Scenario 8: Cross-User Isolation

**Objective**: Verify users cannot see each other's saved ideas

### Setup
- User 1: test1@example.com (token1)
- User 2: test2@example.com (token2)
- Both in same relationship

### Steps
1. **User 1**:
   - Save local idea A
   - Save recipe B
   - Get saved ideas → should see: [A, B]

2. **User 2**:
   - Get saved ideas → should see: [] (empty, no saves)
   - Save movie C
   - Get saved ideas → should see: [C]

3. **User 1**:
   - Get saved ideas → should still see: [A, B]
   - NOT see user 2's movie C

### Expected Results
- ✓ Each user only sees their own saves
- ✓ Saves don't appear in other user's list
- ✓ Save counts are per-user
- ✓ Database enforces user isolation

### API Calls Made
1. User1: `POST /ideas/{id}/save`
2. User2: `GET /ideas/saved` (empty)
3. User2: `POST /ideas/{id}/save`
4. User1: `GET /ideas/saved` (still just their owns)

---

## Scenario 9: Empty States

**Objective**: Verify UI handles empty data gracefully

### Setup
- User: test1@example.com (authenticated)
- User has NO saved ideas
- User searches for local ideas in unpopulated area

### Steps
1. Navigate to Ideas > Saved ideas
2. Verify empty state displays
3. Empty state shows: "No saved ideas"
4. Empty state shows helpful description
5. Tap "Refresh" button
6. Still empty (as expected)
7. Navigate to Local ideas
8. Set radius to 1 mile (probably no results)
9. Tap "See local ideas"
10. Verify empty state: "No nearby ideas yet"
11. Show suggestion to expand radius

### Expected Results
- ✓ Empty states are user-friendly
- ✓ Show helpful CTAs (Refresh, Try again, Expand filters)
- ✓ No loading spinner after initial load
- ✓ Clear distinction from loading state
- ✓ Consistent empty state messaging

---

## Scenario 10: Loading States

**Objective**: Verify loading indicators work correctly

### Setup
- User: test1@example.com
- Network: 3G throttle (slow network)

### Steps
1. Navigate to Local ideas
2. Tap "See local ideas"
3. Observe loading spinner appears
4. Wait 2-3 seconds
5. Loading spinner shows full duration
6. Results appear, spinner disappears
7. Navigate to Food mode
8. Enter ingredients, tap "Get recipes"
9. Skeleton loaders appear (3 placeholder cards)
10. After ~2 seconds, real recipes load
11. Verify no layout shift when content loads

### Expected Results
- ✓ Loading spinners appear immediately
- ✓ Skeleton loaders prevent layout shift
- ✓ Loading lasts appropriate duration (2-3s for slow network)
- ✓ Content appears smoothly
- ✓ User perceives snappy app

---

## Test Data Requirements

### Users
```
User 1:
- Email: test1@example.com
- Password: password123
- In relationship with User 2

User 2:
- Email: test2@example.com
- Password: password456
- In relationship with User 1
```

### Seeded Ideas
```
Local Ideas:
1. Sunset hiking at Eagle Peak (8.5 mi, Outdoors)
2. Coffee tasting at Brew Haven (2.3 mi, Food)
3. Rock climbing gym (3.1 mi, Entertainment)
4. Park picnic setup (5.2 mi, Outdoors)
5. Museum tour (4.8 mi, Entertainment)

Recipes:
1. Homemade Pasta Carbonara
2. Simple Tomato Soup
3. Grilled Salmon with Vegetables
4. Veggie Stir-fry Bowl
5. Chocolate Chip Cookies

Movies:
1. The Grand Budapest Hotel (Comedy/Drama)
2. Spirited Away (Animation)
3. Lost in Translation (Drama)
4. Knives Out (Mystery/Comedy)
5. Everything Everywhere All at Once (Sci-Fi/Comedy)
```

---

## Success Criteria

All scenarios pass if:
- ✅ No app crashes or hangs
- ✅ All API responses are valid JSON
- ✅ User data is properly isolated
- ✅ Loading/empty states display correctly
- ✅ Save/unsave operations persist
- ✅ Navigation flows smoothly
- ✅ Error messages are helpful
- ✅ All links open correctly
- ✅ Performance is acceptable (<3s load time)
- ✅ No lint/type errors in code
