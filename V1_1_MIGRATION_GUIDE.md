# WithYou v1.1 Migration Guide

This guide walks you through deploying v1.1 to production or a staging environment.

## Prerequisites

- Access to the database (PostgreSQL)
- API server deployment access
- Mobile app deployment access (if updating mobile)

## Step 1: Database Migration

The v1.1 update requires a database migration to add new fields and tables.

### Apply the Migration

**Development/Staging:**
```bash
cd apps/api
npx prisma migrate deploy
```

**Production (recommended steps):**

1. **Backup your database first:**
   ```bash
   pg_dump your_database > backup_before_v1_1.sql
   ```

2. **Review the migration:**
   ```bash
   cat prisma/migrations/20260113142756_add_mood_ring_v2_and_plans/migration.sql
   ```

   This migration:
   - Adds nullable `moodColor` and `emotionLabel` columns to `Checkin` table
   - Creates index on `(userId, createdAt)` for performance
   - Creates new `Plan` table with foreign keys

3. **Apply the migration:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Verify the migration:**
   ```bash
   npx prisma migrate status
   ```

### What Changes in the Database

- **Checkin table**: Two new nullable columns (`moodColor`, `emotionLabel`)
- **New index**: `Checkin_userId_createdAt_idx` for efficient today-queries
- **New table**: `Plan` with 16 columns for storing date plans

**Impact**: Zero downtime - all changes are additive and backwards compatible.

## Step 2: Deploy API Server

### Environment Variables

No new environment variables are required for v1.1.

### Deploy Process

1. **Build the API:**
   ```bash
   cd apps/api
   npm run build
   ```

2. **Deploy to your hosting platform** (Railway, Heroku, AWS, etc.):
   ```bash
   # Example for Railway
   railway up
   
   # Or your custom deployment process
   ```

3. **Verify deployment:**
   ```bash
   curl https://your-api-domain.com/health
   # Should return: {"status": "ok"}
   ```

### New Endpoints Available

After deployment, these endpoints are available:

- `POST /checkins/v2` - Create mood ring v2 check-in
- `GET /checkins/today` - Get today's check-ins with reveal logic
- `POST /plans` - Create a plan
- `GET /plans` - List all plans
- `POST /calendar/event` - Export plan to ICS calendar

**Original endpoints remain unchanged and fully functional.**

## Step 3: Deploy Mobile App (Optional)

The v1.1 changes are **optional on mobile**. The CheckInV2Screen is a new feature that users can adopt gradually.

### If You Want to Deploy v1.1 UI:

1. **Ensure dependencies are installed:**
   ```bash
   cd apps/mobile
   npm install
   ```

2. **Build for iOS:**
   ```bash
   eas build --platform ios
   ```

3. **Build for Android:**
   ```bash
   eas build --platform android
   ```

4. **Submit to stores** or distribute via TestFlight/internal testing.

### If You Want to Keep Current Mobile:

The API is backwards compatible. Users can continue using the v1 check-in UI, and the new v2 endpoints will wait until you're ready to deploy the mobile updates.

## Step 4: Verify v1.1 Features

### Test Check-in v2

```bash
# Create a check-in v2
curl -X POST https://your-api-domain.com/checkins/v2 \
  -H "Authorization: ******" \
  -H "Content-Type: application/json" \
  -d '{
    "moodColor": "blue",
    "emotionLabel": "calm",
    "energyLevel": "medium",
    "note": "Feeling good"
  }'

# Get today's check-ins
curl https://your-api-domain.com/checkins/today \
  -H "Authorization: ******"
```

### Test Plan Management

```bash
# Create a plan
curl -X POST https://your-api-domain.com/plans \
  -H "Authorization: ******" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dinner Date",
    "scheduledDate": "2026-01-20T19:00:00Z",
    "address": "123 Main St"
  }'

# List plans
curl https://your-api-domain.com/plans \
  -H "Authorization: ******"
```

### Test Calendar Export

```bash
# Export to calendar
curl -X POST https://your-api-domain.com/calendar/event \
  -H "Authorization: ******" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Date Night",
    "startDate": "2026-01-20T19:00:00Z",
    "endDate": "2026-01-20T21:00:00Z"
  }' \
  --output test-event.ics

# Verify ICS file
cat test-event.ics
```

## Step 5: Monitor

After deployment, monitor for:

1. **Error logs** - Watch for gradient generation failures or ICS export errors
2. **Database performance** - New index should improve check-in queries
3. **User adoption** - Track usage of v2 check-ins vs v1

### Key Metrics to Watch

- Check-in v2 creation rate
- Reveal logic success (both partners checking in same day)
- Plan creation rate
- Calendar export success rate

## Rollback Plan

If you need to rollback:

### Database Rollback

**⚠️ Warning**: Rolling back the database migration will **delete all v1.1 data** (mood ring v2 check-ins and plans).

```bash
cd apps/api
npx prisma migrate resolve --rolled-back 20260113142756_add_mood_ring_v2_and_plans
```

Then manually drop the columns and table:

```sql
ALTER TABLE "Checkin" DROP COLUMN "moodColor";
ALTER TABLE "Checkin" DROP COLUMN "emotionLabel";
DROP INDEX "Checkin_userId_createdAt_idx";
DROP TABLE "Plan";
```

### API Rollback

Simply redeploy the previous version of the API. Old check-ins will continue to work.

### Mobile Rollback

Redeploy the previous mobile build. Users will use v1 check-ins.

## Support

If you encounter issues:

1. Check logs for error details
2. Verify migration status: `npx prisma migrate status`
3. Test API endpoints manually with curl
4. Review [V1_1_IMPLEMENTATION_COMPLETE.md](./V1_1_IMPLEMENTATION_COMPLETE.md) for troubleshooting

## Next Steps After v1.1

Once v1.1 is stable, you can begin planning v1.2 features:

- Google Places API integration for nearby discovery
- Push notifications for check-in reminders
- Advanced planning UI with map view
- UI system hardening (theme centralization)

See [README.md](./README.md) for the v1.2 roadmap.

---

**Migration Difficulty**: Easy  
**Estimated Time**: 15-30 minutes  
**Downtime Required**: None  
**Data Loss Risk**: None (all changes are additive)
