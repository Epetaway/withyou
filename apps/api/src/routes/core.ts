import { Router } from "express";
import { checkinCreateSchema, preferencesSchema } from "@withyou/shared";
import { prisma } from "../../utils/prisma.js";
import { AppError } from "../../errors/app-error.js";
import { jwtMiddleware } from "../../middleware/jwt-middleware.js";
import { z } from "zod";

const router = Router();

router.get("/dashboard", jwtMiddleware, async (req, res, next) => {
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

    const relationshipStage = relationship?.stage ?? null;

    let partnerLastCheckIn = null;
    if (relationship) {
      const partnerId = relationship.userAId === userId ? relationship.userBId : relationship.userAId;
      const lastSharedCheckIn = await prisma.checkin.findFirst({
        where: {
          userId: partnerId,
          relationshipId: relationship.id,
          shared: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (lastSharedCheckIn) {
        partnerLastCheckIn = {
          mood_level: lastSharedCheckIn.moodLevel as 1 | 2 | 3 | 4 | 5,
          shared: true as const,
          timestamp: lastSharedCheckIn.createdAt.toISOString(),
        };
      }
    }

    const recentActivity = relationship
      ? (
          await prisma.checkin.findMany({
            where: { relationshipId: relationship.id },
            orderBy: { createdAt: "desc" },
            take: 5,
          })
        )
          .map((c) => `Check-in on ${new Date(c.createdAt).toLocaleDateString()}`)
      : [];

    res.json({
      relationshipStage,
      partnerLastCheckIn,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/checkins", jwtMiddleware, async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const payload = checkinCreateSchema.parse(req.body);

    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    const checkin = await prisma.checkin.create({
      data: {
        userId,
        moodLevel: payload.mood_level,
        note: payload.note ?? null,
        shared: payload.shared,
        relationshipId: relationship?.id ?? null,
      },
    });

    res.status(201).json({
      checkinId: checkin.id,
      createdAt: checkin.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(
        new AppError(
          "Validation error",
          400,
          "VALIDATION_ERROR",
          error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          }))
        )
      );
    }
    next(error);
  }
});

router.post("/preferences", jwtMiddleware, async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const payload = preferencesSchema.parse(req.body);

    const preferences = await prisma.preference.upsert({
      where: { userId },
      create: {
        userId,
        activityStyle: payload.activity_style,
        foodTypes: payload.food_types,
        budgetLevel: payload.budget_level,
        energyLevel: payload.energy_level,
        stage: "dating",
      },
      update: {
        activityStyle: payload.activity_style,
        foodTypes: payload.food_types,
        budgetLevel: payload.budget_level,
        energyLevel: payload.energy_level,
      },
    });

    res.status(200).json({ success: true, preferencesId: preferences.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(
        new AppError(
          "Validation error",
          400,
          "VALIDATION_ERROR",
          error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          }))
        )
      );
    }
    next(error);
  }
});

router.get("/ideas", jwtMiddleware, async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const prefs = await prisma.preference.findUnique({
      where: { userId },
    });

    if (!prefs) {
      return next(
        new AppError(
          "Set preferences to get ideas",
          400,
          "NEEDS_PREFERENCES",
          { message: "Please set your preferences first to generate ideas." }
        )
      );
    }

    const styleMap: Record<string, string[]> = {
      chill: [
        "Have a quiet dinner at home",
        "Cook together",
        "Watch a movie on the couch",
        "Take a walk",
        "Read together",
      ],
      active: [
        "Go hiking",
        "Try a new fitness class",
        "Play a sport",
        "Go dancing",
        "Visit a new trail",
      ],
      surprise: [
        "Plan a surprise date night",
        "Try a new restaurant",
        "Take a weekend trip",
        "Explore a new neighborhood",
        "Try something neither of you has done",
      ],
    };

    const baseIdeas = styleMap[prefs.activityStyle] || [];
    const ideas = baseIdeas.slice(0, 3);

    res.json({ ideas });
  } catch (error) {
    next(error);
  }
});

export default router;
