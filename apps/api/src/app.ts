import express from 'express';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import relationshipRouter from './routes/relationship.js';
import coreRouter from './routes/core.js';
import { errorHandler } from './middleware/error-handler.js';

export const app = express();

app.use(express.json());

app.use(healthRouter);
app.use(authRouter);
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
