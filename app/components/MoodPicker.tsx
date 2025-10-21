import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MOOD_ORDER, MOODS, MoodType } from '../utils/moodConfig';

interface MoodPickerProps {
  selectedMood?: string;
  onMoodSelect: (mood: string) => void;
  accentColor?: string;
}

interface ConfettiParticle {
  id: number;
  translateX: Animated.Value;
  translateY: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
}

export default function MoodPicker({ selectedMood, onMoodSelect, accentColor = '#966f51' }: MoodPickerProps) {
  const confettiParticles = useRef<ConfettiParticle[]>([]);
  const [showingConfetti, setShowingConfetti] = React.useState(false);
  const [confettiPosition, setConfettiPosition] = React.useState({ x: 0, y: 0 });
  const moodButtonRefs = useRef<Record<string, View | null>>({});

  const handleMoodPress = (mood: MoodType, event: any) => {
    // Measure button position for confetti origin
    const buttonRef = moodButtonRefs.current[mood];
    if (buttonRef) {
      buttonRef.measure((x, y, width, height, pageX, pageY) => {
        setConfettiPosition({
          x: x + width / 2,
          y: y + height / 2,
        });
        onMoodSelect(mood);
        triggerConfetti(mood);
      });
    } else {
      onMoodSelect(mood);
      triggerConfetti(mood);
    }
  };

  const triggerConfetti = (mood: MoodType) => {
    const moodColor = MOODS[mood].color;

    // Generate color variations
    const getColorVariations = (baseColor: string): string[] => {
      // Return array of color variations including base color
      const colors = [baseColor];

      // Add lighter and darker variations
      const lighterShade = adjustBrightness(baseColor, 30);
      const darkerShade = adjustBrightness(baseColor, -30);
      colors.push(lighterShade, darkerShade);

      // Add some complementary colors for variety
      colors.push('#FFD700', '#FF69B4', '#87CEEB', '#98FB98');

      return colors;
    };

    const colorVariations = getColorVariations(moodColor);
    const particleCount = 15;

    // Clear previous particles
    confettiParticles.current = [];

    // Create new particles with varied colors
    for (let i = 0; i < particleCount; i++) {
      confettiParticles.current.push({
        id: i,
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(0),
        color: colorVariations[i % colorVariations.length],
      });
    }

    setShowingConfetti(true);

    // Animate all particles
    const animations = confettiParticles.current.map((particle, index) => {
      const angle = (index / particleCount) * Math.PI * 2;
      const distance = 40 + Math.random() * 20;
      const duration = 600 + Math.random() * 200;

      return Animated.parallel([
        Animated.timing(particle.translateX, {
          toValue: Math.cos(angle) * distance,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateY, {
          toValue: Math.sin(angle) * distance,
          duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: duration * 0.3,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 0,
            duration: duration * 0.7,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start(() => {
      setShowingConfetti(false);
    });
  };

  // Helper function to adjust color brightness
  const adjustBrightness = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.min(255, Math.max(0, parseInt(hex.substring(0, 2), 16) + amount));
    const g = Math.min(255, Math.max(0, parseInt(hex.substring(2, 4), 16) + amount));
    const b = Math.min(255, Math.max(0, parseInt(hex.substring(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.moodRow}>
        {MOOD_ORDER.map((mood) => {
          const config = MOODS[mood];
          const isSelected = selectedMood === mood;

          return (
            <Pressable
              key={mood}
              ref={(ref) => (moodButtonRefs.current[mood] = ref)}
              onPress={(event) => handleMoodPress(mood, event)}
              style={[
                styles.moodButton,
                isSelected && [styles.moodButtonSelected, { borderColor: config.color }],
              ]}
            >
              <Text style={styles.moodEmoji}>{config.emoji}</Text>
              {isSelected && (
                <Text style={[styles.moodLabel, { color: config.color }]}>
                  {config.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Confetti Layer */}
      {showingConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {confettiParticles.current.map((particle) => (
            <Animated.View
              key={particle.id}
              style={[
                styles.confettiParticle,
                {
                  backgroundColor: particle.color,
                  left: confettiPosition.x,
                  top: confettiPosition.y,
                  transform: [
                    { translateX: particle.translateX },
                    { translateY: particle.translateY },
                    { scale: particle.scale },
                  ],
                  opacity: particle.opacity,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  moodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#f5f5f5',
  },
  moodButtonSelected: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  confettiParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
