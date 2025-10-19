// Re-export theme context types and hooks for convenience
export { ThemeProvider, useTheme } from './context/ThemeContext';
export type { Theme, ThemeColors, ThemeMode, ThemeShadows } from './context/ThemeContext';

// Legacy exports for backward compatibility
export const palette = {
  background: "#f9f6f2",
  surface: "#ffffff",
  primary: "#966f51",
  primaryLight: "#c7aa8f",
  accent: "#b08c6f",
  textStrong: "#48362d",
  textMuted: "#7d6a5a",
  border: "#e8dbcf",
};

export const shadows = {
  sm: {
    shadowColor: "#c7aa8f",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 3,
  },
  md: {
    shadowColor: "#b08c6f",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6,
  },
};
