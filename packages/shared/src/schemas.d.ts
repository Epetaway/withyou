import { z } from "zod";
export declare const emailSchema: z.ZodString;
export declare const passwordSchema: z.ZodString;
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const inviteAcceptSchema: z.ZodObject<{
    inviteCode: z.ZodString;
}, z.core.$strip>;
export declare const moodLevelSchema: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>, z.ZodLiteral<5>]>;
export declare const checkinCreateSchema: z.ZodObject<{
    mood_level: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>, z.ZodLiteral<5>]>;
    note: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    shared: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const activityStyleSchema: z.ZodUnion<readonly [z.ZodLiteral<"chill">, z.ZodLiteral<"active">, z.ZodLiteral<"surprise">]>;
export declare const budgetLevelSchema: z.ZodUnion<readonly [z.ZodLiteral<"low">, z.ZodLiteral<"medium">, z.ZodLiteral<"high">]>;
export declare const preferencesSchema: z.ZodObject<{
    activity_style: z.ZodUnion<readonly [z.ZodLiteral<"chill">, z.ZodLiteral<"active">, z.ZodLiteral<"surprise">]>;
    food_types: z.ZodDefault<z.ZodArray<z.ZodString>>;
    budget_level: z.ZodUnion<readonly [z.ZodLiteral<"low">, z.ZodLiteral<"medium">, z.ZodLiteral<"high">]>;
    energy_level: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>, z.ZodLiteral<5>]>;
}, z.core.$strip>;
export declare const relationshipStageSchema: z.ZodUnion<readonly [z.ZodLiteral<"dating">, z.ZodLiteral<"committed">, z.ZodLiteral<"engaged">, z.ZodLiteral<"married">]>;
export declare const apiErrorSchema: z.ZodObject<{
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=schemas.d.ts.map