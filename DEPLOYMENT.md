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

Configure `.env` in `apps/api/.env`:

```env
# Database
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/withyou
JWT_SECRET=your-secret-key-change-in-production

# OAuth (Optional - for Google/Apple Sign-In)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=com.withyou.app
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# AWS SES (Optional - for email verification)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
SES_FROM_EMAIL=noreply@withyou.app

# AWS S3 (Optional - for avatar uploads)
S3_BUCKET_NAME=withyou-avatars
CLOUDFRONT_DOMAIN=cdn.withyou.app

# Deep Linking
APP_DEEP_LINK_DOMAIN=withyou.app
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
- [x] Email verification with rate limiting
- [x] OAuth support (Google/Apple)
- [ ] HTTPS enforced in production
- [ ] CORS configured appropriately
- [ ] Rate limiting on all endpoints
- [ ] Refresh tokens (v2 feature)

## AWS Services Setup

### AWS SES (Simple Email Service)

For email verification to work, configure AWS SES:

1. **Create an AWS Account** and navigate to SES

2. **Verify your sending domain** or email:
   ```bash
   # In SES Console:
   # 1. Go to "Verified identities"
   # 2. Click "Create identity"
   # 3. Choose "Domain" and enter withyou.app
   # 4. Add DNS records provided by AWS
   ```

3. **Move out of sandbox mode** (required for production):
   - Submit a request to AWS to move out of SES sandbox
   - This allows sending to any email address

4. **Create IAM credentials**:
   ```bash
   # Create IAM user with SES permissions
   # Attach policy: AmazonSESFullAccess
   # Generate access keys
   ```

5. **Configure environment variables**:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   SES_FROM_EMAIL=noreply@withyou.app
   ```

### AWS S3 + CloudFront (Avatar Storage)

For avatar uploads using pre-signed URLs:

1. **Create S3 Bucket**:
   ```bash
   # In S3 Console:
   # 1. Create bucket: withyou-avatars
   # 2. Region: us-east-1 (or your preferred region)
   # 3. Block all public access: ON
   # 4. Enable versioning: Optional
   ```

2. **Configure CORS**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["PUT", "POST"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

3. **Create CloudFront Distribution** (recommended):
   ```bash
   # In CloudFront Console:
   # 1. Create distribution
   # 2. Origin: withyou-avatars.s3.us-east-1.amazonaws.com
   # 3. Origin Access: Origin Access Control (OAC)
   # 4. Cache policy: CachingOptimized
   # 5. Copy distribution domain name
   ```

4. **Update S3 bucket policy** to allow CloudFront:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "AllowCloudFrontServicePrincipal",
         "Effect": "Allow",
         "Principal": {
           "Service": "cloudfront.amazonaws.com"
         },
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::withyou-avatars/*",
         "Condition": {
           "StringEquals": {
             "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
           }
         }
       }
     ]
   }
   ```

5. **Lifecycle policy** (optional - cleanup incomplete uploads):
   ```json
   {
     "Rules": [
       {
         "Id": "DeleteIncompleteMultipartUploads",
         "Status": "Enabled",
         "AbortIncompleteMultipartUpload": {
           "DaysAfterInitiation": 1
         }
       }
     ]
   }
   ```

6. **Configure environment variables**:
   ```env
   S3_BUCKET_NAME=withyou-avatars
   CLOUDFRONT_DOMAIN=d123456abcdefg.cloudfront.net
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   ```

### OAuth Configuration

#### Google Sign-In

1. **Create Google Cloud Project**:
   - Go to https://console.cloud.google.com
   - Create new project

2. **Enable Google Sign-In API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sign-In API"
   - Enable it

3. **Create OAuth credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Create OAuth client ID
   - Application type: Web application (for server) + iOS/Android (for mobile)
   - Authorized redirect URIs: Add your mobile app's redirect URI

4. **Configure environment variables**:
   ```env
   GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
   ```

#### Apple Sign-In

1. **Register App ID**:
   - Go to https://developer.apple.com/account
   - Identifiers > Register App ID
   - Enable "Sign In with Apple"

2. **Create Service ID**:
   - Identifiers > Register Services ID
   - Configure Sign In with Apple
   - Add domain: withyou.app
   - Add return URL: https://withyou.app/auth/apple/callback

3. **Create Key**:
   - Keys > Create a new key
   - Enable "Sign In with Apple"
   - Download .p8 file (only downloadable once!)

4. **Configure environment variables**:
   ```env
   APPLE_CLIENT_ID=com.withyou.app.service
   APPLE_TEAM_ID=ABCD123456
   APPLE_KEY_ID=XYZ9876543
   APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGT...\n-----END PRIVATE KEY-----"
   ```

## Next Steps (v1.1+)

- Refresh tokens for better security
- Rate limiting on all endpoints
- Password reset flow
- Push notifications
- Activity logging
- Admin dashboard
