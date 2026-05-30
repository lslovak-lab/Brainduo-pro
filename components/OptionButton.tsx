import React, { useRef } from 'react';
import { Animated, Pressable, Text, StyleSheet } from 'react-native';
import { Typography, Shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  flex?: boolean;
}

export function OptionButton({ label, selected, onPress, flex = false }: OptionButtonProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 20 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 20 }).start();
  };

  return (
    <Animated.View style={[flex && { flex: 1 }, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          s.base,
          { backgroundColor: colors.bgMuted, borderColor: colors.bgOverlay },
          selected && { backgroundColor: colors.ink, borderColor: 'transparent', ...Shadows.button },
        ]}
      >
        <Text style={[s.label, { color: selected ? colors.onDark : colors.charcoal }]}>{label}</Text>
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
    borderWidth: 1,
  },
  label: {
    ...Typography.button,
  },
});
