import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { Radius, Shadows, Typography } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTabBarCtx } from '@/lib/TabBarContext';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STREAK       = 138;
const BEST_STREAK  = 145;
const WEEK_ACTIVE  = 5;

const DAY_HEADERS = ['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'];

type DayState = 'done' | 'today' | 'muted' | 'empty';

const APRIL_DAYS: { num: string; state: DayState }[] = [
  { num: '31', state: 'muted' },
  ...Array.from({ length: 23 }, (_, i) => ({ num: `${i + 1}`, state: 'done' as DayState })),
  { num: '24', state: 'today' },
  ...Array.from({ length: 10 }, (_, i) => ({ num: `${i + 25}`, state: 'muted' as DayState })),
].slice(0, 35) as { num: string; state: DayState }[];

export default function StreakScreen() {
  const router = useRouter();
  const { colors, gradients, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const topPad = width <= 480 ? 10 : 59;

  const [displayCount, setDisplayCount] = useState(0);
  const { notifyScroll } = useTabBarCtx();
  const prevScrollY   = useRef(0);
  const scrollY       = useRef(new Animated.Value(0)).current;
  const shadowOpacity = scrollY.interpolate({ inputRange: [0, 24], outputRange: [0, 1], extrapolate: 'clamp' });
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenSlide   = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      screenOpacity.setValue(0);
      screenSlide.setValue(20);
      Animated.parallel([
        Animated.timing(screenOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(screenSlide,   { toValue: 0, useNativeDriver: true, tension: 100, friction: 16 }),
      ]).start();
    }, [])
  );

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    scrollY.setValue(y);
    notifyScroll(y - prevScrollY.current, y);
    prevScrollY.current = y;
  }, [scrollY, notifyScroll]);

  useEffect(() => {
    const countVal = new Animated.Value(0);
    const lid = countVal.addListener(({ value }) => setDisplayCount(Math.floor(value)));
    Animated.timing(countVal, { toValue: STREAK, duration: 1300, useNativeDriver: false }).start();

    return () => {
      countVal.removeListener(lid);
    };
  }, []);

  const getDayStyle = (state: DayState): object => {
    switch (state) {
      case 'done':  return { backgroundColor: colors.sage };
      case 'today': return {
        backgroundColor: colors.orange,
        shadowColor: colors.orange,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 7,
        elevation: 4,
      };
      case 'muted': return { opacity: 0.4 };
      default:      return {};
    }
  };

  const getDayTextStyle = (state: DayState): object => {
    switch (state) {
      case 'done':
      case 'today': return { color: colors.ink };
      default:      return { color: colors.charcoal2 };
    }
  };

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top']}>
      <Animated.View style={{ flex: 1, opacity: screenOpacity, transform: [{ translateY: screenSlide }] }}>
      <Animated.View style={[s.topnav, { paddingTop: topPad, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, shadowOpacity: shadowOpacity as any, elevation: 4 }]}>
        <Pressable style={s.iconBtn} onPress={() => router.push('/(tabs)')}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Pressable style={s.iconBtn} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={22} color={colors.ink} />
        </Pressable>
      </Animated.View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Flame hero */}
        <View style={s.heroWrap}>
          <View style={s.heroLeft}>
            <Text style={[s.streakBig, { color: colors.ink }]}>{displayCount}</Text>
            <Text style={[s.heroLabel, { color: colors.charcoal2 }]}>днів входу</Text>
          </View>

          <View style={s.heroRight}>
            <LinearGradient
              colors={['#FFB17A', '#F58A3A', '#D86F1F']}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={[s.flameBadge, { shadowColor: colors.orange }]}
            >
              <Ionicons name="flame" size={72} color="#FFF8F0" />
            </LinearGradient>
          </View>
        </View>

        {/* Stat cards */}
        <View style={s.statsRow}>
          <StatCard label="РЕКОРД" value={`${BEST_STREAK}`} icon="trophy-outline" accent={colors.yellow} iconColor={isDark ? '#F58A3A' : undefined} cardBg={colors.paper} cardBorder={colors.borderSubtle} />
          <StatCard label="ТИЖДЕНЬ" value={`${WEEK_ACTIVE}/7`} icon="calendar-outline" accent={colors.sageDeep} iconColor={isDark ? '#F58A3A' : undefined} cardBg={colors.paper} cardBorder={colors.borderSubtle} />
          <StatCard label="БОНУСИ" value="+240" icon="star-outline" accent={colors.orange} iconColor={isDark ? '#F58A3A' : undefined} cardBg={colors.paper} cardBorder={colors.borderSubtle} />
        </View>

        {/* Calendar */}
        <Card style={{ marginTop: 24 }}>
          <View style={s.rowBetween}>
            <Text style={[Typography.eyebrow, { color: colors.charcoal3 }]}>КВІТЕНЬ 2026</Text>
            <Text style={[Typography.caption, { color: colors.charcoal2 }]}>28 днів входу</Text>
          </View>

          <View style={s.calGrid}>
            {DAY_HEADERS.map((h, i) => (
              <View key={`h-${i}`} style={s.calCell}>
                <Text style={[s.calHeader, { color: colors.charcoal3 }]}>{h}</Text>
              </View>
            ))}
            {APRIL_DAYS.map((d, i) => (
              <View key={`d-${i}`} style={[s.calCell, s.calDay, getDayStyle(d.state)]}>
                <Text style={[s.calDayText, getDayTextStyle(d.state)]}>{d.num}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Goal card */}
        <LinearGradient
          colors={gradients.sage}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.goalCard, { marginTop: 12 }]}
        >
          <Text style={[Typography.eyebrow, { color: isDark ? '#FFFFFF' : 'rgba(0,0,0,0.55)' }]}>ЦІЛЬ СЕРІЇ ДНІВ</Text>
          <View style={[s.rowBetween, { marginTop: 8 }]}>
            <View>
              <Text style={[Typography.h2, { color: isDark ? '#FFFFFF' : colors.ink }]}>150 днів</Text>
              <Text style={[Typography.bodySm, { marginTop: 4, color: isDark ? 'rgba(255,255,255,0.80)' : colors.ink }]}>Лишилось 12 днів</Text>
            </View>
            <Text style={[s.pct, { color: colors.ink }]}>92%</Text>
          </View>
          <View style={{ marginTop: 12 }}>
            <ProgressBar value={0.92} trackColor="rgba(0,0,0,0.12)" />
          </View>
        </LinearGradient>

        <View style={{ marginTop: 32 }}>
          {isDark ? (
            <StreakBtn onPress={() => router.push('/quest/tf')} />
          ) : (
            <Button
              variant="primary"
              label="Продовжити стрік"
              fullWidth
              onPress={() => router.push('/quest/tf')}
            />
          )}
        </View>

        <View style={{ height: 128 }} />
      </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function StreakBtn({ onPress }: { onPress: () => void }) {
  const scale      = useRef(new Animated.Value(1)).current;
  const fillOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const onIn = () => {
    Animated.parallel([
      Animated.spring(scale,       { toValue: 0.94, useNativeDriver: true, tension: 500, friction: 8 }),
      Animated.timing(fillOpacity, { toValue: 1, duration: 40, useNativeDriver: true }),
      Animated.timing(textOpacity, { toValue: 1, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const onOut = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.05, useNativeDriver: true, tension: 600, friction: 7 }),
        Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 400, friction: 10 }),
      ]),
      Animated.timing(fillOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(textOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onIn}
        onPressOut={onOut}
        style={[sc.streakBtn, { backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' }]}
      >
        {/* animated white fill on press */}
        <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.88)', opacity: fillOpacity }]} />
        {/* white label (default) */}
        <Animated.Text style={[sc.streakBtnText, { color: '#FFFFFF', opacity: textOpacity.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
          Продовжити стрік
        </Animated.Text>
        {/* black label (active) */}
        <Animated.Text style={[sc.streakBtnText, { color: '#000000', opacity: textOpacity, position: 'absolute' }]}>
          Продовжити стрік
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

function StatCard({ label, value, icon, accent, iconColor, cardBg, cardBorder }: {
  label: string; value: string; icon: string; accent: string; iconColor?: string; cardBg: string; cardBorder: string;
}) {
  const ic = iconColor ?? accent;
  return (
    <View style={[sc.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      <View style={[sc.iconWrap, { backgroundColor: `${accent}22` }]}>
        <Ionicons name={icon as any} size={18} color={ic} />
      </View>
      <Text style={[sc.value, { color: accent }]}>{value}</Text>
      <Text style={[sc.label, { color: accent }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen:  { flex: 1 },
  scroll:  { flex: 1 },
  topnav:  {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 59, paddingBottom: 10,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 128 },
  heroWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  heroLeft: { alignItems: 'center' },
  heroLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18, lineHeight: 24,
    marginTop: 2,
  },
  heroRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameBadge: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 10,
  },
  streakBig: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 92, lineHeight: 98,
    letterSpacing: -3.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  rowBetween: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12,
  },
  calGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    marginTop: 12, gap: 4,
  },
  calCell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  calHeader: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 10, lineHeight: 12, letterSpacing: 1.4,
  },
  calDay: { borderRadius: 10 },
  calDayText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 12, lineHeight: 14,
  },
  goalCard: { borderRadius: Radius.lg, padding: 20 },
  pct: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 28, lineHeight: 30, letterSpacing: -0.5,
  },
});

const sc = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18, padding: 14,
    gap: 6, alignItems: 'center',
    ...Shadows.soft,
  },
  iconWrap: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  value: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 22, lineHeight: 24, letterSpacing: -0.4,
  },
  label: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 9, lineHeight: 11, letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  streakBtn: {
    height: 56, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
    ...Shadows.button,
  },
  streakBtnText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16, lineHeight: 20, letterSpacing: 0.1,
  },
});
