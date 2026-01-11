# Ideas Feature E2E Tests

Comprehensive end-to-end test suite for the Ideas feature covering all four modes: Local, Food, Movie, and Saved Ideas.

## Test Environment Setup

### Prerequisites
- Node.js 18+
- API running on `http://localhost:3000`
- Database initialized and seeded

### Starting the API
```bash
cd apps/api
npm install
npm run dev
```

The API should be listening on port 3000 and health endpoint should respond:
```bash
curl http://localhost:3000/health
```

## Test Cases

### 1. Authentication & Authorization

#### Test: Local Ideas without Token
- **Endpoint**: `POST /ideas/query`
- **Method**: POST
- **Expected**: HTTP 401 (Unauthorized)
- **Validates**: Protected routes require authentication

#### Test: Save Idea without Token
- **Endpoint**: `POST /ideas/:id/save`
- **Method**: POST
- **Expected**: HTTP 401 (Unauthorized)
- **Validates**: Save endpoint requires authentication

### 2. Local Ideas Flow

#### Test: Query Local Ideas with Radius
- **Endpoint**: `POST /ideas/query`
- **Method**: POST
- **Payload**:
```json
{
  "type": "LOCAL",
  "radiusMiles": 10,
  "filters": []
}
```
- **Expected**: HTTP 200
- **Response contains**: Array of local activity ideas with metadata
- **Validates**: 
  - Query parameter parsing
  - Mock curated ideas return
  - Location-based filtering
  - Radius parameter handling

#### Test: Query Local Ideas with Filters
- **Endpoint**: `POST /ideas/query`
- **Payload**:
```json
{
  "type": "LOCAL",
  "radiusMiles": 15,
  "filters": ["outdoors", "entertainment"]
}
```
- **Expected**: HTTP 200
- **Response contains**: Filtered ideas matching selected categories
- **Validates**: Filter application in query logic

#### Test: Invalid Radius
- **Endpoint**: `POST /ideas/query`
- **Payload**:
```json
{
  "type": "LOCAL",
  "radiusMiles": -5,
  "filters": []
}
```
- **Expected**: HTTP 400 (Invalid request)
- **Validates**: Input validation for numeric constraints

### 3. Food Mode Flow

#### Test: Recipe Suggestions
- **Endpoint**: `POST /ideas/recipes`
- **Method**: POST
- **Payload**:
```json
{
  "ingredients": ["eggs", "pasta", "tomatoes"]
}
```
- **Expected**: HTTP 200
- **Response contains**: Array of recipe ideas
- **Each recipe includes**: title, description, metadata (timeMinutes, difficulty, recipeUrl)
- **Validates**:
  - Ingredient parsing
  - Mock recipe generation
  - Ingredient-to-recipe mapping

#### Test: Recipe with Single Ingredient
- **Endpoint**: `POST /ideas/recipes`
- **Payload**:
```json
{
  "ingredients": ["chicken"]
}
```
- **Expected**: HTTP 200
- **Validates**: Single ingredient handling

#### Test: Recipe with Empty Ingredients
- **Endpoint**: `POST /ideas/recipes`
- **Payload**:
```json
{
  "ingredients": []
}
```
- **Expected**: HTTP 400 (Validation error)
- **Validates**: Empty ingredients are rejected

#### Test: Recipe with Special Characters
- **Endpoint**: `POST /ideas/recipes`
- **Payload**:
```json
{
  "ingredients": ["crème brûlée", "café", "naïve"]
}
```
- **Expected**: HTTP 200
- **Validates**: UTF-8 ingredient handling

### 4. Movie Mode Flow

#### Test: Get Movie Suggestions
- **Endpoint**: `GET /ideas/movies`
- **Method**: GET
- **Expected**: HTTP 200
- **Response contains**: Array of movie/show ideas
- **Each movie includes**: title, description, genre, provider, deepLinkUrl
- **Validates**:
  - Mock movie data retrieval
  - Metadata completeness

### 5. Save & Unsave Ideas

#### Test: Save a Local Idea
- **Endpoint**: `POST /ideas/local-idea-id/save`
- **Method**: POST
- **Payload**:
```json
{
  "notes": "Let's try this hiking trail!"
}
```
- **Expected**: HTTP 200 or 201
- **Response contains**: Saved idea record with ID
- **Validates**:
  - Save functionality
  - Notes persistence
  - Relationship association

#### Test: Save a Recipe Idea
- **Endpoint**: `POST /ideas/recipe-pasta-101/save`
- **Method**: POST
- **Payload**:
```json
{
  "notes": "Perfect for date night"
}
```
- **Expected**: HTTP 200 or 201
- **Validates**: Multi-source idea saving

#### Test: Save without Notes
- **Endpoint**: `POST /ideas/idea-id/save`
- **Payload**:
```json
{
  "notes": null
}
```
- **Expected**: HTTP 200
- **Validates**: Optional notes field

#### Test: Unsave an Idea
- **Endpoint**: `DELETE /ideas/idea-id/save`
- **Method**: DELETE
- **Expected**: HTTP 200 or 204
- **Validates**:
  - Unsave/delete functionality
  - Removes idea from saved list

#### Test: Unsave Non-Existent Save
- **Endpoint**: `DELETE /ideas/non-existent-id/save`
- **Expected**: HTTP 404
- **Validates**: Error handling for missing records

### 6. Saved Ideas List

#### Test: Get All Saved Ideas
- **Endpoint**: `GET /ideas/saved`
- **Method**: GET
- **Expected**: HTTP 200
- **Response contains**: Array of all saved ideas for authenticated user
- **Validates**:
  - Saved ideas listing
  - User-scoped results
  - Pagination (if implemented)

#### Test: Empty Saved Ideas
- **Endpoint**: `GET /ideas/saved`
- **Before**: Clear all saved ideas for test user
- **Expected**: HTTP 200 with empty array
- **Validates**: Handles empty state correctly

#### Test: Saved Ideas after Save/Unsave Cycle
- **Steps**:
  1. Save 3 different ideas
  2. Unsave 1 idea
  3. Get saved ideas list
- **Expected**: HTTP 200 with exactly 2 ideas
- **Validates**: Save/unsave state consistency

### 7. Data Persistence

#### Test: Saved Ideas Persist Across Requests
- **Steps**:
  1. Save an idea
  2. Wait 1 second
  3. Get saved ideas list
  4. Verify saved idea is in list
- **Validates**: Database persistence

#### Test: Different Users' Saved Ideas Are Isolated
- **Steps**:
  1. User1 saves idea A
  2. User2 saves idea B
  3. User1 calls GET /ideas/saved
- **Expected**: User1 sees only idea A
- **Validates**: User data isolation

### 8. Error Handling

#### Test: Invalid JSON Payload
- **Endpoint**: `POST /ideas/recipes`
- **Payload**: `{invalid json}`
- **Expected**: HTTP 400
- **Validates**: JSON parsing error handling

#### Test: Missing Required Fields
- **Endpoint**: `POST /ideas/recipes`
- **Payload**: `{}`
- **Expected**: HTTP 400
- **Validates**: Required field validation

#### Test: Invalid Type Parameter
- **Endpoint**: `POST /ideas/query`
- **Payload**:
```json
{
  "type": "INVALID_TYPE",
  "radiusMiles": 10
}
```
- **Expected**: HTTP 400
- **Validates**: Enum validation

### 9. Performance & Analytics

#### Test: Request Logging
- After any POST /ideas/* call
- **Validates**: IdeaRequest record created in database
- **Recorded data**: userId, relationshipId, type, params

## Running the Tests

### Full Test Suite
```bash
bash test-e2e.sh
```

### Individual Test
```bash
# Example: Test local ideas
curl -X POST http://localhost:3000/ideas/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"type":"LOCAL","radiusMiles":10,"filters":[]}'
```

## Test Data

### Sample Local Ideas
- Sunset hiking at Eagle Peak (8.5 mi)
- Coffee tasting at Brew Haven (2.3 mi)
- Rock climbing gym session (3.1 mi)
- Park picnic setup (5.2 mi)

### Sample Recipes
- Homemade Pasta Carbonara
- Simple Tomato Soup
- Grilled Salmon with Vegetables
- Veggie Stir-fry Bowl

### Sample Movies
- The Grand Budapest Hotel
- Spirited Away
- Lost in Translation
- Knives Out

## Expected Responses

### Success Response (200)
```json
{
  "ideas": [
    {
      "id": "unique-idea-id",
      "type": "LOCAL",
      "title": "Sunset hiking at Eagle Peak",
      "description": "Beautiful 2-hour hike with panoramic views",
      "category": "Outdoor",
      "source": "CURATED",
      "metadata": {
        "address": "123 Mountain Road, Denver, CO",
        "lat": 39.7392,
        "lng": -104.9903,
        "distanceMiles": 8.5,
        "websiteUrl": "https://example.com",
        "placeId": "place_123"
      }
    }
  ]
}
```

### Save Response (201)
```json
{
  "id": "save_record_id",
  "ideaId": "idea_id",
  "notes": "Let's try this!",
  "createdAt": "2026-01-11T15:30:00Z"
}
```

### Error Response (400)
```json
{
  "error": "Validation error",
  "code": "INVALID_REQUEST",
  "details": [
    {
      "path": ["radiusMiles"],
      "message": "Number must be greater than 0"
    }
  ]
}
```

## Checklist for Manual Testing

- [ ] All four modes (Local, Food, Movie, Saved) are accessible
- [ ] Save button works on idea cards
- [ ] Unsave button appears on saved ideas
- [ ] Loading states display correctly
- [ ] Empty states appear when no ideas exist
- [ ] Error messages display on API failures
- [ ] Navigation between modes works smoothly
- [ ] Filters apply correctly to local ideas
- [ ] Recipe ingredients can be entered as comma/newline separated
- [ ] Saved ideas persist after app restart
- [ ] Different users don't see each other's saves

## Notes for Future Enhancements

1. **Real API Integration**: Replace mock data with actual AI/third-party API calls
2. **Filtering**: Implement actual filtering for local ideas by category
3. **Pagination**: Add pagination for large result sets
4. **Caching**: Cache frequently accessed ideas to reduce API calls
5. **User Preferences**: Save user filter preferences
6. **Analytics**: Track which types of ideas are saved/unsaved most
7. **Sharing**: Allow users to share ideas with their partner
8. **Calendar Integration**: Add ability to schedule ideas on device calendar
9. **Ratings**: Let users rate ideas they tried
10. **History**: Track which ideas users have explored
