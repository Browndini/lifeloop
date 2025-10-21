import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';

interface LoginScreenProps {
  onEmailLogin: () => void;
}

export default function LoginScreen({ onEmailLogin }: LoginScreenProps) {
  const { theme } = useTheme();
  const { signInWithGoogle, signInWithApple, continueAsGuest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const styles = createStyles(theme);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setLoadingProvider('google');
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setLoadingProvider('apple');
    try {
      await signInWithApple();
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Failed to sign in with Apple');
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleContinueAsGuest = async () => {
    setLoading(true);
    setLoadingProvider('guest');
    try {
      await continueAsGuest();
    } catch {
      Alert.alert('Error', 'Failed to continue as guest');
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>LifeLoop</Text>
          <Text style={styles.tagline}>Capture and cherish your daily moments</Text>
        </View>

        {/* Sign In Buttons */}
        <View style={styles.buttonsSection}>
          {/* Google Sign In */}
          <TouchableOpacity
            style={[styles.signInButton, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loadingProvider === 'google' ? (
              <ActivityIndicator color={theme.colors.textStrong} />
            ) : (
              <>
                <Ionicons name="logo-google" size={24} color={theme.colors.textStrong} />
                <Text style={styles.signInButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Apple Sign In - iOS only */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.signInButton, styles.appleButton]}
              onPress={handleAppleSignIn}
              disabled={loading}
            >
              {loadingProvider === 'apple' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
                  <Text style={[styles.signInButtonText, styles.appleButtonText]}>
                    Continue with Apple
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Email Sign In */}
          <TouchableOpacity
            style={[styles.signInButton, styles.emailButton]}
            onPress={onEmailLogin}
            disabled={loading}
          >
            <Ionicons name="mail-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.signInButtonText, styles.emailButtonText]}>
              Continue with Email
            </Text>
          </TouchableOpacity>

          {/* Guest Mode */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleContinueAsGuest}
            disabled={loading}
          >
            {loadingProvider === 'guest' ? (
              <ActivityIndicator color={theme.colors.textMuted} />
            ) : (
              <Text style={styles.guestButtonText}>Skip for now</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: 'space-between',
      paddingTop: 40,
      paddingBottom: 32,
    },
    logoSection: {
      alignItems: 'center',
      marginTop: 40,
    },
    logoContainer: {
      width: 120,
      height: 120,
      borderRadius: 30,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      ...theme.shadows.md,
    },
    logo: {
      width: 100,
      height: 100,
    },
    appName: {
      fontSize: 36,
      fontWeight: '700',
      color: theme.colors.textStrong,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    tagline: {
      fontSize: 16,
      color: theme.colors.textMuted,
      textAlign: 'center',
      paddingHorizontal: 32,
      lineHeight: 22,
    },
    buttonsSection: {
      gap: 16,
    },
    signInButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      gap: 12,
      ...theme.shadows.sm,
    },
    googleButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    appleButton: {
      backgroundColor: '#000000',
    },
    emailButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    signInButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textStrong,
    },
    appleButtonText: {
      color: '#FFFFFF',
    },
    emailButtonText: {
      color: theme.colors.primary,
    },
    guestButton: {
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    guestButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.textMuted,
    },
    footer: {
      paddingTop: 16,
    },
    footerText: {
      fontSize: 12,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
      paddingHorizontal: 16,
    },
  });
