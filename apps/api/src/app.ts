import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import relationshipRouter from './routes/relationship.js';
import coreRouter from './routes/core.js';
import ideasRouter from './routes/ideas.js';
import activitiesRouter from './routes/activities.js';
import userRouter from './routes/user.js';
import plansRouter from './routes/plans.js';
import qaRouter from './routes/qa.js';
import workoutsRouter from './routes/workouts.js';
import groceryRouter from './routes/grocery.js';
import messagesRouter from './routes/messages.js';
import { errorHandler } from './middleware/error-handler.js';
import { generalLimiter, authLimiter, inviteLimiter, qaLimiter } from './middleware/rate-limit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const app = express();

// Security middleware - Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // In production, enforce strict origin checking
    if (env.isProduction() && env.allowedOrigins.length > 0) {
      if (env.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Generic error message to avoid leaking information
        callback(new Error('CORS policy violation'));
      }
    } else {
      // In dev/test, allow configured origins or all if none configured
      if (env.allowedOrigins.length === 0 || env.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'QA-Admin-Token'],
};

app.use(cors(corsOptions));

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

app.use('/workouts', workoutsRouter);

app.use('/grocery', groceryRouter);

app.use('/messages', messagesRouter);

app.use(coreRouter);

// QA routes (dev/test only)
if (env.isDevelopment() || env.isTest()) {
  app.use('/qa', qaLimiter);
  app.use(qaRouter);
  console.log('QA endpoints enabled for', env.appEnv, 'environment');
} else {
  console.log('QA endpoints disabled in production');
}

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

