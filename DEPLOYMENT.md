# WithYou Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL database
- GitHub account (for CI/CD)

## Local Development

### 1. Setup

Clone and install:

```bash
git clone https://github.com/Epetaway/withyou.git
cd withyou
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb withyou
```

Configure `.env` in the project root:

```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/withyou
JWT_SECRET=your-secret-key-change-in-production
```

Run migrations:

```bash
npm run prisma:migrate --workspace @withyou/api
npm run prisma:generate --workspace @withyou/api
```

### 3. Development

API:

```bash
npm run dev:api
```

Server starts on `http://localhost:3000`

Health check: `GET /health`

### 4. Production Deployment

#### API (Node.js on Heroku, Railway, or Render)

1. Build:

```bash
npm run build:api
```

2. Set environment variables on host:

```
PORT=3000
DATABASE_URL=<your-production-db-url>
JWT_SECRET=<strong-random-secret>
NODE_ENV=production
```

3. Start:

```bash
npm run start --workspace @withyou/api
```

#### Mobile (Expo)

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Configure:

```bash
cd apps/mobile
eas build --platform ios
eas build --platform android
```

3. Environment variables (`.env` in `apps/mobile`):

```
EXPO_PUBLIC_API_BASE_URL=https://api.withyou.example.com
```

## API Error Shape

All API errors follow this consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": null
  }
}
```

Common codes:

- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Missing/invalid JWT token
- `INVALID_CREDENTIALS`: Wrong email/password
- `EMAIL_IN_USE`: Email already registered
- `ALREADY_PAIRED`: User already has active pairing
- `INVALID_INVITE`: Invite code invalid/expired
- `NO_PAIRING`: No active pairing to end
- `NOT_FOUND`: Route not found

## Database Schema

See [prisma/schema.prisma](../apps/api/prisma/schema.prisma) for full schema.

Key tables:

- `User`: Account and authentication
- `Relationship`: Active pairings (one per user)
- `RelationshipInvite`: Pairing invitations with 7-day expiry
- `Checkin`: Mood check-ins (private or shared)
- `Preference`: User preferences for ideas
- `SavedIdea`: User-saved ideas from generation

## Testing

### Manual Testing

1. **Register**:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","confirmPassword":"password123"}'
```

2. **Login**:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

3. **Create invite** (with token):

```bash
curl -X POST http://localhost:3000/relationship/invite \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

4. **Dashboard**:

```bash
curl -X GET http://localhost:3000/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Monitoring

- Monitor database connections and query performance
- Set up error logging (Sentry, LogRocket)
- Track JWT token expiration
- Monitor invite code expiry cleanup

## Security Checklist

- [x] Passwords hashed with bcrypt
- [x] JWT tokens with 7-day expiry
- [x] All endpoints validate input (Zod)
- [x] Auth-protected endpoints require JWT
- [x] One active relationship per user enforced
- [x] Invite codes expire after 7 days
- [x] No user data leakage (preferences are private)
- [ ] HTTPS enforced in production
- [ ] CORS configured appropriately
- [ ] Rate limiting (implement in Phase 8+)
- [ ] Refresh tokens (v2 feature)

## Next Steps (v1.1+)

- Refresh tokens for better security
- Rate limiting on auth endpoints
- Email verification
- Password reset flow
- Notification system
- Activity logging
- Admin dashboard
