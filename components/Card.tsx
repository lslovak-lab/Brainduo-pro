import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shadows, Radius } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

type CardVariant = 'default' | 'sage' | 'ink' | 'glow';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  children: React.ReactNode;
  padding?: number;
}

export function Card({ variant = 'default', children, padding = 20, style, ...rest }: CardProps) {
  const { colors, gradients } = useTheme();

  if (variant === 'sage') {
    return (
      <LinearGradient
        colors={gradients.sage}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.base, { padding }, s.sage, style]}
        {...(rest as any)}
      >
        {children}
      </LinearGradient>
    );
  }

  if (variant === 'ink') {
    return (
      <LinearGradient
        colors={gradients.ink}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[s.base, { padding }, style]}
        {...(rest as any)}
      >
        {children}
      </LinearGradient>
    );
  }

  if (variant === 'glow') {
    return (
      <View style={[s.base, s.default, { backgroundColor: colors.paper, borderColor: colors.borderSubtle, padding }, style]} {...rest}>
        <View style={[s.glowOverlay, { backgroundColor: colors.orangeSoft }]} pointerEvents="none" />
        <View style={{ position: 'relative', zIndex: 1 }}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[s.base, s.default, { backgroundColor: colors.paper, borderColor: colors.borderSubtle, padding }, style]} {...rest}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  default: {
    borderWidth: 1,
    ...Shadows.card,
  },
  sage: {
    ...Shadows.card,
  },
  glowOverlay: {
    position: 'absolute',
    inset: 0,
    top: -60,
    left: -60,
    right: -60,
    bottom: -60,
    opacity: 0.3,
    borderRadius: 999,
  },
});
