import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useEntries } from '../context/EntriesContext';
import { useTheme } from '../context/ThemeContext';
import { shouldShowDevTools } from '../utils/devConfig';
import { JournalEntry } from '../utils/storage';

export default function DevTools() {
  const { user, loading: authLoading, signIn, signOutUser } = useAuth();
  const { entries, loading: entriesLoading, syncLoading, refresh, syncToCloud } = useEntries();
  const { theme, toggleTheme } = useTheme();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);
  const [memoriesCount, setMemoriesCount] = useState('10');
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if dev tools should be visible
  const shouldShow = shouldShowDevTools(user?.uid || null);

  const handleOpenSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleSignInOut = async () => {
    try {
      if (user) {
        await signOutUser();
      } else {
        await signIn();
      }
    } catch {
      Alert.alert('Error', 'Failed to sign in/out');
    }
  };

  const handleSyncToCloud = async () => {
    if (!user) {
      Alert.alert('Error', 'Must be signed in to sync');
      return;
    }

    try {
      await syncToCloud();
      Alert.alert('Success', 'Entries synced to cloud');
    } catch {
      Alert.alert('Error', 'Failed to sync to cloud');
    }
  };

  const handleClearEntries = () => {
    Alert.alert(
      'Clear All Entries',
      'This will delete all local entries. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem('lifeloop.entries', JSON.stringify([]));
              await refresh();
              Alert.alert('Success', 'All entries cleared');
            } catch {
              Alert.alert('Error', 'Failed to clear entries');
            }
          },
        },
      ]
    );
  };

  const handleToggleTheme = () => {
    toggleTheme();
  };

  const handleGenerateMemories = async () => {
    const count = parseInt(memoriesCount, 10);

    if (isNaN(count) || count < 1 || count > 100) {
      Alert.alert('Invalid Count', 'Please enter a number between 1 and 100');
      return;
    }

    Alert.alert(
      'Generate Random Memories',
      `This will create ${count} random memories with past dates. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            setIsGenerating(true);
            try {
              const newEntries: JournalEntry[] = [];
              const today = new Date();

              for (let i = 0; i < count; i++) {
                // Generate random date in the past (last 365 days)
                const daysAgo = Math.floor(Math.random() * 365);
                const entryDate = new Date(today);
                entryDate.setDate(entryDate.getDate() - daysAgo);

                // Random image number between 1-1000
                const imageNumber = Math.floor(Math.random() * 1000) + 1;
                const imageUri = `https://testingbot.com/free-online-tools/random-avatar/200?img=${imageNumber}`;
                console.log(imageUri);

                // Random caption
                const captions = [
                  'Beautiful day!',
                  'Great memories',
                  'Amazing moment',
                  'Love this view',
                  'Perfect timing',
                  'What a day',
                  'Feeling grateful',
                  'Simple pleasures',
                  'Golden hour',
                  'Life is good',
                  'Making memories',
                  'Special moment',
                  'Pure joy',
                  'Peaceful vibes',
                  'Worth remembering',
                  `Random image ${imageNumber}`,
                ];

                const entry: JournalEntry = {
                  id: nanoid(),
                  date: entryDate.toISOString().split('T')[0], // YYYY-MM-DD
                  imageUri,
                  caption: captions[Math.floor(Math.random() * captions.length)],
                  createdAt: entryDate.getTime(),
                };

                newEntries.push(entry);
              }

              // Get existing entries and merge
              const existingEntries = await AsyncStorage.getItem('lifeloop.entries');
              const existing = existingEntries ? JSON.parse(existingEntries) : [];

              // Filter out duplicates by date (prefer existing)
              const existingDates = new Set(existing.map((e: JournalEntry) => e.date));
              const uniqueNewEntries = newEntries.filter(e => !existingDates.has(e.date));

              const allEntries = [...existing, ...uniqueNewEntries].sort(
                (a, b) => b.createdAt - a.createdAt
              );

              await AsyncStorage.setItem('lifeloop.entries', JSON.stringify(allEntries));
              await refresh();

              Alert.alert(
                'Success',
                `Generated ${uniqueNewEntries.length} new memories (${newEntries.length - uniqueNewEntries.length} duplicates skipped)`
              );
            } catch (error) {
              console.error('Error generating memories:', error);
              Alert.alert('Error', 'Failed to generate memories');
            } finally {
              setIsGenerating(false);
            }
          },
        },
      ]
    );
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      {/* Floating Dev Button */}
      <Pressable
        style={[
          styles.floatingButton,
          {
            backgroundColor: theme.isDark
              ? 'rgba(212, 184, 150, 0.3)'
              : 'rgba(150, 111, 81, 0.3)',
          },
        ]}
        onPress={handleOpenSheet}
      >
        <Ionicons name="bug" size={24} color={theme.colors.primary} />
      </Pressable>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
      >
        <BottomSheetScrollView
          style={[styles.contentContainer, { backgroundColor: theme.colors.surface }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="bug" size={24} color={theme.colors.primary} />
              <Text style={[styles.title, { color: theme.colors.textStrong }]}>
                Dev Tools
              </Text>
            </View>
            <Pressable onPress={handleCloseSheet}>
              <Ionicons name="close" size={24} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          {/* Auth State Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Auth State
            </Text>
            <View style={[styles.card, { backgroundColor: theme.colors.background }]}>
              <InfoRow
                label="Signed In"
                value={user ? 'Yes' : 'No'}
                theme={theme}
              />
              <InfoRow
                label="User ID"
                value={user?.uid || 'None'}
                theme={theme}
                mono
              />
              <InfoRow
                label="Loading"
                value={authLoading ? 'Yes' : 'No'}
                theme={theme}
              />
              <InfoRow
                label="Anonymous"
                value={user?.isAnonymous ? 'Yes' : 'No'}
                theme={theme}
              />
            </View>
          </View>

          {/* Entries State Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Entries State
            </Text>
            <View style={[styles.card, { backgroundColor: theme.colors.background }]}>
              <InfoRow
                label="Total Entries"
                value={entries.length.toString()}
                theme={theme}
              />
              <InfoRow
                label="Loading"
                value={entriesLoading ? 'Yes' : 'No'}
                theme={theme}
              />
              <InfoRow
                label="Sync Loading"
                value={syncLoading ? 'Yes' : 'No'}
                theme={theme}
              />
              <InfoRow
                label="Oldest Entry"
                value={
                  entries.length > 0
                    ? new Date(entries[entries.length - 1].createdAt).toLocaleDateString()
                    : 'N/A'
                }
                theme={theme}
              />
              <InfoRow
                label="Newest Entry"
                value={
                  entries.length > 0
                    ? new Date(entries[0].createdAt).toLocaleDateString()
                    : 'N/A'
                }
                theme={theme}
              />
            </View>
          </View>

          {/* Theme State Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Theme State
            </Text>
            <View style={[styles.card, { backgroundColor: theme.colors.background }]}>
              <InfoRow
                label="Theme Mode"
                value={theme.mode}
                theme={theme}
              />
              <InfoRow
                label="Effective Mode"
                value={theme.isDark ? 'dark' : 'light'}
                theme={theme}
              />
              <InfoRow
                label="Background"
                value={theme.colors.background}
                theme={theme}
                mono
              />
              <InfoRow
                label="Primary"
                value={theme.colors.primary}
                theme={theme}
                mono
              />
            </View>
          </View>

          {/* Generate Memories Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Generate Test Data
            </Text>
            <View style={[styles.card, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.inputLabel, { color: theme.colors.textMuted }]}>
                Number of memories (1-100)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.textStrong,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={memoriesCount}
                onChangeText={setMemoriesCount}
                keyboardType="number-pad"
                placeholder="10"
                placeholderTextColor={theme.colors.textMuted}
                maxLength={3}
              />
              <ActionButton
                label={isGenerating ? 'Generating...' : 'Generate Memories'}
                icon="images-outline"
                onPress={handleGenerateMemories}
                theme={theme}
                disabled={isGenerating}
              />
              <Text style={[styles.helperText, { color: theme.colors.textMuted }]}>
                Creates random memories with past dates and random avatar images
              </Text>
            </View>
          </View>

          {/* Quick Actions Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Quick Actions
            </Text>
            <View style={styles.actionsContainer}>
              <ActionButton
                label={user ? 'Sign Out' : 'Sign In'}
                icon={user ? 'log-out-outline' : 'log-in-outline'}
                onPress={handleSignInOut}
                theme={theme}
              />
              <ActionButton
                label="Force Sync"
                icon="cloud-upload-outline"
                onPress={handleSyncToCloud}
                theme={theme}
                disabled={!user}
              />
              <ActionButton
                label="Toggle Theme"
                icon="color-palette-outline"
                onPress={handleToggleTheme}
                theme={theme}
              />
              <ActionButton
                label="Clear Entries"
                icon="trash-outline"
                onPress={handleClearEntries}
                theme={theme}
                destructive
              />
            </View>
          </View>

          {/* Environment Info */}
          <View style={[styles.section, styles.lastSection]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Environment
            </Text>
            <View style={[styles.card, { backgroundColor: theme.colors.background }]}>
              <InfoRow
                label="Platform"
                value={Platform.OS}
                theme={theme}
              />
              <InfoRow
                label="Dev Mode"
                value={__DEV__ ? 'Yes' : 'No'}
                theme={theme}
              />
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
}

// Helper Components

interface InfoRowProps {
  label: string;
  value: string;
  theme: any;
  mono?: boolean;
}

function InfoRow({ label, value, theme, mono = false }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.infoValue,
          { color: theme.colors.textStrong },
          mono && styles.monoValue,
        ]}
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {value}
      </Text>
    </View>
  );
}

interface ActionButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  theme: any;
  disabled?: boolean;
  destructive?: boolean;
}

function ActionButton({
  label,
  icon,
  onPress,
  theme,
  disabled = false,
  destructive = false,
}: ActionButtonProps) {
  return (
    <Pressable
      style={[
        styles.actionButton,
        {
          backgroundColor: theme.colors.background,
          borderColor: destructive ? '#ff3b30' : theme.colors.border,
        },
        disabled && styles.actionButtonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons
        name={icon}
        size={20}
        color={
          disabled
            ? theme.colors.textMuted
            : destructive
            ? '#ff3b30'
            : theme.colors.primary
        }
      />
      <Text
        style={[
          styles.actionButtonText,
          {
            color: disabled
              ? theme.colors.textMuted
              : destructive
              ? '#ff3b30'
              : theme.colors.textStrong,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 0,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
  monoValue: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 12,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  helperText: {
    fontSize: 12,
    marginTop: 8,
    lineHeight: 16,
  },
});
