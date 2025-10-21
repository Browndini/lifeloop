export type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'awful';

export interface MoodConfig {
  emoji: string;
  color: string;
  label: string;
}

export const MOODS: Record<MoodType, MoodConfig> = {
  great: {
    emoji: '😄',
    color: '#4CAF50', // Green
    label: 'Great',
  },
  good: {
    emoji: '🙂',
    color: '#8BC34A', // Light Green
    label: 'Good',
  },
  neutral: {
    emoji: '😐',
    color: '#9E9E9E', // Gray
    label: 'Neutral',
  },
  bad: {
    emoji: '😕',
    color: '#FF9800', // Orange
    label: 'Bad',
  },
  awful: {
    emoji: '😢',
    color: '#F44336', // Red
    label: 'Awful',
  },
};

export const MOOD_ORDER: MoodType[] = ['great', 'good', 'neutral', 'bad', 'awful'];

export function getMoodConfig(mood?: string): MoodConfig | null {
  if (!mood || !(mood in MOODS)) {
    return null;
  }
  return MOODS[mood as MoodType];
}

export function getMoodColor(mood?: string, fallbackColor: string = '#966f51'): string {
  const config = getMoodConfig(mood);
  return config?.color ?? fallbackColor;
}
