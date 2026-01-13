import { Router } from "express";
import type { Request } from "express";
import type { Prisma } from "@prisma/client";
import {
  ideasQuerySchema,
  recipesQuerySchema,
} from "@withyou/shared";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../errors/app-error.js";
import { jwtMiddleware } from "../middleware/jwt-middleware.js";
import { z } from "zod";

const router = Router();
type AuthedRequest = Request & { user?: { userId?: string } };

// Mock curated data for ideas
const curatedLocalIdeas = [
  {
    type: "LOCAL",
    title: "Sunset hiking at Eagle Peak",
    description: "Beautiful 2-hour hike with panoramic views",
    category: "Outdoor",
    source: "CURATED",
    metadata: {
      address: "123 Mountain Road, Denver, CO",
      lat: 39.7392,
      lng: -104.9903,
      distanceMiles: 8.5,
      websiteUrl: "https://example.com/trails/eagle-peak",
      priceLevel: 0,
    },
  },
  {
    type: "LOCAL",
    title: "Jazz night at Blue Note",
    description: "Live jazz performance in intimate venue",
    category: "Entertainment",
    source: "CURATED",
    metadata: {
      address: "456 Music Lane, Denver, CO",
      lat: 39.7489,
      lng: -104.9898,
      distanceMiles: 2.1,
      websiteUrl: "https://bluenotedenver.com",
      priceLevel: 3,
    },
  },
  {
    type: "LOCAL",
    title: "Farmer's market Sunday",
    description: "Fresh local produce and artisan goods",
    category: "Shopping",
    source: "CURATED",
    metadata: {
      address: "789 Market Street, Denver, CO",
      lat: 39.7505,
      lng: -104.9706,
      distanceMiles: 1.5,
      websiteUrl: "https://example.com/farmers-market",
      priceLevel: 1,
    },
  },
];

const curatedRecipes = [
  {
    type: "FOOD",
    title: "Homemade Pasta Carbonara",
    description: "Classic Roman pasta with bacon and cream",
    category: "Italian",
    source: "CURATED",
    metadata: {
      ingredients: ["pasta", "eggs", "bacon", "parmesan", "black pepper"],
      missingIngredients: [],
      recipeUrl: "https://example.com/recipes/carbonara",
      timeMinutes: 25,
      difficulty: "Easy",
    },
  },
  {
    type: "FOOD",
    title: "Stir-fry with vegetables",
    description: "Quick and healthy Asian-inspired meal",
    category: "Asian",
    source: "CURATED",
    metadata: {
      ingredients: ["bell pepper", "broccoli", "soy sauce", "garlic", "rice"],
      missingIngredients: [],
      recipeUrl: "https://example.com/recipes/stirfry",
      timeMinutes: 20,
      difficulty: "Easy",
    },
  },
  {
    type: "FOOD",
    title: "Chocolate chip cookies",
    description: "Classic homemade cookies",
    category: "Dessert",
    source: "CURATED",
    metadata: {
      ingredients: ["flour", "butter", "eggs", "chocolate chips", "vanilla"],
      missingIngredients: [],
      recipeUrl: "https://example.com/recipes/cookies",
      timeMinutes: 30,
      difficulty: "Easy",
    },
  },
];

const curatedMovies = [
  {
    type: "MOVIE",
    title: "Spirited Away",
    description: "Acclaimed animated fantasy adventure",
    category: "Animation",
    source: "CURATED",
    metadata: {
      provider: "HBO Max",
      deepLinkUrl: "https://hbomax.com/watch/spirited-away",
      genre: "Animation, Fantasy",
    },
  },
  {
    type: "MOVIE",
    title: "Inception",
    description: "Mind-bending sci-fi thriller",
    category: "Sci-Fi",
    source: "CURATED",
    metadata: {
      provider: "Netflix",
      deepLinkUrl: "https://netflix.com/watch/inception",
      genre: "Sci-Fi, Thriller",
    },
  },
  {
    type: "MOVIE",
    title: "The Grand Budapest Hotel",
    description: "Wes Anderson masterpiece",
    category: "Comedy",
    source: "CURATED",
    metadata: {
      provider: "Amazon Prime",
      deepLinkUrl: "https://primevideo.com/watch/budapest",
      genre: "Comedy, Drama",
    },
  },
];

// POST /ideas/query - Get local ideas based on filters
// Simple scoring for curated local ideas based on filters and distance
function scoreLocalIdea(params: z.infer<typeof ideasQuerySchema>, idea: typeof curatedLocalIdeas[number]) {
  let score = 0;
  const radius = params.radiusMiles ?? 10;

  // Prefer within radius; farther distances reduce score
  const dist = idea.metadata.distanceMiles ?? radius;
  const distanceFactor = Math.max(0, radius - dist);
  score += distanceFactor; // closer -> higher score

  const filters = (params.filters ?? []).map((f: string) => f.toLowerCase());

  // Category affinity based on simple filters
  if (filters.includes("outdoors") && idea.category.toLowerCase() === "outdoor") score += 5;
  if (filters.includes("entertainment") && idea.category.toLowerCase() === "entertainment") score += 5;
  if (filters.includes("food") && idea.category.toLowerCase() === "food") score += 3; // none in curated currently
  if (filters.includes("lowcost")) {
    const price = idea.metadata.priceLevel ?? 2;
    if (price <= 1) score += 4; else score -= 2;
  }

  // Light boost for website presence
  if (idea.metadata.websiteUrl) score += 1;

  return score;
}

router.post("/query", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const params = ideasQuerySchema.parse(req.body);

    // Get relationship for context
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    // Log request for analytics
    if (relationship) {
      await prisma.ideaRequest.create({
        data: {
          userId,
          relationshipId: relationship.id,
          type: params.type,
          params: params as unknown as Prisma.InputJsonValue,
        },
      });
    }

    // Return curated local ideas with filtering and ranking (mock)
    if (params.type === "LOCAL") {
      const radius = params.radiusMiles ?? 10;
      const filters = (params.filters ?? []).map((f: string) => f.toLowerCase());

      const filtered = curatedLocalIdeas.filter((idea) => {
        const dist = idea.metadata.distanceMiles ?? Infinity;
        const withinRadius = isFinite(dist) ? dist <= radius : true;
        // Basic category matching if filters supplied
        const hasFilter = filters.length === 0
          ? true
          : (
              (filters.includes("outdoors") && idea.category.toLowerCase() === "outdoor") ||
              (filters.includes("entertainment") && idea.category.toLowerCase() === "entertainment") ||
              (filters.includes("food") && idea.category.toLowerCase() === "food") ||
              (filters.includes("lowcost") && (idea.metadata.priceLevel ?? 2) <= 1)
            );
        return withinRadius && hasFilter;
      });

      const ranked = filtered
        .map((idea) => ({ idea, score: scoreLocalIdea(params, idea) }))
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          const ad = a.idea.metadata.distanceMiles ?? Infinity;
          const bd = b.idea.metadata.distanceMiles ?? Infinity;
          return ad - bd; // tie-breaker: closer first
        })
        .map(({ idea }) => idea);

      const ideas = ranked.map((idea) => ({
        id: idea.title.replace(/\s+/g, "-").toLowerCase(),
        type: idea.type,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        source: idea.source,
        metadata: idea.metadata,
        createdAt: new Date().toISOString(),
      }));

      return res.json({ ideas });
    }

    res.json({ ideas: [] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError("Validation error", 400, "INVALID_REQUEST", error.issues as unknown));
    }
    next(error);
  }
});

// POST /ideas/recipes - Get recipe suggestions based on ingredients
router.post("/recipes", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const params = recipesQuerySchema.parse(req.body);

    // Get relationship for context
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    // Log request for analytics
    if (relationship) {
      await prisma.ideaRequest.create({
        data: {
          userId,
          relationshipId: relationship.id,
          type: "FOOD",
          params: params as unknown as Prisma.InputJsonValue,
        },
      });
    }

    // Return curated recipes (mock - in real implementation, filter by ingredients)
    const recipes = curatedRecipes.map((recipe) => ({
      id: recipe.title.replace(/\s+/g, "-").toLowerCase(),
      type: recipe.type,
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      source: recipe.source,
      metadata: recipe.metadata,
      createdAt: new Date().toISOString(),
    }));

    res.json({ recipes });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError("Validation error", 400, "INVALID_REQUEST", error.issues as unknown));
    }
    next(error);
  }
});

// GET /ideas/movies - Get movie suggestions (could be POST for future filtering)
router.get("/movies", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    // Get relationship for context
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    // Log request for analytics
    if (relationship) {
      await prisma.ideaRequest.create({
        data: {
          userId,
          relationshipId: relationship.id,
          type: "MOVIE",
          params: {},
        },
      });
    }

    // Return curated movies
    const movies = curatedMovies.map((movie) => ({
      id: movie.title.replace(/\s+/g, "-").toLowerCase(),
      type: movie.type,
      title: movie.title,
      description: movie.description,
      category: movie.category,
      source: movie.source,
      metadata: movie.metadata,
      createdAt: new Date().toISOString(),
    }));

    res.json({ movies });
  } catch (error) {
    next(error);
  }
});

// POST /:ideaId/save - Save an idea
router.post("/:ideaId/save", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const ideaId = req.params.ideaId;
    if (!ideaId) {
      return next(new AppError("Validation error", 400, "INVALID_REQUEST"));
    }

    const { notes } = req.body;

    // Validate notes if provided
    if (notes && typeof notes !== "string") {
      return next(new AppError("Validation error", 400, "INVALID_REQUEST"));
    }

    // Check if idea exists (in real implementation, fetch from API/DB)
    // For now, we'll create or find the saved idea
    let idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    // If idea doesn't exist, create it from curated data
    if (!idea) {
      const ideaData = [
        ...curatedLocalIdeas,
        ...curatedRecipes,
        ...curatedMovies,
      ].find((i) => i.title.replace(/\s+/g, "-").toLowerCase() === ideaId);

      if (!ideaData) {
        return next(new AppError("Idea not found", 404, "NOT_FOUND"));
      }

      idea = await prisma.idea.create({
        data: {
          id: ideaId,
          type: ideaData.type as "LOCAL" | "FOOD" | "MOVIE" | "HOME",
          title: ideaData.title,
          description: ideaData.description,
          category: ideaData.category,
          source: "CURATED",
          metadata: ideaData.metadata,
        },
      });
    }

    // Save or update the saved idea
    const savedIdea = await prisma.savedIdea.upsert({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
      update: {
        notes: notes || null,
      },
      create: {
        userId,
        ideaId,
        notes: notes || null,
      },
      include: {
        idea: true,
      },
    });

    res.json({
      id: savedIdea.id,
      ideaId: savedIdea.ideaId,
      idea: {
        id: savedIdea.idea.id,
        type: savedIdea.idea.type,
        title: savedIdea.idea.title,
        description: savedIdea.idea.description,
        category: savedIdea.idea.category,
        source: savedIdea.idea.source,
        metadata: savedIdea.idea.metadata,
        createdAt: savedIdea.idea.createdAt.toISOString(),
      },
      notes: savedIdea.notes,
      createdAt: savedIdea.createdAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /:ideaId/save - Unsave an idea
router.delete("/:ideaId/save", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const ideaId = req.params.ideaId;
    if (!ideaId) {
      return next(new AppError("Validation error", 400, "INVALID_REQUEST"));
    }

    const savedIdea = await prisma.savedIdea.findUnique({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
    });

    if (!savedIdea) {
      return next(new AppError("Saved idea not found", 404, "NOT_FOUND"));
    }

    await prisma.savedIdea.delete({
      where: {
        id: savedIdea.id,
      },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /saved - Get all saved ideas for user
router.get("/saved", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const savedIdeas = await prisma.savedIdea.findMany({
      where: { userId },
      include: { idea: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      items: savedIdeas.map((si) => ({
        id: si.id,
        ideaId: si.ideaId,
        idea: {
          id: si.idea.id,
          type: si.idea.type,
          title: si.idea.title,
          description: si.idea.description,
          category: si.idea.category,
          source: si.idea.source,
          metadata: si.idea.metadata,
          createdAt: si.idea.createdAt.toISOString(),
        },
        notes: si.notes,
        createdAt: si.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
