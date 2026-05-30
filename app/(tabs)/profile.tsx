import { ActivityChart, ChartDay } from '@/components/ActivityChart';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { Radius, Typography } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WEEK: ChartDay[] = [
  { label: 'Пн', value: 0.9 },
  { label: 'Вт', value: 0.6 },
  { label: 'Ср', value: 1.0 },
  { label: 'Чт', value: 0.75 },
  { label: 'Пт', value: 0.4, isToday: true },
  { label: 'Сб', value: 0 },
  { label: 'Нд', value: 0 },
];

const BADGES = [
  { id: 'first',   icon: 'rocket-outline',      label: 'Перший тест',     earned: true,  grad: ['rgba(183,203,132,0.90)', 'rgba(143,167,100,0.60)'] as [string,string] },
  { id: 'week',    icon: 'flame-outline',        label: 'Тиждень фокусу',  earned: true,  grad: ['rgba(245,138,58,0.28)',  'rgba(245,138,58,0.10)' ] as [string,string] },
  { id: 'memory',  icon: 'bulb-outline',         label: "Майстер памʼяті", earned: true,  grad: ['rgba(246,221,128,0.95)', 'rgba(230,190,50,0.65)' ] as [string,string] },
  { id: 'level10', icon: 'trending-up-outline',  label: '10-й рівень',     earned: false, grad: null },
  { id: 'month',   icon: 'calendar-outline',     label: 'Місячний стрік',  earned: false, grad: null },
  { id: 'legend',  icon: 'trophy-outline',       label: 'Легенда',         earned: false, grad: null },
];

const earnedCount = BADGES.filter(b => b.earned).length;

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, gradients } = useTheme();

  const SKILLS = [
    { label: 'Увага',        pct: 81, accent: colors.orange   },
    { label: 'Логіка',       pct: 78, accent: colors.sageDeep },
    { label: "Памʼять",      pct: 62, accent: colors.orangeDeep },
    { label: 'Концентрація', pct: 54, accent: colors.sage2    },
  ];

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top']}>
      <View style={s.topRow}>
        <Text style={[Typography.eyebrow, { color: colors.charcoal3 }]}>ПРОФІЛЬ</Text>
        <Pressable style={[s.iconBtn, { backgroundColor: colors.bgOverlay }]} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={20} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Identity ─────────────────────────────────────────────────────── */}
        <View style={s.identity}>
          <View style={[s.avatarOuter, { backgroundColor: colors.ivory }]}>
            <LinearGradient colors={gradients.avatar} style={s.avatar} />
          </View>
          <Text style={[Typography.h1, { marginTop: 14, color: colors.ink }]}>Олена Кравчук</Text>
          <Text style={[Typography.caption, { marginTop: 5, color: colors.charcoal3 }]}>
            @olya · приєдналась у січні 2026
          </Text>

          <View style={s.socialRow}>
            <SocialStat num="128" label="ЧИТАЧІ" />
            <View style={[s.socialDivider, { backgroundColor: colors.borderSubtle }]} />
            <SocialStat num="42"  label="ДРУЗІ"  />
            <View style={[s.socialDivider, { backgroundColor: colors.borderSubtle }]} />
            <SocialStat num="12"  label="РІВЕНЬ" />
          </View>
        </View>

        {/* Add friend — glass button */}
        <Pressable style={s.glassBtn}>
          <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFillObject} />
          <LinearGradient
            colors={['rgba(183,203,132,0.40)', 'rgba(183,203,132,0.15)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFillObject, { opacity: 0.85 }]}
          />
          <LinearGradient
            colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.0)']}
            start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={[s.glassBtnText, { color: colors.ink }]}>+ Додати друга</Text>
        </Pressable>

        {/* ── Key stats ribbon ─────────────────────────────────────────────── */}
        <View style={s.statsRibbon}>
          <StatCard icon="flame"            accent={colors.orange}   num="138"  label="СТРІК ДНІВ" cardBg={colors.paper} cardBorder={colors.borderSubtle} />
          <StatCard icon="star"             accent={colors.yellow}   num="2.4K" label="БОНУСИ"     cardBg={colors.paper} cardBorder={colors.borderSubtle} />
          <StatCard icon="checkmark-circle" accent={colors.sageDeep} num="73%"  label="ТОЧНІСТЬ"   cardBg={colors.paper} cardBorder={colors.borderSubtle} />
        </View>

        {/* ── XP Level ─────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel text="Рівень та XP" />
          <Card style={{ marginTop: 10 }}>
            <View style={s.xpRow}>
              <LinearGradient colors={gradients.ink} style={s.levelBadge}>
                <Text style={[s.levelNum, { color: colors.paper }]}>12</Text>
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[s.levelTitle, { color: colors.ink }]}>Рівень 12</Text>
                <Text style={[Typography.caption, { marginTop: 3, color: colors.charcoal3 }]}>
                  2 400 / 3 000 XP · до рівня 13
                </Text>
              </View>
              <View style={[s.xpPctWrap, { backgroundColor: `${colors.sage}44` }]}>
                <Text style={[s.xpPct, { color: colors.sageDeep }]}>80%</Text>
              </View>
            </View>
            <View style={{ marginTop: 14 }}>
              <ProgressBar value={2400 / 3000} height={10} />
            </View>
          </Card>
        </View>

        {/* ── Weekly activity ──────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel text="Активність тижня" />
          <Card style={{ marginTop: 10 }}>
            <ActivityChart days={WEEK} maxH={68} />
            <View style={[s.activityFooter, { borderTopColor: colors.divider }]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.actNum, { color: colors.ink }]}>74%</Text>
                <Text style={[s.actLabel, { color: colors.charcoal3 }]}>середня активність</Text>
              </View>
              <View style={[s.actDivider, { backgroundColor: colors.divider }]} />
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={[s.actNum, { color: colors.sageDeep }]}>+12%</Text>
                <Text style={[s.actLabel, { color: colors.charcoal3 }]}>vs минулий тиждень</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* ── Badges ───────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <SectionLabel text="Бейджі та досягнення" />
            <View style={[s.badgeCount, { backgroundColor: `${colors.sage}55` }]}>
              <Text style={[s.badgeCountText, { color: colors.sageDeep }]}>{earnedCount} / {BADGES.length}</Text>
            </View>
          </View>
          <View style={{ gap: 10, marginTop: 12 }}>
            <View style={s.badgeRow}>
              {BADGES.slice(0, 3).map(b => <BadgeCell key={b.id} icon={b.icon} label={b.label} earned={b.earned} grad={b.grad} />)}
            </View>
            <View style={s.badgeRow}>
              {BADGES.slice(3, 6).map(b => <BadgeCell key={b.id} icon={b.icon} label={b.label} earned={b.earned} grad={b.grad} />)}
            </View>
          </View>
        </View>

        {/* ── Skills ───────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel text="Навички" />
          <View style={{ gap: 8, marginTop: 10 }}>
            {SKILLS.map((sk, i) => (
              <SkillRow key={sk.label} label={sk.label} pct={sk.pct} index={i} />
            ))}
          </View>
        </View>

        <View style={{ height: 128 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  const { colors } = useTheme();
  return <Text style={[s.sectionLabel, { color: colors.ink }]}>{text}</Text>;
}

function SocialStat({ num, label }: { num: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={[s.socialNum, { color: colors.ink }]}>{num}</Text>
      <Text style={[s.socialLabel, { color: colors.charcoal3 }]}>{label}</Text>
    </View>
  );
}

function StatCard({ icon, accent, num, label, cardBg, cardBorder }: {
  icon: string; accent: string; num: string; label: string; cardBg: string; cardBorder: string;
}) {
  return (
    <View style={[s.statCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      <View style={[s.statIconWrap, { backgroundColor: `${accent}1A` }]}>
        <Ionicons name={icon as any} size={16} color={accent} />
      </View>
      <Text style={[s.statNum, { color: accent }]}>{num}</Text>
      <Text style={[s.statLabel, { color: accent }]}>{label}</Text>
    </View>
  );
}

function SkillRow({ label, pct, index }: { label: string; pct: number; index: number }) {
  const { colors, gradients } = useTheme();
  const fillAnim  = useRef(new Animated.Value(0)).current;
  const mountAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 100;
    Animated.parallel([
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(mountAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(delay + 120),
        Animated.timing(fillAnim, { toValue: pct, duration: 700, useNativeDriver: false }),
      ]),
    ]).start();
  }, []);

  const fillWidth  = fillAnim.interpolate({ inputRange: [0, pct], outputRange: ['0%', `${pct}%`] });
  const translateX = mountAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] });

  return (
    <Animated.View style={[
      s.skillRow,
      { opacity: mountAnim, transform: [{ translateX }], backgroundColor: colors.paper, borderColor: colors.borderDefault },
    ]}>
      <Animated.View style={[s.skillFill, { width: fillWidth as any }]}>
        <LinearGradient colors={gradients.sage} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </Animated.View>
      <Text style={[s.skillLabel, { color: colors.ink }]}>{label}</Text>
      <Text style={[s.skillPct, { color: colors.ink }]}>{pct}%</Text>
    </Animated.View>
  );
}

function BadgeCell({
  icon, label, earned, grad,
}: { icon: string; label: string; earned: boolean; grad: [string,string] | null }) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;

  const iconColor = earned
    ? (icon === 'flame-outline' ? colors.orange : icon === 'bulb-outline' ? colors.yellow : colors.sageDeep)
    : colors.charcoal3;

  const onPressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.91, useNativeDriver: true, tension: 320, friction: 18 }).start();
    if (earned) Animated.timing(glowAnim, { toValue: 1, duration: 140, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 320, friction: 18 }).start();
    Animated.timing(glowAnim, { toValue: 0, duration: 240, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[bc.wrap, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() =>
          Alert.alert(label, earned ? 'Ти отримала цей бейдж! 🎉' : 'Продовжуй навчатись, щоб відкрити цей бейдж.')
        }
        style={[
          bc.cell,
          { backgroundColor: colors.paper, borderColor: colors.borderSubtle },
          earned && bc.cellEarned,
          !earned && bc.cellLocked,
        ]}
      >
        {earned && grad ? (
          <>
            <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFillObject} />
            <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFillObject, { opacity: 0.7 }]} />
            <LinearGradient colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.0)']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFillObject} />
          </>
        ) : null}

        {earned && (
          <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: glowAnim, backgroundColor: `${colors.sage}40` }]} pointerEvents="none" />
        )}

        <View style={[bc.iconCircle, !earned && { backgroundColor: colors.bgMuted }]}>
          {earned ? (
            <Ionicons name={icon as any} size={36} color={iconColor} />
          ) : (
            <Ionicons name="lock-closed-outline" size={18} color={colors.charcoal3} />
          )}
        </View>

        <Text style={[bc.label, { color: earned ? colors.ink : colors.charcoal3 }]} numberOfLines={2}>
          {label}
        </Text>

        {earned && <View style={[bc.dot, { backgroundColor: colors.orange, shadowColor: colors.orange }]} />}
      </Pressable>
    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },

  topRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 59, paddingBottom: 10,
  },

  iconBtn: {
    width: 38, height: 38, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },

  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 128 },

  identity: { alignItems: 'center', paddingTop: 8 },

  avatarOuter: {
    width: 84, height: 84, borderRadius: 42,
    padding: 3,
    shadowColor: '#232814',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18, shadowRadius: 18, elevation: 8,
  },

  avatar: { width: 78, height: 78, borderRadius: 39 },

  socialRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 22, marginTop: 18,
  },

  socialDivider: { width: 1, height: 36 },

  socialNum: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 20, lineHeight: 22, letterSpacing: -0.2,
    textAlign: 'center',
  },

  socialLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 9, lineHeight: 11, letterSpacing: 1.4,
    textTransform: 'uppercase',
    textAlign: 'center', marginTop: 3,
  },

  statsRibbon: { flexDirection: 'row', gap: 10, marginTop: 24 },

  statCard: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 14, gap: 6,
    alignItems: 'center',
    shadowColor: '#232814',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09, shadowRadius: 10, elevation: 3,
  },

  statIconWrap: {
    width: 30, height: 30, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },

  statNum: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 20, lineHeight: 22, letterSpacing: -0.3,
  },

  statLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 9, lineHeight: 11, letterSpacing: 1.3,
    textTransform: 'uppercase',
  },

  section: { marginTop: 26 },

  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  sectionLabel: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 18, lineHeight: 22, letterSpacing: -0.14,
  },

  badgeCount: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 999,
  },

  badgeCountText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 11, lineHeight: 14,
  },

  xpRow: { flexDirection: 'row', alignItems: 'center' },

  levelBadge: {
    width: 50, height: 50, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  levelNum: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 22, lineHeight: 24, letterSpacing: -0.4,
  },

  levelTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 17, lineHeight: 20, letterSpacing: -0.14,
  },

  xpPctWrap: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999, flexShrink: 0,
  },

  xpPct: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 13, lineHeight: 16,
  },

  activityFooter: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 16, paddingTop: 14,
    borderTopWidth: 1,
  },

  actDivider: { width: 1, height: 32, marginHorizontal: 12 },

  actNum: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 17, lineHeight: 19, letterSpacing: -0.2,
  },

  actLabel: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 11, lineHeight: 15, marginTop: 2,
  },

  badgeRow: { flexDirection: 'row', gap: 10 },

  skillRow: {
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 17,
    shadowColor: '#232814',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 3,
  },

  skillFill: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    borderRadius: 18,
    overflow: 'hidden',
  },

  skillLabel: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16, lineHeight: 20,
  },

  skillPct: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 20, lineHeight: 22,
    letterSpacing: 0.2,
  },

  glassBtn: {
    marginTop: 18, height: 56, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.70)',
    shadowColor: '#232814',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22, shadowRadius: 14, elevation: 7,
  },

  glassBtnText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16, lineHeight: 20, letterSpacing: 0.1,
  },
});

const bc = StyleSheet.create({
  wrap: { flex: 1 },

  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    padding: 10, gap: 7,
    overflow: 'hidden',
    shadowColor: '#232814',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },

  cellEarned: {
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderColor: 'rgba(255,255,255,0.70)',
    borderWidth: 1.5,
  },

  cellLocked: {
    opacity: 0.58,
  },

  iconCircle: {
    width: 48, height: 48, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },

  label: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 10, lineHeight: 13, letterSpacing: 0.1,
    textAlign: 'center',
  },

  dot: {
    position: 'absolute', top: 9, right: 9,
    width: 7, height: 7, borderRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6, shadowRadius: 4, elevation: 2,
  },
});
