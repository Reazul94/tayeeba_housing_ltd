export type ThemeMode = 'light' | 'dark' | 'system';
export type DisplayDensity = 'comfortable' | 'compact';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  category: 'green' | 'earth' | 'blue' | 'dark' | 'light' | 'system';
  dots: [string, string, string]; // 3 Preview color dots
  cssVars: {
    '--color-primary': string;
    '--color-primary-dark': string;
    '--color-secondary': string;
    '--color-accent': string;
    '--color-background': string;
    '--color-surface': string;
    '--color-surface-secondary': string;
    '--color-text': string;
    '--color-text-muted': string;
    '--color-border': string;
    '--sidebar-bg': string;
    '--header-bg': string;
    '--card-bg': string;
  };
  chartColors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'tayeeba-emerald',
    name: 'Tayeeba Emerald & Gold',
    description: 'Official corporate real-estate theme with deep emerald and warm gold.',
    category: 'green',
    dots: ['#059669', '#c5a059', '#06231a'],
    cssVars: {
      '--color-primary': '#059669',
      '--color-primary-dark': '#064e3b',
      '--color-secondary': '#c5a059',
      '--color-accent': '#10b981',
      '--color-background': '#f1f4ee',
      '--color-surface': '#ffffff',
      '--color-surface-secondary': '#f8faf7',
      '--color-text': '#0f172a',
      '--color-text-muted': '#64748b',
      '--color-border': '#e2e8f0',
      '--sidebar-bg': '#06231a',
      '--header-bg': 'rgba(255, 255, 255, 0.95)',
      '--card-bg': '#ffffff',
    },
    chartColors: {
      primary: '#059669',
      secondary: '#c5a059',
      accent: '#10b981',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    }
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Lush evergreen pine forests and architectural timber accents.',
    category: 'green',
    dots: ['#064e3b', '#d97706', '#022c22'],
    cssVars: {
      '--color-primary': '#064e3b',
      '--color-primary-dark': '#022c22',
      '--color-secondary': '#d97706',
      '--color-accent': '#059669',
      '--color-background': '#edf5ee',
      '--color-surface': '#ffffff',
      '--color-surface-secondary': '#f0f6f0',
      '--color-text': '#06281e',
      '--color-text-muted': '#4b6358',
      '--color-border': '#d1e3d6',
      '--sidebar-bg': '#022c22',
      '--header-bg': 'rgba(255, 255, 255, 0.95)',
      '--card-bg': '#ffffff',
    },
    chartColors: {
      primary: '#064e3b',
      secondary: '#d97706',
      accent: '#059669',
      success: '#059669',
      warning: '#d97706',
      danger: '#dc2626',
    }
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    description: 'Bright springtime meadows, botanical parks, and natural landscapes.',
    category: 'green',
    dots: ['#16a34a', '#84cc16', '#052e16'],
    cssVars: {
      '--color-primary': '#16a34a',
      '--color-primary-dark': '#14532d',
      '--color-secondary': '#84cc16',
      '--color-accent': '#22c55e',
      '--color-background': '#f0fdf4',
      '--color-surface': '#ffffff',
      '--color-surface-secondary': '#f4fbf5',
      '--color-text': '#052e16',
      '--color-text-muted': '#4b6b55',
      '--color-border': '#bbf7d0',
      '--sidebar-bg': '#052e16',
      '--header-bg': 'rgba(255, 255, 255, 0.95)',
      '--card-bg': '#ffffff',
    },
    chartColors: {
      primary: '#16a34a',
      secondary: '#84cc16',
      accent: '#22c55e',
      success: '#16a34a',
      warning: '#eab308',
      danger: '#ef4444',
    }
  },
  {
    id: 'earth-gold',
    name: 'Earth & Gold',
    description: 'Warm terracotta, natural sand, and heritage architectural stones.',
    category: 'earth',
    dots: ['#92400e', '#d97706', '#451a03'],
    cssVars: {
      '--color-primary': '#92400e',
      '--color-primary-dark': '#451a03',
      '--color-secondary': '#d97706',
      '--color-accent': '#b45309',
      '--color-background': '#faf5ee',
      '--color-surface': '#ffffff',
      '--color-surface-secondary': '#fefaf2',
      '--color-text': '#291807',
      '--color-text-muted': '#6b533e',
      '--color-border': '#ebdcc7',
      '--sidebar-bg': '#451a03',
      '--header-bg': 'rgba(255, 255, 255, 0.95)',
      '--card-bg': '#ffffff',
    },
    chartColors: {
      primary: '#92400e',
      secondary: '#d97706',
      accent: '#b45309',
      success: '#059669',
      warning: '#d97706',
      danger: '#dc2626',
    }
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Serene lakeside water bodies, marina residences, and modern glass architecture.',
    category: 'blue',
    dots: ['#1d4ed8', '#06b6d4', '#0f172a'],
    cssVars: {
      '--color-primary': '#1d4ed8',
      '--color-primary-dark': '#1e3a8a',
      '--color-secondary': '#06b6d4',
      '--color-accent': '#3b82f6',
      '--color-background': '#f0f9ff',
      '--color-surface': '#ffffff',
      '--color-surface-secondary': '#f5fbff',
      '--color-text': '#082f49',
      '--color-text-muted': '#476982',
      '--color-border': '#bae6fd',
      '--sidebar-bg': '#082f49',
      '--header-bg': 'rgba(255, 255, 255, 0.95)',
      '--card-bg': '#ffffff',
    },
    chartColors: {
      primary: '#1d4ed8',
      secondary: '#06b6d4',
      accent: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    }
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Executive institutional navy blue with crisp slate contrasts.',
    category: 'blue',
    dots: ['#1e3a8a', '#475569', '#0f172a'],
    cssVars: {
      '--color-primary': '#1e3a8a',
      '--color-primary-dark': '#0f172a',
      '--color-secondary': '#0284c7',
      '--color-accent': '#2563eb',
      '--color-background': '#f8fafc',
      '--color-surface': '#ffffff',
      '--color-surface-secondary': '#f1f5f9',
      '--color-text': '#0f172a',
      '--color-text-muted': '#64748b',
      '--color-border': '#cbd5e1',
      '--sidebar-bg': '#0f172a',
      '--header-bg': 'rgba(255, 255, 255, 0.95)',
      '--card-bg': '#ffffff',
    },
    chartColors: {
      primary: '#1e3a8a',
      secondary: '#0284c7',
      accent: '#2563eb',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    }
  },
  {
    id: 'dark-emerald',
    name: 'Dark Emerald',
    description: 'High-contrast luxury dark mode with deep emerald green surfaces and gold.',
    category: 'dark',
    dots: ['#10b981', '#fbbf24', '#041610'],
    cssVars: {
      '--color-primary': '#10b981',
      '--color-primary-dark': '#059669',
      '--color-secondary': '#fbbf24',
      '--color-accent': '#34d399',
      '--color-background': '#041610',
      '--color-surface': '#0a2e21',
      '--color-surface-secondary': '#06231a',
      '--color-text': '#f8fafc',
      '--color-text-muted': '#94a3b8',
      '--color-border': '#134e38',
      '--sidebar-bg': '#02120c',
      '--header-bg': '#06231a',
      '--card-bg': '#0a2e21',
    },
    chartColors: {
      primary: '#10b981',
      secondary: '#fbbf24',
      accent: '#34d399',
      success: '#10b981',
      warning: '#fbbf24',
      danger: '#f87171',
    }
  },
  {
    id: 'dark-corporate',
    name: 'Dark Corporate',
    description: 'Midnight slate executive dark mode for late-night analysis.',
    category: 'dark',
    dots: ['#38bdf8', '#fbbf24', '#0b1320'],
    cssVars: {
      '--color-primary': '#38bdf8',
      '--color-primary-dark': '#0284c7',
      '--color-secondary': '#fbbf24',
      '--color-accent': '#60a5fa',
      '--color-background': '#0b1320',
      '--color-surface': '#152238',
      '--color-surface-secondary': '#0e182a',
      '--color-text': '#f1f5f9',
      '--color-text-muted': '#94a3b8',
      '--color-border': '#1e3352',
      '--sidebar-bg': '#080d16',
      '--header-bg': '#0e182a',
      '--card-bg': '#152238',
    },
    chartColors: {
      primary: '#38bdf8',
      secondary: '#fbbf24',
      accent: '#60a5fa',
      success: '#34d399',
      warning: '#fbbf24',
      danger: '#f87171',
    }
  },
  {
    id: 'light',
    name: 'Light Minimalist',
    description: 'Clean high-readability architectural daylight white.',
    category: 'light',
    dots: ['#2563eb', '#64748b', '#ffffff'],
    cssVars: {
      '--color-primary': '#2563eb',
      '--color-primary-dark': '#1d4ed8',
      '--color-secondary': '#64748b',
      '--color-accent': '#3b82f6',
      '--color-background': '#f8fafc',
      '--color-surface': '#ffffff',
      '--color-surface-secondary': '#f1f5f9',
      '--color-text': '#0f172a',
      '--color-text-muted': '#64748b',
      '--color-border': '#e2e8f0',
      '--sidebar-bg': '#1e293b',
      '--header-bg': 'rgba(255, 255, 255, 0.95)',
      '--card-bg': '#ffffff',
    },
    chartColors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    }
  },
  {
    id: 'system',
    name: 'System Default',
    description: 'Automatically synchronizes with your OS light/dark mode preference.',
    category: 'system',
    dots: ['#059669', '#38bdf8', '#64748b'],
    cssVars: {
      '--color-primary': '#059669',
      '--color-primary-dark': '#064e3b',
      '--color-secondary': '#c5a059',
      '--color-accent': '#10b981',
      '--color-background': '#f1f4ee',
      '--color-surface': '#ffffff',
      '--color-surface-secondary': '#f8faf7',
      '--color-text': '#0f172a',
      '--color-text-muted': '#64748b',
      '--color-border': '#e2e8f0',
      '--sidebar-bg': '#06231a',
      '--header-bg': 'rgba(255, 255, 255, 0.95)',
      '--card-bg': '#ffffff',
    },
    chartColors: {
      primary: '#059669',
      secondary: '#c5a059',
      accent: '#10b981',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    }
  }
];
