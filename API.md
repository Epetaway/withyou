# WithYou API Reference

Base URL: `http://localhost:3000` (development) or `https://api.withyou.example.com` (production)

All requests should include:

```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>  # Required for protected endpoints
```

---

## Health

### Check API Health

```http
GET /health
```

**Response (200 OK)**:

```json
{
  "status": "ok"
}
```

---

## Authentication

### Register

Create a new account.

```http
POST /auth/register
```

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Validation**:

- `email`: Valid email format
- `password`: Minimum 8 characters, must match confirmPassword

**Response (200 OK)**:

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "createdAt": "2024-01-01T12:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800
}
```

**Error (400 Bad Request)**:

```json
{
  "error": {
    "code": "EMAIL_IN_USE",
    "message": "This email is already registered",
    "details": null
  }
}
```

### Login

Authenticate with email and password.

```http
POST /auth/login
```

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK)**:

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800
}
```

**Error (401 Unauthorized)**:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": null
  }
}
```

### Google Sign-In

Authenticate with Google OAuth.

```http
POST /auth/google
```

**Request Body**:

```json
{
  "provider": "google",
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..." 
}
```

**Response (200 OK)**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "isNewUser": true,
  "emailVerified": true
}
```

**Error (400 Bad Request)**:

```json
{
  "error": {
    "code": "EMAIL_CONFLICT",
    "message": "Email already registered with different sign-in method",
    "details": {
      "email": "This email is already registered. Please use your original sign-in method."
    }
  }
}
```

### Apple Sign-In

Authenticate with Apple ID.

```http
POST /auth/apple
```

**Request Body**:

```json
{
  "provider": "apple",
  "idToken": "eyJraWQiOiJlWGF1bm1MIiwiYWxnIjoiUlMyNTYifQ..."
}
```

**Response (200 OK)**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "isNewUser": false,
  "emailVerified": true
}
```

### Send Email Verification

Send a 6-digit verification code to the user's email.

```http
POST /auth/verify/send
```

**Auth Required**: Yes

**Request Body**: Empty JSON object

```json
{}
```

**Response (200 OK)**:

```json
{
  "message": "Verification code sent",
  "expiresAt": "2024-01-01T12:15:00Z"
}
```

**Error (429 Too Many Requests)**:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many verification requests. Please try again later.",
    "details": null
  }
}
```

**Rate Limit**: 3 requests per 15 minutes per user

### Confirm Email Verification

Verify the email with the 6-digit code.

```http
POST /auth/verify/confirm
```

**Auth Required**: Yes

**Request Body**:

```json
{
  "code": "123456"
}
```

**Response (200 OK)**:

```json
{
  "message": "Email verified successfully",
  "verified": true
}
```

**Error (400 Bad Request)**:

```json
{
  "error": {
    "code": "INVALID_CODE",
    "message": "Invalid or expired verification code",
    "details": null
  }
}
```

### Resend Email Verification

Resend the verification code.

```http
POST /auth/verify/resend
```

**Auth Required**: Yes

**Request Body**: Empty JSON object

```json
{}
```

**Response (200 OK)**:

```json
{
  "message": "Verification code sent",
  "expiresAt": "2024-01-01T12:15:00Z"
}
```

**Rate Limit**: Same as `/auth/verify/send` (3 per 15 minutes)

---

## User Profile

### Get Avatar Upload URL

Get a pre-signed URL for uploading an avatar directly to S3.

```http
GET /user/avatar/upload-url?fileType=image/jpeg&fileSize=102400
```

**Auth Required**: Yes

**Query Parameters**:
- `fileType`: MIME type (image/jpeg, image/png, image/webp)
- `fileSize`: File size in bytes (max 5MB)

**Response (200 OK)**:

```json
{
  "uploadUrl": "https://withyou-avatars.s3.amazonaws.com",
  "fields": {
    "key": "avatars/user-id/1234567890.jpg",
    "policy": "eyJleHBpcmF0aW9uIjo...",
    "signature": "abcd1234...",
    "x-amz-algorithm": "AWS4-HMAC-SHA256",
    "x-amz-credential": "...",
    "x-amz-date": "20240101T120000Z"
  },
  "avatarUrl": "https://cdn.withyou.app/avatars/user-id/1234567890.jpg"
}
```

**Usage**: Upload file using multipart/form-data POST to `uploadUrl` with the `fields` as form data, plus your file with key "file".

### Confirm Avatar Upload

Update the user's avatar URL after successful S3 upload.

```http
POST /user/avatar
```

**Auth Required**: Yes

**Request Body**:

```json
{
  "avatarUrl": "https://cdn.withyou.app/avatars/user-id/1234567890.jpg"
}
```

**Response (200 OK)**:

```json
{
  "avatarUrl": "https://cdn.withyou.app/avatars/user-id/1234567890.jpg"
}
```

### Complete Profile Setup

Mark profile setup as complete (saves setup preferences).

```http
POST /user/setup
```

**Auth Required**: Yes

**Request Body**:

```json
{
  "nickname": "Johnny",
  "anniversary": "2023-06-15T00:00:00Z",
  "goals": ["communication", "quality-time"],
  "privacySettings": {
    "shareLocation": true,
    "shareActivity": false
  },
  "notificationTimes": ["09:00", "21:00"]
}
```

All fields are optional.

**Response (200 OK)**:

```json
{
  "message": "Profile setup completed",
  "setupCompleted": true
}
```

---

## Relationship Pairing

### Generate Invite Code

Create a pairing invitation for your partner.

```http
POST /relationship/invite
```

**Auth Required**: Yes

**Request Body**: Empty JSON object

```json
{}
```

**Response (200 OK)**:

```json
{
  "code": "a1b2c3",
  "expiresAt": "2024-01-08T12:00:00Z",
  "deepLink": "https://withyou.app/join/a1b2c3"
}
```

**Error (400 Bad Request)**:

```json
{
  "error": {
    "code": "ALREADY_PAIRED",
    "message": "You are already paired with a partner",
    "details": null
  }
}
```

### Accept Invite

Join a partner's pairing invitation.

```http
POST /relationship/accept
```

**Auth Required**: Yes

**Request Body**:

```json
{
  "code": "a1b2c3"
}
```

**Response (200 OK)**:

```json
{
  "relationship": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "partnerId": "550e8400-e29b-41d4-a716-446655440002",
    "status": "active",
    "stage": "dating",
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

**Errors**:

- `INVALID_INVITE` (400): Code invalid
- `INVITE_EXPIRED` (400): Code expired (>7 days)
- `INVITE_USED` (400): Code already used
- `ALREADY_PAIRED` (400): You already have an active pairing

### End Relationship

End an active pairing (both partners notified).

```http
POST /relationship/end
```

**Auth Required**: Yes

**Request Body**: Empty JSON object

```json
{}
```

**Response (200 OK)**:

```json
{
  "status": "ended",
  "message": "Relationship has been ended"
}
```

**Error (400 Bad Request)**:

```json
{
  "error": {
    "code": "NO_PAIRING",
    "message": "You do not have an active pairing",
    "details": null
  }
}
```

---

## Core Features

### Get Dashboard

Fetch your relationship and partner status.

```http
GET /dashboard
```

**Auth Required**: Yes

**Response (200 OK)**:

```json
{
  "relationshipStage": "dating",
  "partnerLastCheckIn": {
    "mood_level": 4,
    "shared": true,
    "timestamp": "2024-01-01T10:30:00Z"
  },
  "recentActivity": [
    {
      "type": "checkin",
      "timestamp": "2024-01-01T10:30:00Z",
      "data": { "mood_level": 4 }
    },
    {
      "type": "preference_update",
      "timestamp": "2024-01-01T09:15:00Z",
      "data": { "activityStyle": "active" }
    }
  ]
}
```

**Response (200 OK, unpaired)**:

```json
{
  "relationshipStage": null,
  "partnerLastCheckIn": null,
  "recentActivity": []
}
```

### Create Check-in

Log a mood and optional note.

```http
POST /checkins
```

**Auth Required**: Yes

**Request Body**:

```json
{
  "mood_level": 4,
  "note": "Had a great day today!",
  "shared": true
}
```

**Validation**:

- `mood_level`: Integer 1-5
- `note`: Max 500 characters
- `shared`: Boolean (whether partner can see)

**Response (201 Created)**:

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440003",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "mood_level": 4,
  "note": "Had a great day today!",
  "shared": true,
  "createdAt": "2024-01-01T12:00:00Z"
}
```

### Create Check-in v2 ✨ NEW

Create a rich emotional check-in with mood color, emotion label, and energy level.

```http
POST /checkins/v2
```

**Auth Required**: Yes

**Request Body**:

```json
{
  "moodColor": "blue",
  "emotionLabel": "calm",
  "energyLevel": "medium",
  "note": "Feeling peaceful after a good weekend"
}
```

**Validation**:

- `moodColor`: "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink"
- `emotionLabel`: "happy" | "excited" | "calm" | "loved" | "tired" | "stressed" | "anxious" | "sad" | "frustrated" | "content"
- `energyLevel`: "low" | "medium" | "high"
- `note`: Optional, max 500 characters

**Response (200 OK)**:

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440003",
  "moodColor": "blue",
  "emotionLabel": "calm",
  "energyLevel": "medium",
  "note": "Feeling peaceful after a good weekend",
  "createdAt": "2024-01-01T12:00:00Z",
  "revealed": false
}
```

### Get Today's Check-ins ✨ NEW

Get today's check-ins with reveal logic. Partner's check-in is only visible after both have checked in.

```http
GET /checkins/today
```

**Auth Required**: Yes

**Response (200 OK)**:

When both partners have checked in:

```json
{
  "userCheckin": {
    "id": "770e8400-e29b-41d4-a716-446655440003",
    "moodColor": "blue",
    "emotionLabel": "calm",
    "energyLevel": "medium",
    "note": "Feeling peaceful",
    "createdAt": "2024-01-01T12:00:00Z",
    "revealed": true
  },
  "partnerCheckin": {
    "id": "880e8400-e29b-41d4-a716-446655440004",
    "moodColor": "yellow",
    "emotionLabel": "happy",
    "energyLevel": "high",
    "note": "Great day!",
    "createdAt": "2024-01-01T11:30:00Z",
    "revealed": true
  },
  "gradient": {
    "colors": ["blue", "yellow"],
    "insight": "Gentle contrast - balance and support each other",
    "tips": [
      "Find balance - one active, one restful activity",
      "Check in about what each of you needs"
    ]
  }
}
```

When only one partner has checked in:

```json
{
  "userCheckin": {
    "id": "770e8400-e29b-41d4-a716-446655440003",
    "moodColor": "blue",
    "emotionLabel": "calm",
    "energyLevel": "medium",
    "note": "Feeling peaceful",
    "createdAt": "2024-01-01T12:00:00Z",
    "revealed": false
  },
  "partnerCheckin": null,
  "gradient": null
}
```

### Set Preferences

Update your preferences (activity style, food, budget, energy).

```http
POST /preferences
```

**Auth Required**: Yes

**Request Body**:

```json
{
  "activityStyle": "active",
  "foodTypes": ["Italian", "Vegetarian", "Asian"],
  "budgetLevel": "medium",
  "energyLevel": 3
}
```

**Validation**:

- `activityStyle`: "chill" | "active" | "surprise"
- `foodTypes`: Array of types from [American, Italian, Mexican, Asian, Mediterranean, Vegetarian, Seafood, Dessert, Coffee and cafes]
- `budgetLevel`: "low" | "medium" | "high"
- `energyLevel`: Integer 1-5

**Response (200 OK)**:

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440004",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "activityStyle": "active",
  "foodTypes": ["Italian", "Vegetarian", "Asian"],
  "budgetLevel": "medium",
  "energyLevel": 3,
  "updatedAt": "2024-01-01T12:00:00Z"
}
```

### Get Ideas

Generate date ideas based on preferences.

```http
GET /ideas
```

**Auth Required**: Yes

**Query Parameters** (optional):

- `limit`: Max number of ideas to return (default: 5, max: 20)
- `style`: Override activity style ("chill" | "active" | "surprise")

**Response (200 OK)**:

```json
{
  "ideas": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440005",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Italian Cooking Class",
      "description": "Take a hands-on pasta-making class together",
      "category": "active",
      "suggestedBudget": "medium",
      "foodFocus": "Italian",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ],
  "generatedAt": "2024-01-01T12:00:00Z"
}
```

**Response (200 OK, no preferences set)**:

```json
{
  "ideas": [],
  "message": "Set preferences to get personalized ideas",
  "generatedAt": "2024-01-01T12:00:00Z"
}
```

---

## Error Codes Reference

| Code | HTTP | Meaning |
| --- | --- | --- |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `EMAIL_IN_USE` | 400 | Email already registered |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `ALREADY_PAIRED` | 400 | User already has active pairing |
| `INVALID_INVITE` | 400 | Invite code invalid |
| `INVITE_EXPIRED` | 400 | Invite expired (>7 days) |
| `INVITE_USED` | 400 | Invite already accepted |
| `NO_PAIRING` | 400 | No active pairing |
| `NOT_FOUND` | 404 | Endpoint not found |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting (Future)

Currently unlimited. Production deployment should implement:

- Auth endpoints: 5 requests/minute per IP
- Other endpoints: 100 requests/minute per user
- Invite generation: 1 per hour per user

---

## Examples

### Full Flow: Register → Pair → Check-in

```bash
# 1. Register User A
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123","confirmPassword":"password123"}'

# Save token from response
TOKEN_A="eyJ..."

# 2. Register User B
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"password456","confirmPassword":"password456"}'

TOKEN_B="eyJ..."

# 3. User A generates invite
curl -X POST http://localhost:3000/relationship/invite \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{}'

# Save code from response: CODE="a1b2c3"

# 4. User B accepts invite
curl -X POST http://localhost:3000/relationship/accept \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{"code":"a1b2c3"}'

# 5. User A sets preferences
curl -X POST http://localhost:3000/preferences \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"activityStyle":"active","foodTypes":["Italian"],"budgetLevel":"medium","energyLevel":4}'

# 6. User A creates check-in
curl -X POST http://localhost:3000/checkins \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"mood_level":4,"note":"Excited for date night!","shared":true}'

# 7. User A gets ideas
curl -X GET "http://localhost:3000/ideas" \
  -H "Authorization: Bearer $TOKEN_A"
```

---

## Plans ✨ NEW

Manage saved date plans with calendar export.

### Create Plan

Save a new date plan.

```http
POST /plans
```

**Auth Required**: Yes

**Request Body**:

```json
{
  "title": "Dinner at The Italian Place",
  "description": "Try their pasta special",
  "address": "123 Main St, Seattle, WA 98101",
  "placeId": "ChIJrTLr-GyuEmsRBfy61i59si0",
  "lat": 47.6062,
  "lng": -122.3321,
  "websiteUrl": "https://example.com",
  "phoneNumber": "(206) 555-1234",
  "priceLevel": 2,
  "scheduledDate": "2026-01-20T19:00:00Z",
  "notes": "Make reservation for 7pm"
}
```

**Validation**:

- `title`: Required, max 200 characters
- `description`: Optional, max 1000 characters
- `address`: Optional, max 500 characters
- `placeId`: Optional Google Places ID
- `lat`, `lng`: Optional coordinates
- `websiteUrl`: Optional valid URL
- `phoneNumber`: Optional, max 50 characters
- `priceLevel`: Optional integer 0-4
- `scheduledDate`: Optional ISO 8601 datetime
- `notes`: Optional, max 1000 characters
- `ideaId`: Optional reference to an Idea

**Response (200 OK)**:

```json
{
  "plan": {
    "id": "990e8400-e29b-41d4-a716-446655440005",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "relationshipId": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Dinner at The Italian Place",
    "description": "Try their pasta special",
    "address": "123 Main St, Seattle, WA 98101",
    "placeId": "ChIJrTLr-GyuEmsRBfy61i59si0",
    "lat": 47.6062,
    "lng": -122.3321,
    "websiteUrl": "https://example.com",
    "phoneNumber": "(206) 555-1234",
    "priceLevel": 2,
    "scheduledDate": "2026-01-20T19:00:00Z",
    "notes": "Make reservation for 7pm",
    "createdAt": "2026-01-13T14:00:00Z",
    "updatedAt": "2026-01-13T14:00:00Z"
  }
}
```

### List Plans

Get all saved plans for the current user/relationship.

```http
GET /plans
```

**Auth Required**: Yes

**Response (200 OK)**:

```json
{
  "plans": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440005",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "relationshipId": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Dinner at The Italian Place",
      "description": "Try their pasta special",
      "scheduledDate": "2026-01-20T19:00:00Z",
      "createdAt": "2026-01-13T14:00:00Z",
      "updatedAt": "2026-01-13T14:00:00Z"
    }
  ],
  "count": 1
}
```

### Export to Calendar

Generate a calendar event in ICS format for download.

```http
POST /calendar/event
```

**Auth Required**: Yes

**Request Body**:

```json
{
  "title": "Date Night - Italian Restaurant",
  "description": "Dinner at The Italian Place",
  "location": "123 Main St, Seattle, WA 98101",
  "startDate": "2026-01-20T19:00:00Z",
  "endDate": "2026-01-20T21:00:00Z",
  "allDay": false
}
```

**Validation**:

- `title`: Required, max 200 characters
- `description`: Optional, max 1000 characters
- `location`: Optional, max 500 characters
- `startDate`: Required ISO 8601 datetime
- `endDate`: Optional ISO 8601 datetime (defaults to 1 hour after start)
- `allDay`: Optional boolean (defaults to false)

**Response (200 OK)**:

Returns an `.ics` file download with `Content-Type: text/calendar`.

Compatible with:
- Google Calendar
- Apple Calendar
- Microsoft Outlook
- Most calendar applications

---

## Example Workflows (Updated)

See existing examples above, plus:

```bash
# Create a mood ring v2 check-in
curl -X POST http://localhost:3000/checkins/v2 \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"moodColor":"blue","emotionLabel":"calm","energyLevel":"medium","note":"Peaceful weekend"}'

# Get today's check-ins with gradient
curl -X GET http://localhost:3000/checkins/today \
  -H "Authorization: Bearer $TOKEN_A"

# Create a plan
curl -X POST http://localhost:3000/plans \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"title":"Dinner Date","scheduledDate":"2026-01-20T19:00:00Z","address":"123 Main St"}'

# Export to calendar
curl -X POST http://localhost:3000/calendar/event \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"title":"Date Night","startDate":"2026-01-20T19:00:00Z","endDate":"2026-01-20T21:00:00Z","location":"123 Main St"}' \
  --output date-night.ics
```
