# WithYou

WithYou is a private, mobile-first application designed to help couples communicate needs and plan intentional connection time without pressure, surveillance, or judgment.

Built as a beta-ready v1 to demonstrate full-stack product engineering, WithYou focuses on:

- **Consent-Based Pairing**: Invite codes ensure both partners opt-in
- **Indirect Communication**: Check-ins and preferences replace direct pressure
- **Privacy-First**: Data is encrypted, never shared or monetized
- **Intentional Connection**: Ideas generated from preferences, not algorithms

## Quick Start

### API Server

```bash
npm install
npm run dev:api  # Starts on http://localhost:3000
```

### Mobile App

```bash
npm run dev:mobile -- --ios  # or --android
```

## Documentation

- **[API Reference](./API.md)**: Complete endpoint documentation with examples
- **[Deployment Guide](./DEPLOYMENT.md)**: Production setup and environment configuration
- **[Expo Setup](./EXPO_SETUP.md)**: Mobile development environment and testing
- **[Development Guide](./DEVELOPMENT.md)**: Monorepo structure and workflow

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

**Auth**: JWT tokens (7-day expiry), bcrypt password hashing

**Validation**: Zod schemas for runtime type safety

## Core Features

### Authentication

- Email/password registration with confirmation
- Secure JWT-based sessions
- Password hashing with bcrypt

### Relationship Pairing

- Invite code generation (6-character hex, 7-day expiry)
- Mutual consent required to pair
- One active relationship per user
- Relationship ending with mutual acknowledgment

### Connection Tools

- **Check-ins**: Log daily mood (1-5) with optional shared note
- **Preferences**: Activity style (chill/active/surprise), food types, budget, energy level
- **Ideas**: AI-generated date suggestions based on preferences and context
- **Dashboard**: Real-time view of partner status and recent activity

## Development

### Environment Setup

1. Install Node.js 18+
2. Copy `.env.example` to `.env`
3. Configure PostgreSQL database URL
4. Run `npm install` in root

### Scripts

```bash
npm run lint              # Lint all workspaces
npm run format            # Format with Prettier
npm run dev:api           # Start API dev server
npm run dev:mobile        # Start Expo
npm run build:api         # Build API for production
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio
```

## Security

- Passwords never stored in plaintext (bcrypt)
- JWTs expire after 7 days (refresh token planned for v1.1)
- All endpoints validate input with Zod
- Auth-protected endpoints require valid JWT
- Invite codes expire after 7 days
- User data is private by default

## Roadmap (v1.1+)

- [ ] Refresh tokens for better session security
- [ ] Email verification and password reset
- [ ] Push notifications for partner activity
- [ ] Activity history and insights
- [ ] Admin dashboard for support
- [ ] Rate limiting on auth endpoints
- [ ] Offline support with sync

## GitHub

https://github.com/Epetaway/withyou

## License

MIT

---

**Built by**: Earl Hickson  
**Created**: January 2024  
**Status**: Beta v1.0 - Production Ready
