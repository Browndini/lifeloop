import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useEntries } from '../context/EntriesContext';
import { useTheme } from '../theme';
import { JournalEntry } from '../utils/storage';
import EntryCard from './EntryCard';

interface CalendarViewProps {
  onSelectDate?: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onSelectDate }) => {
  const { theme } = useTheme();
  const { entries } = useEntries();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Create a map of dates to entries for easy lookup
  const entriesByDate = useMemo(() => {
    const map: Record<string, JournalEntry[]> = {};
    entries.forEach(entry => {
      const date = entry.date;
      if (!map[date]) {
        map[date] = [];
      }
      map[date].push(entry);
    });
    return map;
  }, [entries]);

  // Get all dates that have entries
  const markedDates = useMemo(() => {
    const marked: Record<string, any> = {};

    Object.keys(entriesByDate).forEach(date => {
      marked[date] = {
        marked: true,
        dotColor: theme.colors.primary,
        selectedColor: theme.colors.primaryLight,
      };
    });

    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: theme.colors.primary,
      };
    }

    return marked;
  }, [entriesByDate, selectedDate, theme]);

  const handleDayPress = (day: DateData) => {
    const dateString = day.dateString;
    setSelectedDate(dateString === selectedDate ? null : dateString);
    onSelectDate?.(dateString);
  };

  const selectedDateEntries = selectedDate ? entriesByDate[selectedDate] || [] : [];

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          backgroundColor: theme.colors.surface,
          calendarBackground: theme.colors.surface,
          textSectionTitleColor: theme.colors.textMuted,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: theme.colors.surface,
          todayTextColor: theme.colors.primary,
          dayTextColor: theme.colors.textStrong,
          textDisabledColor: theme.colors.textMuted,
          dotColor: theme.colors.primary,
          selectedDotColor: theme.colors.surface,
          arrowColor: theme.colors.primary,
          disabledArrowColor: theme.colors.textMuted,
          monthTextColor: theme.colors.textStrong,
          indicatorColor: theme.colors.primary,
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        style={styles.calendar}
      />

      {selectedDate && (
        <View style={styles.entriesContainer}>
          <Text style={styles.entriesTitle}>
            {selectedDateEntries.length === 0
              ? `No memories for ${new Date(selectedDate).toLocaleDateString()}`
              : `${selectedDateEntries.length} ${selectedDateEntries.length === 1 ? 'memory' : 'memories'} for ${new Date(selectedDate).toLocaleDateString()}`
            }
          </Text>

          {selectedDateEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              style={styles.entryCard}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  calendar: {
    borderRadius: 12,
    paddingBottom: 10,
  },
  entriesContainer: {
    marginTop: 20,
    flex: 1,
  },
  entriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textStrong,
    marginBottom: 16,
    textAlign: 'center',
  },
  entryCard: {
    marginBottom: 12,
  },
});

export default CalendarView;
