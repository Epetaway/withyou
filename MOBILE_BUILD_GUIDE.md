# WithYou Mobile Build Guide

This guide covers building and testing the WithYou app for both iOS and Android.

## Prerequisites

### System Requirements
- **macOS** (for iOS development)
- **Node.js 18+**
- **Xcode 15+** (for iOS simulator)
- **Android Studio** (for Android emulator)
- **Ruby 2.7+** (for iOS build dependencies)

### Installation

#### 1. Install Expo CLI and EAS CLI
```bash
npm install -g eas-cli
npm install -g expo-cli
```

#### 2. Create Expo Account
```bash
eas login
# or use: eas login --username <your-username>
```

#### 3. Verify Installation
```bash
node -v          # Should be 18+
npm -v           # Should be 9+
eas --version    # Should show version
expo --version   # Should show version
```

## Setup Development Environment

### 1. Install Dependencies
```bash
# From root of monorepo
npm install

# Verify all workspaces are installed
npm list -depth=0
```

### 2. Configure API Endpoint

**Development (local):**
Create `apps/mobile/.env`:
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_APP_VERSION=1.0.0
```

**Production (staging):**
```
EXPO_PUBLIC_API_BASE_URL=https://api.withyou.app
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### 3. Start API Server

Open a separate terminal:
```bash
npm run dev:api
# API will be available at http://localhost:3000
# Verify: curl http://localhost:3000/health
```

## iOS Development

### Prerequisites
- Xcode 15+ with iOS 15+ SDK
- iOS Simulator (comes with Xcode)
- CocoaPods: `sudo gem install cocoapods`

### Start iOS Simulator
```bash
# Open Xcode and launch simulator
open -a Simulator

# Or from command line
xcrun simctl list devices available | grep -i iphone
```

### Build for iOS Simulator
```bash
cd apps/mobile

# Development build
expo run:ios

# Or use Expo's managed service
eas build --platform ios --local
```

### Expected Output
```
[2:01:12 PM] Ensuring necessary tools are available...
[2:01:13 PM] Xcode is installing dependencies...
[2:01:30 PM] Building the app...
[2:01:45 PM] Build completed successfully!
```

### Troubleshooting iOS

**Issue: "Xcode not found"**
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

**Issue: "Pod install" fails**
```bash
cd apps/mobile/ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
```

**Issue: "Metro bundler" timeout**
- Increase timeout: `expo start --ios --max-workers 4`
- Clear cache: `npm start -- --reset-cache`

## Android Development

### Prerequisites
- Android Studio 2023.1+
- Android SDK 33+
- Android Emulator

### Start Android Emulator
```bash
# List available emulators
emulator -list-avds

# Start specific emulator (e.g., Pixel_6_Pro_API_33)
emulator -avd Pixel_6_Pro_API_33

# Or open Android Studio → Device Manager → Start virtual device
```

### Build for Android Emulator
```bash
cd apps/mobile

# Development build
expo run:android

# Or use Expo's managed service
eas build --platform android --local
```

### Expected Output
```
[2:05:10 PM] Building the Android app...
[2:05:45 PM] Compiling Kotlin/Java code...
[2:06:20 PM] Build completed successfully!
[2:06:25 PM] Installing on emulator...
```

### Troubleshooting Android

**Issue: "Emulator not found"**
```bash
# Create new emulator in Android Studio
# Device Manager → Create Virtual Device → Select device → Select API 33+ → Create
```

**Issue: "ANDROID_HOME not set"**
```bash
# Add to ~/.zshrc or ~/.bash_profile
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Issue: "Metro bundler" timeout**
```bash
# Clear cache and rebuild
cd apps/mobile
npm start -- --reset-cache
# In another terminal
expo run:android
```

## Testing Workflows

### 1. Authentication Flow
#### Register New User
1. Launch app
2. Tap "Create Account"
3. Enter:
   - Email: `test@example.com`
   - Password: `TestPass123!`
   - Confirm: `TestPass123!`
4. Tap "Sign Up"
5. **Expected:** Navigate to "Unpaired Home"

#### Login Existing User
1. Tap "Sign In"
2. Enter: `test@example.com` / `TestPass123!`
3. Tap "Sign In"
4. **Expected:** Navigate to "Unpaired Home"

### 2. Pairing Flow
#### Generate Invite Code
1. From "Unpaired Home"
2. Tap "Generate Invite Code"
3. Tap "Copy" to copy code
4. Share code with partner: `ABC123DEF456`
5. **Expected:** Code displays in clipboard

#### Accept Pairing
1. Run app in second simulator/device
2. Register/login as second user
3. From "Unpaired Home", tap "Enter Invite Code"
4. Paste code: `ABC123DEF456`
5. Tap "Pair with Partner"
6. **Expected:** Both users navigate to "Dashboard"

### 3. Check-In Feature
1. From "Dashboard"
2. Tap "Check In"
3. Select mood (1-5)
4. Optional: Add note
5. Toggle "Share with Partner"
6. Tap "Save Check-In"
7. **Expected:** Return to Dashboard, check-in appears in history

### 4. Preferences
1. From "Dashboard"
2. Tap "Preferences"
3. Set:
   - Activity Styles: Select 3-4 options
   - Food Types: Select 3-4 options
   - Budget Level: Select one
   - Energy Level: Select one
4. Tap "Save Preferences"
5. **Expected:** Return to Dashboard

### 5. Ideas Generation
1. From "Dashboard"
2. Tap "Ideas"
3. **Expected:** See 5-10 date ideas based on preferences
4. Tap heart icon to save idea
5. Swipe to see more ideas

### 6. Settings
1. From any screen, tap "Settings"
2. **Expected:** See options:
   - Logout
   - End Pairing (if paired)
3. Tap "Logout"
4. **Expected:** Return to Login screen

## Automated Testing

### Run E2E Tests
```bash
bash test-e2e.sh
```

**Expected output:**
```
✓ Health check passed
✓ User registration passed
✓ User login passed
✓ Generate invite code passed
✓ Accept pairing passed
✓ Create check-in passed
✓ Save preferences passed
✓ Get ideas passed
All tests passed!
```

### Manual Test Checklist

#### Authentication
- [ ] Register new user successfully
- [ ] Login with valid credentials
- [ ] Login fails with wrong password
- [ ] Register fails with duplicate email
- [ ] Password validation (8+ chars, upper, lower, number)

#### Pairing
- [ ] Generate invite code (8 chars alphanumeric)
- [ ] Accept pairing with valid code
- [ ] Accept pairing fails with invalid code
- [ ] Both users see paired status
- [ ] End pairing removes relationship

#### Features
- [ ] Check-in: Save mood (1-5)
- [ ] Check-in: Add optional note
- [ ] Check-in: Toggle sharing
- [ ] Preferences: Save all fields
- [ ] Ideas: Load list based on preferences
- [ ] Ideas: Save/unsave favorites

#### UI/UX
- [ ] All text is readable (contrast)
- [ ] Buttons are tappable (44px+ height)
- [ ] Forms are responsive (phone/tablet)
- [ ] Loading states show spinner
- [ ] Error messages are clear
- [ ] Navigation works properly
- [ ] Settings accessible from all screens

#### Performance
- [ ] App launches in < 3 seconds
- [ ] No crashes on rapid taps
- [ ] Network timeouts handled gracefully
- [ ] Database queries complete < 500ms

## Building for Production

### iOS Production Build
```bash
eas build --platform ios
# Follow prompts for signing certificate
```

### Android Production Build
```bash
eas build --platform android
# Follow prompts for keystore configuration
```

### Submit to App Stores

#### iOS App Store
```bash
eas submit --platform ios
# Enter Apple ID and App Store credentials
```

#### Google Play Store
```bash
eas submit --platform android
# Enter Google Play service account credentials
```

## Debugging

### Enable Remote Debugging
```bash
# In app, shake device or press Ctrl+D (android) / Cmd+D (iOS)
# Select "Debug Remote JS"
# Open browser console at localhost:19000
```

### View Logs
```bash
# API logs
tail -f /tmp/api.log

# Metro bundler logs (during expo start)
# Visible in terminal running expo start

# Device logs (iOS)
xcrun simctl spawn booted log stream --level debug

# Device logs (Android)
adb logcat
```

### Performance Profiling
```bash
# In development menu (Cmd+D or Ctrl+D)
# Select "Profiler"
# Monitor frame rate, memory, network
```

## Common Issues

### Network Connectivity
**Issue:** App cannot reach API (ERR_CONNECTION_REFUSED)
**Solution:**
1. Verify API is running: `curl http://localhost:3000/health`
2. Check `.env` has correct `EXPO_PUBLIC_API_BASE_URL`
3. On iOS simulator: Use `localhost`
4. On Android emulator: Use `10.0.2.2` (emulator gateway IP)
5. Physical device: Use actual machine IP

### Build Failures
**Issue:** "Build failed with error"
**Solution:**
1. Clear cache: `npm start -- --reset-cache`
2. Clean node_modules: `npm run clean`
3. Reinstall: `npm install`
4. Rebuild: `expo run:ios` or `expo run:android`

### Dependency Conflicts
**Issue:** "Module not found" errors
**Solution:**
1. Verify workspace linking: `npm list @withyou/shared`
2. Check `package.json` versions match across workspace
3. Clear lockfile: `rm package-lock.json && npm install`

## Next Steps

1. **Local Testing**: Follow workflows above on both iOS and Android
2. **E2E Testing**: Run `bash test-e2e.sh` to verify full flows
3. **Security Review**: See `SECURITY_CHECKLIST.md`
4. **Production Build**: Use `eas build` for TestFlight/Google Play
5. **Beta Distribution**: Use Expo's internal distribution
6. **Screenshots**: Capture from simulators after full app testing

## Support

For issues or questions:
1. Check Expo documentation: https://docs.expo.dev
2. View logs: `expo logs`
3. Check GitHub issues: https://github.com/Epetaway/withyou/issues
4. Enable verbose logging: `expo start --verbose`
