import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEME_PRESETS, ThemePreset, ThemeMode, DisplayDensity } from '../themes/themePresets';

interface ThemeContextType {
  themeId: string;
  setThemeId: (id: string) => void;
  activeTheme: ThemePreset;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  density: DisplayDensity;
  setDensity: (density: DisplayDensity) => void;
  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;
  isDarkEffective: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'thl-theme';
const MODE_STORAGE_KEY = 'thl-mode';
const DENSITY_STORAGE_KEY = 'thl-density';
const MOTION_STORAGE_KEY = 'thl-motion';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<string>(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'tayeeba-emerald';
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem(MODE_STORAGE_KEY) as ThemeMode) || 'light';
  });

  const [density, setDensityState] = useState<DisplayDensity>(() => {
    return (localStorage.getItem(DENSITY_STORAGE_KEY) as DisplayDensity) || 'comfortable';
  });

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    return localStorage.getItem(MOTION_STORAGE_KEY) === 'true';
  });

  // Calculate effective active theme
  let effectivePresetId = themeId;
  if (themeId === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    effectivePresetId = prefersDark ? 'dark-emerald' : 'tayeeba-emerald';
  } else if (themeMode === 'dark' && !themeId.startsWith('dark-')) {
    effectivePresetId = 'dark-emerald';
  }

  const activeTheme = THEME_PRESETS.find(t => t.id === effectivePresetId) || THEME_PRESETS[0];

  const isDarkEffective = 
    activeTheme.category === 'dark' || 
    themeMode === 'dark' || 
    (themeMode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Apply CSS variables & dark class to document root
  useEffect(() => {
    const root = document.documentElement;

    // Apply CSS Variables
    Object.entries(activeTheme.cssVars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    // Dark class toggle
    if (isDarkEffective) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Density class
    if (density === 'compact') {
      root.classList.add('density-compact');
    } else {
      root.classList.remove('density-compact');
    }

    // Motion class
    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [activeTheme, isDarkEffective, density, reducedMotion]);

  // Setters with LocalStorage persistence
  const setThemeId = (id: string) => {
    setThemeIdState(id);
    localStorage.setItem(THEME_STORAGE_KEY, id);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  };

  const setDensity = (newDensity: DisplayDensity) => {
    setDensityState(newDensity);
    localStorage.setItem(DENSITY_STORAGE_KEY, newDensity);
  };

  const setReducedMotion = (reduced: boolean) => {
    setReducedMotionState(reduced);
    localStorage.setItem(MOTION_STORAGE_KEY, reduced ? 'true' : 'false');
  };

  return (
    <ThemeContext.Provider value={{
      themeId,
      setThemeId,
      activeTheme,
      themeMode,
      setThemeMode,
      density,
      setDensity,
      reducedMotion,
      setReducedMotion,
      isDarkEffective
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
