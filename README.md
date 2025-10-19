# LifeLoop 📸

A beautiful, habit-forming journaling app that helps you capture and cherish your daily moments.

## Features

### ✨ Core Features
- **Daily Photo Journaling**: Capture one meaningful moment each day with photos and captions
- **Beautiful UI**: Clean, modern design with both light and dark themes
- **Offline-First**: Works seamlessly without internet connection
- **Calendar View**: Browse your memories by date with an interactive calendar
- **Cloud Sync**: Sign in to sync your entries across devices (optional)

### 🚀 Phase 2 Features (Latest)
- **Dark Mode**: Full dark theme support with system preference detection
- **Daily Reminders**: Get notified to capture your daily moment
- **Calendar Integration**: Visual calendar showing days with memories
- **Settings Screen**: Customize themes, notifications, and account settings
- **Firebase Integration**: Cloud sync and authentication (scaffold ready)

## Roadmap

### Phase 3 (Next)
- [ ] Social sharing (share memories with friends/family)
- [ ] Memory streaks and achievements
- [ ] Photo editing tools (filters, cropping)
- [ ] Search functionality
- [ ] Memory categories/tags
- [ ] Data export (PDF, JSON)
- [ ] Widget support (iOS/Android)
- [ ] Memory insights/analytics

### Future Enhancements
- [ ] Multi-photo entries
- [ ] Voice memos
- [ ] Location tagging
- [ ] Memory collages
- [ ] Premium features (advanced themes, unlimited storage)

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Firebase** (optional, for cloud sync)
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication and Firestore
   - Copy your config to `app/utils/firebase.ts`
   - Add your config to environment variables

3. **Start the app**
   ```bash
   npx expo start
   ```

## Architecture

- **React Native + Expo**: Cross-platform mobile development
- **TypeScript**: Type-safe development
- **Expo Router**: File-based navigation
- **AsyncStorage**: Local data persistence
- **Firebase**: Cloud sync and authentication (optional)
- **Expo Notifications**: Daily reminders
- **React Native Calendars**: Calendar view

## Project Structure

```
app/
├── components/          # Reusable UI components
├── context/            # React contexts (entries, auth, theme)
├── screens/            # Screen components
├── utils/              # Utilities and services
└── theme.ts           # Theme configuration
```

## Contributing

This is a personal project evolving into a premium journaling app. Contributions welcome for bug fixes and feature enhancements.

## License

Personal project - not yet licensed for public use.
