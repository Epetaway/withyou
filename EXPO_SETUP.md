# Expo Setup Guide

This guide covers setting up the WithYou mobile app for development and testing.

## Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g eas-cli`
- Xcode (iOS) or Android Studio (Android)
- iOS Simulator or Android Emulator

## Initial Setup

### 1. Install Dependencies

```bash
cd apps/mobile
npm install
```

### 2. Create app.json

Create `apps/mobile/app.json`:

```json
{
  "expo": {
    "name": "WithYou",
    "slug": "withyou",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTabletMode": false,
      "bundleIdentifier": "com.withyou.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.withyou.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-secure-store",
        {
          "faceIDPermission": "Allow WithYou to access your Face ID"
        }
      ]
    ]
  }
}
```

### 3. Create Environment File

Create `apps/mobile/.env`:

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### 4. Create Entry Point

Create `apps/mobile/index.ts`:

```typescript
import { registerRootComponent } from 'expo';
import App from './src/App';

registerRootComponent(App);
```

Create `apps/mobile/src/App.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { RootNavigator } from './navigation/RootNavigator';
import { tokens } from './ui/tokens';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize app state here
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: tokens.colors.bg,
        }}
      >
        <ActivityIndicator size="large" color={tokens.colors.button} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
    </>
  );
}
```

## Development

### iOS Simulator

```bash
npm run dev:mobile -- --ios
# or
npx expo start --ios
```

### Android Emulator

```bash
npm run dev:mobile -- --android
# or
npx expo start --android
```

### Web (for testing UI)

```bash
npm run dev:mobile -- --web
# or
npx expo start --web
```

## Key Screens

### Authentication Flow

- **LoginScreen**: Email/password login
- **RegisterScreen**: New account creation

### Pairing Flow

- **UnpairedHomeScreen**: Shows "Pair with someone" CTA
- **PairInviteScreen**: Generate and share invite code
- **PairAcceptScreen**: Enter invite code to pair

### Paired Experience

- **DashboardScreen**: Relationship status and partner activity
- **CheckInScreen**: Log daily mood and notes
- **PreferencesScreen**: Set activity preferences
- **IdeasScreen**: Get personalized date ideas
- **SettingsScreen**: Manage pairing and account

## API Integration

All screens use the API client from `src/api/client.ts`:

```typescript
import { createApiClient } from '../api/client';

const api = createApiClient('YOUR_TOKEN');

// Example: Get dashboard
const dashboard = await api.get('/dashboard');

// Example: Create check-in
await api.post('/checkins', {
  mood_level: 4,
  note: 'Great day!',
  shared: true,
});
```

## Error Handling

Errors from the API follow this shape:

```typescript
{
  error: {
    code: 'ERROR_CODE',
    message: 'Human-readable message',
    details: null,
  }
}
```

Handle in screens:

```typescript
try {
  const result = await api.post('/checkins', data);
} catch (err) {
  if (err instanceof ApiError) {
    setError(err.message);
  }
}
```

## Testing Locally

### 1. Start API Server

```bash
npm run dev:api
```

API runs on `http://localhost:3000`

### 2. Update .env

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 3. Start Simulator and Expo

Terminal 1:

```bash
cd apps/mobile
npm start
```

Terminal 2:

```bash
npm start -- --ios  # or --android
```

### 4. Test Full Flow

1. Register new account
2. Open second simulator/device
3. Register second account
4. First account: Generate invite code
5. Second account: Accept invite code
6. Both accounts: Set preferences and check in

## Debugging

### Console Logs

In Simulator, press `Ctrl+Cmd+Z` (iOS) or `Ctrl+M` (Android) to open debug menu.

### Flipper

Install [Flipper](https://fbflipper.com/) for detailed debugging:

```bash
npm install --save-dev react-native-flipper
```

### Error Boundaries

The app includes error boundaries on critical screens:

```typescript
<ErrorBoundary>
  <YourScreen />
</ErrorBoundary>
```

## Building for Production

### iOS

```bash
eas build --platform ios --auto-submit
```

### Android

```bash
eas build --platform android --auto-submit
```

### Web

```bash
expo export --platform web
```

## Performance Tips

- Use `useMemo` for expensive computations
- Lazy load screens with `React.lazy()`
- Implement pagination for long lists
- Cache API responses with React Query or SWR
- Profile with React DevTools Profiler

## Deep Linking Configuration

Deep linking allows users to open the app directly from invitation links.

### 1. Configure app.json

The deep linking configuration has already been added to `app.json`:

```json
{
  "expo": {
    "scheme": "withyou",
    "ios": {
      "bundleIdentifier": "com.withyou.app",
      "associatedDomains": ["applinks:withyou.app"]
    },
    "android": {
      "package": "com.withyou.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "withyou.app",
              "pathPrefix": "/join"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "plugins": [
      ["expo-apple-authentication"]
    ]
  }
}
```

### 2. Domain Verification (Production)

#### iOS Universal Links

Create `/.well-known/apple-app-site-association` on your domain (withyou.app):

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.withyou.app",
        "paths": ["/join/*"]
      }
    ]
  }
}
```

Host this file at:
- `https://withyou.app/.well-known/apple-app-site-association`
- Content-Type: `application/json`
- No file extension

#### Android App Links

Create `/.well-known/assetlinks.json` on your domain:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.withyou.app",
      "sha256_cert_fingerprints": [
        "YOUR_SHA256_FINGERPRINT_HERE"
      ]
    }
  }
]
```

Get SHA256 fingerprint:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA256
```

Host this file at:
- `https://withyou.app/.well-known/assetlinks.json`
- Content-Type: `application/json`

### 3. Handle Deep Links in App

Add to `App.tsx` or create a deep link handler:

```typescript
import * as Linking from 'expo-linking';
import { useEffect } from 'react';

function DeepLinkHandler({ navigation }: { navigation: any }) {
  useEffect(() => {
    // Handle initial URL if app was opened from a link
    const handleInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleDeepLink(url);
      }
    };

    // Handle URLs when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    handleInitialURL();

    return () => subscription.remove();
  }, []);

  const handleDeepLink = (url: string) => {
    const { path, queryParams } = Linking.parse(url);
    
    // Handle: https://withyou.app/join/ABC123 or withyou://join/ABC123
    if (path === 'join' || path?.startsWith('join/')) {
      const inviteCode = path.split('/')[1] || queryParams?.code;
      if (inviteCode) {
        navigation.navigate('PairAccept', { inviteCode });
      }
    }
  };

  return null;
}

// In your navigation setup:
export function RootNavigator() {
  return (
    <NavigationContainer>
      <DeepLinkHandler navigation={navigation} />
      {/* Your navigation stack */}
    </NavigationContainer>
  );
}
```

### 4. Testing Deep Links

#### iOS Simulator

```bash
xcrun simctl openurl booted "withyou://join/ABC123"
# or
xcrun simctl openurl booted "https://withyou.app/join/ABC123"
```

#### Android Emulator

```bash
adb shell am start -W -a android.intent.action.VIEW -d "withyou://join/ABC123" com.withyou.app
# or
adb shell am start -W -a android.intent.action.VIEW -d "https://withyou.app/join/ABC123" com.withyou.app
```

#### Expo Go (Development)

```bash
npx uri-scheme open "withyou://join/ABC123" --ios
# or
npx uri-scheme open "withyou://join/ABC123" --android
```

### 5. Update PairAcceptScreen

Modify the screen to accept invite code from route params:

```typescript
export function PairAcceptScreen({ navigation, route }: Props) {
  const [inviteCode, setInviteCode] = useState(route.params?.inviteCode || '');
  
  // Auto-submit if code provided via deep link
  useEffect(() => {
    if (route.params?.inviteCode && route.params.inviteCode.length === 6) {
      handleSubmit();
    }
  }, [route.params?.inviteCode]);
  
  // ... rest of component
}
```

### 6. Share Links

Use the native share sheet to share invitation links:

```typescript
import { Share } from 'react-native';

const shareInvite = async (deepLink: string, inviteCode: string) => {
  try {
    await Share.share({
      message: `Join me on WithYou! Use code ${inviteCode} or click: ${deepLink}`,
      url: deepLink, // iOS will show this separately
    });
  } catch (error) {
    console.error('Share error:', error);
  }
};
```

## Common Issues

### "Cannot connect to API"

- Ensure API server is running (`npm run dev:api`)
- Check EXPO_PUBLIC_API_BASE_URL in .env
- For Android: Replace `localhost` with `10.0.2.2`

### "expo-secure-store not installed"

```bash
npm install expo-secure-store
npx expo prebuild --clean
```

### "Navigation state not set"

- Ensure `RootNavigator` is properly initialized
- Check auth status is being fetched in useEffect
- Verify token exists in secure storage after login

## Next Steps

- Add splash screen assets
- Implement offline support with AsyncStorage
- Add push notifications
- Set up Sentry for error tracking
- Create TestFlight builds for iOS
- Set up GitHub Actions for automated builds
