import { StyleSheet, Text, View } from "react-native";
import { palette } from "../theme";

type HeaderProps = {
  title: string;
  subtitle?: string;
};

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    color: palette.textStrong,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 16,
    color: palette.textMuted,
  },
});
