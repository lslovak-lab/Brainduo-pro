import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Confetti } from '@/components/Confetti';
import { Typography } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

export default function CelebrationScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { streak = '5' } = useLocalSearchParams<{ streak?: string }>();
  const streakNum = parseInt(streak as string, 10) || 5;

  const [displayCount, setDisplayCount] = useState(0);

  const scaleAnim  = useRef(new Animated.Value(0.5)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0.3)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const badgeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 160, friction: 10 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.spring(badgeAnim, { toValue: 1, useNativeDriver: true, tension: 180, friction: 14 }).start();
    }, 350);

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.8, duration: 860, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.18, duration: 820, useNativeDriver: true }),
      ])
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 860, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.94, duration: 820, useNativeDriver: true }),
      ])
    );
    glowLoop.start();
    pulseLoop.start();

    const counterVal = new Animated.Value(0);
    const lid = counterVal.addListener(({ value }) => setDisplayCount(Math.floor(value)));
    Animated.timing(counterVal, { toValue: streakNum, duration: 900, delay: 200, useNativeDriver: false }).start();

    return () => {
      glowLoop.stop();
      pulseLoop.stop();
      counterVal.removeListener(lid);
    };
  }, []);

  const badgeTranslate = badgeAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });

  return (
    <View style={[s.screen, { backgroundColor: colors.ivory }]}>
      <Confetti active />

      <LinearGradient
        colors={[colors.ivoryTint ?? '#FFF8F0', colors.ivory]}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.topnav}>
          <Pressable style={[s.closeBtn, { backgroundColor: colors.bgMuted }]} onPress={() => router.replace('/(tabs)')}>
            <Ionicons name="close" size={22} color={colors.ink} />
          </Pressable>
        </View>

        <Animated.View style={[s.hero, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          {/* Glow halo */}
          <Animated.View style={[s.glow, { backgroundColor: colors.orange, opacity: glowAnim }]} pointerEvents="none" />

          {/* Flame badge */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <LinearGradient
              colors={['#FFB17A', '#F58A3A', '#D86F1F']}
              start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
              style={[s.flameBadge, { shadowColor: colors.orange }]}
            >
              <Ionicons name="flame" size={56} color="#FFF8F0" />
            </LinearGradient>
          </Animated.View>

          {/* Counter */}
          <Text style={[s.bigNum, { color: colors.ink }]}>{displayCount}</Text>
          <Text style={[Typography.h2, { marginTop: -4 }]}>
            {streakNum === 1 ? 'день поспіль' : streakNum < 5 ? 'дні поспіль' : 'днів поспіль'}
          </Text>
          <Text style={[Typography.body, { textAlign: 'center', marginTop: 8, paddingHorizontal: 32 }]}>
            Неймовірно! Ти продовжуєш свою серію вже{' '}
            <Text style={{ fontFamily: 'Montserrat_700Bold' }}>{streakNum} {streakNum === 5 ? 'днів' : 'день'}!</Text>
          </Text>
        </Animated.View>

        {/* Reward badge */}
        <Animated.View
          style={[
            s.rewardWrap,
            { opacity: badgeAnim, transform: [{ translateY: badgeTranslate }] },
          ]}
        >
          <View style={s.rewardRow}>
            <RewardChip icon="star" label="+100 бонусів" color={colors.yellow} />
            <RewardChip icon="trophy-outline" label={`Стрік ${streakNum} днів`} color={colors.orange} />
          </View>
        </Animated.View>

        <Animated.View style={[s.bottom, { opacity: badgeAnim }]}>
          <Button
            variant="primary"
            label="Продовжувати навчання!"
            fullWidth
            onPress={() => router.replace('/(tabs)')}
          />
          <View style={{ marginTop: 10 }}>
            <Button
              variant="ghost"
              label="Поділитись"
              fullWidth
              onPress={() => {}}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

function RewardChip({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <View style={[rc.chip, { borderColor: color }]}>
      <LinearGradient
        colors={[`${color}22`, `${color}11`]}
        style={StyleSheet.absoluteFillObject}
      />
      <Ionicons name={icon as any} size={16} color={color} />
      <Text style={[rc.label, { color }]}>{label}</Text>
    </View>
  );
}

const rc = StyleSheet.create({
  chip: {
    flexDirection: 'row', gap: 6, alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 999, borderWidth: 1.5,
    overflow: 'hidden',
  },
  label: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14, lineHeight: 17,
  },
});

const s = StyleSheet.create({
  screen: { flex: 1 },
  topnav: {
    flexDirection: 'row', justifyContent: 'flex-end',
    paddingHorizontal: 18, paddingTop: 59, paddingBottom: 10,
  },
  closeBtn: {
    width: 44, height: 44, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  hero: {
    flex: 1,
    alignItems: 'center', justifyContent: 'center',
    paddingBottom: 20,
  },
  glow: {
    position: 'absolute',
    width: 260, height: 200, borderRadius: 130,
    top: '30%',
  },
  flameBadge: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.52, shadowRadius: 20, elevation: 10,
  },
  bigNum: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 76, lineHeight: 82,
    letterSpacing: -3,
    marginTop: 6,
  },
  rewardWrap: {
    paddingHorizontal: 24, paddingBottom: 16,
  },
  rewardRow: {
    flexDirection: 'row', gap: 12, justifyContent: 'center',
  },
  bottom: {
    paddingHorizontal: 24, paddingBottom: 36,
  },
});
