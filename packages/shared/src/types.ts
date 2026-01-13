export type UUID = string;

export type RelationshipStage = "dating" | "committed" | "engaged" | "married";
export type RelationshipStatus = "active" | "ended";

export type ActivityStyle = "chill" | "active" | "surprise";
export type BudgetLevel = "low" | "medium" | "high";

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export type MoodState = "energetic" | "calm" | "playful" | "romantic" | "adventurous" | "relaxed" | "stressed" | "happy";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export type WeatherPreference = "indoor" | "outdoor" | "any";

export type NoteType = "TEXT" | "VOICE" | "VIDEO";

export type Note = {
  id: UUID;
  type: NoteType;
  content: string | null;
  media_url: string | null;
  authorId: UUID;
  createdAt: string;
};

export type NoteCreatePayload = {
  type: NoteType;
  content?: string | null;
  media_url?: string | null;
};

export type NotesResponse = {
  notes: Note[];
};

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

export type MoodCheckinPayload = {
  moodState: MoodState;
};

export type MoodCheckinResponse = {
  id: UUID;
  moodState: MoodState;
  createdAt: string;
};

export type ActivityPreferences = {
  id: UUID;
  interests: string[];
  dietaryRestrictions: string[];
  hasChildren: boolean;
  accessibilityNeeds: string[];
  budgetLevel: BudgetLevel;
  maxDistance: number;
  preferredTimeOfDay: TimeOfDay[];
  weatherPreference: WeatherPreference;
  createdAt: string;
  updatedAt: string;
};

export type ActivityPreferencesPayload = {
  interests?: string[];
  dietaryRestrictions?: string[];
  hasChildren?: boolean;
  accessibilityNeeds?: string[];
  budgetLevel?: BudgetLevel;
  maxDistance?: number;
  preferredTimeOfDay?: TimeOfDay[];
  weatherPreference?: WeatherPreference;
};

export type ActivityFilters = {
  distance?: number;
  priceLevel?: BudgetLevel;
  timeOfDay?: TimeOfDay;
  weatherPreference?: WeatherPreference;
  familyFriendly?: boolean;
  accessible?: boolean;
  interests?: string[];
};

export type Activity = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  address?: string;
  distance?: number;
  priceLevel: BudgetLevel;
  rating?: number;
  tags: string[];
  isFamilyFriendly: boolean;
  isAccessible: boolean;
  hours?: string;
  bookingUrl?: string;
};

export type ActivitiesResponse = {
  activities: Activity[];
  count: number;
};
