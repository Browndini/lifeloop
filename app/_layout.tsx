import { NavigationIndependentTree } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./AppNavigator";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <NavigationIndependentTree>
        <AppNavigator />
      </NavigationIndependentTree>
    </SafeAreaProvider>
  );
}
