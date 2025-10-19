import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { shadows, useTheme } from '../theme';
import { JournalEntry } from '../utils/storage';

interface CompactEntryCardProps {
  entry: JournalEntry;
  onPress?: (entry: JournalEntry) => void;
  style?: any;
}

const CompactEntryCard: React.FC<CompactEntryCardProps> = ({ 
  entry, 
  onPress, 
  style 
}) => {
  const { theme } = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Pressable
      style={[styles.container, { backgroundColor: theme.colors.surface }, style]}
      onPress={() => onPress?.(entry)}
      android_ripple={{ color: theme.colors.primary + '20' }}
    >
      {/* Image */}
      {entry.imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: entry.imageUri }} style={styles.image} />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Date/Time */}
        <View style={styles.dateContainer}>
          <Text style={[styles.dateText, { color: theme.colors.textMuted }]}>
            {formatDate(entry.date)}
          </Text>
          <Text style={[styles.timeText, { color: theme.colors.textMuted }]}>
            {formatTime(entry.date)}
          </Text>
        </View>

        {/* Caption */}
        {entry.caption && (
          <Text 
            style={[styles.contentText, { color: theme.colors.textMuted }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {entry.caption}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    minHeight: 200,
    ...shadows.sm,
  },
  imageContainer: {
    width: '100%',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    padding: 12,
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  contentText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
});

export default CompactEntryCard;
