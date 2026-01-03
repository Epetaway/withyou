import type { JwtPayload } from 'jsonwebtoken';

declare namespace Express {
  interface Request {
    user?: {
      userId?: string;
      token?: string;
      claims?: JwtPayload;
    };
  }
}
