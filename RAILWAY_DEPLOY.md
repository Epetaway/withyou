# Railway Deployment Guide

**Project ID:** `632c9cda-b560-4fd4-aa42-fe363b57ba7e`  
**Generated JWT Secret:** `206506b9aca36d89d8f3afcd9c634cba53956f6483d20724c65ab86763ee78ba`

---

## Step 1: Add PostgreSQL Database to Railway

1. Go to: https://railway.app/project/632c9cda-b560-4fd4-aa42-fe363b57ba7e
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Wait for provisioning (~30 seconds)
4. Click on the PostgreSQL service
5. Go to **"Variables"** tab
6. Copy the `DATABASE_URL` value (starts with `postgresql://`)

---

## Step 2: Connect GitHub Repository

1. In your Railway project dashboard
2. Click **"+ New"** → **"GitHub Repo"**
3. Authorize Railway to access your GitHub
4. Select: **`Epetaway/withyou`**
5. Railway will auto-detect Node.js and start deploying

---

## Step 3: Set Environment Variables

In your Railway service (the one connected to GitHub):

1. Click on the service → **"Variables"** tab
2. Add these variables:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=206506b9aca36d89d8f3afcd9c634cba53956f6483d20724c65ab86763ee78ba
NODE_ENV=production
PORT=3000
```

**Note:** The `${{Postgres.DATABASE_URL}}` will auto-link to your PostgreSQL database

3. Click **"Deploy"** to restart with new variables

---

## Step 4: Run Database Migration

After deployment succeeds:

1. Go to your service → **"Settings"** tab
2. Scroll to **"Service"** section
3. Click **"View Logs"**
4. Once you see "API listening on port 3000", go to **"Settings"** → **"Custom Start Command"**

**One-time migration setup:**

You have two options:

### Option A: Add to start command (recommended)
Change start command to:
```bash
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma && npm run start --workspace apps/api
```

### Option B: Use Railway CLI
Install Railway CLI locally:
```bash
npm install -g @railway/cli
railway login
railway link 632c9cda-b560-4fd4-aa42-fe363b57ba7e
railway run npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

---

## Step 5: Get Your API URL

1. In your Railway service dashboard
2. Go to **"Settings"** tab
3. Scroll to **"Domains"** section
4. Click **"Generate Domain"**
5. Railway will create a URL like: `withyou-production.up.railway.app`
6. **Copy this URL** - you'll need it for the mobile app

---

## Step 6: Verify Deployment

Test your API:
```bash
curl https://your-railway-domain.up.railway.app/health
```

Expected response:
```json
{"status":"healthy"}
```

---

## Step 7: Update Mobile App API URL

Once you have your Railway domain, update the mobile app:

**File:** `apps/mobile/src/api/client.ts`

Change from:
```typescript
const API_BASE_URL = 'http://localhost:3000';
```

To:
```typescript
const API_BASE_URL = 'https://your-railway-domain.up.railway.app';
```

Then commit:
```bash
git add apps/mobile/src/api/client.ts
git commit -m "Update API URL to Railway production"
git push origin main
```

---

## Troubleshooting

### Build fails?
- Check Railway logs for errors
- Verify `package.json` scripts exist: `build`, `start`
- Ensure `apps/api/tsconfig.json` is valid

### Database connection fails?
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running
- Ensure migration ran successfully

### Health check fails?
- Check logs: does it say "API listening on port 3000"?
- Verify environment variables are set
- Try redeploying

---

## Quick Reference

**Railway Project:** https://railway.app/project/632c9cda-b560-4fd4-aa42-fe363b57ba7e  
**JWT Secret:** `206506b9aca36d89d8f3afcd9c634cba53956f6483d20724c65ab86763ee78ba`  
**Beta Testers:** earlhicksonjr@gmail.com, kate.m.hickson@gmail.com

---

## Next Steps After Deployment

1. ✅ API deployed and healthy
2. ⏳ Update mobile app API URL
3. ⏳ Build mobile apps with EAS
4. ⏳ Test with beta users
