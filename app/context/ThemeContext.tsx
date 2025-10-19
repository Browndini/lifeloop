import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  primaryLight: string;
  accent: string;
  textStrong: string;
  textMuted: string;
  border: string;
}

export interface ThemeShadows {
  sm: {
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  md: {
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  shadows: ThemeShadows;
  isDark: boolean;
}

const lightColors: ThemeColors = {
  background: "#f9f6f2",
  surface: "#ffffff",
  primary: "#966f51",
  primaryLight: "#c7aa8f",
  accent: "#b08c6f",
  textStrong: "#48362d",
  textMuted: "#7d6a5a",
  border: "#e8dbcf",
};

const darkColors: ThemeColors = {
  background: "#1a1a1a",
  surface: "#2d2d2d",
  primary: "#d4b896",
  primaryLight: "#e6c8a3",
  accent: "#c7aa8f",
  textStrong: "#f5f0e8",
  textMuted: "#b8a894",
  border: "#3a352d",
};

const lightShadows: ThemeShadows = {
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

const darkShadows: ThemeShadows = {
  sm: {
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 3,
  },
  md: {
    shadowColor: "#000000",
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 6,
  },
};

interface ThemeContextType {
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const THEME_STORAGE_KEY = '@theme_mode';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeModeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const currentMode = themeMode;
    if (currentMode === 'light') {
      setThemeMode('dark');
    } else if (currentMode === 'dark') {
      setThemeMode('system');
    } else {
      // System mode - toggle to the opposite of current system theme
      const systemTheme = systemColorScheme || 'light';
      setThemeMode(systemTheme === 'light' ? 'dark' : 'light');
    }
  };

  const getEffectiveMode = (): 'light' | 'dark' => {
    if (themeMode === 'system') {
      return systemColorScheme || 'light';
    }
    return themeMode;
  };

  const effectiveMode = getEffectiveMode();
  const isDark = effectiveMode === 'dark';

  const theme: Theme = {
    mode: themeMode,
    colors: isDark ? darkColors : lightColors,
    shadows: isDark ? darkShadows : lightShadows,
    isDark,
  };

  const value = {
    theme,
    setThemeMode,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
