import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

const GUEST_MODE_KEY = '@guest_mode';
const GUEST_USER_ID_KEY = '@guest_user_id';

export type AuthProviderType = 'email' | 'google' | 'apple' | 'anonymous' | 'guest';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  isGuestMode: boolean;
  authProvider: AuthProviderType | null;
  currentUserId: string | null; // Current user ID (guest ID or Firebase UID)
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [authProvider, setAuthProvider] = useState<AuthProviderType | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '150841530456-fr74hqrtqldg5fn38iohlge6k8dc5or6.apps.googleusercontent.com',
    });
  }, []);

  // Load or create guest user ID
  useEffect(() => {
    const loadOrCreateGuestId = async () => {
      try {
        const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
        if (guestMode === 'true') {
          setIsGuestMode(true);
          setAuthProvider('guest');

          // Get or create persistent guest ID
          let guestId = await AsyncStorage.getItem(GUEST_USER_ID_KEY);
          if (!guestId) {
            guestId = `guest_${nanoid()}`;
            await AsyncStorage.setItem(GUEST_USER_ID_KEY, guestId);
            console.log('[Auth] 🆔 Created new guest ID:', guestId);
          } else {
            console.log('[Auth] 🆔 Loaded existing guest ID:', guestId);
          }
          setCurrentUserId(guestId);
        }
      } catch (error) {
        console.error('[Auth] ❌ Error loading guest mode:', error);
      }
    };
    loadOrCreateGuestId();
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      console.log('[Auth] 🔐 Auth state changed:', firebaseUser ? {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        isAnonymous: firebaseUser.isAnonymous,
        provider: firebaseUser.providerData[0]?.providerId
      } : 'Not signed in');

      setUser(firebaseUser);

      if (firebaseUser) {
        // Determine auth provider
        const providerData = firebaseUser.providerData[0];
        if (providerData) {
          switch (providerData.providerId) {
            case 'google.com':
              setAuthProvider('google');
              break;
            case 'apple.com':
              setAuthProvider('apple');
              break;
            case 'password':
              setAuthProvider('email');
              break;
            default:
              setAuthProvider('anonymous');
          }
        } else {
          setAuthProvider('anonymous');
        }

        // User authenticated - use Firebase UID
        setCurrentUserId(firebaseUser.uid);
        console.log('[Auth] ✅ User authenticated, current user ID:', firebaseUser.uid);

        // Clear guest mode if user signs in (keep guest ID for migration)
        setIsGuestMode(false);
        await AsyncStorage.removeItem(GUEST_MODE_KEY);
      } else {
        // Check if in guest mode
        const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
        if (guestMode === 'true') {
          setAuthProvider('guest');
          // Guest ID already set in previous useEffect
        } else {
          setAuthProvider(null);
          setCurrentUserId(null);
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      throw new Error(error.message || 'Failed to sign in with email');
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      await auth().createUserWithEmailAndPassword(email, password);
    } catch (error: any) {
      console.error('Error signing up with email:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('[Auth] 🔵 Starting Google Sign-In...');

      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Get the user's ID token
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token returned from Google Sign-In');
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      await auth().signInWithCredential(googleCredential);

      console.log('[Auth] ✅ Google Sign-In successful');
    } catch (error: any) {
      console.error('[Auth] ❌ Error signing in with Google:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  const signInWithApple = async () => {
    try {
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign-In is only available on iOS');
      }

      console.log('[Auth] 🍎 Starting Apple Sign-In...');

      // Generate a nonce for security
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      // Start the sign-in request
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      // Ensure Apple returned a user identityToken
      if (!credential.identityToken) {
        throw new Error('Apple Sign-In failed - no identity token returned');
      }

      // Create a Firebase credential from the response
      const appleCredential = auth.AppleAuthProvider.credential(
        credential.identityToken,
        nonce
      );

      // Sign the user in with the credential
      await auth().signInWithCredential(appleCredential);

      console.log('[Auth] ✅ Apple Sign-In successful');
    } catch (error: any) {
      console.error('[Auth] ❌ Error signing in with Apple:', error);
      throw new Error(error.message || 'Failed to sign in with Apple');
    }
  };

  const signInAnonymously = async () => {
    try {
      await auth().signInAnonymously();
    } catch (error: any) {
      console.error('Error signing in anonymously:', error);
      throw new Error(error.message || 'Failed to sign in anonymously');
    }
  };

  const continueAsGuest = async () => {
    try {
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');

      // Create or load guest ID
      let guestId = await AsyncStorage.getItem(GUEST_USER_ID_KEY);
      if (!guestId) {
        guestId = `guest_${nanoid()}`;
        await AsyncStorage.setItem(GUEST_USER_ID_KEY, guestId);
        console.log('[Auth] 🆔 Created guest ID:', guestId);
      }

      setIsGuestMode(true);
      setAuthProvider('guest');
      setCurrentUserId(guestId);
      setLoading(false);

      console.log('[Auth] 👤 Continuing as guest with ID:', guestId);
    } catch (error) {
      console.error('[Auth] ❌ Error setting guest mode:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      console.log('[Auth] 🚪 Signing out...');

      // Sign out from Firebase
      await auth().signOut();

      // Clear guest mode (but keep guest ID for future use)
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      setIsGuestMode(false);
      setAuthProvider(null);
      setCurrentUserId(null);

      console.log('[Auth] ✅ Signed out successfully');
    } catch (error: any) {
      console.error('[Auth] ❌ Error signing out:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  };

  const value = {
    user,
    loading,
    isGuestMode,
    authProvider,
    currentUserId,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signInAnonymously,
    continueAsGuest,
    signOutUser,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
