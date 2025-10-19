import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { JournalEntry } from '../utils/storage';

interface LightboxProps {
  visible: boolean;
  entry: JournalEntry | null;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Lightbox: React.FC<LightboxProps> = ({ visible, entry, onClose }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  if (!entry) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay}>
        {/* Header - Fixed at top */}
        <View style={[styles.header, { 
          backgroundColor: theme.colors.surface,
          paddingTop: insets.top,
          paddingBottom: 16,
        }]}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.dateText, { color: theme.colors.textStrong }]}>
              {formatDate(entry.date)}
            </Text>
            <Text style={[styles.timeText, { color: theme.colors.textMuted }]}>
              {formatTime(entry.date)}
            </Text>
          </View>
        </View>

        {/* Content Area */}
        <Pressable style={styles.contentArea} onPress={onClose}>
          <Pressable style={styles.scrollContainer} onPress={(e) => e.stopPropagation()}>
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
              showsVerticalScrollIndicator={false}
            >
              {/* Image */}
              {entry.imageUri && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: entry.imageUri }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Text Content */}
              <View style={[styles.textContainer, { backgroundColor: theme.colors.surface }]}>
                {entry.caption && (
                  <Text style={[styles.content, { color: theme.colors.textStrong }]}>
                    {entry.caption}
                  </Text>
                )}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  contentArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1000,
    elevation: 1000,
  },
  closeButton: {
    padding: 12,
    marginRight: 16,
    zIndex: 1001,
    elevation: 1001,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 25,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight * 0.35,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
});

export default Lightbox;
