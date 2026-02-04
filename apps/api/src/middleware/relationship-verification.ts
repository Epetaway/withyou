import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AppError } from '../errors/app-error.js';

type AuthedRequest = Request & { user?: { userId?: string } };

/**
 * Middleware to verify that the authenticated user belongs to the relationship
 * specified in the request (either as route param or body)
 */
export const verifyRelationshipAccess = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
    }

    // Try to get relationshipId from params or body
    const relationshipId = req.params.relationshipId || req.body.relationshipId;
    
    if (!relationshipId) {
      // If no relationshipId is provided, skip verification
      // This allows routes that don't require a specific relationship
      return next();
    }

    // Verify user belongs to this relationship
    const relationship = await prisma.relationship.findFirst({
      where: {
        id: relationshipId,
        OR: [
          { userAId: userId },
          { userBId: userId },
        ],
      },
    });

    if (!relationship) {
      return next(
        new AppError(
          'Access denied: You do not belong to this relationship',
          403,
          'FORBIDDEN'
        )
      );
    }

    // Attach relationship to request for later use
    (req as AuthedRequest & { relationship?: typeof relationship }).relationship = relationship;
    
    next();
  } catch (error) {
    next(error);
  }
};
