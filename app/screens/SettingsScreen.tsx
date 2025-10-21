import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useEntries } from '../context/EntriesContext';
import { useTheme } from '../theme';
import { notificationService, NotificationSettings } from '../utils/notifications';

export default function SettingsScreen() {
  const { theme, setThemeMode } = useTheme();
  const { user, isGuestMode, authProvider, signOutUser, signInWithGoogle, signInWithApple } = useAuth();
  const { syncToCloud } = useEntries();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    time: '20:00',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
  });
  const [showAuthOptions, setShowAuthOptions] = useState(false);

  useEffect(() => {
    const initializeNotifications = async () => {
      const success = await notificationService.initialize();
      if (success) {
        const settings = await notificationService.getSettings();
        setNotificationSettings(settings);
      }
    };

    initializeNotifications();
  }, []);

  const handleThemeModeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        await notificationService.enableNotifications();
      } else {
        await notificationService.disableNotifications();
      }
      setNotificationSettings(prev => ({ ...prev, enabled }));
    } catch {
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.testNotification();
      Alert.alert('Test Sent', 'Check your notifications!');
    } catch {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const handleSyncToCloud = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to sync your data to the cloud');
      return;
    }

    try {
      await syncToCloud();
      Alert.alert('Success', 'Your data has been synced to the cloud!');
    } catch {
      Alert.alert('Sync Failed', 'Failed to sync data to the cloud. Please try again.');
    }
  };

  const handleSignOut = async () => {
    const title = isGuestMode ? 'Exit Guest Mode' : 'Sign Out';
    const message = isGuestMode
      ? 'Are you sure you want to exit guest mode? Your local data will remain and you can sign in with an account.'
      : 'Are you sure you want to sign out? Your local data will remain.';
    const buttonText = isGuestMode ? 'Exit' : 'Sign Out';

    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: buttonText,
          style: 'destructive',
          onPress: async () => {
            try {
              await signOutUser();
            } catch {
              Alert.alert('Error', `Failed to ${isGuestMode ? 'exit guest mode' : 'sign out'}`);
            }
          },
        },
      ]
    );
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      setShowAuthOptions(false);
      Alert.alert('Success', 'Signed in with Google! Your guest entries have been migrated.');
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
      setShowAuthOptions(false);
      Alert.alert('Success', 'Signed in with Apple! Your guest entries have been migrated.');
    } catch (error) {
      console.error('Apple sign-in error:', error);
      Alert.alert('Error', 'Failed to sign in with Apple. Please try again.');
    }
  };

  const handleEmailSignIn = () => {
    Alert.alert(
      'Email Sign In',
      'Email/password sign-in is currently only available from the initial login screen. Please sign out and use the email option when you launch the app.',
      [{ text: 'OK' }]
    );
  };

  const getAuthStatusText = () => {
    if (isGuestMode) {
      return 'Guest Mode - Local only';
    }
    if (!user) {
      return 'Not signed in';
    }
    switch (authProvider) {
      case 'google':
        return `Signed in with Google`;
      case 'apple':
        return `Signed in with Apple`;
      case 'email':
        return `Signed in with Email`;
      case 'anonymous':
        return 'Anonymous account';
      default:
        return 'Signed in';
    }
  };

  const getAuthIcon = () => {
    if (isGuestMode) return 'person-outline';
    if (!user) return 'log-in-outline';

    switch (authProvider) {
      case 'google':
        return 'logo-google';
      case 'apple':
        return 'logo-apple';
      case 'email':
        return 'mail';
      case 'anonymous':
        return 'finger-print';
      default:
        return 'checkmark-circle';
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header title="Settings" subtitle="Customize your LifeLoop experience" />

        {/* Authentication Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.authStatusCard}>
            <View style={styles.authStatusHeader}>
              <Ionicons name={getAuthIcon()} size={24} color={theme.colors.primary} />
              <View style={styles.authStatusInfo}>
                <Text style={styles.authStatusLabel}>Status</Text>
                <Text style={styles.authStatusText}>{getAuthStatusText()}</Text>
                {user?.email && (
                  <Text style={styles.authStatusEmail}>{user.email}</Text>
                )}
              </View>
            </View>

            {/* Show sign in button for guest mode */}
            {isGuestMode && (
              <TouchableOpacity
                style={styles.signInButton}
                onPress={() => setShowAuthOptions(!showAuthOptions)}
              >
                <Text style={styles.signInButtonText}>Sign In to Sync</Text>
                <Ionicons
                  name={showAuthOptions ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            )}

            {/* Auth options for guest users */}
            {isGuestMode && showAuthOptions && (
              <View style={styles.authOptionsContainer}>
                <Text style={styles.authOptionsTitle}>
                  Sign in to sync your memories across devices
                </Text>
                <View style={styles.authOptionButtons}>
                  <TouchableOpacity style={styles.authOptionButton} onPress={handleGoogleSignIn}>
                    <Ionicons name="logo-google" size={20} color={theme.colors.textStrong} />
                    <Text style={styles.authOptionButtonText}>Google</Text>
                  </TouchableOpacity>
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity style={styles.authOptionButton} onPress={handleAppleSignIn}>
                      <Ionicons name="logo-apple" size={20} color={theme.colors.textStrong} />
                      <Text style={styles.authOptionButtonText}>Apple</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.authOptionButton} onPress={handleEmailSignIn}>
                    <Ionicons name="mail-outline" size={20} color={theme.colors.textStrong} />
                    <Text style={styles.authOptionButtonText}>Email</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Theme Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Theme</Text>
            <View style={styles.themeOptions}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  theme.mode === 'light' && styles.themeOptionActive,
                ]}
                onPress={() => handleThemeModeChange('light')}
              >
                <Text style={[
                  styles.themeOptionText,
                  theme.mode === 'light' && styles.themeOptionTextActive,
                ]}>Light</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  theme.mode === 'dark' && styles.themeOptionActive,
                ]}
                onPress={() => handleThemeModeChange('dark')}
              >
                <Text style={[
                  styles.themeOptionText,
                  theme.mode === 'dark' && styles.themeOptionTextActive,
                ]}>Dark</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  theme.mode === 'system' && styles.themeOptionActive,
                ]}
                onPress={() => handleThemeModeChange('system')}
              >
                <Text style={[
                  styles.themeOptionText,
                  theme.mode === 'system' && styles.themeOptionTextActive,
                ]}>System</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Daily Reminder</Text>
              <Text style={styles.settingDescription}>
                Get reminded to capture your daily moment
              </Text>
            </View>
            <Switch
              value={notificationSettings.enabled}
              onValueChange={handleNotificationToggle}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={notificationSettings.enabled ? theme.colors.surface : theme.colors.textMuted}
            />
          </View>

          {notificationSettings.enabled && (
            <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
              <Text style={styles.testButtonText}>Send Test Notification</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sync Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Sync</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Cloud Sync</Text>
              <Text style={styles.settingDescription}>
                {user
                  ? 'Signed in and syncing'
                  : isGuestMode
                  ? 'Sign in to enable cloud sync'
                  : 'Sign in to sync across devices'}
              </Text>
            </View>
            {user && !isGuestMode && (
              <TouchableOpacity style={styles.syncButton} onPress={handleSyncToCloud}>
                <Text style={styles.syncButtonText}>Sync Now</Text>
              </TouchableOpacity>
            )}
          </View>

          {(user || isGuestMode) && (
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutButtonText}>
                {isGuestMode ? 'Exit Guest Mode' : 'Sign Out'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.appVersion}>LifeLoop v1.0.0</Text>
          <Text style={styles.appDescription}>
            Capture and cherish your daily moments. Build habits that matter.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
    marginBottom: 16,
  },
  authStatusCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  authStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authStatusInfo: {
    flex: 1,
  },
  authStatusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  authStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textStrong,
  },
  authStatusEmail: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  authOptionsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  authOptionsTitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 12,
    lineHeight: 20,
  },
  authOptionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  authOptionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  authOptionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textStrong,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textStrong,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  themeOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  themeOptionText: {
    fontSize: 14,
    color: theme.colors.textStrong,
  },
  themeOptionTextActive: {
    color: theme.colors.surface,
    fontWeight: '500',
  },
  testButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  testButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  syncButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
  },
  syncButtonText: {
    fontSize: 14,
    color: theme.colors.surface,
    fontWeight: '500',
  },
  signOutButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  signOutButtonText: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: '500',
  },
  appVersion: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
});
