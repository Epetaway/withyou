import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import relationshipRouter from './routes/relationship.js';
import coreRouter from './routes/core.js';
import ideasRouter from './routes/ideas.js';
import activitiesRouter from './routes/activities.js';
import userRouter from './routes/user.js';
import plansRouter from './routes/plans.js';
import { errorHandler } from './middleware/error-handler.js';
import { generalLimiter, authLimiter, inviteLimiter } from './middleware/rate-limit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const app = express();

app.use(express.json());

// Request logging
app.use(morgan('combined'));

// Serve landing page
const landingPagePath = path.join(__dirname, '../../..', 'docs/landing/index.html');
app.get('/', (req, res) => {
  res.sendFile(landingPagePath);
});

// General rate limiting
app.use(generalLimiter);

// Routes
app.use(healthRouter);

// Auth with stricter rate limiting
app.use('/auth', authLimiter);
app.use(authRouter);

// User routes
app.use(userRouter);

// Relationship routes with invite-specific rate limiting
app.use('/relationship/invite', inviteLimiter);
app.use(relationshipRouter);

app.use('/ideas', ideasRouter);

app.use(activitiesRouter);

app.use('/plans', plansRouter);

app.use(coreRouter);

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
      details: null,
    },
  });
});

app.use(errorHandler);

