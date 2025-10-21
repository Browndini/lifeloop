import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { nanoid } from "nanoid/non-secure";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import MoodPicker from "../components/MoodPicker";
import { useEntries } from "../context/EntriesContext";
import { palette, shadows } from "../theme";
import { JournalEntry } from "../utils/storage";
import CameraScreen from "./CameraScreen";

export default function AddEntryScreen() {
  const { entries, addOrUpdateEntry } = useEntries();
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const existing = entries.find((entry) => entry.date === today);

  const [imageUri, setImageUri] = useState(existing?.imageUri ?? "");
  const [caption, setCaption] = useState(existing?.caption ?? "");
  const [mood, setMood] = useState<string | undefined>(existing?.mood);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Get previous day's entry for overlay
  const previousEntry = useMemo(() => {
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    // Get most recent entry before today
    return sortedEntries.find((entry) => entry.date < today);
  }, [entries, today]);

  useEffect(() => {
    setImageUri(existing?.imageUri ?? "");
    setCaption(existing?.caption ?? "");
    setMood(existing?.mood);
  }, [existing?.caption, existing?.imageUri, existing?.mood]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need access to your photos to continue.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Open custom camera with overlay
    setShowCamera(true);
  };

  const handlePhotoTaken = (uri: string) => {
    setImageUri(uri);
    setShowCamera(false);
  };

  const handleSave = async () => {
    if (!imageUri || caption.trim().length === 0) {
      Alert.alert("Incomplete", "Please add a photo and a caption to save your memory.");
      return;
    }

    try {
      setLoading(true);
      const baseDirectory = new Directory(Paths.document, "lifeloop");
      if (!baseDirectory.exists) {
        baseDirectory.create({ intermediates: true });
      }

      let storedUri = imageUri;
      const alreadyStored = imageUri.startsWith(baseDirectory.uri);
      if (!alreadyStored) {
        const destinationFile = new File(baseDirectory, `${today}.jpg`);
        // Delete existing file if it exists (when updating entry with new image)
        if (destinationFile.exists) {
          destinationFile.delete();
        }
        const sourceFile = new File(imageUri);
        sourceFile.copy(destinationFile);
        storedUri = destinationFile.uri;
      }

      const entry: JournalEntry = {
        id: existing?.id ?? nanoid(),
        date: today,
        imageUri: storedUri,
        caption: caption.trim(),
        createdAt: existing?.createdAt ?? Date.now(),
        mood,
      };

      await addOrUpdateEntry(entry);
      Alert.alert("Saved", "Your memory for today is saved.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "We couldn't save your entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header title="Today" subtitle="Capture your daily moment" />

        <View style={styles.card}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>No photo yet</Text>
            </View>
          )}
          <View style={styles.actionBar}>
            <ActionButton label="Take photo" onPress={takePhoto} />
            <ActionButton label="Pick from library" onPress={pickImage} />
          </View>
        </View>

        <Text style={styles.label}>Caption</Text>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Describe the moment in a sentence"
          maxLength={100}
          style={styles.textInput}
          multiline
          editable={!disabled}
        />
        <Text style={styles.charCount}>{caption.length}/100</Text>

        <Text style={styles.label}>How are you doing today?</Text>
        <MoodPicker
          selectedMood={mood}
          onMoodSelect={setMood}
          accentColor={palette.primary}
        />

        <TouchableOpacity
          onPress={handleSave}
          disabled={disabled}
          style={[styles.saveButton, disabled && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>
            {existing ? "Update today" : "Save memory"}
          </Text>
        </TouchableOpacity>

        {existing ? (
          <Text style={styles.infoText}>
            You already have a memory today. Update it if you wish to change it.
          </Text>
        ) : null}
      </ScrollView>

      {/* Custom Camera Modal */}
      <Modal visible={showCamera} animationType="slide" presentationStyle="fullScreen">
        <CameraScreen
          previousImageUri={previousEntry?.imageUri}
          onPhotoTaken={handlePhotoTaken}
          onClose={() => setShowCamera(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
};

function ActionButton({ label, onPress }: ActionButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.actionButton}>
      <Text style={styles.actionButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 160,
  },
  card: {
    marginBottom: 24,
    borderRadius: 30,
    backgroundColor: palette.surface,
    overflow: "hidden",
    ...shadows.md,
  },
  image: {
    height: 280,
    width: "100%",
  },
  placeholder: {
    height: 280,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primaryLight,
  },
  placeholderText: {
    fontSize: 18,
    color: palette.textMuted,
  },
  actionBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: palette.border,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: palette.primary,
  },
  label: {
    marginBottom: 8,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "600",
    color: palette.textMuted,
  },
  textInput: {
    minHeight: 120,
    textAlignVertical: "top",
    borderRadius: 24,
    backgroundColor: palette.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: palette.textStrong,
    ...shadows.sm,
  },
  charCount: {
    marginTop: 8,
    textAlign: "right",
    fontSize: 13,
    color: palette.textMuted,
  },
  saveButton: {
    marginTop: 32,
    borderRadius: 999,
    backgroundColor: palette.primary,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  infoText: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 14,
    color: palette.textMuted,
    lineHeight: 20,
  },
});
