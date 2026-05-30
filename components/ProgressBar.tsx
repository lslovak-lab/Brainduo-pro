import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/lib/ThemeContext';

interface ProgressBarProps {
  value: number;
  height?: number;
  trackColor?: string;
}

export function ProgressBar({ value, height = 4, trackColor }: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(1, value));
  const widthAnim = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: clamped,
      useNativeDriver: false,
      tension: 120,
      friction: 22,
    }).start();
  }, [clamped]);

  const animWidth = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[s.track, { height, backgroundColor: trackColor ?? colors.bgMuted }]}>
      <Animated.View style={[s.fillWrap, { width: animWidth }]}>
        <LinearGradient
          colors={[colors.orange, colors.yellow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.fill}
        />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  track: {
    borderRadius: 999,
    overflow: 'hidden',
    width: '100%',
  },
  fillWrap: {
    height: '100%',
    overflow: 'hidden',
    borderRadius: 999,
  },
  fill: {
    flex: 1,
    borderRadius: 999,
  },
});
