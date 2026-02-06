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

// OAuth schemas
export const oauthProviderSchema = z.union([
  z.literal("google"),
  z.literal("apple"),
]);

export const oauthLoginSchema = z.object({
  provider: oauthProviderSchema,
  idToken: z.string().min(1),
});

// Email verification schemas
export const emailVerifySchema = z.object({
  code: z.string().length(6).regex(/^\d{6}$/, "Code must be 6 digits"),
});

export const emailVerifySendSchema = z.object({
  email: emailSchema.optional(),
});

// Avatar upload schemas
export const avatarUploadSchema = z.object({
  fileType: z.union([
    z.literal("image/jpeg"),
    z.literal("image/png"),
    z.literal("image/webp"),
  ]),
  fileSize: z.number().max(5 * 1024 * 1024, "File size must be less than 5MB"),
});

// Profile setup schemas
export const profileSetupSchema = z.object({
  nickname: z.string().trim().max(50).optional(),
  anniversary: z.string().datetime().optional(),
  goals: z.array(z.string()).optional(),
  privacySettings: z.record(z.string(), z.boolean()).optional(),
  notificationTimes: z.array(z.string()).optional(),
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

// Mood Ring v2 Schemas
export const moodColorSchema = z.union([
  z.literal("red"),
  z.literal("orange"),
  z.literal("yellow"),
  z.literal("green"),
  z.literal("blue"),
  z.literal("purple"),
  z.literal("pink"),
]);

export const emotionLabelSchema = z.union([
  z.literal("happy"),
  z.literal("excited"),
  z.literal("calm"),
  z.literal("loved"),
  z.literal("tired"),
  z.literal("stressed"),
  z.literal("anxious"),
  z.literal("sad"),
  z.literal("frustrated"),
  z.literal("content"),
]);

export const energyLevelSchema = z.union([
  z.literal("low"),
  z.literal("medium"),
  z.literal("high"),
]);

export const checkinV2Schema = z.object({
  moodColor: moodColorSchema,
  emotionLabel: emotionLabelSchema,
  energyLevel: energyLevelSchema,
  note: z.string().max(500).optional(),
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

export const noteTypeSchema = z.union([
  z.literal("TEXT"),
  z.literal("VOICE"),
  z.literal("VIDEO"),
]);

export const noteCreateSchema = z
  .object({
    type: noteTypeSchema,
    content: z.string().trim().max(300).optional(),
    media_url: z.string().url().max(500).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "TEXT") {
      if (!value.content || value.content.trim().length === 0) {
        ctx.addIssue({
          code: "too_small",
          minimum: 1,
          type: "string",
          inclusive: true,
          origin: "string",
          message: "Text notes require content",
          path: ["content"],
        });
      }
    } else {
      if (!value.media_url) {
        ctx.addIssue({
          code: "custom",
          message: `${value.type === "VOICE" ? "Voice" : "Video"} notes require a media URL`,
          path: ["media_url"],
        });
      }
      if (value.content && value.content.length > 120) {
        ctx.addIssue({
          code: "too_big",
          maximum: 120,
          type: "string",
          inclusive: true,
          origin: "string",
          message: "Keep captions short (<=120 chars)",
          path: ["content"],
        });
      }
    }
  });

export const relationshipStageSchema = z.union([
  z.literal("dating"),
  z.literal("committed"),
  z.literal("engaged"),
  z.literal("married"),
]);

export const moodStateSchema = z.union([
  z.literal("energetic"),
  z.literal("calm"),
  z.literal("playful"),
  z.literal("romantic"),
  z.literal("adventurous"),
  z.literal("relaxed"),
  z.literal("stressed"),
  z.literal("happy"),
]);

export const timeOfDaySchema = z.union([
  z.literal("morning"),
  z.literal("afternoon"),
  z.literal("evening"),
  z.literal("night"),
]);

export const weatherPreferenceSchema = z.union([
  z.literal("indoor"),
  z.literal("outdoor"),
  z.literal("any"),
]);

export const moodCheckinSchema = z.object({
  moodState: moodStateSchema,
});

export const activityPreferencesSchema = z.object({
  interests: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  hasChildren: z.boolean().optional(),
  accessibilityNeeds: z.array(z.string()).optional(),
  budgetLevel: budgetLevelSchema.optional(),
  maxDistance: z.number().int().positive().optional(),
  preferredTimeOfDay: z.array(timeOfDaySchema).optional(),
  weatherPreference: weatherPreferenceSchema.optional(),
});

export const activityFiltersSchema = z.object({
  distance: z.number().positive().optional(),
  priceLevel: budgetLevelSchema.optional(),
  timeOfDay: timeOfDaySchema.optional(),
  weatherPreference: weatherPreferenceSchema.optional(),
  familyFriendly: z.boolean().optional(),
  accessible: z.boolean().optional(),
  interests: z.array(z.string()).optional(),
});

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

// Plan schemas
export const planPayloadSchema = z.object({
  ideaId: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  placeId: z.string().optional(),
  address: z.string().max(500).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  websiteUrl: z.string().url().optional(),
  phoneNumber: z.string().max(50).optional(),
  priceLevel: z.number().int().min(0).max(4).optional(),
  scheduledDate: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

export const calendarEventPayloadSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  location: z.string().max(500).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  allDay: z.boolean().optional(),
});

// Check-in schemas
export const checkInPayloadSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  needs: z.array(z.string()).optional().default([]),
  intentions: z.array(z.string()).optional().default([]),
  support: z.array(z.string()).optional().default([]),
  note: z.string().max(250).optional(),
});

// Workout goal schemas
export const goalStatusSchema = z.union([
  z.literal("active"),
  z.literal("completed"),
  z.literal("failed"),
]);

export const workoutGoalCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  targetMetric: z.string().min(1).max(50), // e.g., "miles", "workouts", "calories"
  targetValue: z.number().int().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isCouple: z.boolean().default(false), // Whether this is a couple's challenge
});

export const workoutGoalUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: goalStatusSchema.optional(),
});

export const workoutLogCreateSchema = z.object({
  amount: z.number().int().positive(),
  notes: z.string().max(500).optional(),
});

export const workoutBetCreateSchema = z.object({
  goalId: z.string().cuid(),
  wagerDescription: z.string().min(1).max(500), // e.g., "Loser cooks dinner", "Winner gets a massage"
});

// Grocery list schemas
export const groceryListCreateSchema = z.object({
  name: z.string().min(1).max(100),
});

export const groceryItemCreateSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().int().positive().default(1),
  unit: z.string().max(20).optional(),
});

export const groceryItemUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  quantity: z.number().int().positive().optional(),
  unit: z.string().max(20).optional(),
  completed: z.boolean().optional(),
});

export const groceryItemVetoSchema = z.object({
  vetoReason: z.string().max(500).optional(),
});

// Chat message schemas
export const messageTypeSchema = z.union([
  z.literal("text"),
  z.literal("image"),
  z.literal("voice"),
  z.literal("assistance_request"),
]);

export const chatMessageCreateSchema = z.object({
  content: z.string().min(1).max(5000),
  type: messageTypeSchema.default("text"),
  mediaUrl: z.string().url().optional(),
});

export const chatMessageReadSchema = z.object({
  messageIds: z.array(z.string().cuid()),
});
// ===== Wearable Device & Health Schemas =====

export const deviceTypeSchema = z.enum(['apple_watch', 'google_watch', 'apple_health', 'google_fit']);

export const deviceConnectionSchema = z.object({
  deviceType: deviceTypeSchema,
  deviceName: z.string().min(1).max(100),
  authCode: z.string().min(1),
});

export const challengeTypeSchema = z.enum(['steps', 'heart_rate', 'combined', 'daily_active_minutes']);

export const challengeStatusSchema = z.enum(['pending', 'active', 'completed', 'declined']);

export const healthMetricsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  deviceType: deviceTypeSchema.optional(),
});

export const activityChallengeCreateSchema = z.object({
  participantId: z.string().cuid(),
  challengeType: challengeTypeSchema,
  title: z.string().min(5).max(100),
  description: z.string().max(500).optional(),
  targetValue: z.number().int().positive(),
  duration: z.number().int().min(1).max(90),
  reward: z.string().max(200).optional(),
});

export const activityChallengeUpdateStatusSchema = z.object({
  status: z.enum(['active', 'declined']),
});