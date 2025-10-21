import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import { useEntries } from "../context/EntriesContext";
import { useTheme } from "../theme";

export default function FlipbookScreen() {
  const { theme } = useTheme();
  const { entries } = useEntries();

  // Sort entries chronologically
  const sortedEntries = [...entries].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(8); // Default 8 frames per second
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Animation values
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  // Calculate interval in milliseconds from fps
  const getInterval = (framesPerSecond: number) => 1000 / framesPerSecond;

  // Animate the flip transition
  const animateFlip = () => {
    // Reset animations
    flipAnimation.setValue(0);
    fadeAnimation.setValue(1);

    // Subtle flip animation
    Animated.parallel([
      Animated.timing(flipAnimation, {
        toValue: 1,
        duration: 200, // Slower, smoother
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(fadeAnimation, {
          toValue: 0.92, // Less drastic fade (was 0.7)
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Reset after animation completes
      flipAnimation.setValue(0);
    });
  };

  // Playback effect
  useEffect(() => {
    if (isPlaying && sortedEntries.length > 0) {
      intervalRef.current = setInterval(() => {
        animateFlip();
        setCurrentIndex((prev) => {
          const next = prev + 1;
          // Loop back to start when reaching end
          if (next >= sortedEntries.length) {
            return 0;
          }
          return next;
        });
      }, getInterval(fps));
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, fps, sortedEntries.length]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleScrub = (value: number) => {
    setCurrentIndex(Math.floor(value));
  };

  // Show empty state if no entries
  if (sortedEntries.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <Header title="Flipbook" subtitle="Your year in motion" />
        <EmptyState
          icon="film-outline"
          title="No photos yet"
          message="Capture your daily moments to see them come alive in a flipbook animation."
        />
      </SafeAreaView>
    );
  }

  const currentEntry = sortedEntries[currentIndex];

  // Calculate flip transform - much subtler
  const flipInterpolate = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '-5deg', '0deg'], // Reduced from -15deg to -5deg
  });

  const scaleInterpolate = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.98, 1], // Reduced from 0.95 to 0.98
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Header with proper padding */}
        <View style={styles.headerContainer}>
          <Header title="Flipbook" subtitle="Your year in motion" />
        </View>

        {/* Main flipbook display */}
        <View style={styles.flipbookContainer}>
          <Animated.View
            style={[
              styles.imageContainer,
              theme.shadows.md,
              {
                transform: [
                  { perspective: 1000 },
                  { rotateY: flipInterpolate },
                  { scale: scaleInterpolate },
                ],
                opacity: fadeAnimation,
              },
            ]}
          >
            <Image
              source={{ uri: currentEntry.imageUri }}
              style={styles.image}
              resizeMode="cover"
            />

            {/* Date overlay */}
            <View style={[styles.dateOverlay, { backgroundColor: theme.colors.surfaceOverlay }]}>
              <Text style={[styles.dateText, { color: theme.colors.textStrong }]}>
                {new Date(currentEntry.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Controls */}
        <View style={[styles.controlsContainer, { backgroundColor: theme.colors.surface }, theme.shadows.md]}>
          {/* Progress indicator */}
          <View style={styles.progressRow}>
            <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
              {currentIndex + 1} / {sortedEntries.length} days
            </Text>
          </View>

          {/* Timeline scrubber */}
          <View style={styles.scrubberContainer}>
            <Slider
              style={styles.scrubber}
              minimumValue={0}
              maximumValue={sortedEntries.length - 1}
              value={currentIndex}
              onValueChange={handleScrub}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={theme.colors.primary}
              step={1}
            />
          </View>

          {/* Play/Pause button */}
          <View style={styles.playbackRow}>
            <Pressable
              onPress={togglePlayPause}
              style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={24}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          {/* Speed control */}
          <View style={styles.speedContainer}>
            <View style={styles.speedLabelRow}>
              <Ionicons name="speedometer-outline" size={13} color={theme.colors.textMuted} />
              <Text style={[styles.speedLabel, { color: theme.colors.textMuted }]}>
                Speed: {fps} fps
              </Text>
            </View>
            <Slider
              style={styles.speedSlider}
              minimumValue={3}
              maximumValue={15}
              value={fps}
              onValueChange={setFps}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={theme.colors.primary}
              step={1}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 24,
  },
  flipbookContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 260, // Reduced for smaller controls
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    maxHeight: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dateOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 60,
    left: 24,
    right: 24,
    borderRadius: 16,
    padding: 14,
  },
  progressRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scrubberContainer: {
    marginBottom: 10,
  },
  scrubber: {
    width: '100%',
    height: 32,
  },
  playbackRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedContainer: {
    marginTop: 4,
  },
  speedLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  speedLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  speedSlider: {
    width: '100%',
    height: 24,
  },
});
