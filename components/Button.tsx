import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Typography, Shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

type Variant = 'primary' | 'secondary' | 'ghost' | 'option' | 'sage' | 'warm';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: Variant;
  label: string;
  pending?: boolean;
  active?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  variant = 'primary',
  label,
  pending = false,
  active = false,
  fullWidth = false,
  loading = false,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const { colors, isDark } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(scale, { toValue: 0.93, duration: 90, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 280, friction: 4 }).start();
  };

  const isDisabled = pending || loading || rest.disabled;

  const getContainerStyle = (): any[] => {
    if (pending) return [s.base, { backgroundColor: '#B0B0B0' }, fullWidth && s.block];
    switch (variant) {
      case 'primary':   return [s.base, { backgroundColor: isDark ? '#1C1A2E' : colors.ink }, Shadows.button, fullWidth && s.block];
      case 'secondary': return [s.base, { backgroundColor: colors.charcoal }, fullWidth && s.block];
      case 'ghost':     return [s.base, s.ghost, { borderColor: `${colors.ink}55` }, fullWidth && s.block];
      case 'option':    return [s.base, { backgroundColor: colors.bgMuted, borderWidth: 1, borderColor: colors.bgOverlay },
                                active && { backgroundColor: colors.ink, borderColor: 'transparent', ...Shadows.button },
                                fullWidth && s.block];
      case 'sage':      return [s.base, { backgroundColor: colors.sage }, fullWidth && s.block];
      case 'warm':      return [s.base, {
                                  backgroundColor: colors.orange,
                                  shadowColor: colors.orange,
                                  shadowOffset: { width: 0, height: 12 },
                                  shadowOpacity: 0.6, shadowRadius: 18, elevation: 8,
                                }, fullWidth && s.block];
      default:          return [s.base, { backgroundColor: colors.ink }, Shadows.button, fullWidth && s.block];
    }
  };

  const getTextStyle = (): any[] => {
    if (pending) return [s.text, { color: 'rgba(255,255,255,0.92)' }];
    switch (variant) {
      case 'ghost':  return [s.text, { color: colors.ink }];
      case 'option': return [s.text, { color: active ? colors.onDark : colors.charcoal }];
      case 'sage':   return [s.text, { color: colors.ink }];
      case 'warm':   return [s.text, { color: colors.ink }];
      default:       return [s.text, { color: colors.onDark }];
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && s.block]}>
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        onPressIn={isDisabled ? undefined : onPressIn}
        onPressOut={isDisabled ? undefined : onPressOut}
        style={[...getContainerStyle(), style]}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'ghost' ? colors.ink : colors.onDark} size="small" />
        ) : (
          <Text style={getTextStyle()}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  base: {
    height: 56,
    paddingHorizontal: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  block: { width: '100%' },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  text: {
    ...Typography.button,
  },
});
