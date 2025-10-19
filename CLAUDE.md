# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LifeLoop** is a minimalist daily photo journal app built with Expo and React Native. Users capture one photo + caption per day, building a beautiful timeline of memories. The app is offline-first with optional Firebase cloud sync.

**Status:** Phase 2 complete (dark mode, notifications, calendar, Firebase sync)

## Commands

### Development
```bash
npm install                 # Install dependencies
npx expo start              # Start development server
npx expo start --android    # Run on Android
npx expo start --ios        # Run on iOS
npm run lint                # Run ESLint
```

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
   - Handles Firebase anonymous authentication
   - Manages user sign-in/sign-out state
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
- Anonymous Firebase authentication (no sign-up required)
- Per-user Firestore collections: `users/{userId}/entries/{entryId}`
- Merge strategy: newer `createdAt` timestamp wins
- Sync operations:
  - `syncEntry()` - Single entry sync
  - `batchSync()` - Bulk sync all entries
  - `mergeLocalAndRemote()` - Conflict resolution

### Navigation Structure

Bottom tab navigator with 5 screens:
- **Today** (`AddEntryScreen`) - Capture daily photo
- **Memories** (`HomeScreen`) - Timeline of entries
- **Calendar** (`CalendarScreen`) - Calendar view with marked dates
- **Settings** (`SettingsScreen`) - Theme, notifications, sync controls
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
- Config in `app/utils/firebase.ts`
- Uses Firebase Web SDK (not React Native Firebase)
- Anonymous auth enabled for frictionless onboarding

## Common Patterns

### Accessing Global State
```typescript
import { useEntries } from './context/EntriesContext';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

const { entries, addOrUpdateEntry, deleteEntry, syncToCloud } = useEntries();
const { user, signIn, signOutUser } = useAuth();
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
├── screens/           # Tab screens
│   ├── AddEntryScreen.tsx
│   ├── CalendarScreen.tsx
│   ├── HomeScreen.tsx
│   ├── ProfileScreen.tsx
│   └── SettingsScreen.tsx
├── utils/             # Core services
│   ├── firebase.ts    # Firebase initialization
│   ├── notifications.ts
│   ├── storage.ts     # AsyncStorage operations
│   └── sync.ts        # Firebase sync service
├── AppNavigator.tsx   # Tab navigator + providers
├── _layout.tsx        # Root layout
└── theme.ts          # Theme types (deprecated - use ThemeContext)
```

## Development Notes

### Firebase Setup (Optional)
1. Create project at https://console.firebase.google.com
2. Enable **Authentication** → Anonymous sign-in
3. Enable **Firestore Database**
4. Copy web config to `app/utils/firebase.ts`
5. For iOS: Add `GoogleService-Info.plist` to project root
6. For Android: Add `google-services.json` to project root

### Expo Configuration
- `app.config.js` handles environment-based app names/bundle IDs
- Build profiles: development (dev client), simulator, preview, production
- Uses Expo's new architecture (`newArchEnabled: true`)

### Testing Sync
1. Sign in via Settings screen
2. Add entries on device A
3. Sign in with same account on device B
4. Entries should appear after merge

### Notification Testing
1. Enable in Settings screen
2. Set time (e.g., 5 minutes from now)
3. Use "Test Notification" button for immediate test
4. Check system notification permissions if not appearing

## Roadmap Context

**Completed (Phase 1 & 2):**
- Daily photo journaling
- Local storage with AsyncStorage
- Timeline and calendar views
- Dark mode
- Firebase sync
- Daily reminder notifications

**Phase 3 (Next):**
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
