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
  "link": "https://withyou.app/invite/a1b2c3"
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
