// Explicit .js extensions keep NodeNext module resolution happy when compiled
export type {
	UUID,
	RelationshipStage,
	RelationshipStatus,
	ActivityStyle,
	BudgetLevel,
	MoodLevel,
	ApiErrorShape,
	AuthResponse,
	InviteResponse,
	RelationshipAcceptResponse,
	CheckinCreateResponse,
	DashboardResponse,
	PreferencesPayload,
	IdeasResponse,
	SavedIdeaResponse,
} from "./types.js";

export {
	emailSchema,
	passwordSchema,
	registerSchema,
	loginSchema,
	inviteAcceptSchema,
	moodLevelSchema,
	checkinCreateSchema,
	activityStyleSchema,
	budgetLevelSchema,
	preferencesSchema,
	relationshipStageSchema,
	apiErrorSchema,
} from "./schemas.js";

export { CONTENT } from "./content.js";
