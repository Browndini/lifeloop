import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { JournalEntry } from '../utils/storage';
import CompactEntryCard from './CompactEntryCard';

interface TimelineProps {
  entries: JournalEntry[];
  onEntryPress?: (entry: JournalEntry) => void;
}

interface TimelineItemProps {
  entry: JournalEntry;
  isLast: boolean;
  onPress?: (entry: JournalEntry) => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ entry, isLast, onPress }) => {
  const { theme } = useTheme();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <View style={styles.timelineItem}>
      {/* Timeline dot and connector */}
      <View style={styles.timelineSeparator}>
        <View style={[
          styles.timelineDot,
          { backgroundColor: theme.colors.primary }
        ]} />
        {!isLast && (
          <View style={[
            styles.timelineConnector,
            { backgroundColor: theme.colors.border }
          ]} />
        )}
      </View>
      
      {/* Timeline content */}
      <View style={styles.timelineContent}>
        <View style={[
          styles.dateContainer,
          { backgroundColor: theme.colors.surface }
        ]}>
          <Text style={[styles.dateText, { color: theme.colors.textMuted }]}>
            {formatDate(entry.date)}
          </Text>
          <Text style={[styles.timeText, { color: theme.colors.textMuted }]}>
            {formatTime(entry.date)}
          </Text>
        </View>
        
        <View style={styles.entryContainer}>
          <CompactEntryCard 
            entry={entry} 
            onPress={onPress}
            style={styles.entryCard}
          />
        </View>
      </View>
    </View>
  );
};

const Timeline: React.FC<TimelineProps> = ({ entries, onEntryPress }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.timeline}>
      {entries.map((entry, index) => (
        <TimelineItem
          key={entry.id}
          entry={entry}
          isLast={index === entries.length - 1}
          onPress={onEntryPress}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  timeline: {
    flex: 1,
    paddingHorizontal: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineSeparator: {
    alignItems: 'center',
    marginRight: 16,
    width: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    minHeight: 40,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  dateContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  entryContainer: {
    flex: 1,
  },
  entryCard: {
    marginBottom: 0,
  },
});

export default Timeline;
