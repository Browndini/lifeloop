// React Native Firebase configuration
// This file initializes Firebase using @react-native-firebase packages
// No initialization needed for React Native Firebase - it's auto-initialized via native config files
// (GoogleService-Info.plist for iOS, google-services.json for Android)

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Export the initialized services
export { auth, firestore };

// Helper to check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  try {
    return auth().app !== null && firestore().app !== null;
  } catch {
    return false;
  }
};

export default { auth, firestore };
