import { Router } from "express";
import type { Request } from "express";
import {
  moodCheckinSchema,
  activityPreferencesSchema,
  activityFiltersSchema,
} from "@withyou/shared";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../errors/app-error.js";
import { jwtMiddleware } from "../middleware/jwt-middleware.js";

const router = Router();
type AuthedRequest = Request & { user?: { userId?: string } };

// POST /mood-checkin - Record user's current mood
router.post("/mood-checkin", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const parsed = moodCheckinSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues));
    }

    const { moodState } = parsed.data;

    const moodCheckin = await prisma.moodCheckin.create({
      data: {
        userId,
        moodState,
      },
    });

    res.json({
      id: moodCheckin.id,
      moodState: moodCheckin.moodState,
      createdAt: moodCheckin.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// GET /activity-preferences - Get user's activity preferences
router.get("/activity-preferences", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const prefs = await prisma.activityPreferences.findUnique({
      where: { userId },
    });

    if (!prefs) {
      // Return defaults if not set
      return res.json({
        interests: [],
        dietaryRestrictions: [],
        hasChildren: false,
        accessibilityNeeds: [],
        budgetLevel: "medium",
        maxDistance: 10,
        preferredTimeOfDay: [],
        weatherPreference: "any",
      });
    }

    res.json({
      id: prefs.id,
      interests: prefs.interests,
      dietaryRestrictions: prefs.dietaryRestrictions,
      hasChildren: prefs.hasChildren,
      accessibilityNeeds: prefs.accessibilityNeeds,
      budgetLevel: prefs.budgetLevel,
      maxDistance: prefs.maxDistance,
      preferredTimeOfDay: prefs.preferredTimeOfDay,
      weatherPreference: prefs.weatherPreference,
      createdAt: prefs.createdAt.toISOString(),
      updatedAt: prefs.updatedAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// PUT /activity-preferences - Update user's activity preferences
router.put("/activity-preferences", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const parsed = activityPreferencesSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues));
    }

    // Filter out undefined values for Prisma compatibility with exactOptionalPropertyTypes
    const dataToUpdate = Object.fromEntries(
      Object.entries(parsed.data).filter(([_, v]) => v !== undefined)
    );

    const prefs = await prisma.activityPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...dataToUpdate,
      },
      update: dataToUpdate,
    });

    res.json({
      id: prefs.id,
      interests: prefs.interests,
      dietaryRestrictions: prefs.dietaryRestrictions,
      hasChildren: prefs.hasChildren,
      accessibilityNeeds: prefs.accessibilityNeeds,
      budgetLevel: prefs.budgetLevel,
      maxDistance: prefs.maxDistance,
      preferredTimeOfDay: prefs.preferredTimeOfDay,
      weatherPreference: prefs.weatherPreference,
      createdAt: prefs.createdAt.toISOString(),
      updatedAt: prefs.updatedAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// GET /activities - Discover activities with filters
router.get("/activities", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const parsed = activityFiltersSchema.safeParse(req.query);
    if (!parsed.success) {
      return next(new AppError("Invalid filters", 400, "VALIDATION_ERROR", parsed.error.issues));
    }

    // Get user's preferences and partner's preferences (if paired)
    const _userPrefs = await prisma.activityPreferences.findUnique({
      where: { userId },
    });

    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    let _partnerPrefs = null;
    if (relationship) {
      const partnerId = relationship.userAId === userId ? relationship.userBId : relationship.userAId;
      _partnerPrefs = await prisma.activityPreferences.findUnique({
        where: { userId: partnerId },
      });
    }

    // Get recent mood check-ins for both users
    const userMood = await prisma.moodCheckin.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    let partnerMood = null;
    if (relationship) {
      const partnerId = relationship.userAId === userId ? relationship.userBId : relationship.userAId;
      partnerMood = await prisma.moodCheckin.findFirst({
        where: { userId: partnerId },
        orderBy: { createdAt: "desc" },
      });
    }

    // TODO: Implement actual activity discovery logic
    // For now, return curated ideas from the database as placeholder
    const ideas = await prisma.idea.findMany({
      where: {
        type: "LOCAL",
      },
      take: 10,
    });

    const activities = ideas.map((idea) => ({
      id: idea.id,
      title: idea.title,
      description: idea.description || "",
      category: idea.category || "General",
      imageUrl: undefined,
      address: undefined,
      distance: undefined,
      priceLevel: "medium" as const,
      rating: undefined,
      tags: [],
      isFamilyFriendly: false,
      isAccessible: false,
      hours: undefined,
      bookingUrl: undefined,
    }));

    res.json({
      activities,
      count: activities.length,
      appliedFilters: parsed.data,
      userMood: userMood?.moodState || null,
      partnerMood: partnerMood?.moodState || null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
