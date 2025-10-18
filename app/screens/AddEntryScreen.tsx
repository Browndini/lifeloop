import { useEffect, useMemo, useState } from "react";
import { Alert, Image, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { cacheDirectory, copyAsync, documentDirectory, getInfoAsync, makeDirectoryAsync } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { nanoid } from "nanoid/non-secure";
import { Header } from "../components/Header";
import { useEntries } from "../context/EntriesContext";
import { JournalEntry } from "../utils/storage";

export default function AddEntryScreen() {
  const { entries, addOrUpdateEntry } = useEntries();
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const existing = entries.find((entry) => entry.date === today);

  const [imageUri, setImageUri] = useState(existing?.imageUri ?? "");
  const [caption, setCaption] = useState(existing?.caption ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setImageUri(existing?.imageUri ?? "");
    setCaption(existing?.caption ?? "");
  }, [existing?.caption, existing?.imageUri]);

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
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need camera access to capture your moment.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!imageUri || caption.trim().length === 0) {
      Alert.alert("Incomplete", "Please add a photo and a caption to save your memory.");
      return;
    }

    try {
      setLoading(true);
      const baseDirectory = `${documentDirectory ?? cacheDirectory ?? ""}lifeloop/`;
      const directoryInfo = await getInfoAsync(baseDirectory);
      if (!directoryInfo.exists) {
        await makeDirectoryAsync(baseDirectory, { intermediates: true });
      }

      let storedUri = imageUri;
      const alreadyStored = imageUri.startsWith(baseDirectory);
      if (!alreadyStored) {
        const destination = `${baseDirectory}${today}.jpg`;
        await copyAsync({ from: imageUri, to: destination });
        storedUri = destination;
      }

      const entry: JournalEntry = {
        id: existing?.id ?? nanoid(),
        date: today,
        imageUri: storedUri,
        caption: caption.trim(),
        createdAt: existing?.createdAt ?? Date.now(),
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
    <SafeAreaView className="flex-1 bg-[#f9f6f2]">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 160 }}>
        <Header title="Today" subtitle="Capture your daily moment" />

        <View className="mb-6 overflow-hidden rounded-3xl bg-white shadow-md shadow-sand-200">
          {imageUri ? (
            <Image source={{ uri: imageUri }} className="h-80 w-full" resizeMode="cover" />
          ) : (
            <View className="h-80 items-center justify-center bg-sand-100">
              <Text className="text-lg text-sand-500">No photo yet</Text>
            </View>
          )}
          <View className="flex-row border-t border-sand-100">
            <ActionButton label="Take photo" onPress={takePhoto} />
            <ActionButton label="Pick from library" onPress={pickImage} />
          </View>
        </View>

        <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-sand-500">Caption</Text>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Describe the moment in a sentence"
          maxLength={100}
          style={{
            minHeight: 120,
            textAlignVertical: "top",
          }}
          className="rounded-3xl bg-white p-5 text-base text-sand-700 shadow-sm shadow-sand-200"
          multiline
          editable={!disabled}
        />
        <Text className="mt-2 text-right text-sm text-sand-400">{caption.length}/100</Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={disabled}
          className={`mt-8 rounded-full bg-sand-600 py-4 ${disabled ? "opacity-70" : ""}`}
        >
          <Text className="text-center text-lg font-semibold text-white">
            {existing ? "Update today" : "Save memory"}
          </Text>
        </TouchableOpacity>

        {existing ? (
          <Text className="mt-6 text-center text-sm text-sand-500">
            You already have a memory today. Update it if you wish to change it.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
};

function ActionButton({ label, onPress }: ActionButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} className="flex-1 items-center justify-center py-4">
      <Text className="text-sm font-semibold text-sand-600">{label}</Text>
    </TouchableOpacity>
  );
}
