import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { Typography, Shadows, Radius } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

interface PollOption {
  text: string;
  pct: number;
  votes: number;
}

const QUESTION = 'Яка стратегія навчання є найефективнішою?';
const OPTIONS: PollOption[] = [
  { text: 'Читання та повторення',  pct: 28, votes: 1240 },
  { text: 'Практичні завдання',     pct: 47, votes: 2087 },
  { text: 'Перегляд відео-лекцій',  pct: 15, votes: 665  },
  { text: 'Групові дискусії',       pct: 10, votes: 443  },
];
const TOTAL = OPTIONS.reduce((s, o) => s + o.votes, 0);

function fmtVotes(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

function PollBar({ pct, color, animate }: { pct: number; color: string; animate: boolean }) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;
    Animated.spring(anim, {
      toValue: pct / 100,
      useNativeDriver: false,
      tension: 80,
      friction: 14,
      delay: 80,
    }).start();
  }, [animate]);

  const w = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[pb.track, { backgroundColor: colors.bgMuted }]}>
      <Animated.View style={[pb.fill, { width: w, backgroundColor: color }]} />
    </View>
  );
}

const pb = StyleSheet.create({
  track: {
    height: 6, borderRadius: 999, overflow: 'hidden',
    flex: 1,
  },
  fill: { height: '100%', borderRadius: 999 },
});

export default function PollQuestScreen() {
  const router = useRouter();
  const { colors, gradients, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const topPad = width <= 480 ? 10 : 59;
  const [voted, setVoted]       = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const revealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  const handleVote = (i: number) => {
    if (voted) return;
    setSelected(i);
    setVoted(true);
    Animated.timing(revealAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  };

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top', 'bottom']}>
      <View style={[s.topnav, { paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <ProgressBar value={0.8} height={8} />
        </View>
        <Text style={[Typography.caption, { minWidth: 32, textAlign: 'right' }]}>4/5</Text>
      </View>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={Typography.eyebrow}>КВЕСТ · ОПИТУВАННЯ</Text>
        <Text style={[Typography.display, { marginTop: 10, textAlign: 'center', color: isDark ? '#FFFFFF' : colors.ink }]}>Твоя думка</Text>

        <LinearGradient
          colors={gradients.sage}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.questionCard}
        >
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <View style={[s.pollIcon, { backgroundColor: colors.bgOverlay }]}>
              <Ionicons name="stats-chart" size={20} color={colors.ink} />
            </View>
            <Text style={[Typography.h3, { flex: 1, lineHeight: 26, textAlign: 'center', color: isDark ? '#FFFFFF' : colors.ink }]}>{QUESTION}</Text>
          </View>
        </LinearGradient>

        {voted && (
          <Animated.View style={{ opacity: revealAnim }}>
            <View style={s.totalRow}>
              <Ionicons name="people-outline" size={15} color={colors.charcoal3} />
              <Text style={[Typography.caption, { color: colors.charcoal3 }]}>
                {fmtVotes(TOTAL + 1)} проголосували
              </Text>
            </View>
          </Animated.View>
        )}

        <View style={{ gap: 12, marginTop: 20 }}>
          {OPTIONS.map((opt, i) => {
            const isSelected = selected === i;
            const isWinner   = voted && opt.pct === Math.max(...OPTIONS.map(o => o.pct));
            const barColor   = isSelected ? colors.orange : colors.sage;

            return (
              <Pressable
                key={i}
                onPress={() => handleVote(i)}
                style={[
                  s.optRow,
                  { backgroundColor: colors.paper, borderColor: colors.borderSubtle },
                  isSelected && { borderColor: colors.orange, backgroundColor: colors.bgMuted },
                  voted && !isSelected && { opacity: 0.75 },
                ]}
              >
                <View style={s.optTop}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {voted && isWinner && (
                      <Ionicons name="trophy" size={14} color={colors.orange} />
                    )}
                    <Text style={[s.optText, { color: colors.charcoal }, isSelected && { color: colors.ink, fontFamily: 'Montserrat_700Bold' }]}>
                      {opt.text}
                    </Text>
                  </View>
                  {voted ? (
                    <Text style={[s.pctText, { color: colors.charcoal }, isSelected && { color: colors.orange }]}>
                      {opt.pct}%
                    </Text>
                  ) : (
                    <View style={[
                      s.optCircle,
                      { borderColor: colors.borderDefault },
                      isSelected && { backgroundColor: colors.ink, borderColor: colors.ink },
                    ]}>
                      {isSelected && <Ionicons name="checkmark" size={13} color={colors.paper} />}
                    </View>
                  )}
                </View>

                {voted && (
                  <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <PollBar pct={opt.pct} color={barColor} animate={voted} />
                    <Text style={[Typography.caption, { color: colors.charcoal3, width: 36, textAlign: 'right' }]}>
                      {fmtVotes(opt.votes)}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {voted && (
          <Animated.View style={{ opacity: revealAnim, marginTop: 28 }}>
            <Button
              variant="primary"
              label="Далі"
              fullWidth
              onPress={() => router.push('/quest/result')}
            />
          </Animated.View>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:  { flex: 1 },
  topnav:  {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingTop: 59, paddingBottom: 10,
  },
  iconBtn: { width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  questionCard: {
    padding: 20, borderRadius: 22, marginTop: 18,
    ...Shadows.card,
  },
  pollIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  totalRow: {
    flexDirection: 'row', gap: 5, alignItems: 'center',
    marginTop: 14, marginLeft: 2,
  },
  optRow: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    ...Shadows.card,
  },
  optTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  optText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14, lineHeight: 18,
    flex: 1,
  },
  optCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  pctText: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 16, lineHeight: 19,
  },
});
