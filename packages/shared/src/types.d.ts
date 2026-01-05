export type UUID = string;
export type RelationshipStage = "dating" | "committed" | "engaged" | "married";
export type RelationshipStatus = "active" | "ended";
export type ActivityStyle = "chill" | "active" | "surprise";
export type BudgetLevel = "low" | "medium" | "high";
export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type ApiErrorShape = {
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown> | Array<Record<string, unknown>> | string;
    };
};
export type AuthResponse = {
    userId: UUID;
    token: string;
};
export type InviteResponse = {
    inviteCode: string;
    expiresAt: string;
};
export type RelationshipAcceptResponse = {
    relationshipId: UUID;
    status: RelationshipStatus;
};
export type CheckinCreateResponse = {
    checkinId: UUID;
    createdAt: string;
};
export type DashboardResponse = {
    relationshipStage: RelationshipStage | null;
    partnerLastCheckIn: null | {
        mood_level: MoodLevel;
        shared: true;
        timestamp: string;
    };
    recentActivity: string[];
};
export type PreferencesPayload = {
    activity_style: ActivityStyle;
    food_types: string[];
    budget_level: BudgetLevel;
    energy_level: MoodLevel;
};
export type IdeasResponse = {
    ideas: string[];
};
export type SavedIdeaResponse = {
    id: UUID;
    createdAt: string;
};
//# sourceMappingURL=types.d.ts.map