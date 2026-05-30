import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Button } from '@/components/Button';
import { Confetti } from '@/components/Confetti';
import { Typography, Radius, Shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ACCURACY = 73;
const CIRC     = 2 * Math.PI * 86;
const TARGET   = CIRC - (ACCURACY / 100) * CIRC;

export default function QuestResultScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const topPad = width <= 480 ? 10 : 59;

  const [displayAcc,   setDisplayAcc]   = useState(0);
  const [displayBonus, setDisplayBonus] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);

  const strokeAnim = useRef(new Animated.Value(CIRC)).current;
  const scaleAnim  = useRef(new Animated.Value(0.8)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const statsAnim  = useRef(new Animated.Value(0)).current;
  const ringScale  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 140, friction: 12 }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    Animated.timing(strokeAnim, {
      toValue: TARGET,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      Animated.sequence([
        Animated.spring(ringScale, { toValue: 1.06, useNativeDriver: true, tension: 400, friction: 8 }),
        Animated.spring(ringScale, { toValue: 1,    useNativeDriver: true, tension: 300, friction: 10 }),
      ]).start();
    });

    const accVal = new Animated.Value(0);
    const lid1 = accVal.addListener(({ value }) => setDisplayAcc(Math.floor(value)));
    Animated.timing(accVal, {
      toValue: ACCURACY,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    setTimeout(() => {
      Animated.timing(statsAnim, { toValue: 1, duration: 360, useNativeDriver: true }).start();

      const bonusVal = new Animated.Value(0);
      const lid2 = bonusVal.addListener(({ value }) => setDisplayBonus(Math.floor(value)));
      Animated.timing(bonusVal, { toValue: 24, duration: 600, useNativeDriver: false }).start();

      return () => bonusVal.removeListener(lid2);
    }, 900);

    const confettiTimer = setTimeout(() => setShowConfetti(false), 3200);

    return () => {
      accVal.removeListener(lid1);
      clearTimeout(confettiTimer);
    };
  }, []);

  const isGood = ACCURACY >= 70;

  return (
    <View style={[s.screen, { backgroundColor: colors.ivory }]}>
      <Confetti active={showConfetti} />

      <LinearGradient
        colors={[isGood ? 'rgba(245,138,58,0.12)' : 'rgba(245,138,58,0.06)', colors.ivory]}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.5 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={[s.topnav, { paddingTop: topPad }]}>
          <Pressable style={s.iconBtn} onPress={() => router.replace('/(tabs)')}>
            <Ionicons name="close" size={22} color={colors.ink} />
          </Pressable>
          <Text style={Typography.eyebrow}>РЕЗУЛЬТАТ</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <Text style={[Typography.display, { textAlign: 'center' }]}>
              {ACCURACY >= 80 ? 'Відмінна робота!' : ACCURACY >= 60 ? 'Майже ідеально!' : 'Є куди рости!'}
            </Text>
            <Text style={[Typography.body, { marginTop: 6, textAlign: 'center' }]}>
              {ACCURACY >= 80 ? 'Ти чудово впоралась із завданням.' : 'Проаналізуй помилки та спробуй ще раз.'}
            </Text>
          </Animated.View>

          {/* Accuracy ring */}
          <Animated.View style={[s.ringWrap, { opacity: fadeAnim, transform: [{ scale: ringScale }] }]}>
            <Svg
              width={280} height={280} viewBox="0 0 200 200"
              style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
            >
              <Defs>
                <SvgLinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%"   stopColor={colors.orange} />
                  <Stop offset="100%" stopColor={colors.yellow ?? '#F6DD80'} />
                </SvgLinearGradient>
              </Defs>
              <Circle
                cx={100} cy={100} r={86}
                stroke={colors.borderSubtle}
                strokeWidth={14}
                fill="none"
              />
              <AnimatedCircle
                cx={100} cy={100} r={86}
                stroke="url(#ringGrad)"
                strokeWidth={14}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${CIRC}`}
                strokeDashoffset={strokeAnim}
              />
            </Svg>
            <View style={{ alignItems: 'center' }}>
              <Text style={[s.ringPct, { color: colors.ink }]}>{displayAcc}%</Text>
              <Text style={[Typography.eyebrow, { marginTop: 2 }]}>точність</Text>
            </View>
          </Animated.View>

          {/* Stats */}
          <Animated.View style={[s.statsGrid, { opacity: statsAnim, transform: [{ translateY: statsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
            <StatBox num="2"    sub="помилки" accent={colors.orangeDeep} icon="close-circle-outline" />
            <StatBox num="3:42" sub="час"     accent={colors.charcoal}   icon="time-outline"          />
            <StatBox num={`+${displayBonus}`} sub="бонуси" accent={colors.orange} icon="star-outline" />
          </Animated.View>

          {/* Streak continuation notice */}
          {isGood && (
            <Animated.View style={[s.streakNotice, { opacity: statsAnim, borderColor: `${colors.orange}30` }]}>
              <LinearGradient
                colors={['rgba(245,138,58,0.15)', 'rgba(245,138,58,0.05)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Ionicons name="flame" size={20} color={colors.orange} />
              <View style={{ flex: 1 }}>
                <Text style={[s.streakNoticeText, { color: colors.ink }]}>Стрік продовжено — 138 днів!</Text>
                <Pressable onPress={() => router.push('/quest/celebrate?streak=138' as any)}>
                  <Text style={[Typography.caption, { color: colors.orange, marginTop: 1 }]}>
                    Відсвяткувати →
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

        </ScrollView>

        <Animated.View style={{ opacity: statsAnim, paddingHorizontal: 24, paddingBottom: 24, gap: 10 }}>
          <Pressable style={[s.glassBtn, { borderColor: 'rgba(255,255,255,0.70)' }]} onPress={() => router.push('/quest/mistakes')}>
            <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFillObject} />
            <LinearGradient
              colors={['rgba(245,138,58,0.18)', 'rgba(245,138,58,0.06)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={[s.glassBtnText, { color: colors.ink }]}>Переглянути помилки</Text>
          </Pressable>
          <Button
            variant="primary"
            label="До головної"
            fullWidth
            onPress={() => router.replace('/(tabs)')}
          />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

function StatBox({ num, sub, accent, icon }: { num: string; sub: string; accent: string; icon: string }) {
  const { colors } = useTheme();
  return (
    <View style={[s.statBox, { backgroundColor: colors.paper, borderColor: colors.borderSubtle }]}>
      <View style={[s.statIconWrap, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={icon as any} size={16} color={accent} />
      </View>
      <Text style={[s.statNum, { color: accent }]}>{num}</Text>
      <Text style={[s.statLabel, { color: colors.charcoal3 }]}>{sub.toUpperCase()}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  topnav: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 59, paddingBottom: 10,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  ringWrap: {
    width: 280, height: 280,
    alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
    marginTop: 28,
  },
  ringPct: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 54, lineHeight: 58, letterSpacing: -1.4,
  },
  statsGrid: {
    flexDirection: 'row', gap: 10, marginTop: 28,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18, padding: 14, gap: 5,
    alignItems: 'center',
    ...Shadows.soft,
  },
  statIconWrap: {
    width: 30, height: 30, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  statNum: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 24, lineHeight: 26, letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 9, lineHeight: 11, letterSpacing: 1.4,
  },
  streakNotice: {
    flexDirection: 'row', gap: 10, alignItems: 'center',
    marginTop: 20,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  streakNoticeText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14, lineHeight: 18,
  },
  glassBtn: {
    height: 56, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#232814',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22, shadowRadius: 14, elevation: 7,
  },
  glassBtnText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16, lineHeight: 20, letterSpacing: 0.1,
  },
});
