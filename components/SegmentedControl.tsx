import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, LayoutChangeEvent } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';

interface Option { label: string; value: string }

interface Props {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}

export function SegmentedControl({ options, value, onChange }: Props) {
  const { colors } = useTheme();
  const [segW, setSegW] = useState(0);
  const pillX = useRef(new Animated.Value(0)).current;
  const mounted = useRef(false);
  const activeIdx = options.findIndex(o => o.value === value);

  useEffect(() => {
    if (!mounted.current || segW === 0) return;
    Animated.spring(pillX, {
      toValue: activeIdx * segW,
      useNativeDriver: true,
      tension: 420,
      friction: 34,
    }).start();
  }, [activeIdx]);

  useEffect(() => {
    if (segW > 0) mounted.current = true;
  }, [segW]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width / options.length;
    pillX.setValue(activeIdx * w);
    setSegW(w);
  };

  return (
    <View style={[s.wrap, { backgroundColor: colors.bgMuted }]} onLayout={onLayout}>
      {segW > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[s.pill, { width: segW, backgroundColor: colors.paper, transform: [{ translateX: pillX }] }]}
        />
      )}
      {options.map(opt => (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={s.segment}
        >
          <Text style={[s.label, { color: value === opt.value ? colors.ink : colors.charcoal3 }]}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 4, bottom: 4,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  segment: {
    flex: 1, height: 36,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13, lineHeight: 16,
  },
});
