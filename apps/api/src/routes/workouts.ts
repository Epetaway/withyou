import { Router } from "express";
import type { Request } from "express";
import { 
  workoutGoalCreateSchema, 
  workoutGoalUpdateSchema,
  workoutLogCreateSchema,
  workoutBetCreateSchema 
} from "@withyou/shared";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../errors/app-error.js";
import { jwtMiddleware } from "../middleware/jwt-middleware.js";

const router = Router();
type AuthedRequest = Request & { user?: { userId?: string } };

// POST /workouts/goals - Create a new workout goal
router.post("/goals", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const parsed = workoutGoalCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues));
    }

    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    const goal = await prisma.workoutGoal.create({
      data: {
        userId,
        relationshipId: parsed.data.isCouple && relationship ? relationship.id : null,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        targetMetric: parsed.data.targetMetric,
        targetValue: parsed.data.targetValue,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        status: "active",
      },
    });

    res.json({
      goal: {
        id: goal.id,
        userId: goal.userId,
        relationshipId: goal.relationshipId,
        title: goal.title,
        description: goal.description,
        targetMetric: goal.targetMetric,
        targetValue: goal.targetValue,
        startDate: goal.startDate.toISOString(),
        endDate: goal.endDate.toISOString(),
        status: goal.status,
        createdAt: goal.createdAt.toISOString(),
        updatedAt: goal.updatedAt.toISOString(),
        progress: 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /workouts/goals - Get all workout goals for user
router.get("/goals", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    const goals = await prisma.workoutGoal.findMany({
      where: {
        OR: [
          { userId },
          { relationshipId: relationship?.id ?? undefined },
        ],
      },
      include: {
        logs: true,
        bets: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const goalsWithProgress = goals.map(goal => {
      const userLogs = goal.logs.filter(log => log.userId === userId);
      const totalProgress = userLogs.reduce((sum, log) => sum + log.amount, 0);
      const progress = Math.min((totalProgress / goal.targetValue) * 100, 100);

      let userProgress = progress;
      let partnerProgress = 0;

      if (goal.relationshipId && relationship) {
        const partnerId = relationship.userAId === userId ? relationship.userBId : relationship.userAId;
        const partnerLogs = goal.logs.filter(log => log.userId === partnerId);
        const partnerTotal = partnerLogs.reduce((sum, log) => sum + log.amount, 0);
        partnerProgress = Math.min((partnerTotal / goal.targetValue) * 100, 100);
      }

      return {
        id: goal.id,
        userId: goal.userId,
        relationshipId: goal.relationshipId,
        title: goal.title,
        description: goal.description,
        targetMetric: goal.targetMetric,
        targetValue: goal.targetValue,
        startDate: goal.startDate.toISOString(),
        endDate: goal.endDate.toISOString(),
        status: goal.status,
        createdAt: goal.createdAt.toISOString(),
        updatedAt: goal.updatedAt.toISOString(),
        progress: userProgress,
        userProgress,
        partnerProgress: goal.relationshipId ? partnerProgress : undefined,
        logs: goal.logs.map(log => ({
          id: log.id,
          goalId: log.goalId,
          userId: log.userId,
          amount: log.amount,
          notes: log.notes,
          loggedAt: log.loggedAt.toISOString(),
        })),
        bets: goal.bets.map(bet => ({
          id: bet.id,
          relationshipId: bet.relationshipId,
          goalId: bet.goalId,
          wagerDescription: bet.wagerDescription,
          createdAt: bet.createdAt.toISOString(),
        })),
      };
    });

    res.json({
      goals: goalsWithProgress,
      count: goalsWithProgress.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /workouts/goals/:id - Get a specific workout goal
router.get("/goals/:id", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const { id } = req.params;

    const goal = await prisma.workoutGoal.findUnique({
      where: { id },
      include: {
        logs: true,
        bets: true,
      },
    });

    if (!goal) {
      return next(new AppError("Goal not found", 404, "NOT_FOUND"));
    }

    // Check access
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    const hasAccess = goal.userId === userId || goal.relationshipId === relationship?.id;
    if (!hasAccess) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    const userLogs = goal.logs.filter(log => log.userId === userId);
    const totalProgress = userLogs.reduce((sum, log) => sum + log.amount, 0);
    const progress = Math.min((totalProgress / goal.targetValue) * 100, 100);

    let userProgress = progress;
    let partnerProgress = 0;

    if (goal.relationshipId && relationship) {
      const partnerId = relationship.userAId === userId ? relationship.userBId : relationship.userAId;
      const partnerLogs = goal.logs.filter(log => log.userId === partnerId);
      const partnerTotal = partnerLogs.reduce((sum, log) => sum + log.amount, 0);
      partnerProgress = Math.min((partnerTotal / goal.targetValue) * 100, 100);
    }

    res.json({
      goal: {
        id: goal.id,
        userId: goal.userId,
        relationshipId: goal.relationshipId,
        title: goal.title,
        description: goal.description,
        targetMetric: goal.targetMetric,
        targetValue: goal.targetValue,
        startDate: goal.startDate.toISOString(),
        endDate: goal.endDate.toISOString(),
        status: goal.status,
        createdAt: goal.createdAt.toISOString(),
        updatedAt: goal.updatedAt.toISOString(),
        progress: userProgress,
        userProgress,
        partnerProgress: goal.relationshipId ? partnerProgress : undefined,
        logs: goal.logs.map(log => ({
          id: log.id,
          goalId: log.goalId,
          userId: log.userId,
          amount: log.amount,
          notes: log.notes,
          loggedAt: log.loggedAt.toISOString(),
        })),
        bets: goal.bets.map(bet => ({
          id: bet.id,
          relationshipId: bet.relationshipId,
          goalId: bet.goalId,
          wagerDescription: bet.wagerDescription,
          createdAt: bet.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /workouts/goals/:id - Update a workout goal
router.put("/goals/:id", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const { id } = req.params;
    const parsed = workoutGoalUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues));
    }

    const goal = await prisma.workoutGoal.findUnique({
      where: { id },
    });

    if (!goal) {
      return next(new AppError("Goal not found", 404, "NOT_FOUND"));
    }

    if (goal.userId !== userId) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    const updated = await prisma.workoutGoal.update({
      where: { id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        status: parsed.data.status,
      },
    });

    res.json({
      goal: {
        id: updated.id,
        userId: updated.userId,
        relationshipId: updated.relationshipId,
        title: updated.title,
        description: updated.description,
        targetMetric: updated.targetMetric,
        targetValue: updated.targetValue,
        startDate: updated.startDate.toISOString(),
        endDate: updated.endDate.toISOString(),
        status: updated.status,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /workouts/goals/:id/log - Log progress for a goal
router.post("/goals/:id/log", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const { id } = req.params;
    const parsed = workoutLogCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues));
    }

    const goal = await prisma.workoutGoal.findUnique({
      where: { id },
      include: {
        logs: true,
      },
    });

    if (!goal) {
      return next(new AppError("Goal not found", 404, "NOT_FOUND"));
    }

    // Check access
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    const hasAccess = goal.userId === userId || goal.relationshipId === relationship?.id;
    if (!hasAccess) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    const log = await prisma.workoutLog.create({
      data: {
        goalId: id,
        userId,
        amount: parsed.data.amount,
        notes: parsed.data.notes ?? null,
      },
    });

    // Calculate updated progress
    const userLogs = await prisma.workoutLog.findMany({
      where: {
        goalId: id,
        userId,
      },
    });

    const totalProgress = userLogs.reduce((sum, l) => sum + l.amount, 0);
    const progress = Math.min((totalProgress / goal.targetValue) * 100, 100);

    // Auto-complete goal if target reached
    if (totalProgress >= goal.targetValue && goal.status === "active") {
      await prisma.workoutGoal.update({
        where: { id },
        data: { status: "completed" },
      });
    }

    res.json({
      log: {
        id: log.id,
        goalId: log.goalId,
        userId: log.userId,
        amount: log.amount,
        notes: log.notes,
        loggedAt: log.loggedAt.toISOString(),
      },
      goal: {
        id: goal.id,
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /workouts/goals/:id/bet - Place a bet on a goal
router.post("/goals/:id/bet", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const { id } = req.params;
    const parsed = workoutBetCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues));
    }

    const goal = await prisma.workoutGoal.findUnique({
      where: { id },
    });

    if (!goal) {
      return next(new AppError("Goal not found", 404, "NOT_FOUND"));
    }

    if (!goal.relationshipId) {
      return next(new AppError("Bets can only be placed on couple goals", 400, "INVALID_GOAL"));
    }

    const relationship = await prisma.relationship.findFirst({
      where: {
        id: goal.relationshipId,
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    if (!relationship) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    const bet = await prisma.workoutBet.create({
      data: {
        relationshipId: goal.relationshipId,
        goalId: id,
        wagerDescription: parsed.data.wagerDescription,
      },
    });

    res.json({
      bet: {
        id: bet.id,
        relationshipId: bet.relationshipId,
        goalId: bet.goalId,
        wagerDescription: bet.wagerDescription,
        createdAt: bet.createdAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /workouts/leaderboard - Get leaderboard for couple challenges
router.get("/leaderboard", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    if (!relationship) {
      return next(new AppError("No active relationship", 404, "NO_RELATIONSHIP"));
    }

    const partnerId = relationship.userAId === userId ? relationship.userBId : relationship.userAId;

    const coupleGoals = await prisma.workoutGoal.findMany({
      where: {
        relationshipId: relationship.id,
        status: "active",
      },
      include: {
        logs: true,
      },
    });

    const leaderboard = coupleGoals.map(goal => {
      const userLogs = goal.logs.filter(log => log.userId === userId);
      const partnerLogs = goal.logs.filter(log => log.userId === partnerId);

      const userTotal = userLogs.reduce((sum, log) => sum + log.amount, 0);
      const partnerTotal = partnerLogs.reduce((sum, log) => sum + log.amount, 0);

      const userProgress = Math.min((userTotal / goal.targetValue) * 100, 100);
      const partnerProgress = Math.min((partnerTotal / goal.targetValue) * 100, 100);

      let winner: "user" | "partner" | "tie" | undefined;
      if (userProgress > partnerProgress) {
        winner = "user";
      } else if (partnerProgress > userProgress) {
        winner = "partner";
      } else if (userProgress === partnerProgress && userProgress > 0) {
        winner = "tie";
      }

      return {
        goalId: goal.id,
        goalTitle: goal.title,
        userProgress,
        partnerProgress,
        winner,
      };
    });

    res.json({
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
