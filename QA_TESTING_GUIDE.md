# Environment Separation & QA Testing Guide

## Overview

This document provides a comprehensive guide for testing the newly implemented environment separation, security hardening, and E2E QA infrastructure for the WithYou application.

## What Was Implemented

### 1. Environment Separation (dev/test/prod)

**Files Created:**
- `apps/api/.env.development` - Development environment configuration
- `apps/api/.env.test` - Test environment configuration  
- `apps/api/.env.example` - Template with all configuration options

**Files Modified:**
- `apps/api/src/config/env.ts` - Loads environment-specific .env files based on NODE_ENV
- `.gitignore` - Allows .env.development and .env.test while excluding .env.production

**Database Separation:**
- Development: `withyou_dev`
- Test: `withyou_test`
- Production: Separate hosted database

### 2. Prisma Schema Changes

**Migration:** `20260204152800_add_test_user_fields`

**User Model:**
- `isTestUser` (Boolean, default: false) - Marks users created for testing
- `testTag` (String?, nullable) - Groups test users by tag (e.g., "e2e-test")
- Index on `(isTestUser, testTag)` for efficient queries

**Relationship Model:**
- `isTest` (Boolean, default: false) - Marks test relationships
- Index on `isTest` for efficient queries

### 3. Seed Scripts

**seed-dev.ts** (Minimal development data):
- 2 users: dev1@example.com, dev2@example.com
- 1 active relationship
- 2 sample ideas
- Run with: `npm run seed:dev`

**seed-e2e.ts** (Deterministic QA data):
- **Couple A (Dating)**: qa_alex@example.com, qa_jordan@example.com
- **Couple B (Committed)**: qa_taylor@example.com, qa_casey@example.com
- **Unpaired**: qa_unpaired@example.com
- All with password: `password123`
- All tagged with: `testTag: "e2e-test"`, `isTestUser: true`
- Includes: check-ins, notes, saved ideas, preferences
- Run with: `npm run seed:e2e`

### 4. QA Endpoints (Dev/Test Only)

**POST /qa/reset**
- Wipes all data with `testTag: "e2e-test"` and `isTestUser: true`
- Requires `QA-Admin-Token` header
- Rate limited: 5 requests/hour
- Returns: `{ message, tag }`

**POST /qa/seed**
- Runs the E2E seed script to populate test data
- Requires `QA-Admin-Token` header
- Rate limited: 5 requests/hour
- Returns: `{ message, output }`

**Security:**
- Only available when `NODE_ENV=development` or `NODE_ENV=test`
- Returns 404 in production
- Requires `QA_ADMIN_TOKEN` from environment variables
- Path validation prevents directory traversal

### 5. Security Hardening

**Helmet.js:**
- Content Security Policy configured
- XSS protection enabled
- Other security headers set

**CORS:**
- Strict origin validation in production
- Configurable via `ALLOWED_ORIGINS` environment variable
- Generic error messages to avoid information leakage

**Rate Limiting:**
- General API: 100 requests/15 min
- Auth endpoints: 5 requests/15 min
- Invite endpoints: 10 requests/hour
- QA endpoints: 5 requests/hour
- Places endpoints: 30 requests/15 min (ready for future use)

**Relationship Verification Middleware:**
- Created at `src/middleware/relationship-verification.ts`
- Ready for routes that need explicit relationship access control
- Current routes already implement secure access patterns

## Testing Instructions

### Setup Test Environment

1. **Create test database:**
```bash
createdb withyou_test
```

2. **Apply migrations:**
```bash
cd apps/api
NODE_ENV=test npx dotenv -e .env.test -- npx prisma migrate dev
```

3. **Seed test data:**
```bash
npm run seed:e2e
```

### Test QA Endpoints

1. **Start server in test mode:**
```bash
NODE_ENV=test npm run dev
```

2. **Test /qa/reset:**
```bash
curl -X POST http://localhost:3001/qa/reset \
  -H "Content-Type: application/json" \
  -H "QA-Admin-Token: test-qa-admin-token"
```

Expected response:
```json
{
  "message": "Test data reset successfully",
  "tag": "e2e-test"
}
```

3. **Test /qa/seed:**
```bash
curl -X POST http://localhost:3001/qa/seed \
  -H "Content-Type: application/json" \
  -H "QA-Admin-Token: test-qa-admin-token"
```

Expected response:
```json
{
  "message": "E2E seed completed successfully",
  "output": "..."
}
```

4. **Test invalid token:**
```bash
curl -X POST http://localhost:3001/qa/reset \
  -H "Content-Type: application/json" \
  -H "QA-Admin-Token: wrong-token"
```

Expected: 401 Unauthorized

5. **Test rate limiting:**
```bash
for i in {1..10}; do
  curl -X POST http://localhost:3001/qa/reset \
    -H "QA-Admin-Token: test-qa-admin-token"
done
```

Expected: First 5 succeed, rest get rate limited

### Test Environment Separation

1. **Verify QA endpoints disabled in production:**
```bash
NODE_ENV=production npm run dev
curl http://localhost:3000/qa/reset
```

Expected: 404 Not Found

2. **Verify environment loading:**
```bash
# Check that development loads .env.development
NODE_ENV=development npm run dev
# Check logs show "QA endpoints enabled for development environment"

# Check that test loads .env.test
NODE_ENV=test npm run dev
# Check logs show "QA endpoints enabled for test environment"

# Check that production disables QA
NODE_ENV=production npm run dev
# Check logs show "QA endpoints disabled in production"
```

### Test Security Features

1. **Test CORS:**
```bash
# Should be rejected (not in ALLOWED_ORIGINS)
curl -X POST http://localhost:3000/auth/login \
  -H "Origin: https://evil.com" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

2. **Test Helmet headers:**
```bash
curl -I http://localhost:3000/health
```

Check for security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Content-Security-Policy: ...`

3. **Test rate limiting on different endpoints:**
```bash
# Auth rate limiting (5/15min)
for i in {1..10}; do
  curl http://localhost:3000/auth/login -d '{"email":"test","password":"test"}'
done

# General rate limiting (100/15min)
for i in {1..150}; do
  curl http://localhost:3000/health
done
```

### E2E Testing Workflow

Complete E2E test cycle:

```bash
# 1. Start test server
NODE_ENV=test npm run dev

# 2. Reset test data
curl -X POST http://localhost:3001/qa/reset \
  -H "QA-Admin-Token: test-qa-admin-token"

# 3. Seed fresh test data
curl -X POST http://localhost:3001/qa/seed \
  -H "QA-Admin-Token: test-qa-admin-token"

# 4. Run E2E tests (use test accounts)
# - qa_alex@example.com / password123
# - qa_jordan@example.com / password123
# - qa_taylor@example.com / password123
# - qa_casey@example.com / password123
# - qa_unpaired@example.com / password123

# 5. Clean up (optional)
curl -X POST http://localhost:3001/qa/reset \
  -H "QA-Admin-Token: test-qa-admin-token"
```

## Validation Checklist

- [x] Build succeeds without errors
- [x] Linting passes without warnings
- [x] TypeScript compilation succeeds
- [x] CodeQL security scan passes (0 alerts)
- [ ] QA endpoints work in dev/test
- [ ] QA endpoints return 404 in production
- [ ] Environment variables load correctly per environment
- [ ] Database migrations apply successfully
- [ ] Seed scripts run without errors
- [ ] Rate limiting works correctly
- [ ] CORS blocks unauthorized origins
- [ ] Helmet security headers are present
- [ ] Test accounts can log in and access data

## Security Summary

### Vulnerabilities Addressed

1. **Environment Separation**: Separate databases and configurations prevent test data from polluting production
2. **QA Endpoint Security**: Token authentication, rate limiting, and production disabling prevent abuse
3. **CORS Hardening**: Strict origin validation prevents unauthorized cross-origin requests
4. **Helmet Integration**: Sets secure HTTP headers to prevent common web vulnerabilities
5. **Rate Limiting**: Multiple tiers of rate limiting prevent abuse and DoS attacks
6. **Path Validation**: QA seed script path is validated to prevent directory traversal
7. **Generic Error Messages**: CORS errors don't leak origin information in production

### No Vulnerabilities Found

CodeQL security analysis found **0 alerts** across all modified and new code.

## Production Deployment Notes

Before deploying to production:

1. Create `.env.production` with production values (DO NOT commit)
2. Set `NODE_ENV=production` and `APP_ENV=production`
3. Use a strong random `JWT_SECRET` (32+ characters)
4. Configure `ALLOWED_ORIGINS` with actual production domains
5. Verify QA endpoints return 404 (test with curl)
6. Enable database SSL in production `DATABASE_URL`
7. Run migration with: `npx dotenv -e .env.production -- npx prisma migrate deploy`
8. Monitor rate limiting metrics and adjust thresholds if needed

## Troubleshooting

**Issue: Prisma migrate fails with "DATABASE_URL not found"**
Solution: Use dotenv-cli: `npx dotenv -e .env.development -- npx prisma migrate dev`

**Issue: QA endpoints return 404 in development**
Solution: Check that `NODE_ENV=development` or `APP_ENV=development` is set

**Issue: QA seed script fails**
Solution: Ensure seed-e2e.ts path is correct and readable, check logs for specific error

**Issue: Rate limiting too strict during testing**
Solution: Temporarily increase limits in `src/middleware/rate-limit.ts` for local testing

**Issue: CORS blocking legitimate requests**
Solution: Add origins to `ALLOWED_ORIGINS` in .env file (comma-separated)

## Next Steps

1. Update existing E2E test scripts to use new QA endpoints
2. Create automated tests for QA endpoints
3. Add monitoring/alerting for security events in production
4. Consider adding Places API integration (rate limiter already configured)
5. Document QA workflow for other team members
