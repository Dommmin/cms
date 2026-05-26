import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#14201F',
    background: '#F8FAF8',
    backgroundElement: '#EDF3F1',
    backgroundSelected: '#D8ECE6',
    textSecondary: '#64716E',
  },
  dark: {
    text: '#14201F',
    background: '#F8FAF8',
    backgroundElement: '#EDF3F1',
    backgroundSelected: '#D8ECE6',
    textSecondary: '#64716E',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 48,
} as const;

export const Storefront = {
  colors: {
    primary: '#0F766E',
    primaryDark: '#0B4F49',
    primarySoft: '#DDF5EF',
    ink: '#14201F',
    muted: '#64716E',
    canvas: '#F8FAF8',
    surface: '#FFFFFF',
    surfaceWarm: '#F4F1EA',
    border: '#DDE6E2',
    amber: '#F4B63D',
    rose: '#D84F4F',
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 18,
  },
  shadow: {
    card: {
      shadowColor: '#10201D',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.08,
      shadowRadius: 22,
      elevation: 3,
    },
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
