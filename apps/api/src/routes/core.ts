import { Router } from "express";
import type { Request } from "express";
import { checkinCreateSchema, preferencesSchema, noteCreateSchema } from "@withyou/shared";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../errors/app-error.js";
import { jwtMiddleware } from "../middleware/jwt-middleware.js";
import { z } from "zod";

const router = Router();
type AuthedRequest = Request & { user?: { userId?: string } };

router.get("/dashboard", jwtMiddleware, async (req: AuthedRequest, res, next) => {
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
          .map((c: { createdAt: Date }) => `Check-in on ${new Date(c.createdAt).toLocaleDateString()}`)
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

router.get("/checkins", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const parsedLimit = Number.parseInt(String(req.query.limit ?? "10"), 10);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;

    const checkins = await prisma.checkin.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        moodLevel: true,
        note: true,
        shared: true,
        createdAt: true,
      },
    });

    res.json({ checkins });
  } catch (error) {
    next(error);
  }
});

router.post("/checkins", jwtMiddleware, async (req: AuthedRequest, res, next) => {
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
          error.issues.map((issue: z.ZodIssue) => ({
            path: issue.path.join("."),
            message: issue.message,
          }))
        )
      );
    }
    next(error);
  }
});

router.get("/notes", jwtMiddleware, async (req: AuthedRequest, res, next) => {
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

    const parsedLimit = Number.parseInt(String(req.query.limit ?? "10"), 10);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;

    const notes = await prisma.note.findMany({
      where: relationship
        ? { relationshipId: relationship.id }
        : { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        userId: true,
        type: true,
        content: true,
        mediaUrl: true,
        createdAt: true,
      },
    });

    res.json({
      notes: notes.map((n: { id: string; userId: string; type: string; content: string | null; mediaUrl: string | null; createdAt: Date }) => ({
        id: n.id,
        authorId: n.userId,
        type: n.type,
        content: n.content,
        media_url: n.mediaUrl,
        createdAt: n.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/notes", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const payload = noteCreateSchema.parse(req.body);

    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    const note = await prisma.note.create({
      data: {
        userId,
        relationshipId: relationship?.id ?? null,
        type: payload.type,
        content: payload.content ?? null,
        mediaUrl: payload.media_url ?? null,
      },
    });

    res.status(201).json({
      note: {
        id: note.id,
        authorId: note.userId,
        type: note.type,
        content: note.content,
        media_url: note.mediaUrl,
        createdAt: note.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(
        new AppError(
          "Validation error",
          400,
          "VALIDATION_ERROR",
          error.issues.map((issue: z.ZodIssue) => ({
            path: issue.path.join("."),
            message: issue.message,
          }))
        )
      );
    }
    next(error);
  }
});

router.post("/preferences", jwtMiddleware, async (req: AuthedRequest, res, next) => {
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

    res.status(200).json({ 
      preferencesId: preferences.id 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(
        new AppError(
          "Validation error",
          400,
          "VALIDATION_ERROR",
          error.issues.map((issue: z.ZodIssue) => ({
            path: issue.path.join("."),
            message: issue.message,
          }))
        )
      );
    }
    next(error);
  }
});

router.get("/ideas", jwtMiddleware, async (req: AuthedRequest, res, next) => {
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

    res.json({ 
      ideas 
    });
  } catch (error) {
    next(error);
  }
});

// Mood Ring v2 Endpoints

// POST /checkins/v2 - Create a mood ring v2 check-in
router.post("/checkins/v2", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const { checkinV2Schema } = await import("@withyou/shared");
    const parsed = checkinV2Schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues));
    }

    const { moodColor, emotionLabel, energyLevel, note } = parsed.data;

    // Get relationship if paired
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    const checkin = await prisma.checkin.create({
      data: {
        userId,
        relationshipId: relationship?.id ?? null,
        moodLevel: 3, // Default for backwards compatibility
        moodColor,
        emotionLabel,
        energyLevel: energyLevel === "low" ? 1 : energyLevel === "high" ? 3 : 2,
        note: note || null,
        shared: false,
      },
    });

    res.json({
      id: checkin.id,
      moodColor: checkin.moodColor,
      emotionLabel: checkin.emotionLabel,
      energyLevel: checkin.energyLevel === 1 ? "low" : checkin.energyLevel === 3 ? "high" : "medium",
      note: checkin.note,
      createdAt: checkin.createdAt.toISOString(),
      revealed: false,
    });
  } catch (error) {
    next(error);
  }
});

// GET /checkins/today - Get today's check-ins with reveal logic
router.get("/checkins/today", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    // Get relationship if paired
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get user's check-in for today
    const userCheckin = await prisma.checkin.findFirst({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        moodColor: {
          not: null,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let partnerCheckin = null;
    let gradient = null;

    if (relationship) {
      const partnerId = relationship.userAId === userId ? relationship.userBId : relationship.userAId;
      
      // Get partner's check-in for today
      partnerCheckin = await prisma.checkin.findFirst({
        where: {
          userId: partnerId,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
          moodColor: {
            not: null,
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Reveal only if both have checked in
      if (userCheckin && partnerCheckin) {
        gradient = {
          colors: [userCheckin.moodColor, partnerCheckin.moodColor] as [string, string],
          insight: getMoodGradientInsight(userCheckin.moodColor!, partnerCheckin.moodColor!),
          tips: getMoodGradientTips(userCheckin.moodColor!, partnerCheckin.moodColor!),
        };
      }
    }

    const formatCheckin = (checkin: typeof userCheckin) => {
      if (!checkin) return null;
      return {
        id: checkin.id,
        moodColor: checkin.moodColor!,
        emotionLabel: checkin.emotionLabel!,
        energyLevel: checkin.energyLevel === 1 ? "low" as const : checkin.energyLevel === 3 ? "high" as const : "medium" as const,
        note: checkin.note,
        createdAt: checkin.createdAt.toISOString(),
        revealed: !!(userCheckin && partnerCheckin),
      };
    };

    res.json({
      userCheckin: formatCheckin(userCheckin),
      partnerCheckin: userCheckin && partnerCheckin ? formatCheckin(partnerCheckin) : null,
      gradient,
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions for mood gradient insights
function getMoodGradientInsight(color1: string, color2: string): string {
  const insights: Record<string, string> = {
    "red-red": "Both feeling intense - you're on the same wavelength",
    "red-blue": "Contrasting energies - one fiery, one calm",
    "red-green": "Mixed signals - communicate what you need",
    "blue-blue": "Peaceful harmony - enjoy the calm together",
    "blue-yellow": "Gentle contrast - balance and support each other",
    "green-green": "Grounded together - steady and balanced",
    "yellow-yellow": "Bright and optimistic - celebrate together",
    "purple-purple": "Creative and reflective - deep connection",
    "pink-pink": "Loving and tender - sweet connection",
    "orange-orange": "Energized together - enthusiastic vibes",
  };

  const key = [color1, color2].sort().join("-");
  return insights[key] || "Unique blend - explore what this means for you both";
}

function getMoodGradientTips(color1: string, color2: string): string[] {
  const energyMap: Record<string, number> = {
    red: 5, orange: 4, yellow: 3, green: 3, blue: 2, purple: 3, pink: 3,
  };

  const energy1 = energyMap[color1] || 3;
  const energy2 = energyMap[color2] || 3;
  const avgEnergy = (energy1 + energy2) / 2;

  if (avgEnergy >= 4) {
    return [
      "Channel this energy into a fun activity together",
      "Go for a walk or try something new",
    ];
  } else if (avgEnergy <= 2) {
    return [
      "Rest together - movie night or quiet time",
      "Be gentle with yourselves and each other",
    ];
  } else {
    return [
      "Find balance - one active, one restful activity",
      "Check in about what each of you needs",
    ];
  }
}

export default router;
