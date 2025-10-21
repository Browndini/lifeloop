# Authentication Setup Guide

This guide explains how to configure authentication in LifeLoop using **@react-native-firebase/auth** ONLY.

## Overview

LifeLoop uses **@react-native-firebase/auth** for all authentication methods:

- ✅ Google Sign-In
- ✅ Apple Sign-In (iOS only)
- ✅ Email/Password authentication
- ✅ Anonymous authentication (fallback)
- ✅ Guest mode (offline-only, no Firebase required)

**No additional packages needed!** Firebase Auth handles everything natively.

## Prerequisites

1. Firebase project created at https://console.firebase.google.com
2. iOS app registered in Firebase (Bundle ID matches app.config.js)
3. Android app registered in Firebase (Package name matches app.config.js)
4. `GoogleService-Info.plist` file for iOS (at project root)
5. `google-services.json` file for Android (at project root)

## Firebase Console Setup

### 1. Enable Authentication Methods

In Firebase Console, go to **Authentication > Sign-in method** and enable:

- ✅ **Google** - Click Enable, Firebase handles the rest
- ✅ **Apple** - Click Enable, follow Firebase instructions for Apple Developer setup
- ✅ **Email/Password** - Click Enable
- ✅ **Anonymous** (optional) - Used as fallback if needed

### 2. Configure Google Sign-In

**For iOS:**
1. In Firebase Console: **Authentication > Sign-in method > Google**
2. Enable Google Sign-In
3. Your `GoogleService-Info.plist` already contains all necessary configuration
4. That's it! No additional setup needed.

**For Android:**
1. In Firebase Console: **Authentication > Sign-in method > Google**
2. Enable Google Sign-In
3. Add your app's SHA-1 fingerprint:
   - Get debug SHA-1: `cd android && ./gradlew signingReport`
   - Add it in Firebase Console: **Project Settings > Your apps > Android app**
4. Download updated `google-services.json` and place at project root

### 3. Configure Apple Sign-In (iOS only)

**Firebase Console:**
1. Go to **Authentication > Sign-in method > Apple**
2. Enable Apple Sign-In
3. Firebase will guide you through Apple Developer setup

**Apple Developer Portal:**
1. Go to https://developer.apple.com/account
2. **Certificates, Identifiers & Profiles > Identifiers**
3. Select your App ID
4. Enable "Sign in with Apple" capability
5. Save changes

**Xcode (if building locally):**
1. Open your project in Xcode
2. Select your target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "Sign in with Apple"

### 4. Enable Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Click "Create database"
3. Choose production mode or test mode
4. Select a location for your database

## Native Configuration Files

### iOS: GoogleService-Info.plist

1. Download from Firebase Console: **Project Settings > iOS App > GoogleService-Info.plist**
2. Place at project root: `/Users/kylebrown/LifeLoop/GoogleService-Info.plist`
3. The file is already referenced in `app.config.js`:
   ```javascript
   googleServicesFile: "./GoogleService-Info.plist"
   ```

**This file contains ALL configuration needed for:**
- Firebase initialization
- Google Sign-In
- Apple Sign-In
- All Firebase services

### Android: google-services.json

1. Download from Firebase Console: **Project Settings > Android App > google-services.json**
2. Place at project root: `/Users/kylebrown/LifeLoop/google-services.json`

**This file contains ALL configuration needed for:**
- Firebase initialization
- Google Sign-In
- All Firebase services

## Building the App

Since we're using native modules (`@react-native-firebase/*`), you need a development build:

```bash
# Install dependencies
npm install

# Create development build for iOS
eas build --profile development --platform ios

# Create development build for Android
eas build --profile development --platform android

# Or for iOS Simulator
eas build --profile simulator --platform ios
```

### Running the App

```bash
# Start the development server
npx expo start --dev-client

# Press 'i' for iOS or 'a' for Android
```

## Testing Authentication

### Guest Mode
- Tap "Skip for now" on the login screen
- App works offline with local storage only
- No cloud sync available

### Google Sign-In
1. Tap "Continue with Google"
2. Select a Google account
3. Grant permissions
4. You'll be signed in and redirected to the app

### Apple Sign-In (iOS only)
1. Tap "Continue with Apple"
2. Authenticate with Face ID / Touch ID / Password
3. Choose to share or hide your email
4. You'll be signed in and redirected to the app

### Email/Password
1. Tap "Continue with Email"
2. Enter email and password
3. Toggle to "Sign Up" if creating a new account
4. Tap "Sign In" or "Create Account"

## Troubleshooting

### Google Sign-In Errors

**"DEVELOPER_ERROR" or "Sign in cancelled":**
- **Android**: Verify SHA-1 certificate fingerprint is registered in Firebase Console
  ```bash
  cd android && ./gradlew signingReport
  ```
- **iOS**: Ensure `GoogleService-Info.plist` is present and up to date
- Verify Google sign-in is enabled in Firebase Console
- Rebuild the app after adding/updating config files

**"An internal error has occurred":**
- Check that `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) is in the project root
- Verify the file is properly formatted JSON/plist
- Make sure the bundle ID / package name matches Firebase Console

### Apple Sign-In Errors

**"Apple Sign-In is only available on iOS":**
- This is expected behavior on Android. Apple Sign-In only works on iOS devices.

**"Sign in failed":**
- Verify Apple sign-in is enabled in Firebase Console
- Check that "Sign in with Apple" capability is added in Xcode
- Ensure your Apple Developer account has proper permissions
- Make sure you're testing on a physical device or iOS 13+ simulator

### Firebase Connection Issues

**"Firebase app not initialized":**
- Verify `GoogleService-Info.plist` (iOS) or `google-services.json` (Android) is present at project root
- Check that the file is correctly formatted
- Rebuild the app after adding/updating these files

**"Permission denied" errors:**
- Check Firestore security rules in Firebase Console
- Default rules for testing:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
  ```

## Architecture

### How It Works

**@react-native-firebase/auth** provides native OAuth flows for all providers:

```typescript
// Google Sign-In
const googleProvider = new auth.GoogleAuthProvider();
await auth().signInWithProvider(googleProvider);

// Apple Sign-In
const appleProvider = new auth.AppleAuthProvider();
appleProvider.addScope('email');
appleProvider.addScope('name');
await auth().signInWithProvider(appleProvider);

// Email/Password
await auth().signInWithEmailAndPassword(email, password);
```

All authentication is handled through the **single Firebase Auth SDK** with native integration.

### Authentication Flow

```
App Launch
    ↓
AuthProvider checks auth state
    ↓
    ├─→ User authenticated → Show main app
    ├─→ Guest mode enabled → Show main app (offline)
    └─→ Not authenticated → Show LoginScreen
            ↓
            ├─→ Google Sign-In → auth().signInWithProvider(GoogleAuthProvider)
            ├─→ Apple Sign-In → auth().signInWithProvider(AppleAuthProvider)
            ├─→ Email Sign-In → Navigate to EmailLoginScreen
            └─→ Skip for now → continueAsGuest()
```

## Security Considerations

1. **Never commit** sensitive credentials to git
2. **Use Firestore security rules** to protect user data
3. **Guest mode data** is stored locally only - remind users to sign in to backup
4. **Native config files** (`GoogleService-Info.plist`, `google-services.json`) contain API keys that are safe to commit as they're restricted by bundle ID/package name

## What Changed from Original Implementation

We simplified from multiple packages to just **@react-native-firebase/auth**:

**Before (multiple packages):**
- `firebase` (Web SDK)
- `@react-native-google-signin/google-signin`
- `@invertase/react-native-apple-authentication`
- Required separate configuration for each provider
- Complex setup with multiple API keys

**After (single package):**
- `@react-native-firebase/auth` only
- All providers handled natively through Firebase Auth
- Single configuration through native files
- Simpler setup, better performance

## Additional Resources

- [React Native Firebase Documentation](https://rnfirebase.io/)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Auth Native Providers](https://rnfirebase.io/auth/social-auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
