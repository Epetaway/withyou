import express from 'express';
import morgan from 'morgan';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import relationshipRouter from './routes/relationship.js';
import coreRouter from './routes/core.js';
import { errorHandler } from './middleware/error-handler.js';
import { generalLimiter, authLimiter, inviteLimiter } from './middleware/rate-limit.js';

export const app = express();

app.use(express.json());

// Request logging
app.use(morgan('combined'));

// General rate limiting
app.use(generalLimiter);

// Routes
app.use(healthRouter);

// Auth with stricter rate limiting
app.use('/auth', authLimiter);
app.use(authRouter);

// Relationship routes with invite-specific rate limiting
app.use('/relationship/invite', inviteLimiter);
app.use(relationshipRouter);

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

