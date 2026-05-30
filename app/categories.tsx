import { useTheme } from '@/lib/ThemeContext';
import { Radius } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── Types ─────────────────────────────────────────────────────────────────────

type ChipKey = 'Увага' | 'Логіка' | "Пам'ять" | 'Концентрація';

interface QuestItem {
  id: string;
  title: string;
  meta: string;
  accent: string;
  icon: string;
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function CategoriesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<ChipKey>('Увага');

  const CHIPS: { label: ChipKey; color: string }[] = [
    { label: 'Увага',        color: colors.orange   },
    { label: 'Логіка',       color: colors.sageDeep },
    { label: "Пам'ять",      color: colors.yellow   },
    { label: 'Концентрація', color: colors.charcoal },
  ];

  const QUESTS: QuestItem[] = [
    { id: '1', title: 'Пастки\nаргументації',  meta: '10 завдань • Легкий рівень',     accent: colors.sage,     icon: 'alert-circle-outline' },
    { id: '2', title: 'Пошук закономірностей', meta: '12 завдань • Середній рівень',   accent: colors.yellow,   icon: 'search-outline'       },
    { id: '3', title: 'Сила\nсилогізмів',      meta: '20 завдань • Високий рівень',    accent: colors.orange,   icon: 'layers-outline'       },
    { id: '4', title: 'Фільтр\nдоказів',       meta: '18 завдань • Просунутий рівень', accent: colors.sageDeep, icon: 'funnel-outline'       },
  ];

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top']}>
      {/* Header */}
      <View style={s.topnav}>
        <Pressable style={s.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={[s.navTitle, { color: colors.ink }]}>Категорії</Text>
        <View style={s.iconBtn} />
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.chipsRow}
        contentContainerStyle={s.chipsContent}
      >
        {CHIPS.map(chip => (
          <CategoryChip
            key={chip.label}
            chip={chip}
            isActive={selected === chip.label}
            onPress={() => setSelected(chip.label)}
          />
        ))}
      </ScrollView>

      {/* Quest cards */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 8 }}>
          {QUESTS.map((quest, i) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              index={i}
              onPress={() => router.push('/quest/tf')}
            />
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── CategoryChip ──────────────────────────────────────────────────────────────

function CategoryChip({
  chip,
  isActive,
  onPress,
}: {
  chip: { label: string; color: string };
  isActive: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: isActive ? 1 : 0,
      useNativeDriver: false,
      tension: 220,
      friction: 20,
    }).start();
  }, [isActive]);

  const bgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.paper, colors.ink],
  });

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[s.chip, { backgroundColor: bgColor }]}>
        <View style={[s.chipDot, { backgroundColor: isActive ? colors.paper : chip.color }]} />
        <Text style={[s.chipText, { color: isActive ? colors.paper : colors.ink }]}>{chip.label}</Text>
      </Animated.View>
    </Pressable>
  );
}

// ── QuestCard ─────────────────────────────────────────────────────────────────

function QuestCard({
  quest,
  index,
  onPress,
}: {
  quest: QuestItem;
  index: number;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const mountAnim  = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 70),
      Animated.spring(mountAnim, {
        toValue: 1, useNativeDriver: true, tension: 110, friction: 16,
      }),
    ]).start();
  }, []);

  const onIn  = () => Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 20 }).start();
  const onOut = () => Animated.spring(pressScale, { toValue: 1,    useNativeDriver: true, tension: 300, friction: 20 }).start();

  const translateY = mountAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <Animated.View style={{ opacity: mountAnim, transform: [{ translateY }, { scale: pressScale }] }}>
      <View style={[c.card, { backgroundColor: colors.paper, borderColor: colors.borderDefault }]}>
        <Pressable onPress={onPress} onPressIn={onIn} onPressOut={onOut} style={c.pressable}>
          <View style={c.body}>
            <Text style={[c.cardTitle, { color: colors.ink }]}>{quest.title}</Text>
            <Text style={[c.cardMeta, { color: colors.charcoal3 }]}>{quest.meta}</Text>
          </View>

          <View style={c.footer}>
            <View style={[c.iconCircle, { backgroundColor: `${quest.accent}22` }]}>
              <Ionicons name={quest.icon as any} size={18} color={quest.accent} />
            </View>
          </View>

          <View style={[c.arrowBtn, { backgroundColor: colors.ivory, borderColor: colors.borderSubtle }]}>
            <Ionicons name="chevron-forward" size={18} color={colors.ink} />
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },

  topnav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 59,
    paddingBottom: 10,
  },

  navTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 24, lineHeight: 29,
    letterSpacing: -0.3,
  },

  iconBtn: {
    width: 44, height: 44, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center',
  },

  chipsRow: {
    flexGrow: 0,
    marginBottom: 12,
  },

  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.pill,
  },

  chipDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },

  chipText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16, lineHeight: 22,
    letterSpacing: 0.2,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
});

const c = StyleSheet.create({
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

  pressable: {
    height: 190,
    padding: 16,
    justifyContent: 'space-between',
  },

  body: {
    gap: 8,
    paddingRight: 56,
  },

  cardTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 24, lineHeight: 29,
    letterSpacing: -0.2,
  },

  cardMeta: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14, lineHeight: 22,
    letterSpacing: 0.2,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconCircle: {
    width: 36, height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

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
