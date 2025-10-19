import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarView from '../components/CalendarView';
import Header from '../components/Header';
import { useTheme } from '../theme';

export default function CalendarScreen() {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header title="Calendar" subtitle="Browse your memories by date" />
        <CalendarView />
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
});
