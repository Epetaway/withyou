# WithYou Monorepo Development

## Quick Start

Install dependencies:
```bash
npm install
```

Run linting across all workspaces:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

## Workspace Structure

- **apps/api** - Express.js backend with Prisma ORM and PostgreSQL
- **apps/mobile** - Expo React Native frontend
- **packages/shared** - Shared types, schemas, and constants

## Development

### API

Set up your `.env` file with DATABASE_URL and JWT_SECRET:

```bash
cp .env.example .env
```

Then initialize the database:

```bash
npm run prisma:migrate --workspace @withyou/api
npm run prisma:generate --workspace @withyou/api
```

Start the dev server:

```bash
npm run dev:api
```

### Mobile

Full Expo setup coming in next phase.

## Git Workflow

Work is organized by phase with commits per phase:

- Phase 1: Tooling and monorepo setup
- Phase 2: API foundation (Express, health route, error handler)
- Phase 3: Database schema and shared types
- Phase 4: Auth endpoints (register, login)
- Phase 5+: Features
