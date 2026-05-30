import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/lib/ThemeContext';

export interface ChartDay {
  label: string;
  value: number; // 0–1
  isToday?: boolean;
}

interface Props {
  days: ChartDay[];
  maxH?: number;
}

export function ActivityChart({ days, maxH = 68 }: Props) {
  const { colors } = useTheme();
  const anims = useRef(days.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      55,
      days.map((d, i) =>
        Animated.spring(anims[i], {
          toValue: Math.max(d.value, 0.04),
          useNativeDriver: false,
          tension: 160,
          friction: 16,
        })
      )
    ).start();
  }, []);

  return (
    <View style={s.wrap}>
      {days.map((d, i) => {
        const h = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [4, maxH],
        });
        const barColors: [string, string] = d.isToday
          ? [colors.orangeSoft, colors.orange]
          : d.value > 0.15
          ? [colors.sage1, colors.sage]
          : [colors.bgMuted, colors.bgOverlay];

        return (
          <View key={i} style={s.col}>
            <View style={[s.track, { height: maxH }]}>
              <Animated.View style={{ width: '100%', height: h, borderRadius: 6, overflow: 'hidden' }}>
                <LinearGradient
                  colors={barColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            </View>
            <Text style={[s.label, { color: d.isToday ? colors.orange : colors.charcoal3 }]}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 6, alignItems: 'flex-end' },
  col: { flex: 1, alignItems: 'center', gap: 5 },
  track: { width: '100%', justifyContent: 'flex-end' },
  label: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 10, lineHeight: 12,
  },
});
