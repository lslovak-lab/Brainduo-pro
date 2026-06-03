import { useTheme } from '@/lib/ThemeContext';
import { Radius } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { useScrollTabBar } from '@/lib/useScrollTabBar';
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

// ── Data ──────────────────────────────────────────────────────────────────────

const XP    = 249;
const STARS = 335;

type LevelState = 'done' | 'active' | 'locked';

interface Level {
  num: number;
  label: string;
  sublabel: string;
  state: LevelState;
}

const LEVELS: Level[] = [
  { num: 1, label: 'Рівень 1–2', sublabel: 'Базові навички',         state: 'done'   },
  { num: 2, label: 'Рівень 2',   sublabel: 'Критичне мислення',      state: 'active' },
  { num: 3, label: 'Рівень 3',   sublabel: 'Аргументація та логіка', state: 'locked' },
  { num: 4, label: 'Рівень 4',   sublabel: 'Майстерність',           state: 'locked' },
  { num: 5, label: 'Рівень 5',   sublabel: 'Риторика',               state: 'locked' },
  { num: 6, label: 'Рівень 6',   sublabel: 'Експертний рівень',      state: 'locked' },
];

// ── Path geometry ─────────────────────────────────────────────────────────────

const CIRC     = 96;
const R        = CIRC / 2;
const LEFT_X   = 90;
const RIGHT_X  = 300;
const Y_STEP   = 155;
const CANVAS_W = 390;

const CENTERS = [
  { x: LEFT_X,  y: R },
  { x: RIGHT_X, y: R +     Y_STEP },
  { x: LEFT_X,  y: R + 2 * Y_STEP },
  { x: RIGHT_X, y: R + 3 * Y_STEP },
  { x: LEFT_X,  y: R + 4 * Y_STEP },
  { x: RIGHT_X, y: R + 5 * Y_STEP },
] as const;

const PATH_H = R + 5 * Y_STEP + R;

function qBez(
  t: number,
  p0x: number, p0y: number,
  p1x: number, p1y: number,
  p2x: number, p2y: number,
) {
  const m = 1 - t;
  return {
    x: m * m * p0x + 2 * m * t * p1x + t * t * p2x,
    y: m * m * p0y + 2 * m * t * p1y + t * t * p2y,
  };
}

function makeDots(from: typeof CENTERS[number], to: typeof CENTERS[number], n = 11) {
  const p0x = from.x, p0y = from.y + R;
  const p2x = to.x,   p2y = to.y   - R;
  const p1x = p2x,    p1y = p0y;
  return Array.from({ length: n }, (_, i) => qBez((i + 1) / (n + 1), p0x, p0y, p1x, p1y, p2x, p2y));
}

const ALL_DOTS = [
  makeDots(CENTERS[0], CENTERS[1]),
  makeDots(CENTERS[1], CENTERS[2]),
  makeDots(CENTERS[2], CENTERS[3]),
  makeDots(CENTERS[3], CENTERS[4]),
  makeDots(CENTERS[4], CENTERS[5]),
];


// ── Screen ────────────────────────────────────────────────────────────────────

export default function LevelsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const topPad = width <= 480 ? 10 : 59;
  const onTabScroll = useScrollTabBar();

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

  const dotFill = (segIdx: number): string => {
    const state = LEVELS[segIdx].state;
    if (state === 'done')   return isDark ? '#F58A3A' : colors.sage;
    if (state === 'active') return isDark ? '#F58A3A60' : `${colors.orange}60`;
    return '#D0D0D0';
  };

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top']}>
      <Animated.View style={{ flex: 1, opacity: screenOpacity, transform: [{ translateY: screenSlide }] }}>
      <View style={[s.header, { paddingTop: topPad }]}>
        <View style={[s.pill, { borderColor: `${colors.yellow}55`, backgroundColor: `${colors.yellow}14` }]}>
          <Ionicons name="flash" size={14} color={colors.yellow} />
          <Text style={[s.pillText, { color: colors.ink }]}>{STARS}</Text>
        </View>
        <Text style={[s.headerTitle, { color: colors.ink }]}>Рівні</Text>
        <View style={[s.pill, { borderColor: `${colors.orange}44`, backgroundColor: `${colors.orange}12` }]}>
          <Ionicons name="flame" size={14} color={colors.orange} />
          <Text style={[s.pillText, { color: colors.ink }]}>{XP}</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        onScroll={onTabScroll}
        scrollEventThrottle={16}
      >
        <View style={[s.canvas, { height: PATH_H }]}>
          {ALL_DOTS.map((dots, si) =>
            dots.map((pt, di) => (
              <View
                key={`${si}-${di}`}
                style={[
                  s.dot,
                  {
                    left: pt.x - 4,
                    top:  pt.y - 4,
                    backgroundColor: dotFill(si),
                    opacity: LEVELS[si].state === 'locked' ? 0.55 : 1,
                  },
                ]}
              />
            ))
          )}

          {LEVELS.map((level, i) => (
            <LevelNode
              key={level.num}
              level={level}
              index={i}
              center={CENTERS[i]}
              isLeft={i % 2 === 0}
              onPress={() => {
                if (level.state !== 'locked') router.push('/quest/tf');
              }}
            />
          ))}
        </View>

        <View style={{ height: 128 }} />
      </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

// ── LevelNode ─────────────────────────────────────────────────────────────────

function LevelNode({
  level,
  index,
  center,
  isLeft,
  onPress,
}: {
  level: Level;
  index: number;
  center: typeof CENTERS[number];
  isLeft: boolean;
  onPress: () => void;
}) {
  const { colors, isDark } = useTheme();

  const mountAnim  = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(0.3)).current;

  const isDone   = level.state === 'done';
  const isActive = level.state === 'active';
  const isLocked = level.state === 'locked';

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 130),
      Animated.spring(mountAnim, {
        toValue: 1, useNativeDriver: true, tension: 100, friction: 14,
      }),
    ]).start();

    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1,   duration: 1000, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  const onIn  = () => !isLocked && Animated.spring(pressScale, { toValue: 0.88, useNativeDriver: true, tension: 300, friction: 20 }).start();
  const onOut = () =>               Animated.spring(pressScale, { toValue: 1,    useNativeDriver: true, tension: 300, friction: 20 }).start();

  const gradColors: readonly [string, string] =
    isDone   ? (isDark ? ['#FFB17A', '#F58A3A'] : [colors.sage1, colors.sageDeep]) :
    isActive ? (isDark ? ['#FFB17A', '#F58A3A'] : [colors.orangeSoft, colors.orangeDeep]) :
               ['#E2E2E2', '#CACACA'];

  const iconName  = isDone ? 'checkmark' : isActive ? 'play' : 'lock-closed';
  const iconSize  = isDone ? 30 : isActive ? 26 : 22;
  const iconColor = isDone ? (isDark ? colors.paper : colors.ink) : isActive ? colors.paper : '#AAAAAA';

  const circleTop  = center.y - R;
  const circleLeft = center.x - R;
  const labelTop   = center.y - 24;
  const scaleIn    = mountAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  const labelStyle = isLeft
    ? { left: center.x + R + 14, width: CANVAS_W - (center.x + R + 14) - 8 }
    : { right: CANVAS_W - (center.x - R - 14), width: center.x - R - 14 - 8 };

  return (
    <>
      <Animated.View
        style={[
          s.labelWrap,
          labelStyle,
          {
            top:        labelTop,
            alignItems: isLeft ? 'flex-start' : 'flex-end',
            opacity:    mountAnim,
          },
        ]}
      >
        <Text style={[s.levelLabel, { color: isLocked ? '#9A9A9A' : colors.ink }]}>{level.label}</Text>
        <Text style={[s.sublabel,   { color: isLocked ? '#BEBEBE' : colors.charcoal3 }]}>{level.sublabel}</Text>
      </Animated.View>

      <Animated.View
        style={[
          s.circleWrap,
          {
            left:      circleLeft,
            top:       circleTop,
            opacity:   mountAnim,
            transform: [{ scale: scaleIn }, { scale: pressScale }],
          },
        ]}
      >
        {isActive && (
          <Animated.View style={[s.glowRing, { backgroundColor: isDark ? '#F58A3A38' : `${colors.orange}38`, opacity: glowAnim }]} />
        )}

        {isActive && <View style={[s.whiteRing, { borderColor: colors.paper }]} />}

        <Pressable onPress={onPress} onPressIn={onIn} onPressOut={onOut}>
          <LinearGradient
            colors={gradColors}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={[
              s.circle,
              isDone   && { shadowColor: isDark ? '#D86F1F' : colors.sageDeep, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 8 },
              isActive && { shadowColor: isDark ? '#D86F1F' : colors.orange, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 10 },
              isLocked && s.circleLockedStyle,
            ]}
          >
            <Ionicons name={iconName as any} size={iconSize} color={iconColor} />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 59,
    paddingBottom: 12,
  },

  headerTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 24, lineHeight: 30,
    letterSpacing: -0.3,
  },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },

  pillText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14, lineHeight: 17,
  },

  content: {
    paddingTop: 8,
    paddingHorizontal: 20,
  },

  canvas: {
    position: 'relative',
    width: '100%',
  },

  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  labelWrap: {
    position: 'absolute',
    gap: 3,
  },

  levelLabel: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16, lineHeight: 20,
  },

  sublabel: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12, lineHeight: 15,
  },

  circleWrap: {
    position: 'absolute',
    width:  CIRC,
    height: CIRC,
    alignItems: 'center',
    justifyContent: 'center',
  },

  circle: {
    width: CIRC,
    height: CIRC,
    borderRadius: R,
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleLockedStyle: {
    opacity: 0.72,
  },

  glowRing: {
    position: 'absolute',
    width:  CIRC + 32,
    height: CIRC + 32,
    borderRadius: (CIRC + 32) / 2,
  },

  whiteRing: {
    position: 'absolute',
    width:  CIRC + 14,
    height: CIRC + 14,
    borderRadius: (CIRC + 14) / 2,
    borderWidth: 3,
  },
});
