import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Typography, Radius, Shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

interface Mistake {
  question: string;
  yourAnswer: string;
  correct: string;
  explanation: string;
  category: string;
}

const MISTAKES: Mistake[] = [
  {
    question: 'Скільки місяців у році мають 28 днів?',
    yourAnswer: 'Усі 12',
    correct: 'Тільки лютий',
    explanation: 'Усі 12 місяців мають хоча б 28 днів, але рівно 28 днів (у звичайний рік) має лише лютий.',
    category: 'Логіка',
  },
  {
    question: 'Наш мозок продовжує активно працювати під час сну — це правда чи хиба?',
    yourAnswer: 'Хиба',
    correct: 'Правда',
    explanation: 'Під час сну мозок активно консолідує спогади, очищається від токсинів та обробляє емоційні переживання.',
    category: "Памʼять",
  },
];

export default function MistakesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const topPad = width <= 480 ? 10 : 59;
  const [idx, setIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const navigate = (nextIdx: number) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setIdx(nextIdx);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const mistake = MISTAKES[idx];
  const isLast  = idx === MISTAKES.length - 1;

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top', 'bottom']}>
      <View style={[s.topnav, { paddingTop: topPad }]}>
        <Pressable style={s.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={Typography.eyebrow}>ВАШІ ПОМИЛКИ</Text>
        <Text style={[Typography.caption, { minWidth: 44, textAlign: 'right' }]}>
          {idx + 1} / {MISTAKES.length}
        </Text>
      </View>

      {/* Progress dots */}
      <View style={s.dotsRow}>
        {MISTAKES.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => i !== idx && navigate(i)}
            style={[
              s.dot,
              { backgroundColor: colors.bgMuted },
              i === idx && { backgroundColor: colors.orange },
              i < idx   && { backgroundColor: colors.sage },
            ]}
          />
        ))}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Category chip */}
          <View style={[s.chip, { backgroundColor: `${colors.sage}44` }]}>
            <Text style={[s.chipText, { color: colors.sageDeep }]}>{mistake.category}</Text>
          </View>

          <Text style={[Typography.eyebrow, { marginTop: 16, color: isDark ? 'rgba(255,255,255,0.55)' : undefined }]}>ПИТАННЯ {idx + 1}</Text>
          <Text style={[Typography.h2, { marginTop: 8, lineHeight: 28, color: isDark ? '#FFFFFF' : colors.ink }]}>
            {mistake.question}
          </Text>

          {/* Answers comparison */}
          <View style={{ gap: 10, marginTop: 20 }}>
            <View style={[s.answerRow, { borderColor: `${colors.orangeDeep}60`, backgroundColor: 'transparent' }]}>
              <BlurView intensity={isDark ? 40 : 55} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
              <LinearGradient
                colors={isDark ? [`${colors.orangeDeep}55`, `${colors.orangeDeep}22`] : ['rgba(251,228,213,0.80)', 'rgba(251,228,213,0.45)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={s.answerIconWrap}>
                <Ionicons name="close-circle" size={20} color={colors.orangeDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.eyebrow, { color: colors.orangeDeep }]}>ВАША ВІДПОВІДЬ</Text>
                <Text style={[s.answerText, { marginTop: 3, color: isDark ? '#FFFFFF' : colors.ink }]}>{mistake.yourAnswer}</Text>
              </View>
            </View>

            <View style={[s.answerRow, { borderColor: `${colors.sageDeep}60`, backgroundColor: 'transparent' }]}>
              <BlurView intensity={isDark ? 40 : 55} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
              <LinearGradient
                colors={isDark ? [`${colors.sageDeep}55`, `${colors.sageDeep}22`] : ['rgba(230,241,201,0.80)', 'rgba(230,241,201,0.45)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={s.answerIconWrap}>
                <Ionicons name="checkmark-circle" size={20} color={colors.sageDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.eyebrow, { color: colors.sageDeep }]}>ПРАВИЛЬНА ВІДПОВІДЬ</Text>
                <Text style={[s.answerText, { marginTop: 3, color: isDark ? '#FFFFFF' : colors.ink }]}>{mistake.correct}</Text>
              </View>
            </View>
          </View>

          {/* Explanation */}
          <View style={[s.explanationCard, { borderColor: `${colors.sage}60` }]}>
            <LinearGradient
              colors={['rgba(183,203,132,0.18)', 'rgba(183,203,132,0.06)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
              <View style={[s.bulbWrap, { backgroundColor: `${colors.sage}44` }]}>
                <Ionicons name="bulb-outline" size={18} color={colors.sageDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.eyebrow, { color: colors.sageDeep }]}>ПОЯСНЕННЯ</Text>
                <Text style={[Typography.body, { marginTop: 6, fontSize: 15, lineHeight: 22, color: isDark ? 'rgba(255,255,255,0.85)' : undefined }]}>
                  {mistake.explanation}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

      </ScrollView>

      <View style={s.footer}>
        {!isLast ? (
          <MistakesNavBtn label="Наступна помилка →" onPress={() => navigate(idx + 1)} />
        ) : (
          <MistakesNavBtn label="До головної" onPress={() => router.replace('/(tabs)')} />
        )}
        {idx > 0 && (
          <Button
            variant="ghost"
            label="← Попередня"
            fullWidth
            onPress={() => navigate(idx - 1)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function MistakesNavBtn({ label, onPress }: { label: string; onPress: () => void }) {
  const { isDark } = useTheme();
  const scale       = useRef(new Animated.Value(1)).current;
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

  if (!isDark) {
    return <Button variant="primary" label={label} fullWidth onPress={onPress} />;
  }

  return (
    <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
      <Pressable
        onPress={onPress}
        onPressIn={onIn}
        onPressOut={onOut}
        style={[s.navBtn, { overflow: 'hidden' }]}
      >
        <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.88)', opacity: fillOpacity }]} />
        <Animated.Text style={[s.navBtnText, { color: '#FFFFFF', opacity: textOpacity.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
          {label}
        </Animated.Text>
        <Animated.Text style={[s.navBtnText, { color: '#000000', opacity: textOpacity, position: 'absolute' }]}>
          {label}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  topnav: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 59, paddingBottom: 10,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row', gap: 6,
    paddingHorizontal: 24, paddingBottom: 10,
  },
  dot: {
    height: 4, flex: 1, borderRadius: 999,
  },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  footer:  { paddingHorizontal: 24, paddingBottom: 24, gap: 10 },
  chip: {
    alignSelf: 'flex-start',
    paddingVertical: 4, paddingHorizontal: 12,
    borderRadius: 999,
  },
  chipText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 11, lineHeight: 14,
  },
  answerRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 14, paddingHorizontal: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  answerIconWrap: { marginTop: 2 },
  answerText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 15, lineHeight: 19,
  },
  explanationCard: {
    marginTop: 16,
    padding: 16, borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  bulbWrap: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  navBtn: {
    height: 56, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
    ...Shadows.button,
  },
  navBtnText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16, lineHeight: 20, letterSpacing: 0.1,
  },
});
