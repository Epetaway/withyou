import { Router } from "express";
import type { Request } from "express";
import {
  activityChallengeCreateSchema,
  activityChallengeUpdateStatusSchema,
} from "@withyou/shared";
import { prisma } from "../utils/prisma.js";
import type { ChallengeProgress } from "@prisma/client";
import { AppError } from "../errors/app-error.js";
import { jwtMiddleware } from "../middleware/jwt-middleware.js";
import { emitWorkoutEvent } from "../utils/websocket.js";

const router = Router();
type AuthedRequest = Request & { user?: { userId?: string } };

// POST /activity-challenges/create - Create a new activity challenge
router.post("/create", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const parsed = activityChallengeCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues)
      );
    }

    // Verify the initiator and participant are in the same relationship
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [
          { userAId: userId, userBId: parsed.data.participantId },
          { userAId: parsed.data.participantId, userBId: userId },
        ],
        status: "active",
      },
    });

    if (!relationship) {
      return next(
        new AppError(
          "Relationship not found or inactive",
          404,
          "RELATIONSHIP_NOT_FOUND"
        )
      );
    }

    // Create the activity challenge
    const challenge = await prisma.activityChallenge.create({
      data: {
        relationshipId: relationship.id,
        initiatorId: userId,
        participantId: parsed.data.participantId,
        challengeType: parsed.data.challengeType,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        targetValue: parsed.data.targetValue,
        duration: parsed.data.duration,
        reward: parsed.data.reward ?? null,
        endDate: new Date(
          Date.now() + parsed.data.duration * 24 * 60 * 60 * 1000
        ),
      },
      include: {
        progress: true,
      },
    });

    // Initialize progress tracking for both users
    await prisma.challengeProgress.createMany({
      data: [
        {
          challengeId: challenge.id,
          userId: userId,
          totalSteps: 0,
          daysCompleted: 0,
        },
        {
          challengeId: challenge.id,
          userId: parsed.data.participantId,
          totalSteps: 0,
          daysCompleted: 0,
        },
      ],
    });

    const responseData = {
      id: challenge.id,
      relationshipId: challenge.relationshipId,
      initiatorId: challenge.initiatorId,
      participantId: challenge.participantId,
      challengeType: challenge.challengeType,
      status: challenge.status,
      title: challenge.title,
      description: challenge.description,
      targetValue: challenge.targetValue,
      duration: challenge.duration,
      reward: challenge.reward,
      startDate: challenge.startDate.toISOString(),
      endDate: challenge.endDate.toISOString(),
      createdAt: challenge.createdAt.toISOString(),
      updatedAt: challenge.updatedAt.toISOString(),
    };

    // Emit real-time event
    emitWorkoutEvent(relationship.id, "challenge:created", responseData);

    res.json({ challenge: responseData });
  } catch (error) {
    next(error);
  }
});

// GET /activity-challenges - Get active challenges for user
router.get("/", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const challenges = await prisma.activityChallenge.findMany({
      where: {
        OR: [
          { initiatorId: userId },
          { participantId: userId },
        ],
        status: {
          in: ["pending", "active"],
        },
      },
      include: {
        progress: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      challenges: challenges.map((c) => ({
        id: c.id,
        relationshipId: c.relationshipId,
        initiatorId: c.initiatorId,
        participantId: c.participantId,
        challengeType: c.challengeType,
        status: c.status,
        title: c.title,
        description: c.description,
        targetValue: c.targetValue,
        duration: c.duration,
        reward: c.reward,
        startDate: c.startDate.toISOString(),
        endDate: c.endDate.toISOString(),
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      count: challenges.length,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /activity-challenges/:id/status - Accept or decline a challenge
router.patch("/:id/status", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const { id } = req.params;
    const parsed = activityChallengeUpdateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues)
      );
    }

    if (!id) {
      return next(new AppError("Invalid challenge ID", 400, "INVALID_INPUT"));
    }

    // Verify user is the participant
    const challenge = await prisma.activityChallenge.findUnique({
      where: { id },
    });

    if (!challenge) {
      return next(new AppError("Challenge not found", 404, "NOT_FOUND"));
    }

    if (challenge.participantId !== userId) {
      return next(
        new AppError(
          "Only the participant can respond to a challenge",
          403,
          "FORBIDDEN"
        )
      );
    }

    if (challenge.status !== "pending") {
      return next(
        new AppError(
          "Challenge has already been responded to",
          400,
          "INVALID_STATE"
        )
      );
    }

    const updatedChallenge = await prisma.activityChallenge.update({
      where: { id },
      data: {
        status: parsed.data.status,
        declinedAt: parsed.data.status === "declined" ? new Date() : null,
      },
    });

    const responseData = {
      id: updatedChallenge.id,
      relationshipId: updatedChallenge.relationshipId,
      initiatorId: updatedChallenge.initiatorId,
      participantId: updatedChallenge.participantId,
      challengeType: updatedChallenge.challengeType,
      status: updatedChallenge.status,
      title: updatedChallenge.title,
      description: updatedChallenge.description,
      targetValue: updatedChallenge.targetValue,
      duration: updatedChallenge.duration,
      reward: updatedChallenge.reward,
      startDate: updatedChallenge.startDate.toISOString(),
      endDate: updatedChallenge.endDate.toISOString(),
      createdAt: updatedChallenge.createdAt.toISOString(),
      updatedAt: updatedChallenge.updatedAt.toISOString(),
    };

    // Emit real-time event
    emitWorkoutEvent(
      updatedChallenge.relationshipId,
      "challenge:updated",
      responseData
    );

    res.json({ challenge: responseData });
  } catch (error) {
    next(error);
  }
});

// GET /activity-challenges/:id/progress - Get challenge progress and leaderboard
router.get("/:id/progress", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const { id } = req.params;
    if (!id) {
      return next(new AppError("Invalid challenge ID", 400, "INVALID_INPUT"));
    }

    const challenge = await prisma.activityChallenge.findUnique({
      where: { id },
      include: {
        progress: true,
      },
    });

    if (!challenge) {
      return next(new AppError("Challenge not found", 404, "NOT_FOUND"));
    }

    // Verify user is part of this challenge
    if (challenge.initiatorId !== userId && challenge.participantId !== userId) {
      return next(
        new AppError("You are not part of this challenge", 403, "FORBIDDEN")
      );
    }

    const progress = (challenge.progress ?? []) as ChallengeProgress[];

    // Get user information for leaderboard
    const users = await prisma.user.findMany({
      where: {
        id: { in: progress.map((p) => p.userId) },
      },
      select: {
        id: true,
        email: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u.email]));

    const leaderboard = progress
      .sort((a, b) => b.totalSteps - a.totalSteps)
      .map((p, index) => ({
        userId: p.userId,
        displayName: userMap.get(p.userId) || "Unknown",
        totalSteps: p.totalSteps,
        avgHeartRate: p.avgHeartRate,
        daysCompleted: p.daysCompleted,
        ranking: index + 1,
      }));

    res.json({
      progress: challenge.progress,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
});

// GET /activity-challenges/:id/leaderboard - Get detailed leaderboard
router.get("/:id/leaderboard", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const { id } = req.params;
    if (!id) {
      return next(new AppError("Invalid challenge ID", 400, "INVALID_INPUT"));
    }

    const challenge = await prisma.activityChallenge.findUnique({
      where: { id },
      include: {
        progress: true,
      },
    });

    if (!challenge) {
      return next(new AppError("Challenge not found", 404, "NOT_FOUND"));
    }

    // Verify user is part of this challenge
    if (challenge.initiatorId !== userId && challenge.participantId !== userId) {
      return next(
        new AppError("You are not part of this challenge", 403, "FORBIDDEN")
      );
    }

    const progress = (challenge.progress ?? []) as ChallengeProgress[];

    // Get user information
    const users = await prisma.user.findMany({
      where: {
        id: { in: progress.map((p) => p.userId) },
      },
      select: {
        id: true,
        email: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u.email]));

    // Calculate percentages and create leaderboard
    const participants = progress.map((p) => {
      const percentageComplete =
        (p.totalSteps / (challenge.targetValue * challenge.duration)) * 100;
      return {
        userId: p.userId,
        displayName: userMap.get(p.userId) || "Unknown",
        totalSteps: p.totalSteps,
        avgHeartRate: p.avgHeartRate,
        daysCompleted: p.daysCompleted,
        percentageComplete: Math.min(100, Math.round(percentageComplete * 10) / 10),
      };
    });

    participants.sort((a, b) => b.totalSteps - a.totalSteps);

    const currentUserRanking =
      participants.findIndex((p) => p.userId === userId) + 1;

    res.json({
      challengeId: challenge.id,
      participants: participants.map((p, index) => ({
        ...p,
        ranking: index + 1,
      })),
      currentUserRanking,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
