import { z } from "zod";

export const emailSchema = z.string().trim().email();
export const passwordSchema = z.string().min(8);

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const inviteAcceptSchema = z.object({
  inviteCode: z.string().trim().min(1),
});

export const moodLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const checkinCreateSchema = z.object({
  mood_level: moodLevelSchema,
  note: z.string().max(500).optional().nullable(),
  shared: z.boolean().default(false),
});

export const activityStyleSchema = z.union([
  z.literal("chill"),
  z.literal("active"),
  z.literal("surprise"),
]);

export const budgetLevelSchema = z.union([
  z.literal("low"),
  z.literal("medium"),
  z.literal("high"),
]);

export const preferencesSchema = z.object({
  activity_style: activityStyleSchema,
  food_types: z.array(z.string().trim()).default([]),
  budget_level: budgetLevelSchema,
  energy_level: moodLevelSchema,
});

export const relationshipStageSchema = z.union([
  z.literal("dating"),
  z.literal("committed"),
  z.literal("engaged"),
  z.literal("married"),
]);

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
});

// Ideas schemas
export const ideaTypeSchema = z.union([
  z.literal("LOCAL"),
  z.literal("FOOD"),
  z.literal("MOVIE"),
  z.literal("HOME"),
]);

export const ideaSourceSchema = z.union([
  z.literal("CURATED"),
  z.literal("GENERATED"),
  z.literal("USER_SAVED"),
]);

export const localFiltersSchema = z.object({
  radiusMiles: z.number().int().positive().default(10),
  filters: z.array(z.string()).optional(),
  timeWindow: z.union([
    z.literal("TONIGHT"),
    z.literal("WEEKEND"),
    z.literal("ANYTIME"),
  ]).default("ANYTIME"),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

export const ideasQuerySchema = z.object({
  type: ideaTypeSchema,
  radiusMiles: z.number().int().positive().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  filters: z.array(z.string()).optional(),
  timeWindow: z.string().optional(),
});

export const recipesQuerySchema = z.object({
  ingredients: z.array(z.string().trim()),
  preferences: z.array(z.string()).optional(),
});

export const ideaMetadataLocalSchema = z.object({
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  distanceMiles: z.number().optional(),
  websiteUrl: z.string().url().optional(),
  priceLevel: z.number().int().min(0).max(4).optional(),
  placeId: z.string().optional(),
});

export const ideaMetadataFoodSchema = z.object({
  ingredients: z.array(z.string()),
  missingIngredients: z.array(z.string()).optional(),
  recipeUrl: z.string().url().optional(),
  timeMinutes: z.number().int().optional(),
  difficulty: z.string().optional(),
});

export const ideaMetadataMovieSchema = z.object({
  provider: z.string().optional(),
  deepLinkUrl: z.string().url().optional(),
  genre: z.string().optional(),
});

export const ideaMetadataHomeSchema = z.object({
  promptType: z.string(),
});

export const ideaResponseSchema = z.object({
  id: z.string(),
  type: ideaTypeSchema,
  title: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  source: ideaSourceSchema,
  metadata: z.record(z.string(), z.any()),
  createdAt: z.string(),
});

export const savedIdeasResponseSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    ideaId: z.string(),
    idea: ideaResponseSchema,
    notes: z.string().nullable(),
    createdAt: z.string(),
  })),
});
