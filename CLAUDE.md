# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LifeLoop** is a minimalist daily photo journal app built with Expo and React Native. Users capture one photo + caption per day, building a beautiful timeline of memories. The app is offline-first with optional Firebase cloud sync.

**Status:** Phase 3 in progress - Authentication system complete (login screens, Google/Apple/Email sign-in, guest mode)

## Commands

### Development
```bash
npm install                 # Install dependencies
npx expo start --dev-client # Start development server (requires dev build)
npx expo start --android    # Run on Android
npx expo start --ios        # Run on iOS
npm run lint                # Run ESLint
```

**Note:** App now requires EAS development build due to React Native Firebase native modules. Cannot use Expo Go.

### Building with EAS
```bash
# Development builds (with dev client)
eas build --profile development --platform ios
eas build --profile simulator --platform ios  # For iOS simulator

# Preview builds (internal testing)
eas build --profile preview --platform ios
eas build --profile preview --platform android

# Production builds
eas build --profile production --platform all
```

## Architecture

### Context-Based State Management

The app uses React Context for global state, organized into three main providers (see `app/AppNavigator.tsx`):

1. **ThemeProvider** (`app/context/ThemeContext.tsx`)
   - Manages light/dark/system theme modes
   - Persists theme preference to AsyncStorage
   - Provides theme colors and shadows to all components

2. **AuthProvider** (`app/context/AuthContext.tsx`)
   - Handles Firebase authentication (Google, Apple, Email/Password)
   - Manages user sign-in/sign-out state
   - Supports guest mode (offline-only, no authentication)
   - Tracks authentication provider and auth state
   - Required for cloud sync functionality

3. **EntriesProvider** (`app/context/EntriesContext.tsx`)
   - Manages journal entries (CRUD operations)
   - Orchestrates local storage + Firebase sync
   - Automatically syncs when user is authenticated

**Provider Hierarchy:**
```
ThemeProvider → AuthProvider → EntriesProvider → App
```

### Data Flow & Sync Strategy

**Local-First Approach:**
- All entries stored in AsyncStorage (`app/utils/storage.ts`)
- Writes happen locally first, then sync to Firebase
- App works fully offline

**Cloud Sync (`app/utils/sync.ts`):**
- Uses React Native Firebase (@react-native-firebase/firestore)
- Authenticated users (Google, Apple, Email) get automatic cloud sync
- Guest mode users have no cloud sync (local only)
- Per-user Firestore collections: `users/{userId}/entries/{entryId}`
- Merge strategy: newer `createdAt` timestamp wins
- Sync operations:
  - `syncEntry()` - Single entry sync
  - `batchSync()` - Bulk sync all entries
  - `mergeLocalAndRemote()` - Conflict resolution

### Navigation Structure

**Authentication Flow:**
- **LoginScreen** - Shown if not authenticated and not in guest mode
  - Google Sign-In button
  - Apple Sign-In button (iOS only)
  - Email Sign-In button → navigates to EmailLoginScreen
  - "Skip for now" → enters guest mode
- **EmailLoginScreen** - Email/password authentication form
  - Toggle between sign-in and sign-up
  - Password reset functionality
  - Back button to LoginScreen

**Main App (after auth or guest mode):**
Bottom tab navigator with 5 screens:
- **Today** (`AddEntryScreen`) - Capture daily photo
- **Memories** (`HomeScreen`) - Timeline of entries
- **Calendar** (`CalendarScreen`) - Calendar view with marked dates
- **Settings** (`SettingsScreen`) - Theme, notifications, auth status, sync controls
- **Profile** (`ProfileScreen`) - User profile (placeholder)

### Styling Approach

**NO Tailwind/NativeWind** - Uses React Native StyleSheet API exclusively

Theme system provides:
- `theme.colors` - Semantic color tokens (background, surface, primary, etc.)
- `theme.shadows` - Platform-appropriate shadows (sm, md)
- `theme.isDark` - Boolean for conditional styling

All components consume theme via `useTheme()` hook.

## Key Technical Details

### Entry Constraints
- **One entry per day** enforced by date string (`YYYY-MM-DD`)
- Entries stored with `id`, `date`, `imageUri`, `caption`, `createdAt`
- Updates replace existing entry for same date

### Image Handling
- Uses `expo-image-picker` for camera/library access
- Images stored as local file URIs (not uploaded to cloud)
- Firebase stores entry metadata only, not image data

### Notifications
- `expo-notifications` with scheduled daily reminders
- Settings screen allows time customization
- Graceful degradation if permissions denied

### Firebase Configuration
- Config in `app/utils/firebaseConfig.ts`
- Uses React Native Firebase (@react-native-firebase/auth, @react-native-firebase/firestore)
- Native config files: `GoogleService-Info.plist` (iOS), `google-services.json` (Android)
- Authentication methods: Google, Apple (iOS), Email/Password, Anonymous (fallback)
- Guest mode available for offline-only usage (no authentication required)
- See AUTH_SETUP.md for complete configuration guide

## Common Patterns

### Accessing Global State
```typescript
import { useEntries } from './context/EntriesContext';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

const { entries, addOrUpdateEntry, deleteEntry, syncToCloud } = useEntries();
const {
  user,
  isGuestMode,
  authProvider,
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
  signOutUser
} = useAuth();
const { theme, setThemeMode, toggleTheme } = useTheme();
```

### Storage Functions
```typescript
// Use EntriesContext methods instead of direct storage calls
// Context handles both local + cloud sync automatically

// Direct storage utils (app/utils/storage.ts) - use sparingly:
import { getEntries, saveEntries, addOrUpdateEntry as upsertEntry, removeEntry } from './utils/storage';
```

### Theming Components
```typescript
import { useTheme } from './context/ThemeContext';

const { theme } = useTheme();
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    ...theme.shadows.md,
  },
});
```

## File Structure Reference

```
app/
├── components/         # Reusable UI components
│   ├── CalendarView.tsx
│   ├── CompactEntryCard.tsx
│   ├── EmptyState.tsx
│   ├── EntryCard.tsx
│   ├── Header.tsx
│   ├── Lightbox.tsx
│   └── Timeline.tsx
├── context/           # Global state providers
│   ├── AuthContext.tsx
│   ├── EntriesContext.tsx
│   └── ThemeContext.tsx
├── screens/           # App screens
│   ├── AddEntryScreen.tsx      # Today tab - capture daily photo
│   ├── CalendarScreen.tsx      # Calendar tab
│   ├── EmailLoginScreen.tsx    # Email/password authentication form
│   ├── HomeScreen.tsx          # Memories tab - timeline
│   ├── LoginScreen.tsx         # Main login screen with auth options
│   ├── ProfileScreen.tsx       # Profile tab
│   └── SettingsScreen.tsx      # Settings tab with auth status
├── utils/             # Core services
│   ├── firebaseConfig.ts  # React Native Firebase initialization
│   ├── notifications.ts   # Daily reminder notifications
│   ├── storage.ts         # AsyncStorage operations (local data)
│   └── sync.ts            # Firestore cloud sync service
├── AppNavigator.tsx   # Tab navigator + providers
├── _layout.tsx        # Root layout
└── theme.ts          # Theme types (deprecated - use ThemeContext)
```

## Development Notes

### Firebase Setup (Required for Authentication & Sync)
**See AUTH_SETUP.md for complete configuration guide**

Quick setup:
1. Create project at https://console.firebase.google.com
2. Enable **Authentication** → Google, Apple, Email/Password
3. Enable **Firestore Database**
4. Download `GoogleService-Info.plist` (iOS) and place in project root
5. Download `google-services.json` (Android) and place in project root
6. Configure Google Sign-In (get Web Client ID)
7. Create `.env` file with EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
8. Update `app.config.js` with REVERSED_CLIENT_ID for iOS

### Expo Configuration
- `app.config.js` handles environment-based app names/bundle IDs
- Build profiles: development (dev client), simulator, preview, production
- Uses Expo's new architecture (`newArchEnabled: true`)

### Testing Authentication
1. **Guest Mode**: Tap "Skip for now" on login screen (offline-only)
2. **Google Sign-In**: Tap "Continue with Google", select account
3. **Apple Sign-In** (iOS): Tap "Continue with Apple", authenticate
4. **Email Sign-In**: Tap "Continue with Email", enter credentials

### Testing Sync
1. Sign in with Google/Apple/Email
2. Add entries on device A
3. Sign in with same account on device B
4. Entries should appear after automatic merge

### Notification Testing
1. Enable in Settings screen
2. Set time (e.g., 5 minutes from now)
3. Use "Test Notification" button for immediate test
4. Check system notification permissions if not appearing

## Roadmap Context

**Completed (Phase 1, 2 & 3):**
- Daily photo journaling
- Local storage with AsyncStorage
- Timeline and calendar views
- Dark mode
- Firebase cloud sync
- Daily reminder notifications
- Authentication system (Google, Apple, Email/Password)
- Login screens with guest mode support
- Protected routes
- Auth status in Settings

**Phase 4 (Next):**
- Social sharing
- Memory streaks/achievements
- Photo editing tools
- Search functionality
- Tags/categories
- Data export
- Widgets
- Analytics

**Future Considerations:**
- Multi-photo entries
- Voice memos
- Location tagging
- Premium features/monetization
