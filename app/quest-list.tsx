import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Animated, Modal, useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { SegmentedControl } from '@/components/SegmentedControl';

type Segment = 'today' | 'week' | 'all';

const CHALLENGES: {
  id: string;
  title: string;
  meta: readonly string[];
  variant: 'warm' | 'dark' | 'default' | 'sage';
  icon: string;
  pct?: number;
}[] = [
  {
    id: 'tf',
    title: 'Щоденний фокус',
    meta: ['7 хв', '3 завдання', '+24 бонуси'],
    variant: 'warm',
    icon: 'time-outline',
    pct: 100,
  },
  {
    id: 'mc',
    title: 'Пастки аргументації',
    meta: ['12 хв', 'Логіка', '+50 бонусів'],
    variant: 'default',
    icon: 'pulse-outline',
    pct: 40,
  },
  {
    id: 'voice',
    title: 'Голосова відповідь',
    meta: ['8 хв', 'Мовлення', '+30 бонусів'],
    variant: 'sage',
    icon: 'mic-outline',
  },
  {
    id: 'poll',
    title: 'Голосування аудиторії',
    meta: ['3 хв', 'Думка', '+12 бонусів'],
    variant: 'warm',
    icon: 'stats-chart-outline',
  },
  {
    id: 'sentence',
    title: "Памʼять у словах",
    meta: ['5 хв', "Памʼять", '+18 бонусів'],
    variant: 'dark',
    icon: 'document-outline',
  },
];

const TOMORROW = [
  {
    title: 'Парний челендж · з Юлею',
    meta: '10 хв · Розблокування завтра о 9:00',
    icon: 'people-outline',
  },
  {
    title: 'Тижневий марафон',
    meta: '30 хв · Розблокування у суботу',
    icon: 'barbell-outline',
  },
];

const SEG_OPTIONS = [
  { label: 'Сьогодні', value: 'today' },
  { label: 'Тиждень',  value: 'week'  },
  { label: 'Усі',      value: 'all'   },
];

export default function QuestListScreen() {
  const router   = useRouter();
  const { width } = useWindowDimensions();
  const topPad = width <= 480 ? 10 : 59;
  const { colors, isDark } = useTheme();
  const [seg, setSeg]         = useState<Segment>('today');
  const [calModal, setCalModal] = useState(false);

  const visibleChallenges = seg === 'today'
    ? CHALLENGES.slice(0, 3)
    : seg === 'week'
    ? CHALLENGES.slice(0, 4)
    : CHALLENGES;

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { paddingTop: topPad }]}>
        <Pressable style={[s.iconBtn, { backgroundColor: colors.bgMuted }]} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <View style={{ marginTop: 16 }}>
          <Text style={[s.title, { color: isDark ? '#FFFFFF' : colors.ink, textAlign: 'center' }]}>Челенджі</Text>
          <Text style={[Typography.body, { marginTop: 4, color: isDark ? 'rgba(255,255,255,0.80)' : colors.ink, textAlign: 'center' }]}>
            Від 5 до 30 хвилин — обирай під свій настрій.
          </Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <SegmentedControl
          options={SEG_OPTIONS}
          value={seg}
          onChange={v => setSeg(v as Segment)}
        />

        <Text style={[s.sectionHead, { marginTop: 22, color: colors.charcoal3 }]}>АКТИВНІ · {visibleChallenges.length}</Text>
        <View style={{ gap: 12 }}>
          {visibleChallenges.map(ch => (
            <ChallengeRow
              key={ch.id}
              title={ch.title}
              meta={ch.meta}
              variant={ch.variant}
              icon={ch.icon}
              pct={ch.pct}
              onPress={() => router.push(`/quest/${ch.id}` as any)}
            />
          ))}
        </View>

        <Text style={[s.sectionHead, { marginTop: 32, color: colors.charcoal3 }]}>ПРИЙДЕ ЗАВТРА</Text>
        <View style={{ gap: 12 }}>
          {TOMORROW.map((ch, i) => (
            <View key={i} style={[s.challengeCard, { backgroundColor: colors.paper, borderColor: colors.borderSubtle, opacity: 0.6 }]}>
              <View style={s.challengeIcon}>
                <Ionicons name={ch.icon as any} size={22} color={colors.charcoal3} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.challengeTitle, { color: colors.charcoal2 }]}>{ch.title}</Text>
                <Text style={[Typography.caption, { marginTop: 3, color: colors.charcoal3 }]}>
                  {ch.meta}
                </Text>
              </View>
              <Ionicons name="lock-closed-outline" size={16} color={colors.charcoal3} />
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Calendar modal */}
      <Modal
        visible={calModal}
        transparent
        animationType="slide"
        onRequestClose={() => setCalModal(false)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setCalModal(false)}>
          <View style={[s.modalSheet, { backgroundColor: colors.paper }]}>
            <View style={[s.modalHandle, { backgroundColor: colors.divider }]} />
            <Text style={[Typography.h2, { marginTop: 8 }]}>Календар завдань</Text>
            <Text style={[Typography.body, { marginTop: 8 }]}>
              Тут буде повний календар активності та розклад челенджів.
            </Text>
            <View style={s.calPreview}>
              {['Пн','Вт','Ср','Чт','Пт','Сб','Нд'].map((d, i) => (
                <View key={i} style={s.calPreviewCol}>
                  <Text style={[s.calPreviewLabel, { color: colors.charcoal3 }]}>{d}</Text>
                  <View style={[
                    s.calPreviewDot,
                    { backgroundColor: colors.bgMuted },
                    i < 4 && { backgroundColor: colors.sage },
                    i === 3 && { backgroundColor: colors.orange },
                  ]} />
                </View>
              ))}
            </View>
            <Text style={[Typography.caption, { textAlign: 'center', marginTop: 16 }]}>
              Повний вигляд буде доступний незабаром ✦
            </Text>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function ChallengeRow({
  title, meta, variant, icon, pct, onPress,
}: {
  title: string;
  meta: readonly string[];
  variant: 'warm' | 'dark' | 'default' | 'sage';
  icon: string;
  pct?: number;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const onIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 20 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 300, friction: 20 }).start();

  const iconColors: readonly [string, string] =
    variant === 'warm' ? [colors.orangeSoft, colors.orange] :
    variant === 'dark' ? ['#2a2a2a', '#000000'] :
    variant === 'sage' ? [colors.sage1, colors.sage] :
    [colors.sage1, colors.sage];

  const isDone = pct === 100;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={onPress} onPressIn={onIn} onPressOut={onOut}
        style={[s.challengeCard, { backgroundColor: colors.paper, borderColor: colors.borderSubtle }]}>
        {isDone && (
          <View style={StyleSheet.absoluteFillObject}>
            <LinearGradient
              colors={['rgba(183,203,132,0.12)', 'rgba(183,203,132,0.04)']}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={{ flex: 1, borderRadius: 18 }}
            />
          </View>
        )}
        <LinearGradient
          colors={iconColors}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.challengeIcon}
        >
          <Ionicons
            name={isDone ? 'checkmark' : icon as any}
            size={22}
            color={variant === 'dark' ? colors.onDark : colors.ink}
          />
        </LinearGradient>

        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[s.challengeTitle, { color: colors.ink }]}>{title}</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {meta.map((m, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={[s.metaDot, { backgroundColor: colors.charcoal3 }]} />}
                <Text style={[Typography.caption, { color: colors.charcoal3 }]}>{m}</Text>
              </React.Fragment>
            ))}
          </View>
          {pct !== undefined && pct > 0 && pct < 100 && (
            <View style={[s.miniBar, { backgroundColor: colors.bgMuted }]}>
              <View style={[s.miniBarFill, { width: `${pct}%`, backgroundColor: colors.orange }]} />
            </View>
          )}
        </View>

        {isDone ? (
          <View style={[s.doneTag, { backgroundColor: colors.sage }]}>
            <Text style={[s.doneTagText, { color: colors.ink }]}>✓</Text>
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={colors.charcoal3} />
        )}
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 59,
    paddingBottom: 10,
  },
  title: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 28, lineHeight: 34, letterSpacing: -0.34,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  sectionHead: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 11, lineHeight: 13, letterSpacing: 1.76,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  challengeCard: {
    flexDirection: 'row', gap: 14, alignItems: 'center',
    padding: 14, paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 18, overflow: 'hidden',
    ...Shadows.card,
  },
  challengeIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  challengeTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14, lineHeight: 17, letterSpacing: -0.1,
  },
  metaDot: {
    width: 3, height: 3, borderRadius: 2,
    alignSelf: 'center',
  },
  miniBar: {
    height: 3, borderRadius: 999, marginTop: 2,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%', borderRadius: 999,
  },
  doneTag: {
    width: 28, height: 28, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  doneTagText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 48,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 8,
  },
  calPreview: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 24, paddingHorizontal: 8,
  },
  calPreviewCol: { alignItems: 'center', gap: 8 },
  calPreviewLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 11, lineHeight: 13,
  },
  calPreviewDot: {
    width: 28, height: 28, borderRadius: 10,
  },
});
