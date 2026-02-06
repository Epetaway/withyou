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
  emailVerified?: boolean;
};

export type OAuthLoginResponse = {
  userId: UUID;
  token: string;
  isNewUser: boolean;
  emailVerified: boolean;
};

export type EmailVerificationSendResponse = {
  message: string;
  expiresAt: string;
};

export type EmailVerificationConfirmResponse = {
  message: string;
  verified: boolean;
};

export type AvatarUploadUrlResponse = {
  uploadUrl: string;
  fields: Record<string, string>;
  avatarUrl: string;
};

export type AvatarUploadResponse = {
  avatarUrl: string;
};

export type ProfileSetupResponse = {
  message: string;
  setupCompleted: boolean;
};

export type InviteResponse = {
  inviteCode: string;
  expiresAt: string;
  deepLink?: string;
};

export type RelationshipAcceptResponse = {
  relationshipId: UUID;
  status: RelationshipStatus;
};

export type CheckinCreateResponse = {
  checkinId: UUID;
  createdAt: string;
};

// Mood Ring v2 Types
export type MoodColor = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink";

export type EmotionLabel = 
  | "happy" 
  | "excited" 
  | "calm" 
  | "loved" 
  | "tired" 
  | "stressed" 
  | "anxious" 
  | "sad" 
  | "frustrated" 
  | "content";

export type EnergyLevel = "low" | "medium" | "high";

export type CheckinV2Payload = {
  moodColor: MoodColor;
  emotionLabel: EmotionLabel;
  energyLevel: EnergyLevel;
  note?: string;
};

export type CheckinV2Response = {
  id: UUID;
  moodColor: MoodColor;
  emotionLabel: EmotionLabel;
  energyLevel: EnergyLevel;
  note?: string;
  createdAt: string;
  revealed: boolean;
};

export type CheckinTodayResponse = {
  userCheckin: CheckinV2Response | null;
  partnerCheckin: CheckinV2Response | null;
  gradient?: {
    colors: [MoodColor, MoodColor];
    insight: string;
    tips: string[];
  };
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

// Plan Types
export type Plan = {
  id: UUID;
  userId: UUID;
  relationshipId?: UUID;
  ideaId?: UUID;
  title: string;
  description?: string;
  placeId?: string;
  address?: string;
  lat?: number;
  lng?: number;
  websiteUrl?: string;
  phoneNumber?: string;
  priceLevel?: number;
  scheduledDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type PlanPayload = {
  ideaId?: UUID;
  title: string;
  description?: string;
  placeId?: string;
  address?: string;
  lat?: number;
  lng?: number;
  websiteUrl?: string;
  phoneNumber?: string;
  priceLevel?: number;
  scheduledDate?: string;
  notes?: string;
};

export type PlanResponse = {
  plan: Plan;
};

export type PlansListResponse = {
  plans: Plan[];
  count: number;
};

export type CalendarEventPayload = {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
};

export type CalendarEventResponse = {
  success: boolean;
  icsUrl?: string;
};

// Workout Goal Types
export type GoalStatus = "active" | "completed" | "failed";

export type WorkoutGoal = {
  id: UUID;
  userId: UUID;
  relationshipId?: UUID;
  title: string;
  description?: string;
  targetMetric: string;
  targetValue: number;
  startDate: string;
  endDate: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  logs?: WorkoutLog[];
  bets?: WorkoutBet[];
  progress?: number; // Calculated percentage
  userProgress?: number; // For couple challenges
  partnerProgress?: number; // For couple challenges
};

export type WorkoutLog = {
  id: UUID;
  goalId: UUID;
  userId: UUID;
  amount: number;
  notes?: string;
  loggedAt: string;
};

export type WorkoutBet = {
  id: UUID;
  relationshipId: UUID;
  goalId: UUID;
  wagerDescription: string;
  createdAt: string;
};

export type WorkoutGoalCreatePayload = {
  title: string;
  description?: string;
  targetMetric: string;
  targetValue: number;
  startDate: string;
  endDate: string;
  isCouple?: boolean;
};

export type WorkoutGoalResponse = {
  goal: WorkoutGoal;
};

export type WorkoutGoalsListResponse = {
  goals: WorkoutGoal[];
  count: number;
};

export type WorkoutLogResponse = {
  log: WorkoutLog;
  goal: WorkoutGoal;
};

export type WorkoutBetResponse = {
  bet: WorkoutBet;
};

export type WorkoutLeaderboardResponse = {
  userProgress: number;
  partnerProgress: number;
  winner?: "user" | "partner" | "tie";
};

// Grocery List Types
export type GroceryList = {
  id: UUID;
  relationshipId: UUID;
  name: string;
  createdAt: string;
  updatedAt: string;
  items?: GroceryItem[];
};

export type GroceryItem = {
  id: UUID;
  listId: UUID;
  addedBy: UUID;
  name: string;
  quantity: number;
  unit?: string;
  vetoed: boolean;
  vetoedBy?: UUID;
  vetoReason?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  addedByUser?: {
    id: UUID;
    email: string;
  };
  vetoByUser?: {
    id: UUID;
    email: string;
  };
};

export type GroceryListCreatePayload = {
  name: string;
};

export type GroceryItemCreatePayload = {
  name: string;
  quantity?: number;
  unit?: string;
};

export type GroceryItemUpdatePayload = {
  name?: string;
  quantity?: number;
  unit?: string;
  completed?: boolean;
};

export type GroceryListResponse = {
  list: GroceryList;
};

export type GroceryListsResponse = {
  lists: GroceryList[];
  count: number;
};

export type GroceryItemResponse = {
  item: GroceryItem;
};

// Chat Message Types
export type MessageType = "text" | "image" | "voice" | "assistance_request";

export type ChatMessage = {
  id: UUID;
  relationshipId: UUID;
  senderId: UUID;
  content: string;
  type: MessageType;
  mediaUrl?: string;
  readAt?: string;
  createdAt: string;
  sender?: {
    id: UUID;
    email: string;
  };
};

export type ChatMessageCreatePayload = {
  content: string;
  type?: MessageType;
  mediaUrl?: string;
};

export type ChatMessageResponse = {
  message: ChatMessage;
};

export type ChatMessagesResponse = {
  messages: ChatMessage[];
  count: number;
  unreadCount?: number;
};

export type ChatUnreadCountResponse = {
  unreadCount: number;
};
// ===== Wearable Devices & Health Tracking =====

export type DeviceType = 'apple_watch' | 'google_watch' | 'apple_health' | 'google_fit';

export type WearableDevice = {
  id: UUID;
  userId: UUID;
  deviceType: DeviceType;
  deviceName: string;
  isActive: boolean;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type HealthMetric = {
  id: UUID;
  userId: UUID;
  date: string;
  steps?: number;
  heartRate?: number; // BPM
  activeMinutes?: number; // Minutes of activity
  calories?: number;
  sleepDuration?: number; // Minutes
  syncedFrom?: DeviceType;
  createdAt: string;
  updatedAt: string;
};

export type DeviceConnectionPayload = {
  deviceType: DeviceType;
  deviceName: string;
  authCode: string; // From OAuth flow
};

export type WearableDeviceResponse = {
  device: WearableDevice;
};

export type HealthMetricsResponse = {
  metrics: HealthMetric[];
  dateRange: {
    from: string;
    to: string;
  };
};

// ===== Activity Challenges =====

export type ChallengeType = 'steps' | 'heart_rate' | 'combined' | 'daily_active_minutes';
export type ChallengeStatus = 'pending' | 'active' | 'completed' | 'declined';

export type ActivityChallenge = {
  id: UUID;
  relationshipId: UUID;
  initiatorId: UUID;
  participantId: UUID;
  challengeType: ChallengeType;
  status: ChallengeStatus;
  title: string;
  description?: string;
  targetValue: number; // Daily target (steps, bpm, minutes, etc.)
  duration: number; // Days
  reward?: string; // What's at stake
  startDate: string;
  endDate: string;
  declinedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  progress?: ChallengeProgress[];
};

export type ChallengeProgress = {
  id: UUID;
  challengeId: UUID;
  userId: UUID;
  totalSteps: number;
  avgHeartRate?: number;
  daysCompleted: number;
  maxMetricValue?: number;
  lastUpdatedAt: string;
};

export type ActivityChallengeCreatePayload = {
  participantId: UUID;
  challengeType: ChallengeType;
  title: string;
  description?: string;
  targetValue: number;
  duration: number; // Days
  reward?: string;
};

export type ActivityChallengeResponse = {
  challenge: ActivityChallenge;
};

export type ActivityChallengesListResponse = {
  challenges: ActivityChallenge[];
  count: number;
};

export type ChallengeProgressResponse = {
  progress: ChallengeProgress[];
  leaderboard: Array<{
    userId: UUID;
    displayName?: string;
    totalSteps: number;
    avgHeartRate?: number;
    daysCompleted: number;
    ranking: number;
  }>;
};

export type ActivityLeaderboardResponse = {
  challengeId: UUID;
  participants: Array<{
    userId: UUID;
    displayName?: string;
    totalSteps: number;
    avgHeartRate?: number;
    daysCompleted: number;
    ranking: number;
    percentageComplete: number;
  }>;
  currentUserRanking: number;
};