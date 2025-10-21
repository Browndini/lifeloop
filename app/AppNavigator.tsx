import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useState } from "react";
import DevTools from "./components/DevTools";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { EntriesProvider } from "./context/EntriesContext";
import AddEntryScreen from "./screens/AddEntryScreen";
import CalendarScreen from "./screens/CalendarScreen";
import HomeScreen from "./screens/HomeScreen";
import FlipbookScreen from "./screens/FlipbookScreen";
import SettingsScreen from "./screens/SettingsScreen";
import LoginScreen from "./screens/LoginScreen";
import EmailLoginScreen from "./screens/EmailLoginScreen";
import { ThemeProvider, useTheme } from "./theme";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EntriesProvider>
          <AppNavigatorContent />
        </EntriesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppNavigatorContent() {
  const { theme } = useTheme();
  const { user, loading, isGuestMode } = useAuth();
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Show login screen if not authenticated and not in guest mode
  if (!user && !isGuestMode) {
    if (showEmailLogin) {
      return <EmailLoginScreen onBack={() => setShowEmailLogin(false)} />;
    }
    return <LoginScreen onEmailLogin={() => setShowEmailLogin(true)} />;
  }

  // User is authenticated or in guest mode - show main app
  const AppTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.background,
      card: theme.colors.surface,
      primary: theme.colors.primary,
      text: theme.colors.textStrong,
      border: theme.colors.border,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={AppTheme}>
        <StatusBar style={theme.isDark ? "light" : "dark"} />
        <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: theme.colors.textMuted,
              tabBarStyle: {
                position: 'absolute',
                borderRadius: 32,
                marginHorizontal: 24,
                marginBottom: 18,
                height: 68,
                paddingBottom: 12,
                paddingTop: 12,
                backgroundColor: 'transparent',
                borderTopColor: 'transparent',
                shadowColor: theme.shadows.sm.shadowColor,
                shadowOpacity: theme.shadows.sm.shadowOpacity,
                shadowRadius: theme.shadows.sm.shadowRadius,
                elevation: 0,
              },
              tabBarBackground: () => (
                <BlurView
                  intensity={theme.isDark ? 80 : 95}
                  tint={theme.isDark ? 'dark' : 'light'}
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    borderRadius: 32,
                    overflow: 'hidden',
                  }}
                />
              ),
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap = "calendar-outline";
                if (route.name === "Today") {
                  iconName = focused ? "camera" : "camera-outline";
                } else if (route.name === "Memories") {
                  iconName = focused ? "images" : "images-outline";
                } else if (route.name === "Calendar") {
                  iconName = focused ? "calendar" : "calendar-outline";
                } else if (route.name === "Settings") {
                  iconName = focused ? "settings" : "settings-outline";
                } else if (route.name === "Flipbook") {
                  iconName = focused ? "film" : "film-outline";
                }
                return <Ionicons name={iconName} size={size} color={color} />;
              },
            })}
          >
            <Tab.Screen name="Today" component={AddEntryScreen} />
            <Tab.Screen name="Memories" component={HomeScreen} />
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="Flipbook" component={FlipbookScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
        <DevTools />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
