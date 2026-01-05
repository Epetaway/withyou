export const CONTENT = {
    app: {
        name: "WithYou",
        nav: {
            dashboard: "Dashboard",
            checkIn: "Check-in",
            preferences: "Preferences",
            ideas: "Ideas",
            settings: "Settings",
        },
        common: {
            save: "Save",
            cancel: "Cancel",
            continue: "Continue",
            back: "Back",
            close: "Close",
            loading: "Loading...",
            retry: "Try again",
            required: "Required",
        },
        errors: {
            network: "Can’t connect right now. Try again.",
            unknown: "Something went wrong. Try again.",
        },
    },
    auth: {
        login: {
            title: "Log in",
            fields: {
                emailLabel: "Email",
                passwordLabel: "Password",
            },
            actions: {
                primary: "Log in",
                secondary: "Create an account",
            },
            helper: "Your account is private.",
            validation: {
                emailRequired: "Enter your email.",
                emailInvalid: "Enter a valid email address.",
                passwordRequired: "Enter your password.",
            },
            apiErrors: {
                invalidCredentials: "Email or password is incorrect.",
            },
        },
        register: {
            title: "Create account",
            fields: {
                emailLabel: "Email",
                passwordLabel: "Password",
                confirmPasswordLabel: "Confirm password",
            },
            actions: {
                primary: "Create account",
                secondary: "Back to log in",
            },
            helper: "You can pair with your partner after creating your account.",
            validation: {
                emailRequired: "Enter your email.",
                emailInvalid: "Enter a valid email address.",
                passwordRequired: "Enter your password.",
                passwordMinLength: "Password must be at least 8 characters.",
                confirmPasswordRequired: "Confirm your password.",
                passwordMismatch: "Passwords do not match.",
            },
            success: {
                created: "Account created.",
            },
        },
    },
    pairing: {
        invite: {
            title: "Pair with partner",
            body: "Create an invite code to connect privately with your partner.",
            fields: {
                inviteCodeLabel: "Invite code",
            },
            actions: {
                generateCode: "Generate invite code",
                copyLink: "Copy invite link",
                goToSettings: "Go to settings",
            },
            status: {
                waiting: "Waiting for your partner to accept.",
            },
            blocked: {
                title: "You are already paired",
                body: "End your current pairing to start a new one.",
            },
            errors: {
                createFailed: "Could not create an invite. Try again.",
            },
        },
        accept: {
            title: "Enter invite code",
            fields: {
                inviteCodeLabel: "Invite code",
            },
            helper: "Pairing requires mutual consent.",
            actions: {
                primary: "Accept and pair",
            },
            validation: {
                codeRequired: "Enter an invite code.",
            },
            apiErrors: {
                invalid: "Invite code is not valid.",
                expired: "This invite code has expired.",
                alreadyUsed: "This invite code has already been used.",
                alreadyPairedSelf: "You must end your current pairing first.",
                alreadyPairedOther: "This person is already paired.",
            },
        },
    },
    dashboard: {
        paired: {
            title: "Dashboard",
            labels: {
                stage: "Relationship stage",
                partnerCheckInHeader: "Partner check-in",
                lastSharedCheckIn: "Last shared check-in:",
                moodLevel: "Mood level:",
                recentActivityHeader: "Recent activity",
            },
            actions: {
                newCheckIn: "New check-in",
                updatePreferences: "Update preferences",
                getIdeas: "Get ideas",
            },
            empty: {
                noSharedCheckIns: "No shared check-ins yet.",
                noRecentActivity: "No recent activity.",
            },
        },
        unpaired: {
            title: "Dashboard",
            body: "You are not paired yet. Pair with your partner to get started.",
            actions: {
                primary: "Pair with partner",
            },
        },
    },
    checkIn: {
        create: {
            title: "New check-in",
            prompt: "How are you feeling today?",
            fields: {
                moodLabel: "Mood level",
                noteLabel: "Note (optional)",
                shareToggleLabel: "Share with partner",
                shareHelper: "If turned on, your partner can view this check-in.",
            },
            moodLabels: {
                1: "Very low",
                2: "Low",
                3: "Neutral",
                4: "Good",
                5: "Very good",
            },
            actions: {
                primary: "Save check-in",
                secondary: "Cancel",
            },
            validation: {
                moodRequired: "Select a mood level.",
            },
            success: {
                saved: "Check-in saved.",
            },
        },
    },
    preferences: {
        title: "Preferences",
        body: "Set your preferences for suggestions and ideas. These are private.",
        fields: {
            activityStyleLabel: "Activity style",
            foodTypesLabel: "Food types",
            foodTypesHelper: "Choose as many as you like.",
            budgetLabel: "Budget level",
            energyLabel: "Energy level",
            energyHelper: "Lower values suggest low-effort ideas.",
        },
        options: {
            activityStyle: {
                chill: "Chill",
                active: "Active",
                surprise: "Surprise",
            },
            budget: {
                low: "Low",
                medium: "Medium",
                high: "High",
            },
            stage: {
                dating: "Dating",
                committed: "Committed",
                engaged: "Engaged",
                married: "Married",
            },
        },
        actions: {
            primary: "Save preferences",
        },
        validation: {
            missingRequired: "Complete the required fields.",
        },
        success: {
            saved: "Preferences saved.",
        },
    },
    ideas: {
        title: "Ideas",
        body: "Here are a few ideas based on your preferences.",
        actions: {
            refresh: "Refresh ideas",
            save: "Save idea",
            goToPreferences: "Go to preferences",
        },
        empty: {
            needsPreferencesTitle: "Set preferences to get ideas",
            needsPreferencesBody: "Add preferences to generate better suggestions.",
        },
        errors: {
            generationFailed: "Could not generate ideas. Try again.",
            rateLimited: "Try again in a moment.",
        },
        success: {
            saved: "Idea saved.",
        },
    },
    settings: {
        title: "Settings",
        sections: {
            relationship: "Relationship",
            account: "Account",
            dangerZone: "Danger zone",
        },
        relationship: {
            stageLabel: "Relationship stage",
            endPairing: "End pairing",
            confirmEndTitle: "End pairing?",
            confirmEndBody: "This ends your pairing and removes access to shared content.",
            confirmEndAction: "End pairing",
            cancelEndAction: "Cancel",
            successEnded: "Pairing ended.",
        },
        account: {
            logout: "Log out",
            confirmLogoutTitle: "Log out?",
            confirmLogoutBody: "You will need to log in again to access WithYou.",
            confirmLogoutAction: "Log out",
            cancelLogoutAction: "Cancel",
        },
    },
    lists: {
        foodTypes: [
            "American",
            "Italian",
            "Mexican",
            "Asian",
            "Mediterranean",
            "Vegetarian",
            "Seafood",
            "Dessert",
            "Coffee and cafes",
        ],
    },
};
//# sourceMappingURL=content.js.map