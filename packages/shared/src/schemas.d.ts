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
export declare const oauthProviderSchema: z.ZodUnion<readonly [z.ZodLiteral<"google">, z.ZodLiteral<"apple">]>;
export declare const oauthLoginSchema: z.ZodObject<{
    provider: z.ZodUnion<readonly [z.ZodLiteral<"google">, z.ZodLiteral<"apple">]>;
    idToken: z.ZodString;
}, z.core.$strip>;
export declare const emailVerifySchema: z.ZodObject<{
    code: z.ZodString;
}, z.core.$strip>;
export declare const emailVerifySendSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const avatarUploadSchema: z.ZodObject<{
    fileType: z.ZodUnion<readonly [z.ZodLiteral<"image/jpeg">, z.ZodLiteral<"image/png">, z.ZodLiteral<"image/webp">]>;
    fileSize: z.ZodNumber;
}, z.core.$strip>;
export declare const profileSetupSchema: z.ZodObject<{
    nickname: z.ZodOptional<z.ZodString>;
    anniversary: z.ZodOptional<z.ZodString>;
    goals: z.ZodOptional<z.ZodArray<z.ZodString>>;
    privacySettings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
    notificationTimes: z.ZodOptional<z.ZodArray<z.ZodString>>;
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
export declare const noteTypeSchema: z.ZodUnion<readonly [z.ZodLiteral<"TEXT">, z.ZodLiteral<"VOICE">, z.ZodLiteral<"VIDEO">]>;
export declare const noteCreateSchema: z.ZodObject<{
    type: z.ZodUnion<readonly [z.ZodLiteral<"TEXT">, z.ZodLiteral<"VOICE">, z.ZodLiteral<"VIDEO">]>;
    content: z.ZodOptional<z.ZodString>;
    media_url: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const relationshipStageSchema: z.ZodUnion<readonly [z.ZodLiteral<"dating">, z.ZodLiteral<"committed">, z.ZodLiteral<"engaged">, z.ZodLiteral<"married">]>;
export declare const moodStateSchema: z.ZodUnion<readonly [z.ZodLiteral<"energetic">, z.ZodLiteral<"calm">, z.ZodLiteral<"playful">, z.ZodLiteral<"romantic">, z.ZodLiteral<"adventurous">, z.ZodLiteral<"relaxed">, z.ZodLiteral<"stressed">, z.ZodLiteral<"happy">]>;
export declare const timeOfDaySchema: z.ZodUnion<readonly [z.ZodLiteral<"morning">, z.ZodLiteral<"afternoon">, z.ZodLiteral<"evening">, z.ZodLiteral<"night">]>;
export declare const weatherPreferenceSchema: z.ZodUnion<readonly [z.ZodLiteral<"indoor">, z.ZodLiteral<"outdoor">, z.ZodLiteral<"any">]>;
export declare const moodCheckinSchema: z.ZodObject<{
    moodState: z.ZodUnion<readonly [z.ZodLiteral<"energetic">, z.ZodLiteral<"calm">, z.ZodLiteral<"playful">, z.ZodLiteral<"romantic">, z.ZodLiteral<"adventurous">, z.ZodLiteral<"relaxed">, z.ZodLiteral<"stressed">, z.ZodLiteral<"happy">]>;
}, z.core.$strip>;
export declare const activityPreferencesSchema: z.ZodObject<{
    interests: z.ZodOptional<z.ZodArray<z.ZodString>>;
    dietaryRestrictions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    hasChildren: z.ZodOptional<z.ZodBoolean>;
    accessibilityNeeds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    budgetLevel: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"low">, z.ZodLiteral<"medium">, z.ZodLiteral<"high">]>>;
    maxDistance: z.ZodOptional<z.ZodNumber>;
    preferredTimeOfDay: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"morning">, z.ZodLiteral<"afternoon">, z.ZodLiteral<"evening">, z.ZodLiteral<"night">]>>>;
    weatherPreference: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"indoor">, z.ZodLiteral<"outdoor">, z.ZodLiteral<"any">]>>;
}, z.core.$strip>;
export declare const activityFiltersSchema: z.ZodObject<{
    distance: z.ZodOptional<z.ZodNumber>;
    priceLevel: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"low">, z.ZodLiteral<"medium">, z.ZodLiteral<"high">]>>;
    timeOfDay: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"morning">, z.ZodLiteral<"afternoon">, z.ZodLiteral<"evening">, z.ZodLiteral<"night">]>>;
    weatherPreference: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"indoor">, z.ZodLiteral<"outdoor">, z.ZodLiteral<"any">]>>;
    familyFriendly: z.ZodOptional<z.ZodBoolean>;
    accessible: z.ZodOptional<z.ZodBoolean>;
    interests: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const apiErrorSchema: z.ZodObject<{
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ideaTypeSchema: z.ZodUnion<readonly [z.ZodLiteral<"LOCAL">, z.ZodLiteral<"FOOD">, z.ZodLiteral<"MOVIE">, z.ZodLiteral<"HOME">]>;
export declare const ideaSourceSchema: z.ZodUnion<readonly [z.ZodLiteral<"CURATED">, z.ZodLiteral<"GENERATED">, z.ZodLiteral<"USER_SAVED">]>;
export declare const localFiltersSchema: z.ZodObject<{
    radiusMiles: z.ZodDefault<z.ZodNumber>;
    filters: z.ZodOptional<z.ZodArray<z.ZodString>>;
    timeWindow: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"TONIGHT">, z.ZodLiteral<"WEEKEND">, z.ZodLiteral<"ANYTIME">]>>;
    location: z.ZodOptional<z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const ideasQuerySchema: z.ZodObject<{
    type: z.ZodUnion<readonly [z.ZodLiteral<"LOCAL">, z.ZodLiteral<"FOOD">, z.ZodLiteral<"MOVIE">, z.ZodLiteral<"HOME">]>;
    radiusMiles: z.ZodOptional<z.ZodNumber>;
    location: z.ZodOptional<z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, z.core.$strip>>;
    filters: z.ZodOptional<z.ZodArray<z.ZodString>>;
    timeWindow: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const recipesQuerySchema: z.ZodObject<{
    ingredients: z.ZodArray<z.ZodString>;
    preferences: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const ideaMetadataLocalSchema: z.ZodObject<{
    address: z.ZodString;
    lat: z.ZodNumber;
    lng: z.ZodNumber;
    distanceMiles: z.ZodOptional<z.ZodNumber>;
    websiteUrl: z.ZodOptional<z.ZodString>;
    priceLevel: z.ZodOptional<z.ZodNumber>;
    placeId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ideaMetadataFoodSchema: z.ZodObject<{
    ingredients: z.ZodArray<z.ZodString>;
    missingIngredients: z.ZodOptional<z.ZodArray<z.ZodString>>;
    recipeUrl: z.ZodOptional<z.ZodString>;
    timeMinutes: z.ZodOptional<z.ZodNumber>;
    difficulty: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ideaMetadataMovieSchema: z.ZodObject<{
    provider: z.ZodOptional<z.ZodString>;
    deepLinkUrl: z.ZodOptional<z.ZodString>;
    genre: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ideaMetadataHomeSchema: z.ZodObject<{
    promptType: z.ZodString;
}, z.core.$strip>;
export declare const ideaResponseSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodUnion<readonly [z.ZodLiteral<"LOCAL">, z.ZodLiteral<"FOOD">, z.ZodLiteral<"MOVIE">, z.ZodLiteral<"HOME">]>;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    category: z.ZodNullable<z.ZodString>;
    source: z.ZodUnion<readonly [z.ZodLiteral<"CURATED">, z.ZodLiteral<"GENERATED">, z.ZodLiteral<"USER_SAVED">]>;
    metadata: z.ZodRecord<z.ZodString, z.ZodAny>;
    createdAt: z.ZodString;
}, z.core.$strip>;
export declare const savedIdeasResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        ideaId: z.ZodString;
        idea: z.ZodObject<{
            id: z.ZodString;
            type: z.ZodUnion<readonly [z.ZodLiteral<"LOCAL">, z.ZodLiteral<"FOOD">, z.ZodLiteral<"MOVIE">, z.ZodLiteral<"HOME">]>;
            title: z.ZodString;
            description: z.ZodNullable<z.ZodString>;
            category: z.ZodNullable<z.ZodString>;
            source: z.ZodUnion<readonly [z.ZodLiteral<"CURATED">, z.ZodLiteral<"GENERATED">, z.ZodLiteral<"USER_SAVED">]>;
            metadata: z.ZodRecord<z.ZodString, z.ZodAny>;
            createdAt: z.ZodString;
        }, z.core.$strip>;
        notes: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
//# sourceMappingURL=schemas.d.ts.map