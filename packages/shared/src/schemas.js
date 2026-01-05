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
//# sourceMappingURL=schemas.js.map