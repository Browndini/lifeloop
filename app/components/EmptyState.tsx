import { StyleSheet, Text, View } from "react-native";
import { palette } from "../theme";

type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Text style={styles.icon}>📷</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconWrapper: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: palette.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  icon: {
    fontSize: 36,
  },
  message: {
    textAlign: "center",
    fontSize: 18,
    color: palette.textMuted,
    lineHeight: 26,
  },
});
