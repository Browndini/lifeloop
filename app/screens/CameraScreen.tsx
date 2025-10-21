import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "../theme";

type CameraScreenProps = {
  previousImageUri?: string;
  onPhotoTaken: (uri: string) => void;
  onClose: () => void;
};

export default function CameraScreen({
  previousImageUri,
  onPhotoTaken,
  onClose,
}: CameraScreenProps) {
  const [cameraType, setCameraType] = useState<"front" | "back">("front");
  const device = useCameraDevice(cameraType);
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);

  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const handleCapturePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePhoto({
        flash: "off",
        enableShutterSound: true,
      });

      const uri = Platform.OS === "android" ? `file://${photo.path}` : photo.path;
      onPhotoTaken(uri);
    } catch (error) {
      console.error("Failed to capture photo:", error);
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera permission is required</Text>
          <Pressable style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.permissionText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Previous photo overlay */}
      {previousImageUri && showOverlay && (
        <View style={[StyleSheet.absoluteFill, { opacity: overlayOpacity }]} pointerEvents="none">
          <Image
            source={{ uri: previousImageUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Bottom controls */}
      <SafeAreaView style={styles.bottomControls} edges={["bottom"]}>
        {previousImageUri && (
          <Text style={styles.hintText}>
            Align your photo with the previous day's image
          </Text>
        )}

        {/* Button row with close, capture, and flip */}
        <View style={styles.controlsRow}>
          {/* Close button */}
          <Pressable style={styles.sideButton} onPress={onClose}>
            <Ionicons name="close" size={32} color="white" />
          </Pressable>

          {/* Capture button */}
          <Pressable
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={handleCapturePhoto}
            disabled={isCapturing}
          >
            <View style={styles.captureButtonInner} />
          </Pressable>

          {/* Flip camera button */}
          <Pressable
            style={styles.sideButton}
            onPress={() => setCameraType(prev => prev === 'front' ? 'back' : 'front')}
          >
            <Ionicons name="camera-reverse-outline" size={32} color="white" />
          </Pressable>
        </View>

        {/* Overlay toggle button - only show if previousImageUri exists */}
        {previousImageUri && (
          <Pressable
            style={styles.overlayToggleButton}
            onPress={() => setShowOverlay(prev => !prev)}
          >
            <Ionicons
              name={showOverlay ? "eye-outline" : "eye-off-outline"}
              size={24}
              color="white"
            />
            <Text style={styles.overlayToggleText}>
              {showOverlay ? "Hide Overlay" : "Show Overlay"}
            </Text>
          </Pressable>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  permissionText: {
    fontSize: 16,
    color: palette.textMuted,
    textAlign: "center",
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: palette.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: "center",
    gap: 16,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 400,
  },
  sideButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "white",
  },
  hintText: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  overlayToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  overlayToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
});
