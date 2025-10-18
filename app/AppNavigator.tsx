import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { EntriesProvider } from "./context/EntriesContext";
import HomeScreen from "./screens/HomeScreen";
import AddEntryScreen from "./screens/AddEntryScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { useColorScheme } from "react-native";

const Tab = createBottomTabNavigator();

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#f9f6f2",
  },
};

export default function AppNavigator() {
  const scheme = useColorScheme();

  return (
    <EntriesProvider>
      <NavigationContainer theme={AppTheme}>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: "#966f51",
            tabBarInactiveTintColor: "#c7aa8f",
            tabBarStyle: {
              borderRadius: 32,
              marginHorizontal: 24,
              marginBottom: 18,
              height: 68,
              paddingBottom: 12,
              paddingTop: 12,
              backgroundColor: "white",
              shadowColor: "#c7aa8f",
              shadowOpacity: 0.2,
              shadowRadius: 16,
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap = "calendar-outline";
              if (route.name === "Today") {
                iconName = focused ? "camera" : "camera-outline";
              } else if (route.name === "Memories") {
                iconName = focused ? "images" : "images-outline";
              } else if (route.name === "Profile") {
                iconName = focused ? "person" : "person-outline";
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Today" component={AddEntryScreen} />
          <Tab.Screen name="Memories" component={HomeScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </EntriesProvider>
  );
}
