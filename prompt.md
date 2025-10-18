You are an expert Expo + React Native developer.

Your task: build the initial version (MVP) of an app called **LifeLoop**.

---

### 🧭 Project Overview
LifeLoop is a minimalist daily photo journal app that lets users capture **one photo + one short caption per day**, automatically timestamped, and view their memories in a clean, aesthetic timeline.

The app should feel calm, beautiful, and modern — similar to Notion or Stoic — but emotionally personal. Focus on simplicity and polish.

---

### 🎯 MVP Features (Phase 1)
1. **Add Daily Entry**
   - User can take a photo or upload one from the library.
   - Add a short caption (max 100 chars).
   - Automatically timestamp the entry.
   - Only one entry allowed per day.

2. **View Timeline**
   - Scrollable feed showing each day’s photo + caption.
   - Entries displayed in chronological order.
   - Option for grid or list layout toggle (basic version is fine).

3. **Local Storage**
   - Store entries locally using `expo-sqlite` or `AsyncStorage`.
   - Offline-first approach.

4. **Navigation**
   - Use React Navigation with 3 tabs:
     - “Today” (AddEntryScreen)
     - “Memories” (HomeScreen)
     - “Profile” (placeholder for future use)

5. **UI Style**
   - Minimal, clean, soft color palette.
   - Rounded corners, gentle animations.
   - Typography and layout should evoke calmness and mindfulness.

---

### ⚙️ Tech Stack
- Expo + React Native
- React Navigation
- AsyncStorage or expo-sqlite
- Expo Camera + ImagePicker
- do not use NativeWind (Tailwind for RN styling)
- redux for state management

---

### 📁 File Structure
lifeloop/
├── app/
│ ├── screens/
│ │ ├── HomeScreen.tsx
│ │ ├── AddEntryScreen.tsx
│ │ ├── ProfileScreen.tsx
│ ├── components/
│ │ ├── EntryCard.tsx
│ │ ├── Header.tsx
│ │ └── EmptyState.tsx
│ ├── context/
│ │ └── EntriesContext.tsx
│ ├── utils/
│ │ └── storage.ts
│ └── AppNavigator.tsx
├── assets/
│ ├── icon.png
│ ├── splash.png
│ └── placeholder.jpg
└── README.md

---

### 🧩 Deliverables
1. Working Expo project scaffold with navigation.
2. Functional `AddEntryScreen` and `HomeScreen` connected via local storage.
3. Clean, modern UI styling.
4. A complete `README.md` file that includes:
   - Setup instructions
   - MVP overview
   - Tech stack
   - Folder structure
   - Future feature roadmap (list below)

---

### 🧠 Add This to README (Future Features Roadmap)
**Short-Term**
- [ ] Calendar view of entries  
- [ ] Notifications to remind daily photo  
- [ ] Dark mode  
- [ ] Grid / timeline toggle  

**Cloud & Social**
- [ ] Firebase or Supabase sync  
- [ ] Sign-in / cloud backup  
- [ ] Shareable recap videos  

**AI Enhancements**
- [ ] AI “memory summaries”  
- [ ] AI-generated recap collage  
- [ ] Smart tag suggestions  

**Monetization**
- [ ] Premium for cloud sync + recap exports  
- [ ] Paid aesthetic themes  
- [ ] Print-on-demand memory books  

---

### 🧰 Development Notes
- Keep the code modular and readable.
- Focus on a smooth, emotional UX.
- Use consistent rounded corners, soft shadows, and smooth transitions.
- Optimize for daily 30-second usage.

---

**Goal:** Deliver the complete Expo project ready to run with `npx expo start`, including the README and all MVP screens implemented.

