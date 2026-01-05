# API Contract – WithYou

## Base URL
Production: `https://withyouapi-production.up.railway.app`

---

## Auth Endpoints
```
POST /auth/register
POST /auth/login
```

## Relationship Endpoints
```
POST /relationship/invite (auth)
POST /relationship/accept (auth)
POST /relationship/end (auth)
```

## Core Endpoints
```
GET /dashboard (auth)
POST /checkins (auth)
POST /preferences (auth)
GET /ideas?mode=reconnect|repair (auth)
```

## Stage 2 Endpoints
```
POST /weekly-reflection (auth)
GET /weekly-reflection/current (auth)
```

---

## Response Shape

### Success
```json
{
  "ok": true,
  "data": {}
}
```

### Error
```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR|AUTH_ERROR|NOT_FOUND",
    "message": "Human-readable message",
    "details": []
  }
}
```

### Auth Token
Returned on login/register:
```json
{
  "ok": true,
  "data": {
    "token": "eyJhbGc...",
    "user": { "id": "uuid", "email": "user@example.com" }
  }
}
```
