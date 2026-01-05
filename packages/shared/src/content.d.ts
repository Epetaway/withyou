export declare const CONTENT: {
    readonly app: {
        readonly name: "WithYou";
        readonly nav: {
            readonly dashboard: "Dashboard";
            readonly checkIn: "Check-in";
            readonly preferences: "Preferences";
            readonly ideas: "Ideas";
            readonly settings: "Settings";
        };
        readonly common: {
            readonly save: "Save";
            readonly cancel: "Cancel";
            readonly continue: "Continue";
            readonly back: "Back";
            readonly close: "Close";
            readonly loading: "Loading...";
            readonly retry: "Try again";
            readonly required: "Required";
        };
        readonly errors: {
            readonly network: "Can’t connect right now. Try again.";
            readonly unknown: "Something went wrong. Try again.";
        };
    };
    readonly auth: {
        readonly login: {
            readonly title: "Log in";
            readonly fields: {
                readonly emailLabel: "Email";
                readonly passwordLabel: "Password";
            };
            readonly actions: {
                readonly primary: "Log in";
                readonly secondary: "Create an account";
            };
            readonly helper: "Your account is private.";
            readonly validation: {
                readonly emailRequired: "Enter your email.";
                readonly emailInvalid: "Enter a valid email address.";
                readonly passwordRequired: "Enter your password.";
            };
            readonly apiErrors: {
                readonly invalidCredentials: "Email or password is incorrect.";
            };
        };
        readonly register: {
            readonly title: "Create account";
            readonly fields: {
                readonly emailLabel: "Email";
                readonly passwordLabel: "Password";
                readonly confirmPasswordLabel: "Confirm password";
            };
            readonly actions: {
                readonly primary: "Create account";
                readonly secondary: "Back to log in";
            };
            readonly helper: "You can pair with your partner after creating your account.";
            readonly validation: {
                readonly emailRequired: "Enter your email.";
                readonly emailInvalid: "Enter a valid email address.";
                readonly passwordRequired: "Enter your password.";
                readonly passwordMinLength: "Password must be at least 8 characters.";
                readonly confirmPasswordRequired: "Confirm your password.";
                readonly passwordMismatch: "Passwords do not match.";
            };
            readonly success: {
                readonly created: "Account created.";
            };
        };
    };
    readonly pairing: {
        readonly invite: {
            readonly title: "Pair with partner";
            readonly body: "Create an invite code to connect privately with your partner.";
            readonly fields: {
                readonly inviteCodeLabel: "Invite code";
            };
            readonly actions: {
                readonly generateCode: "Generate invite code";
                readonly copyLink: "Copy invite link";
                readonly goToSettings: "Go to settings";
            };
            readonly status: {
                readonly waiting: "Waiting for your partner to accept.";
            };
            readonly blocked: {
                readonly title: "You are already paired";
                readonly body: "End your current pairing to start a new one.";
            };
            readonly errors: {
                readonly createFailed: "Could not create an invite. Try again.";
            };
        };
        readonly accept: {
            readonly title: "Enter invite code";
            readonly fields: {
                readonly inviteCodeLabel: "Invite code";
            };
            readonly helper: "Pairing requires mutual consent.";
            readonly actions: {
                readonly primary: "Accept and pair";
            };
            readonly validation: {
                readonly codeRequired: "Enter an invite code.";
            };
            readonly apiErrors: {
                readonly invalid: "Invite code is not valid.";
                readonly expired: "This invite code has expired.";
                readonly alreadyUsed: "This invite code has already been used.";
                readonly alreadyPairedSelf: "You must end your current pairing first.";
                readonly alreadyPairedOther: "This person is already paired.";
            };
        };
    };
    readonly dashboard: {
        readonly paired: {
            readonly title: "Dashboard";
            readonly labels: {
                readonly stage: "Relationship stage";
                readonly partnerCheckInHeader: "Partner check-in";
                readonly lastSharedCheckIn: "Last shared check-in:";
                readonly moodLevel: "Mood level:";
                readonly recentActivityHeader: "Recent activity";
            };
            readonly actions: {
                readonly newCheckIn: "New check-in";
                readonly updatePreferences: "Update preferences";
                readonly getIdeas: "Get ideas";
            };
            readonly empty: {
                readonly noSharedCheckIns: "No shared check-ins yet.";
                readonly noRecentActivity: "No recent activity.";
            };
        };
        readonly unpaired: {
            readonly title: "Dashboard";
            readonly body: "You are not paired yet. Pair with your partner to get started.";
            readonly actions: {
                readonly primary: "Pair with partner";
            };
        };
    };
    readonly checkIn: {
        readonly create: {
            readonly title: "New check-in";
            readonly prompt: "How are you feeling today?";
            readonly fields: {
                readonly moodLabel: "Mood level";
                readonly noteLabel: "Note (optional)";
                readonly shareToggleLabel: "Share with partner";
                readonly shareHelper: "If turned on, your partner can view this check-in.";
            };
            readonly moodLabels: {
                readonly 1: "Very low";
                readonly 2: "Low";
                readonly 3: "Neutral";
                readonly 4: "Good";
                readonly 5: "Very good";
            };
            readonly actions: {
                readonly primary: "Save check-in";
                readonly secondary: "Cancel";
            };
            readonly validation: {
                readonly moodRequired: "Select a mood level.";
            };
            readonly success: {
                readonly saved: "Check-in saved.";
            };
        };
    };
    readonly preferences: {
        readonly title: "Preferences";
        readonly body: "Set your preferences for suggestions and ideas. These are private.";
        readonly fields: {
            readonly activityStyleLabel: "Activity style";
            readonly foodTypesLabel: "Food types";
            readonly foodTypesHelper: "Choose as many as you like.";
            readonly budgetLabel: "Budget level";
            readonly energyLabel: "Energy level";
            readonly energyHelper: "Lower values suggest low-effort ideas.";
        };
        readonly options: {
            readonly activityStyle: {
                readonly chill: "Chill";
                readonly active: "Active";
                readonly surprise: "Surprise";
            };
            readonly budget: {
                readonly low: "Low";
                readonly medium: "Medium";
                readonly high: "High";
            };
            readonly stage: {
                readonly dating: "Dating";
                readonly committed: "Committed";
                readonly engaged: "Engaged";
                readonly married: "Married";
            };
        };
        readonly actions: {
            readonly primary: "Save preferences";
        };
        readonly validation: {
            readonly missingRequired: "Complete the required fields.";
        };
        readonly success: {
            readonly saved: "Preferences saved.";
        };
    };
    readonly ideas: {
        readonly title: "Ideas";
        readonly body: "Here are a few ideas based on your preferences.";
        readonly actions: {
            readonly refresh: "Refresh ideas";
            readonly save: "Save idea";
            readonly goToPreferences: "Go to preferences";
        };
        readonly empty: {
            readonly needsPreferencesTitle: "Set preferences to get ideas";
            readonly needsPreferencesBody: "Add preferences to generate better suggestions.";
        };
        readonly errors: {
            readonly generationFailed: "Could not generate ideas. Try again.";
            readonly rateLimited: "Try again in a moment.";
        };
        readonly success: {
            readonly saved: "Idea saved.";
        };
    };
    readonly settings: {
        readonly title: "Settings";
        readonly sections: {
            readonly relationship: "Relationship";
            readonly account: "Account";
            readonly dangerZone: "Danger zone";
        };
        readonly relationship: {
            readonly stageLabel: "Relationship stage";
            readonly endPairing: "End pairing";
            readonly confirmEndTitle: "End pairing?";
            readonly confirmEndBody: "This ends your pairing and removes access to shared content.";
            readonly confirmEndAction: "End pairing";
            readonly cancelEndAction: "Cancel";
            readonly successEnded: "Pairing ended.";
        };
        readonly account: {
            readonly logout: "Log out";
            readonly confirmLogoutTitle: "Log out?";
            readonly confirmLogoutBody: "You will need to log in again to access WithYou.";
            readonly confirmLogoutAction: "Log out";
            readonly cancelLogoutAction: "Cancel";
        };
    };
    readonly lists: {
        readonly foodTypes: readonly ["American", "Italian", "Mexican", "Asian", "Mediterranean", "Vegetarian", "Seafood", "Dessert", "Coffee and cafes"];
    };
};
//# sourceMappingURL=content.d.ts.map