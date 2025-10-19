import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useEntries } from '../context/EntriesContext';
import { useTheme } from '../theme';
import { notificationService, NotificationSettings } from '../utils/notifications';

export default function SettingsScreen() {
  const { theme, setThemeMode } = useTheme();
  const { user, signIn, signOutUser } = useAuth();
  const { syncToCloud } = useEntries();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    time: '20:00',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
  });

  useEffect(() => {
    const initializeNotifications = async () => {
      const success = await notificationService.initialize();
      if (success) {
        const settings = await notificationService.getSettings();
        setNotificationSettings(settings);
      }
    //   setNotificationsInitialized(true);
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
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your local data will remain.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOutUser();
            } catch {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header title="Settings" subtitle="Customize your LifeLoop experience" />

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
                {user ? 'Signed in and syncing' : 'Sign in to sync across devices'}
              </Text>
            </View>
            {user ? (
              <TouchableOpacity style={styles.syncButton} onPress={handleSyncToCloud}>
                <Text style={styles.syncButtonText}>Sync Now</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.signInButton} onPress={signIn}>
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>

          {user && (
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutButtonText}>Sign Out</Text>
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
  signInButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  signInButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
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
