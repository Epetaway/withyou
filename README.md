# WithYou

**[View Landing Page](./docs/landing/index.html)** | **[Beta Checklist](./BETA_CHECKLIST.md)** | **[API Docs](./API.md)** | **[v1.1 Summary](./V1_1_IMPLEMENTATION_SUMMARY.md)**

WithYou is a private, mobile-first application designed to help couples communicate needs and plan intentional connection time without pressure, surveillance, or judgment.

Built as a **beta-ready v1** to demonstrate full-stack product engineering, WithYou focuses on:

- **Consent-Based Pairing**: Invite codes ensure both partners opt-in
- **Indirect Communication**: Check-ins and preferences replace direct pressure
- **Privacy-First**: Data is encrypted, never shared or monetized
- **Intentional Connection**: Ideas generated from preferences, not algorithms

## ✅ Project Status: v1.1 - Enhanced Check-ins + Planning

**New in v1.1**:
- 🎨 **Mood Ring v2 Check-ins**: Rich emotional check-ins with color, emotion labels, and energy levels
- 🤝 **Reveal Logic**: Partner moods visible only after both check in
- 🌈 **Mood Gradients**: Visual blend of both moods with contextual insights and tips
- 📅 **Plan Management**: Save date plans with calendar export (ICS format)
- 🔒 **Enhanced Pairing UX**: Clearer messaging for one-relationship-per-user rule

See **[V1_1_IMPLEMENTATION_SUMMARY.md](./V1_1_IMPLEMENTATION_SUMMARY.md)** for full v1.1 feature details.

All v1.0 core features remain:
- ✅ Database schema and migrations
- ✅ Mobile frontend (8+ screens across 3 flows)
- ✅ Backend API (6 route groups, 15+ endpoints)
- ✅ Authentication and authorization
- ✅ Rate limiting and logging
- ✅ E2E testing and CI/CD
- ✅ Comprehensive documentation

See **[BETA_CHECKLIST.md](./BETA_CHECKLIST.md)** for complete implementation details and readiness assessment.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (running locally or remotely)
- Git

### Environment Setup

The project supports three environments: **development**, **test**, and **production**.

#### 1. Clone and Install Dependencies

```bash
git clone https://github.com/Epetaway/withyou.git
cd withyou
npm install
```

#### 2. Database Setup

Create separate databases for each environment:

```bash
# Development database
createdb withyou_dev

# Test database (for E2E testing)
createdb withyou_test

# Production uses separate hosted database
```

#### 3. Environment Configuration

Copy the example environment file and configure for your environment:

```bash
cd apps/api
cp .env.example .env.development
```

Edit `.env.development` with your local database credentials:

```env
NODE_ENV=development
APP_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/withyou_dev"
JWT_SECRET="your-dev-secret-key"
QA_ADMIN_TOKEN="your-qa-admin-token"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:19006"
```

For **test** environment, create `.env.test`:

```bash
cp .env.example .env.test
```

And update the DATABASE_URL to use `withyou_test`.

For **production**, create `.env.production` (not committed to git) with production credentials.

#### 4. Apply Database Migrations

```bash
# Development (use migrate dev for interactive migration)
cd apps/api
NODE_ENV=development npx dotenv -e .env.development -- npx prisma migrate dev

# Test
NODE_ENV=test npx dotenv -e .env.test -- npx prisma migrate dev

# Production (use migrate deploy for non-interactive deployment)
NODE_ENV=production npx dotenv -e .env.production -- npx prisma migrate deploy
```

#### 5. Seed Database

**Development** (minimal data):
```bash
npm run seed:dev
```

**E2E Testing** (QA test couples):
```bash
npm run seed:e2e
```

**Legacy seed** (comprehensive test data):
```bash
npm run prisma:seed
```

### API Server

```bash
# Development mode (with hot reload)
npm run dev:api  # Starts on http://localhost:3000

# Production mode
npm run build:api
npm run start --workspace apps/api
```

### Mobile App

```bash
npm run dev:mobile -- --ios  # or --android
```

## QA and E2E Testing

### QA Test Accounts

After running `npm run seed:e2e`, the following test accounts are available:

**Couple A (Dating)**:
- `qa_alex@example.com` / `password123`
- `qa_jordan@example.com` / `password123`

**Couple B (Committed)**:
- `qa_taylor@example.com` / `password123`
- `qa_casey@example.com` / `password123`

**Unpaired**:
- `qa_unpaired@example.com` / `password123`

All QA accounts are tagged with `testTag: "e2e-test"` and `isTestUser: true`.

### QA Endpoints (Dev/Test Only)

The API provides special QA endpoints for E2E testing automation. **These endpoints are only available in development and test environments.**

#### POST /qa/reset

Wipes all test-tagged data (users with `testTag: "e2e-test"`).

```bash
curl -X POST http://localhost:3000/qa/reset \
  -H "Content-Type: application/json" \
  -H "QA-Admin-Token: your-qa-admin-token"
```

#### POST /qa/seed

Runs the E2E seed script to populate test data.

```bash
curl -X POST http://localhost:3000/qa/seed \
  -H "Content-Type: application/json" \
  -H "QA-Admin-Token: your-qa-admin-token"
```

**Rate Limiting**: QA endpoints have strict rate limiting (5 requests/hour).

### E2E Testing Workflow

```bash
# 1. Reset test data
curl -X POST http://localhost:3000/qa/reset -H "QA-Admin-Token: your-token"

# 2. Seed fresh test data
curl -X POST http://localhost:3000/qa/seed -H "QA-Admin-Token: your-token"

# 3. Run E2E tests
./test-e2e.sh

# 4. Clean up (optional)
curl -X POST http://localhost:3000/qa/reset -H "QA-Admin-Token: your-token"
```

## Documentation

- **[BETA_CHECKLIST.md](./BETA_CHECKLIST.md)**: Implementation status, known limitations, v2 roadmap
- **[API Reference](./API.md)**: Complete endpoint documentation with examples
- **[TESTING.md](./TESTING.md)**: E2E testing guide, manual testing procedures, debugging
- **[Deployment Guide](./DEPLOYMENT.md)**: Production setup and environment configuration
- **[Expo Setup](./EXPO_SETUP.md)**: Mobile development environment and testing
- **[Development Guide](./DEVELOPMENT.md)**: Monorepo structure and workflow
- **[Privacy Policy](./docs/PRIVACY.md)**: How we collect, use, and protect your data
- **[Terms of Service](./docs/TERMS.md)**: User agreement and acceptable use policy

## Architecture

```
withyou/
├── apps/
│   ├── api/           # Express.js backend
│   └── mobile/        # Expo/React Native app
├── packages/
│   └── shared/        # Shared types, schemas, content
└── docs/
```

## Tech Stack

**Backend**: Express.js, Node.js, PostgreSQL, Prisma ORM

**Frontend**: Expo, React Native, TypeScript, @react-navigation

**Auth**: JWT tokens (7-day expiry), bcrypt password hashing, OAuth (Google/Apple)

**Email**: AWS SES for verification emails

**Storage**: AWS S3 + CloudFront for avatar images

**Validation**: Zod schemas for runtime type safety

**Security**: Helmet.js, CORS, rate limiting, relationship-scoped access control

## Security

### Environment Separation

The application enforces strict environment separation:

- **Development** (`.env.development`): Local development with relaxed security
- **Test** (`.env.test`): Isolated test database with QA endpoints enabled
- **Production** (`.env.production`): Hardened security, QA endpoints disabled

### Security Features

1. **Helmet.js**: Sets secure HTTP headers (CSP, XSS protection, etc.)
2. **CORS**: Strict origin validation (configurable via `ALLOWED_ORIGINS`)
3. **Rate Limiting**:
   - General API: 100 requests/15 min
   - Auth endpoints: 5 requests/15 min
   - Invite endpoints: 10 requests/hour
   - QA endpoints: 5 requests/hour (dev/test only)
   - Places endpoints: 30 requests/15 min
4. **Relationship Verification**: Middleware ensures users can only access their own relationship data
5. **JWT Validation**: All protected routes require valid JWT tokens
6. **Password Hashing**: bcrypt with 10 rounds
7. **Input Validation**: Zod schemas validate all API inputs

### QA Endpoint Security

QA endpoints (`/qa/reset`, `/qa/seed`) are:
- **Disabled in production** (environment check)
- **Token-protected** (`QA_ADMIN_TOKEN` header required)
- **Rate-limited** (5 requests/hour)
- **Scoped to test data** (only affects records with `isTestUser: true`)

### Production Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production` and `APP_ENV=production`
- [ ] Use a strong random `JWT_SECRET` (32+ characters)
- [ ] Configure `ALLOWED_ORIGINS` with actual production domains
- [ ] Never commit `.env.production` to version control
- [ ] Verify QA endpoints return 404 in production
- [ ] Enable database SSL in production `DATABASE_URL`
- [ ] Set up monitoring and alerting for security events
- [ ] Review all rate limiting thresholds for production traffic

## Core Features

### Authentication

- Email/password registration with verification
- **OAuth Sign-In**: Google and Apple Sign-In support
- **Email Verification**: 6-digit code sent via AWS SES
- Secure JWT-based sessions (7-day expiry)
- Password hashing with bcrypt

### Relationship Pairing

- **Deep Linking**: Share invitation links (`https://withyou.app/join/CODE`)
- Invite code generation (6-character hex, 7-day expiry)
- Mutual consent required to pair
- One active relationship per user
- Relationship ending with mutual acknowledgment

### User Profile

- **Avatar Upload**: Direct-to-S3 uploads using pre-signed URLs
- **Profile Setup Wizard**: Optional 4-step onboarding
  - Step 1: Nickname
  - Step 2: Relationship goals
  - Step 3: Privacy settings
  - Step 4: Notification preferences
- All setup steps can be skipped

### Connection Tools

- **Check-ins v2** ✨: Rich emotional check-ins with:
  - Mood color selection (7 colors)
  - Emotion label (10 emotions)
  - Energy level (low/medium/high)
  - Optional note
  - Reveal logic (partner mood shown only after both check in)
  - Mood gradient with insights and actionable tips
- **Check-ins v1**: Original 1-5 mood scale (still supported)
- **Preferences**: Activity style (chill/active/surprise), food types, budget, energy level
- **Ideas**: AI-generated date suggestions based on preferences and context
- **Plans** ✨: Save and organize date plans with:
  - Title, description, location details
  - Calendar export (ICS format)
  - Scheduled dates
- **Dashboard**: Real-time view of partner status and recent activity

## Development

### Environment Setup

1. Install Node.js 18+
2. Install PostgreSQL locally or use a cloud instance
3. Clone the repository
4. Install dependencies: `npm install`
5. Create `.env` file in `apps/api/.env` and configure:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/withyou"
   PORT=3000
   JWT_SECRET="your-secret-key"
   
   # Optional: OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   APPLE_CLIENT_ID="com.withyou.app"
   
   # Optional: AWS for email/avatars
   AWS_REGION="us-east-1"
   AWS_ACCESS_KEY_ID="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-key"
   S3_BUCKET_NAME="withyou-avatars"
   SES_FROM_EMAIL="noreply@withyou.app"
   ```
6. Run migrations: `npx prisma migrate deploy --workspace @withyou/api`
7. Seed test data: `npm run prisma:seed --workspace @withyou/api`

### Development Scripts

```bash
npm run lint              # Lint all workspaces
npm run format            # Format with Prettier
npm run type-check        # TypeScript type checking
npm run dev:api           # Start API dev server (watches for changes)
npm run dev:mobile        # Start Expo development server
npm run build:api         # Build API for production
npm run test              # Run test suite
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio (visual DB explorer)
npm run prisma:seed       # Seed database with test data
```

### Testing

```bash
# E2E testing
bash test-e2e.sh              # Run all E2E tests
bash test-e2e.sh register     # Run specific test group

# See TESTING.md for detailed testing guide
```

### Project Structure

```
withyou/
├── apps/
│   ├── api/                 # Express.js backend
│   │   ├── src/
│   │   │   ├── routes/      # API endpoint definitions
│   │   │   ├── middleware/  # Auth, rate limiting, error handling
│   │   │   ├── app.ts       # Express app configuration
│   │   │   └── index.ts     # Server entry point
│   │   └── prisma/          # Database schema
│   │
│   └── mobile/              # Expo/React Native frontend
│       ├── src/
│       │   ├── screens/     # UI screens for app flows
│       │   ├── navigation/  # React Navigation setup
│       │   ├── lib/         # Utilities (API client, hooks)
│       │   └── ui/          # Shared UI components
│       └── app.json         # Expo configuration
│
├── packages/
│   └── shared/              # Shared code (types, schemas, content)
│       ├── src/
│       │   ├── types/       # TypeScript type definitions
│       │   ├── schemas.ts   # Zod validation schemas
│       │   └── content.ts   # UI text content
│       └── index.ts         # Package exports
│
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI/CD pipeline
│
├── BETA_CHECKLIST.md        # Implementation checklist & readiness status
├── TESTING.md               # Testing guide and procedures
├── API.md                   # API documentation
└── README.md                # This file
```

## Security

- **Passwords**: Never stored in plaintext (bcrypt with salt rounds: 10)
- **Sessions**: JWT tokens expire after 7 days, stored in secure storage
- **Input Validation**: All endpoints validate input with Zod schemas
- **Authorization**: Auth-protected endpoints require valid JWT in Authorization header
- **Invite Codes**: Cryptographically random (6-char hex), expire after 7 days
- **Rate Limiting**: 
  - General: 100 requests per 15 minutes
  - Auth: 5 attempts per 15 minutes
  - Invites: 10 invites per hour
- **Data Privacy**: User data is private by default, never shared or monetized
- **CORS**: Configured for development; must be restricted in production

### Security Recommendations for Production

- Enable HTTPS only
- Use environment-specific secrets manager (AWS Secrets Manager, HashiCorp Vault)
- Enable database encryption at rest
- Set up WAF (AWS WAF, Cloudflare)
- Regular security audits and penetration testing
- Monitor and log all authentication attempts
- Implement CSRF protection for web dashboard
- Set appropriate CORS origins for production domain

## Roadmap (v1.2+)

### Completed in v1.1 ✅
- ✅ Mood Ring v2 check-ins (color, emotion, energy)
- ✅ Check-in reveal logic (both partners must check in)
- ✅ Mood gradient visualizations with insights
- ✅ Plan management with calendar export
- ✅ Enhanced pairing integrity UX

### Known Limitations (v1.1)
- Logout does not immediately reset app state (workaround: force restart)
- No offline mode (requires internet connection)
- No push notifications for partner activity
- No nearby discovery (Google Places API integration pending)
- No video/audio calling support
- Limited analytics and insights

### Planned Features (v1.2)
- [ ] Google Places API integration for nearby discovery
- [ ] Advanced filters (budget, distance, kid-friendly, indoor/outdoor)
- [ ] Map view for local activities
- [ ] Push notifications (daily check-in reminders, partner activity)
- [ ] Native calendar integration (iOS/Android)
- [ ] UI system hardening (theme centralization, dark mode fixes)

### Planned Features (v2.0)
- [ ] Refresh tokens for better session security
- [ ] Activity history and insights dashboard
- [ ] Admin dashboard for support
- [ ] Offline support with local persistence
- [ ] Video calling integration (Twilio/Daily)
- [ ] Avatar/profile pictures support
- [ ] Advanced relationship insights
- [ ] Calendar integration
- [ ] Custom date templates

See **[BETA_CHECKLIST.md](./BETA_CHECKLIST.md#v2-roadmap)** for detailed v2 feature list.

## GitHub

https://github.com/Epetaway/withyou

## Support & Feedback

For bugs, feature requests, or questions:
1. Check **[BETA_CHECKLIST.md](./BETA_CHECKLIST.md)** for known issues
2. See **[TESTING.md](./TESTING.md)** for debugging tips
3. Open an issue on GitHub

## Contributors

- **Earl Hickson** - Initial design and implementation

## License

MIT - See LICENSE file for details

---

**Project Status**: ✅ Beta v1 - Feature Complete  
**Last Updated**: January 2025  
**Next Release**: v1.0 (production deployment)

For detailed implementation status, see **[BETA_CHECKLIST.md](./BETA_CHECKLIST.md)**.
