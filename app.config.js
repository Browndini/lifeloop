module.exports = ({ config }) => {
  // Get environment from EAS build profile or default to development
  const environment = __DEV__ ? 'development' : 'production';
  const isDev = environment.includes('development') || environment === 'simulator';
  const isPreview = environment === 'preview';

  // Set app name based on build type
  const appName = isDev ? 'lifeloop Dev' : isPreview ? 'lifeloop Preview' : 'lifeloop';

  return {
    expo: {
      name: appName,
      slug: "lifeloop",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "lifeloop",
      userInterfaceStyle: "automatic",
      newArchEnabled: true,
    ios: {
      bundleIdentifier: "com.lifeloop-photos.app",
      supportsTablet: true,
      icon: "./assets/images/icon.png",
      splash: {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#f9f6f2"
      },
      googleServicesFile: "./GoogleService-Info.plist",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: "$(PRODUCT_NAME) uses your camera to capture your daily memory.",
        NSPhotoLibraryUsageDescription: "$(PRODUCT_NAME) needs access to your photo library to attach a memory.",
        NSPhotoLibraryAddUsageDescription: "$(PRODUCT_NAME) saves your selected images so you can revisit them later.",
        NSUserNotificationsUsageDescription: "$(PRODUCT_NAME) sends daily reminders to help you capture your memories."
      }
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#f9f6f2",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: isDev ? "com.lifeloopphotos.dev" : isPreview ? "com.lifeloopphotos.preview" : "com.lifeloopphotos",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.VIBRATE",
        "android.permission.SCHEDULE_EXACT_ALARM"
      ]
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-google-signin/google-signin",
      "expo-apple-authentication",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#f9f6f2",
          dark: {
            backgroundColor: "#966f51"
          }
        }
      ],
      [
        "expo-image-picker",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to use your camera to capture today's memory.",
          photosPermission: "Allow $(PRODUCT_NAME) to access your photo library to select a memory.",
          microphonePermission: "Allow $(PRODUCT_NAME) to use the microphone while recording video memories."
        }
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/android-icon-monochrome.png",
          color: "#966f51"
        }
      ],
      [
        "react-native-vision-camera",
        {
          cameraPermissionText: "$(PRODUCT_NAME) needs access to your Camera.",

          // optionally, if you want to record audio:
          enableMicrophonePermission: true,
          microphonePermissionText: "$(PRODUCT_NAME) needs access to your Microphone."
        }
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
            forceStaticLinking: ["RNFBApp", "RNFBAuth", "RNFBFunctions", "RNFBStorage", "RNFBFirestore"]
          }
        }
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "0c7d65cf-25fa-4b83-b5d5-1e5f5aa20139"
      }
    },
    owner: "browndini"
    }
  };
};
