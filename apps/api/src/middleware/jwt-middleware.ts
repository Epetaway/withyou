import type { NextFunction, Response } from 'express';
import type { Request } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { AppError } from '../errors/app-error.js';
import { env } from '../config/env.js';

// Type for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    claims?: JwtPayload;
    token: string;
  };
}

// Stub implementation: validates presence of a bearer token and decodes it without enforcing auth.
// Full verification and user lookup will be added in the auth phase.
export const jwtMiddleware = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Missing bearer token', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.substring('Bearer '.length).trim();

  if (!token) {
    return next(new AppError('Missing bearer token', 401, 'UNAUTHORIZED'));
  }

  try {
    const decoded = jwt.decode(token) as JwtPayload | null;
    req.user = decoded?.sub
      ? { userId: String(decoded.sub), claims: decoded, token }
      : { token };
    // Verification will be added later using jwt.verify with env.jwtSecret.
    return next();
  } catch (error) {
    return next(new AppError('Invalid token', 401, 'UNAUTHORIZED', error));
  }
};

// Helper for future verification once auth is implemented.
export const verifyJwt = (token: string): JwtPayload => {
  const verified = jwt.verify(token, env.jwtSecret) as JwtPayload;
  return verified;
};
