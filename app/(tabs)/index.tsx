import { ProgressBar } from '@/components/ProgressBar';
import { Radius, Shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── Data ──────────────────────────────────────────────────────────────────────

const XP_TOTAL = 249;
const STREAK   = 138;

interface CategoryCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accentKey: 'sageDeep' | 'orange';
  activeKey:  'sage1';
  route: string;
  progress?: { current: number; total: number };
}

const CARDS: CategoryCard[] = [
  {
    id: 'categories',
    title: 'Категорії\nзавдань',
    subtitle: 'Останній перегляд: 20 годин тому',
    icon: 'apps-outline',
    accentKey: 'sageDeep',
    activeKey: 'sage1',
    route: '/categories',
  },
  {
    id: 'personal',
    title: 'Персональні\nзавдання',
    subtitle: 'Останній перегляд: 20 годин тому',
    icon: 'clipboard-outline',
    accentKey: 'orange',
    activeKey: 'sage1',
    progress: { current: 5, total: 10 },
    route: '/quest/tf',
  },
  {
    id: 'challenges',
    title: 'Челеджі\nз друзями',
    subtitle: 'Останній перегляд: 20 годин тому',
    icon: 'people-outline',
    accentKey: 'sageDeep',
    activeKey: 'sage1',
    route: '/quest-list',
  },
];

// ── Screen ────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [displayXP, setDisplayXP]       = useState(0);
  const [displayStreak, setDisplayStreak] = useState(0);

  const flamePulse = useRef(new Animated.Value(1)).current;
  const flameGlow  = useRef(new Animated.Value(0.3)).current;
  const headerFade = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      setSelectedId(null);
    }, [])
  );

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 380, useNativeDriver: true }).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(flamePulse, { toValue: 1.18, duration: 860, useNativeDriver: true }),
        Animated.timing(flamePulse, { toValue: 0.90, duration: 820, useNativeDriver: true }),
      ])
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(flameGlow, { toValue: 0.85, duration: 860, useNativeDriver: true }),
        Animated.timing(flameGlow, { toValue: 0.15, duration: 820, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();
    glowLoop.start();

    const xpCounter = new Animated.Value(0);
    const xpLid = xpCounter.addListener(({ value }) => setDisplayXP(Math.floor(value)));
    Animated.timing(xpCounter, { toValue: XP_TOTAL, duration: 1100, useNativeDriver: false }).start();

    const strCounter = new Animated.Value(0);
    const strLid = strCounter.addListener(({ value }) => setDisplayStreak(Math.floor(value)));
    Animated.timing(strCounter, { toValue: STREAK, duration: 1300, delay: 200, useNativeDriver: false }).start();

    return () => {
      pulseLoop.stop();
      glowLoop.stop();
      xpCounter.removeListener(xpLid);
      strCounter.removeListener(strLid);
    };
  }, []);

  const handleCardPress = (card: CategoryCard) => {
    setSelectedId(card.id);
    setTimeout(() => router.push(card.route as any), 240);
  };

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <Animated.View style={[s.header, { opacity: headerFade }]}>
          <View style={{ gap: 6 }}>
            <Text style={[s.greeting, { color: colors.ink }]}>Привіт, Олю!</Text>
            <View style={s.streakRow}>
              <Ionicons name="flame" size={20} color={colors.orange} />
              <Text style={[s.streakLabel, { color: colors.charcoal2 }]}>{displayStreak} днів поспіль</Text>
            </View>
          </View>

          {/* XP badge */}
          <Pressable
            onPress={() => router.push('/(tabs)/streak')}
            style={[s.xpBadge, { borderColor: `${colors.orange}30` }]}
          >
            <Ionicons name="heart" size={20} color={colors.orange} />
            <Text style={[s.xpNum, { color: colors.ink }]}>{displayXP}</Text>
          </Pressable>
        </Animated.View>

        {/* ── Category cards ──────────────────────────────────────────────── */}
        <View style={s.cardList}>
          {CARDS.map((card, i) => (
            <CategoryCardItem
              key={card.id}
              card={card}
              index={i}
              isSelected={selectedId === card.id}
              onPress={() => handleCardPress(card)}
            />
          ))}
        </View>

        <View style={{ height: 128 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── CategoryCard ──────────────────────────────────────────────────────────────

function CategoryCardItem({
  card,
  index,
  isSelected,
  onPress,
}: {
  card: CategoryCard;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  const accent      = colors[card.accentKey];
  const activeColor = colors[card.activeKey];

  const mountAnim  = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const selectT    = useRef(new Animated.Value(0)).current;
  const selectC    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 90),
      Animated.spring(mountAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 110,
        friction: 16,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const target = isSelected ? 1 : 0;
    Animated.parallel([
      Animated.spring(selectT, { toValue: target, useNativeDriver: true, tension: 200, friction: 18 }),
      Animated.spring(selectC, { toValue: target, useNativeDriver: false, tension: 200, friction: 18 }),
    ]).start();
  }, [isSelected]);

  const onIn  = () => Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 20 }).start();
  const onOut = () => Animated.spring(pressScale, { toValue: 1,    useNativeDriver: true, tension: 300, friction: 20 }).start();

  const translateY  = mountAnim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] });
  const selectScale = selectT.interpolate({ inputRange: [0, 1], outputRange: [1, 1.016] });
  const bgColor     = selectC.interpolate({ inputRange: [0, 1], outputRange: [colors.paper, activeColor] });
  const borderColor = selectC.interpolate({ inputRange: [0, 1], outputRange: [colors.borderSubtle, accent + '80'] });

  return (
    <Animated.View
      style={[
        cc.outerWrap,
        {
          opacity: mountAnim,
          transform: [{ translateY }, { scale: selectScale }, { scale: pressScale }],
        },
      ]}
    >
      <Animated.View style={[cc.card, { borderColor }]}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, cc.bgFill, { backgroundColor: bgColor }]}
        />

        <Pressable
          onPress={onPress}
          onPressIn={onIn}
          onPressOut={onOut}
          style={cc.pressable}
        >
          <View style={cc.body}>
            <Text style={[cc.title, { color: colors.ink }]}>{card.title}</Text>
            <Text style={[cc.subtitle, { color: colors.charcoal3 }]}>{card.subtitle}</Text>
          </View>

          <View style={cc.footer}>
            <View style={[cc.iconCircle, { backgroundColor: `${accent}22` }]}>
              <Ionicons name={card.icon as any} size={18} color={accent} />
            </View>

            {card.progress && (
              <View style={cc.progressSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <ProgressBar
                      value={card.progress.current / card.progress.total}
                      height={10}
                      trackColor={colors.bgMuted}
                    />
                  </View>
                  <Text style={[cc.progressText, { color: colors.ink }]}>
                    {card.progress.current}/{card.progress.total}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={[cc.arrowBtn, { backgroundColor: colors.ivory, borderColor: colors.borderSubtle }]}>
            <Ionicons name="chevron-forward" size={18} color={colors.ink} />
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen:  { flex: 1 },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 59 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    marginBottom: 20,
  },

  greeting: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 32, lineHeight: 38,
    letterSpacing: -0.5,
  },

  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  streakLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 17, lineHeight: 21,
  },

  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 6,
    ...Shadows.soft,
  },

  xpNum: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14, lineHeight: 17,
  },

  cardList: { gap: 8 },
});

const cc = StyleSheet.create({
  outerWrap: { width: '100%' },

  card: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#232814',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  bgFill: { borderRadius: Radius.sm },

  pressable: {
    height: 190,
    padding: 16,
    justifyContent: 'space-between',
  },

  body: { gap: 8, paddingRight: 56 },

  title: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 24, lineHeight: 29,
    letterSpacing: -0.2,
  },

  subtitle: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14, lineHeight: 22,
    letterSpacing: 0.2,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  iconCircle: {
    width: 36, height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  progressSection: { flex: 1, gap: 6 },

  progressText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 15, lineHeight: 18,
    letterSpacing: 0.1,
  },

  progressBarWrap: { width: '100%' },

  arrowBtn: {
    position: 'absolute',
    top: 16, right: 16,
    width: 44, height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
