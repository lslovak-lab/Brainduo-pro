import { Radius, Shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable, StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── Types ───────────────────────────────────────────────────────────────────

type Period = 'week' | 'month' | 'all';

export interface Leader {
  rank: number;
  name: string;
  handle: string;
  pts: number;
  avColors: readonly [string, string];
  isYou?: boolean;
}

// ── Constants ───────────────────────────────────────────────────────────────

const SILVER = '#9A9A9A';
const BRONZE = '#C0955A';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week',  label: 'Тиждень'   },
  { key: 'month', label: 'Місяць'    },
  { key: 'all',   label: 'Увесь час' },
];

const PODIUM_SLOTS: Array<{
  rankIdx: number;
  avSize: number;
  platformH: number;
  accent: string;
  isCenter?: boolean;
}> = [
  { rankIdx: 1, avSize: 46, platformH:  80, accent: SILVER              },
  { rankIdx: 0, avSize: 60, platformH: 108, accent: '#F58A3A', isCenter: true },
  { rankIdx: 2, avSize: 40, platformH:  64, accent: BRONZE              },
];

// ── Data ────────────────────────────────────────────────────────────────────

const DATA: Record<Period, Leader[]> = {
  week: [
    { rank: 1,  name: 'Юлія Мороз',    handle: '@yulia',   pts: 2847, avColors: ['#D9E3B4', '#B7CB84'] },
    { rank: 2,  name: 'Іра Ковальчук', handle: '@ira',     pts: 2612, avColors: ['#FFB17A', '#F58A3A'] },
    { rank: 3,  name: 'Надія Захар',   handle: '@nadia',   pts: 2401, avColors: ['#F6DD80', '#EFC84A'] },
    { rank: 4,  name: 'Дмитро Лис',    handle: '@dmytro',  pts: 2188, avColors: ['#D9E3B4', '#9DB66B'] },
    { rank: 5,  name: 'Катя Руденко',  handle: '@katya',   pts: 1954, avColors: ['#FFB17A', '#F58A3A'] },
    { rank: 6,  name: 'Олег Тимченко', handle: '@oleg',    pts: 1837, avColors: ['#F6DD80', '#EFC84A'] },
    { rank: 7,  name: 'Марина Савчук', handle: '@marina',  pts: 1720, avColors: ['#D9E3B4', '#B7CB84'] },
    { rank: 8,  name: 'Павло Гук',     handle: '@pavlo',   pts: 1604, avColors: ['#FFB17A', '#F58A3A'] },
    { rank: 9,  name: 'Анна Стець',    handle: '@anna',    pts: 1539, avColors: ['#F6DD80', '#EFC84A'] },
    { rank: 10, name: 'Олена Кравчук', handle: '@olya',    pts: 1480, avColors: ['#D9E3B4', '#B7CB84'], isYou: true },
    { rank: 11, name: 'Вася Петренко', handle: '@vasya',   pts: 1322, avColors: ['#FFB17A', '#F58A3A'] },
  ],
  month: [
    { rank: 1,  name: 'Надія Захар',   handle: '@nadia',   pts: 9841, avColors: ['#F6DD80', '#EFC84A'] },
    { rank: 2,  name: 'Юлія Мороз',    handle: '@yulia',   pts: 9612, avColors: ['#D9E3B4', '#B7CB84'] },
    { rank: 3,  name: 'Катя Руденко',  handle: '@katya',   pts: 8954, avColors: ['#FFB17A', '#F58A3A'] },
    { rank: 4,  name: 'Іра Ковальчук', handle: '@ira',     pts: 8401, avColors: ['#FFB17A', '#F58A3A'] },
    { rank: 5,  name: 'Павло Гук',     handle: '@pavlo',   pts: 7604, avColors: ['#FFB17A', '#F58A3A'] },
    { rank: 6,  name: 'Марина Савчук', handle: '@marina',  pts: 7220, avColors: ['#D9E3B4', '#B7CB84'] },
    { rank: 7,  name: 'Дмитро Лис',    handle: '@dmytro',  pts: 6988, avColors: ['#D9E3B4', '#9DB66B'] },
    { rank: 9,  name: 'Олена Кравчук', handle: '@olya',    pts: 6480, avColors: ['#D9E3B4', '#B7CB84'], isYou: true },
    { rank: 10, name: 'Вася Петренко', handle: '@vasya',   pts: 6122, avColors: ['#FFB17A', '#F58A3A'] },
  ],
  all: [
    { rank: 1,  name: 'Іра Ковальчук', handle: '@ira',     pts: 42812, avColors: ['#FFB17A', '#F58A3A'] },
    { rank: 2,  name: 'Марина Савчук', handle: '@marina',  pts: 38440, avColors: ['#D9E3B4', '#B7CB84'] },
    { rank: 3,  name: 'Надія Захар',   handle: '@nadia',   pts: 35201, avColors: ['#F6DD80', '#EFC84A'] },
    { rank: 4,  name: 'Павло Гук',     handle: '@pavlo',   pts: 31604, avColors: ['#FFB17A', '#F58A3A'] },
    { rank: 5,  name: 'Юлія Мороз',    handle: '@yulia',   pts: 27847, avColors: ['#D9E3B4', '#B7CB84'] },
    { rank: 6,  name: 'Дмитро Лис',    handle: '@dmytro',  pts: 24188, avColors: ['#D9E3B4', '#9DB66B'] },
    { rank: 7,  name: 'Катя Руденко',  handle: '@katya',   pts: 19954, avColors: ['#FFB17A', '#F58A3A'] },
    { rank: 8,  name: 'Олег Тимченко', handle: '@oleg',    pts: 17837, avColors: ['#F6DD80', '#EFC84A'] },
    { rank: 22, name: 'Олена Кравчук', handle: '@olya',    pts: 8480,  avColors: ['#D9E3B4', '#B7CB84'], isYou: true },
    { rank: 23, name: 'Анна Стець',    handle: '@anna',    pts: 8220,  avColors: ['#F6DD80', '#EFC84A'] },
  ],
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmtPts(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ── Screen ───────────────────────────────────────────────────────────────────

export default function LeaderboardScreen() {
  const { colors } = useTheme();
  const [period, setPeriod] = useState<Period>('week');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const GOLD = colors.orange;

  const rankAccent = (r: number): string =>
    r === 1 ? GOLD : r === 2 ? SILVER : r === 3 ? BRONZE : colors.charcoal3;

  const switchPeriod = (p: Period) => {
    if (p === period) return;
    Animated.timing(fadeAnim, { toValue: 0, duration: 110, useNativeDriver: true }).start(() => {
      setPeriod(p);
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  const data = DATA[period];
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: colors.ink, textAlign: 'center' }]}>Рейтинг</Text>
        </View>
      </View>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <PodiumSection leaders={top3} gold={GOLD} />

        {/* Period segment control */}
        <View style={[s.segWrap, { marginHorizontal: -24 }]}>
          <View style={[s.segTrack, { backgroundColor: colors.bgMuted }]}>
            {PERIODS.map(({ key, label }) => (
              <Pressable
                key={key}
                onPress={() => switchPeriod(key)}
                style={[s.segBtn, period === key && { backgroundColor: colors.paper, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 3 }]}
              >
                <Text style={[s.segLabel, { color: period === key ? colors.ink : colors.charcoal3 }]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {rest.length > 0 && (
          <View style={[s.listCard, { backgroundColor: colors.paper, borderColor: colors.borderSubtle }]}>
            {rest.map((leader, i) => {
              const prevRank = i === 0 ? (top3[2]?.rank ?? 3) : rest[i - 1].rank;
              const hasGap   = leader.rank > prevRank + 1;
              return (
                <React.Fragment key={leader.rank}>
                  {hasGap && <RankGapItem colors={colors} />}
                  <LeaderRowItem leader={leader} showDivider={i < rest.length - 1} rankAccent={rankAccent} colors={colors} />
                </React.Fragment>
              );
            })}
          </View>
        )}

        <View style={{ height: 128 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// ── Podium ───────────────────────────────────────────────────────────────────

function PodiumSection({ leaders, gold }: { leaders: Leader[]; gold: string }) {
  const { colors } = useTheme();
  if (leaders.length < 3) return null;

  const slots = [
    { rankIdx: 1, avSize: 46, platformH:  80, accent: SILVER               },
    { rankIdx: 0, avSize: 60, platformH: 108, accent: gold,  isCenter: true },
    { rankIdx: 2, avSize: 40, platformH:  64, accent: BRONZE               },
  ];

  return (
    <View style={pd.wrap}>
      {slots.map(({ rankIdx, avSize, platformH, accent, isCenter }) => {
        const leader = leaders[rankIdx];
        return (
          <View key={rankIdx} style={[pd.col, isCenter && pd.colCenter]}>
            {isCenter && (
              <LinearGradient colors={['#F6DD80', '#F58A3A']} style={[pd.crown, { shadowColor: gold }]}>
                <Ionicons name="trophy" size={16} color={colors.ink} />
              </LinearGradient>
            )}

            <View style={[pd.avatarRing, { borderRadius: (avSize + 8) / 2, backgroundColor: accent }]}>
              <LinearGradient
                colors={leader.avColors}
                style={{ width: avSize, height: avSize, borderRadius: avSize / 2 }}
              />
            </View>

            <Text style={[pd.name, { color: colors.ink }, isCenter && pd.nameBold]} numberOfLines={1}>
              {leader.name.split(' ')[0]}
            </Text>
            <Text style={[pd.pts, { color: accent }]}>{fmtPts(leader.pts)}</Text>

            <View style={[pd.platform, { height: platformH }]}>
              <View style={[StyleSheet.absoluteFillObject, {
                backgroundColor: accent,
                opacity: 0.13,
                borderTopLeftRadius: 14,
                borderTopRightRadius: 14,
              }]} />
              <LinearGradient
                colors={['transparent', `${accent}55`]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={[StyleSheet.absoluteFillObject, { borderTopLeftRadius: 14, borderTopRightRadius: 14 }]}
              />
              <View style={[pd.rankBadge, { backgroundColor: accent }]}>
                <Text style={[pd.rankNum, { color: colors.paper }]}>{leader.rank}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── LeaderRow ─────────────────────────────────────────────────────────────────

function LeaderRowItem({ leader, showDivider, rankAccent, colors }: {
  leader: Leader;
  showDivider: boolean;
  rankAccent: (r: number) => string;
  colors: any;
}) {
  const accent = rankAccent(leader.rank);
  return (
    <View style={[lr.row, showDivider && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
      {leader.isYou && (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.sage, opacity: 0.14 }]} />
      )}

      <Text style={[
        lr.rank,
        { color: leader.rank <= 3 ? accent : colors.charcoal3 },
        leader.rank <= 3 ? { fontFamily: 'Montserrat_800ExtraBold' } : undefined,
      ]}>
        {leader.rank}
      </Text>

      <LinearGradient colors={leader.avColors} style={lr.avatar} />

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[lr.name, { color: colors.ink }]} numberOfLines={1}>{leader.name}</Text>
          {leader.isYou && (
            <View style={[lr.youTag, { backgroundColor: colors.orange }]}>
              <Text style={[lr.youTagText, { color: colors.paper }]}>ти</Text>
            </View>
          )}
        </View>
        <Text style={[lr.handle, { color: colors.charcoal3 }]}>{leader.handle}</Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[lr.pts, { color: colors.ink }]}>{fmtPts(leader.pts)}</Text>
        <Text style={[lr.ptsLabel, { color: colors.charcoal3 }]}>XP</Text>
      </View>
    </View>
  );
}

// ── RankGap ──────────────────────────────────────────────────────────────────

function RankGapItem({ colors }: { colors: any }) {
  return (
    <View style={[rg.wrap, { borderBottomColor: colors.divider }]}>
      <View style={[rg.line, { backgroundColor: colors.bgMuted }]} />
      <Text style={[rg.dots, { color: colors.charcoal3 }]}>· · ·</Text>
      <View style={[rg.line, { backgroundColor: colors.bgMuted }]} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 59,
    paddingBottom: 10,
    gap: 12,
    minHeight: 52,
  },
  title: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 28, lineHeight: 34, letterSpacing: -0.34,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  segWrap: { paddingHorizontal: 24, paddingBottom: 8 },
  segTrack: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
  },
  segBtn: {
    flex: 1, height: 36, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  segLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13, lineHeight: 16,
  },
  content: { paddingHorizontal: 24, paddingBottom: 128 },
  listCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 24,
    ...Shadows.card,
  },
});

const pd = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 4,
    gap: 4,
  },
  col: { flex: 1, alignItems: 'center', gap: 5 },
  colCenter: { gap: 3 },
  crown: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45, shadowRadius: 18, elevation: 8,
  },
  avatarRing: { padding: 3 },
  name: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 12, lineHeight: 15,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  nameBold: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14, lineHeight: 17,
  },
  pts: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 11, lineHeight: 13, letterSpacing: 0.2,
  },
  platform: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
  },
  rankBadge: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  rankNum: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 13, lineHeight: 15,
  },
});

const lr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    position: 'relative',
  },
  rank: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16, lineHeight: 18,
    width: 28, textAlign: 'center',
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  name: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14, lineHeight: 17,
  },
  handle: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12, lineHeight: 15, marginTop: 2,
  },
  pts: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 15, lineHeight: 18,
  },
  ptsLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 10, lineHeight: 12,
    letterSpacing: 1.4, marginTop: 1,
  },
  youTag: {
    borderRadius: 999,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  youTagText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 9, lineHeight: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

const rg = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  line: { flex: 1, height: 1 },
  dots: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 12, lineHeight: 15,
    letterSpacing: 2,
  },
});
