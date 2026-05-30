import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { Colors, Gradients } from './theme';

// ── Dark palette ──────────────────────────────────────────────────────────────

const DarkColors = {
  ivory:       '#020913',
  ivoryTint:   '#07111E',
  ivoryDeep:   '#040D18',
  sage:        '#473D97',
  sageSoft:    '#5B50A8',
  sageDeep:    '#6549E0',
  sage1:       '#3A3280',
  sage2:       '#524598',
  orange:      '#783CD8',
  orangeSoft:  '#A773D9',
  orangeDeep:  '#5C2BA8',
  yellow:      '#A773D9',
  yellowSoft:  '#C09DE0',
  charcoal:    '#C8BEF5',
  charcoal2:   '#A898D8',
  charcoal3:   '#7B6FA8',
  ink:         '#EEE8FF',
  paper:       '#322F46',
  paperSoft:   '#2C2940',
  onDark:      '#EEE8FF',
} as const;

const DarkGradients = {
  sage:    ['#3A3280', '#473D97', '#524598'] as const,
  ink:     ['#1B1B1B', '#000000'] as const,
  orange:  ['#8B4ED0', '#783CD8'] as const,
  yellow:  ['#C09DE0', '#A773D9'] as const,
  avatar:  ['#3A3280', '#473D97', '#524598'] as const,
  skill:   ['#783CD8', '#A773D9'] as const,
} as const;

// ── Extended color tokens (includes semantic UI values) ───────────────────────

const LightTokens = {
  ...Colors,
  bgOverlay:    'rgba(0,0,0,0.04)',
  bgMuted:      'rgba(0,0,0,0.06)',
  borderSubtle: 'rgba(0,0,0,0.06)',
  borderDefault:'rgba(0,0,0,0.10)',
  divider:      'rgba(0,0,0,0.05)',
} as const;

const DarkTokens = {
  ...DarkColors,
  bgOverlay:    'rgba(255,255,255,0.06)',
  bgMuted:      'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.08)',
  borderDefault:'rgba(255,255,255,0.12)',
  divider:      'rgba(255,255,255,0.08)',
} as const;

export type ThemeColors = { [K in keyof typeof LightTokens]: string };
export type ThemeGradients = { [K in keyof typeof Gradients]: readonly [string, string, ...string[]] };

// ── Context ───────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  isDark: boolean;
  colors: ThemeColors;
  gradients: ThemeGradients;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  colors: LightTokens,
  gradients: Gradients,
  toggleTheme: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const toggleTheme = useCallback(() => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setIsDark(prev => !prev);
      Animated.timing(fadeAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
    });
  }, [fadeAnim]);

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        colors:    isDark ? DarkTokens    : LightTokens,
        gradients: isDark ? DarkGradients : Gradients,
        toggleTheme,
      }}
    >
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {children}
      </Animated.View>
    </ThemeContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTheme() {
  return useContext(ThemeContext);
}
