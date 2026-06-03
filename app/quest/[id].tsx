import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { Radius, Shadows, Typography } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Easing,
  Image,
  Pressable, StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

function SoundIcon() {
  const { colors, isDark } = useTheme();
  if (isDark) {
    return (
      <Image
        source={require('@/assets/sound.png')}
        style={{ position: 'absolute', top: 10, right: 10, zIndex: 1, width: 44, height: 44 }}
      />
    );
  }
  return (
    <View style={{ position: 'absolute', top: 10, right: 10, zIndex: 1,
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M6.72385 14.4731H3.77001C2.78539 14.4731 1.80078 13.4885 1.80078 11.5192C1.80078 9.55002 2.78539 8.56541 3.77001 8.56541H6.72385L11.6469 4.62695V18.4115L6.72385 14.4731Z" stroke="white" strokeWidth={2.1978} />
        <Path d="M15.584 8.56641C15.584 8.56641 17.0609 9.55102 17.0609 11.5202C17.0609 13.4895 15.584 14.4741 15.584 14.4741" stroke="white" strokeWidth={2.1978} strokeLinecap="square" strokeLinejoin="round" />
        <Path d="M18.5391 5.6123C18.5391 5.6123 21.0006 7.58153 21.0006 11.52C21.0006 15.4584 18.5391 17.4277 18.5391 17.4277" stroke="white" strokeWidth={2.1978} strokeLinecap="square" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────

type QuestStep = 'tf' | 'mc' | 'sentence';
type TFFeedback = 'correct' | 'wrong' | 'reveal' | null;
type McFeedback = 'correct-selected' | 'correct-missed' | 'wrong-selected' | null;

// ── Data ─────────────────────────────────────────────────────────────────────

const STEP_ORDER: QuestStep[] = ['tf', 'mc', 'sentence'];

const MC_ANSWERS = [
  { text: '40' },
  { text: '15' },
  { text: '35' },
  { text: '23' },
];
const MC_CORRECT = new Set([0, 1, 2]);

const SENTENCE_WORDS   = ['вітер', 'вулиці', 'На', 'дощ', 'холодний', 'В'];
const CORRECT_SENTENCE = ['На', 'вулиці', 'холодний', 'вітер'];

// ── Screen ───────────────────────────────────────────────────────────────────

export default function QuestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const { colors, isDark } = useTheme();

  const startStep = (STEP_ORDER.includes(id as QuestStep) ? id : 'tf') as QuestStep;

  const [questStep,     setQuestStep]     = useState<QuestStep>(startStep);
  const [tfAnswer,      setTfAnswer]      = useState<'true' | 'false' | null>(null);
  const [tfChecked,     setTfChecked]     = useState(false);
  const [mcSelected,    setMcSelected]    = useState<Set<number>>(new Set());
  const [mcChecked,     setMcChecked]     = useState(false);
  const [answerTokens,  setAnswerTokens]  = useState<string[]>([]);
  const [bankTokens,    setBankTokens]    = useState<string[]>([...SENTENCE_WORDS]);
  const [showTutorTF,   setShowTutorTF]   = useState(false);
  const [sentencePhase,   setSentencePhase]   = useState<'memorize' | 'answer'>('memorize');
  const [sentenceChecked, setSentenceChecked] = useState(false);

  const questStartTime = useRef(Date.now()).current;
  const getElapsedTime = () => {
    const secs = Math.floor((Date.now() - questStartTime) / 1000);
    return `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
  };

  const stepFade        = useRef(new Animated.Value(1)).current;
  const cardFallY       = useRef(new Animated.Value(0)).current;
  const cardFallRot     = useRef(new Animated.Value(0)).current;
  const cardFallOpacity = useRef(new Animated.Value(1)).current;


  const stepIndex = STEP_ORDER.indexOf(questStep);
  const progress  = (stepIndex + 1) / STEP_ORDER.length;
  const stepLabel = `${stepIndex + 1}/${STEP_ORDER.length}`;

  const goNextWithFade = () => {
    const next = STEP_ORDER[stepIndex + 1];
    Animated.timing(stepFade, { toValue: 0, duration: 130, useNativeDriver: true }).start(() => {
      if (next) {
        setQuestStep(next);
        Animated.timing(stepFade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      } else {
        router.push(`/quest/result?time=${getElapsedTime()}` as any);
      }
    });
  };

  const goBackWithFade = () => {
    const prev = STEP_ORDER[stepIndex - 1];
    if (!prev) { router.back(); return; }
    Animated.timing(stepFade, { toValue: 0, duration: 130, useNativeDriver: true }).start(() => {
      setQuestStep(prev);
      Animated.timing(stepFade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  const tfFeedbackPravda: TFFeedback = tfChecked
    ? (tfAnswer === 'true' ? 'correct' : 'reveal')
    : null;
  const tfFeedbackKhyba: TFFeedback = tfChecked
    ? (tfAnswer === 'false' ? 'wrong' : null)
    : null;

  const handleTfSubmit = () => {
    if (tfAnswer === null || tfChecked) return;
    setTfChecked(true);
    setTimeout(() => {
      setTfChecked(false);
      setTfAnswer(null);
      setShowTutorTF(false);
      goNextWithFade();
    }, 400);
  };

  const getMcFeedback = (i: number): McFeedback => {
    if (!mcChecked) return null;
    const correct  = MC_CORRECT.has(i);
    const selected = mcSelected.has(i);
    if (correct && selected)  return 'correct-selected';
    if (correct && !selected) return 'correct-missed';
    if (!correct && selected) return 'wrong-selected';
    return null;
  };

  const handleMcSubmit = () => {
    if (mcSelected.size === 0 || mcChecked) return;
    setMcChecked(true);
    setTimeout(() => {
      setMcChecked(false);
      setMcSelected(new Set());
      goNextWithFade();
    }, 400);
  };

  const toggleMc = (i: number) => {
    if (mcChecked) return;
    setMcSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const moveTokenToAnswer = (word: string) => {
    setBankTokens(prev => prev.filter(w => w !== word));
    setAnswerTokens(prev => [...prev, word]);
  };

  const moveTokenToBank = (word: string) => {
    setAnswerTokens(prev => prev.filter(w => w !== word));
    setBankTokens(prev => [...prev, word]);
  };

  const handleSentenceSubmit = () => {
    if (sentenceChecked) return;
    setSentenceChecked(true);
    setTimeout(() => {
      Animated.timing(stepFade, { toValue: 0, duration: 130, useNativeDriver: true }).start(() => {
        router.push(`/quest/result?time=${getElapsedTime()}` as any);
      });
    }, 500);
  };

  useEffect(() => {
    if (questStep === 'sentence') {
      setSentencePhase('memorize');
      setSentenceChecked(false);
      cardFallY.setValue(0);
      cardFallRot.setValue(0);
      cardFallOpacity.setValue(1);
      setBankTokens([...SENTENCE_WORDS]);
      setAnswerTokens([]);
    }
  }, [questStep]);

  const startCardFall = () => {
    Animated.parallel([
      Animated.timing(cardFallY, {
        toValue: 900, duration: 520,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(cardFallRot, {
        toValue: 1, duration: 520,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(180),
        Animated.timing(cardFallOpacity, {
          toValue: 0, duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setSentencePhase('answer'));
  };

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top', 'bottom']}>
      <QuestHeader
        onClose={questStep === 'tf' ? () => router.replace('/(tabs)') : goBackWithFade}
        showClose={questStep === 'tf'}
        progress={progress}
        stepLabel={stepLabel}
      />

      <Animated.View style={{ flex: 1, opacity: stepFade }}>

        {/* ── True / False ─────────────────────────────────────────────── */}
        {questStep === 'tf' && (
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
              <View
                style={[s.tfCard, { height: 507, width: '100%', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.70)', backgroundColor: 'transparent' }]}
              >
                <BlurView intensity={isDark ? 40 : 55} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
                <LinearGradient
                  colors={isDark ? ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)'] : ['rgba(255,255,255,0.65)', 'rgba(255,255,255,0.30)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <SoundIcon />
                <Text style={[Typography.eyebrow, { color: colors.charcoal3, textAlign: 'center' }]}>ТВЕРДЖЕННЯ</Text>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={[Typography.h2, { lineHeight: 26, color: colors.ink, textAlign: 'center' }]}>
                    Наш мозок продовжує активно працювати навіть під час сну.
                  </Text>
                </View>
                <View style={s.tfOptions}>
                  <OptionBtn
                    label="Правда"
                    selected={tfAnswer === 'true'}
                    inactive={tfAnswer === 'false'}
                    feedbackState={tfFeedbackPravda}
                    onPress={() => !tfChecked && setTfAnswer('true')}
                    dark
                  />
                  <OptionBtn
                    label="Хиба"
                    selected={tfAnswer === 'false'}
                    inactive={tfAnswer === 'true'}
                    feedbackState={tfFeedbackKhyba}
                    onPress={() => !tfChecked && setTfAnswer('false')}
                    dark
                  />
                </View>
              </View>

              <TutorHint
                visible={showTutorTF}
                text="Подумай про фази сну та консолідацію памʼяті."
              />
            </View>
            <View style={s.footer}>
              <Pressable style={[s.glassBtn, { borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.70)' }]} onPress={() => setShowTutorTF(true)}>
                <BlurView intensity={55} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
                <LinearGradient
                  colors={['rgba(245,138,58,0.18)', 'rgba(245,138,58,0.06)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                {!isDark && (
                  <LinearGradient
                    colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
                    start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="bulb-outline" size={18} color={colors.orange} />
                  <Text style={[s.glassBtnText, { color: colors.ink }]}>Підказка AI-тьютора</Text>
                </View>
              </Pressable>
              <QuestDaliBtn
                label={tfChecked ? 'Перевіряємо…' : 'Далі'}
                pending={tfAnswer === null && !tfChecked}
                onPress={handleTfSubmit}
              />
            </View>
          </View>
        )}

        {/* ── Multiple Choice ───────────────────────────────────────────── */}
        {questStep === 'mc' && (
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
              <View style={[s.mcCard, { width: '100%', height: 507, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.70)', backgroundColor: 'transparent' }]}>
                <BlurView intensity={isDark ? 40 : 55} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
                <LinearGradient
                  colors={isDark ? ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)'] : ['rgba(255,255,255,0.65)', 'rgba(255,255,255,0.30)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <SoundIcon />
                <Text style={[s.mcQuestion, { color: colors.ink }]}>
                  Які числа діляться на 5 без залишку?
                </Text>
                <View style={{ gap: 16, marginTop: 24 }}>
                  {MC_ANSWERS.map((ans, i) => (
                    <McAnswer
                      key={i}
                      text={ans.text}
                      selected={mcSelected.has(i)}
                      feedback={getMcFeedback(i)}
                      onPress={() => toggleMc(i)}
                    />
                  ))}
                </View>
              </View>
            </View>
            <View style={s.footer}>
              <QuestDaliBtn
                label={mcChecked ? 'Перевіряємо…' : 'Далі'}
                pending={mcSelected.size === 0 && !mcChecked}
                onPress={handleMcSubmit}
              />
            </View>
          </View>
        )}

        {/* ── Sentence Reconstruction ───────────────────────────────────── */}
        {questStep === 'sentence' && (
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
              <View style={{ height: 507, width: '100%', overflow: 'visible' }}>

                {/* ── Card 2: Answer task (always underneath) ── */}
                <View style={[s.sentenceCard, {
                  ...StyleSheet.absoluteFillObject,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.70)',
                  backgroundColor: 'transparent',
                }]}>
                  <BlurView intensity={isDark ? 40 : 55} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
                  <LinearGradient
                    colors={isDark ? ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)'] : ['rgba(255,255,255,0.65)', 'rgba(255,255,255,0.30)']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <SoundIcon />
                  <Text style={[s.sentenceLabel, { color: colors.charcoal3 }]}>Відтвори речення</Text>

                  {(() => {
                    const isCorrect = sentenceChecked &&
                      answerTokens.length === CORRECT_SENTENCE.length &&
                      answerTokens.every((w, i) => w === CORRECT_SENTENCE[i]);
                    const isWrong = sentenceChecked && !isCorrect;
                    return (
                      <>
                        <View style={[s.sentenceAnswerSlot, {
                          borderColor:     isCorrect ? '#22C55E' : isWrong ? '#EF4444' : colors.borderDefault,
                          backgroundColor: isCorrect ? 'rgba(34,197,94,0.07)' : isWrong ? 'rgba(239,68,68,0.07)' : colors.bgMuted,
                        }]}>
                          {answerTokens.length === 0 ? (
                            <Text style={[Typography.caption, { color: colors.charcoal3 }]}>Додай слова тут…</Text>
                          ) : (
                            answerTokens.map(w => (
                              <AnswerToken
                                key={w}
                                word={w}
                                onPress={() => !sentenceChecked && moveTokenToBank(w)}
                                isCorrect={isCorrect}
                                isWrong={isWrong}
                              />
                            ))
                          )}
                        </View>

                        <View style={[s.sentenceBank, { marginTop: 16 }]}>
                          {bankTokens.map(w => (
                            <BankToken
                              key={w}
                              word={w}
                              onPress={() => !sentenceChecked && moveTokenToAnswer(w)}
                            />
                          ))}
                        </View>
                      </>
                    );
                  })()}

                </View>

                {/* ── Card 1: Memorize (on top, falls away) ── */}
                {sentencePhase === 'memorize' && (
                  <Animated.View style={[
                    s.sentenceCard,
                    {
                      ...StyleSheet.absoluteFillObject,
                      borderWidth: 1,
                      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.70)',
                      backgroundColor: 'transparent',
                      transform: [
                        { perspective: 1200 },
                        { translateY: cardFallY },
                        { rotate: cardFallRot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '10deg'] }) },
                      ],
                      opacity: cardFallOpacity,
                    },
                  ]}>
                    <BlurView intensity={isDark ? 40 : 55} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
                    <LinearGradient
                      colors={isDark ? ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)'] : ['rgba(255,255,255,0.65)', 'rgba(255,255,255,0.30)']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <SoundIcon />
                    <Text style={[s.sentenceMemTitle, { color: colors.ink }]}>
                      {`Запам'ятай послідовність слів та відтвори речення.`}
                    </Text>

                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <View style={s.sentenceMemRow}>
                        <View style={[s.sentenceMemIcon, { backgroundColor: colors.ink }]}>
                          <Ionicons name="musical-notes" size={18} color={colors.ivory} />
                        </View>
                        <Text style={[s.sentenceMemText, { color: colors.ink }]}>
                          На вулиці холодний вітер.
                        </Text>
                      </View>
                    </View>
                  </Animated.View>
                )}

              </View>
            </View>
            {sentencePhase === 'memorize' && (
              <View style={s.footer}>
                <Button variant="primary" label="Далі" fullWidth onPress={startCardFall} />
              </View>
            )}
            {sentencePhase === 'answer' && (
              <View style={s.footer}>
                <QuestDaliBtn label="Відповісти" onPress={handleSentenceSubmit} />
              </View>
            )}
          </View>
        )}

      </Animated.View>
    </SafeAreaView>
  );
}

function QuestDaliBtn({ label, pending, onPress }: { label: string; pending?: boolean; onPress: () => void }) {
  const { isDark } = useTheme();
  const scale       = useRef(new Animated.Value(1)).current;
  const fillOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const onIn = () => {
    if (pending) return;
    Animated.parallel([
      Animated.spring(scale,       { toValue: 0.94, useNativeDriver: true, tension: 500, friction: 8 }),
      Animated.timing(fillOpacity, { toValue: 1, duration: 40, useNativeDriver: true }),
      Animated.timing(textOpacity, { toValue: 1, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const onOut = () => {
    if (pending) return;
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
    return <Button variant="primary" label={label} fullWidth pending={pending} onPress={onPress} />;
  }

  return (
    <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
      <Pressable
        onPress={pending ? undefined : onPress}
        onPressIn={onIn}
        onPressOut={onOut}
        style={[s.daliBtn, { backgroundColor: pending ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)', overflow: 'hidden' }]}
      >
        <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.88)', opacity: fillOpacity }]} />
        <Animated.Text style={[s.daliBtnText, { color: '#FFFFFF', opacity: textOpacity.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
          {label}
        </Animated.Text>
        <Animated.Text style={[s.daliBtnText, { color: '#000000', opacity: textOpacity, position: 'absolute' }]}>
          {label}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

// ── QuestHeader ───────────────────────────────────────────────────────────────

function QuestHeader({
  onClose, showClose, progress, stepLabel,
}: {
  onClose: () => void;
  showClose: boolean;
  progress: number;
  stepLabel: string;
}) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const topPad = width <= 480 ? 10 : 59;
  return (
    <View style={[s.topnav, { paddingTop: topPad }]}>
      <Pressable onPress={onClose} style={s.iconBtn}>
        <Ionicons name={showClose ? 'close' : 'chevron-back'} size={22} color={colors.ink} />
      </Pressable>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {isDark ? (
          <View style={{ height: 14, justifyContent: 'center' }}>
            {/* track */}
            <View style={{
              position: 'absolute', left: 0, right: 0,
              height: 8, backgroundColor: '#27272F', borderRadius: 50,
            }} />
            {/* fill + glow */}
            <View style={{ position: 'absolute', left: 0, width: `${progress * 100}%` as any, height: 14 }}>
              <View style={{
                position: 'absolute', left: 0, right: 0, top: 3,
                height: 8, backgroundColor: '#FB853C', borderRadius: 50, overflow: 'hidden',
              }}>
                <LinearGradient
                  colors={['rgba(243,96,43,0)', '#F94F11', '#FB853C']}
                  start={{ x: 1, y: 0.54 }} end={{ x: 0, y: 0.54 }}
                  style={{ position: 'absolute', left: 4, top: -2, right: 0, bottom: -2 }}
                />
              </View>
              {/* glow tip */}
              <View style={{
                position: 'absolute', right: -6, top: 0,
                width: 13, height: 14,
                backgroundColor: '#B1134B', borderRadius: 6,
                shadowColor: '#B1134B', shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1, shadowRadius: 5,
              }} />

            </View>
          </View>
        ) : (
          <ProgressBar value={progress} height={8} />
        )}
      </View>
      <Text style={[Typography.caption, { minWidth: 32, textAlign: 'right' }]}>{stepLabel}</Text>
    </View>
  );
}

// ── TutorHint ─────────────────────────────────────────────────────────────────

function TutorHint({ visible, text }: { visible: boolean; text: string }) {
  const { colors } = useTheme();
  if (!visible) return null;
  return (
    <View style={[s.tutorCard, { backgroundColor: colors.bgMuted, borderColor: colors.borderSubtle }]}>
      <LinearGradient
        colors={[colors.orange, colors.yellow]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.tutorAvatar}
      >
        <Ionicons name="information-circle-outline" size={18} color={colors.ink} />
      </LinearGradient>
      <Text style={[Typography.bodySm, { flex: 1 }]}>
        <Text style={{ fontFamily: 'Montserrat_700Bold' }}>Підказка AI-тьютора. </Text>
        {text}
      </Text>
    </View>
  );
}

// ── OptionBtn (True/False) ────────────────────────────────────────────────────

function OptionBtn({
  label, selected, inactive = false, feedbackState, onPress, dark = false,
}: {
  label: string;
  selected: boolean;
  inactive?: boolean;
  feedbackState: TFFeedback;
  onPress: () => void;
  dark?: boolean;
}) {
  const { colors, isDark } = useTheme();
  const scale       = useRef(new Animated.Value(1)).current;
  const shake       = useRef(new Animated.Value(0)).current;
  const fillOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const dimOpacity  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isDark || feedbackState) return;
    Animated.timing(dimOpacity, {
      toValue: inactive ? 0.35 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [inactive, isDark, feedbackState]);

  useEffect(() => {
    if (feedbackState === 'wrong') {
      Animated.sequence([
        Animated.timing(shake, { toValue: 9,  duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -9, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 6,  duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -4, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0,  duration: 45, useNativeDriver: true }),
      ]).start();
    }
    if (feedbackState === 'correct') {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.05, useNativeDriver: true, tension: 400, friction: 8 }),
        Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 200, friction: 8 }),
      ]).start();
    }
  }, [feedbackState]);

  const onIn = () => {
    if (feedbackState) return;
    if (isDark) {
      Animated.parallel([
        Animated.spring(scale,       { toValue: 0.94, useNativeDriver: true, tension: 500, friction: 8 }),
        Animated.timing(fillOpacity, { toValue: 1, duration: 40, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 1, duration: 40, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 20 }).start();
    }
  };

  const onOut = () => {
    if (feedbackState) return;
    if (isDark) {
      Animated.parallel([
        Animated.sequence([
          Animated.spring(scale, { toValue: 1.05, useNativeDriver: true, tension: 600, friction: 7 }),
          Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 400, friction: 10 }),
        ]),
        Animated.timing(fillOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 20 }).start();
    }
  };

  const correctColor = isDark ? '#22A854' : colors.sageDeep;
  const wrongColor   = isDark ? '#E03535' : colors.orangeDeep;

  const bgColor =
    feedbackState === 'correct' ? correctColor :
    feedbackState === 'wrong'   ? wrongColor :
    feedbackState === 'reveal'  ? (isDark ? 'rgba(34,168,84,0.15)' : 'rgba(143,167,100,0.12)') :
    selected                    ? (isDark ? 'rgba(255,255,255,0.88)' : '#000000') :
    isDark                      ? 'rgba(255,255,255,0.12)' :
    dark                        ? 'rgba(0,0,0,0.15)' :
    colors.bgMuted;

  const borderColor =
    feedbackState === 'correct' ? 'transparent' :
    feedbackState === 'wrong'   ? 'transparent' :
    feedbackState === 'reveal'  ? correctColor :
    selected                    ? 'transparent' :
    isDark                      ? 'rgba(255,255,255,0.20)' :
    dark                        ? 'rgba(0,0,0,0.12)' :
    colors.borderSubtle;

  const textColor =
    feedbackState === 'correct' ? colors.onDark :
    feedbackState === 'wrong'   ? colors.onDark :
    feedbackState === 'reveal'  ? correctColor :
    selected                    ? (isDark ? '#000000' : '#FFFFFF') :
    isDark                      ? '#FFFFFF' :
    dark                        ? 'rgba(0,0,0,0.35)' :
    colors.charcoal;

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }, { translateX: shake }], opacity: dimOpacity }}>
      <Pressable
        onPress={onPress}
        onPressIn={onIn}
        onPressOut={onOut}
        style={[s.optBtn, { backgroundColor: bgColor, borderColor, overflow: 'hidden' }, feedbackState === 'correct' && Shadows.button]}
      >
        {isDark && !feedbackState && !selected && (
          <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.88)', opacity: fillOpacity }]} />
        )}
        {feedbackState === 'correct' && (
          <Ionicons name="checkmark" size={18} color={colors.onDark} style={{ marginRight: 4 }} />
        )}
        {feedbackState === 'wrong' && (
          <Ionicons name="close" size={18} color={colors.onDark} style={{ marginRight: 4 }} />
        )}
        {feedbackState === 'reveal' && (
          <Ionicons name="checkmark-circle-outline" size={18} color={correctColor} style={{ marginRight: 4 }} />
        )}
        {isDark && !feedbackState && !selected ? (
          <>
            <Animated.Text style={[s.optLabel, { color: '#FFFFFF', opacity: textOpacity.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
              {label}
            </Animated.Text>
            <Animated.Text style={[s.optLabel, { color: '#000000', opacity: textOpacity, position: 'absolute' }]}>
              {label}
            </Animated.Text>
          </>
        ) : (
          <Text style={[s.optLabel, { color: textColor }]}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ── McAnswer ──────────────────────────────────────────────────────────────────

function McAnswer({
  text, selected, feedback, onPress,
}: {
  text: string;
  selected: boolean;
  feedback: McFeedback;
  onPress: () => void;
}) {
  const { colors, isDark } = useTheme();
  const shake = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (feedback === 'wrong-selected') {
      Animated.sequence([
        Animated.timing(shake, { toValue: 8,  duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -8, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 5,  duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0,  duration: 45, useNativeDriver: true }),
      ]).start();
    }
  }, [feedback]);

  useEffect(() => {
    if (selected) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 260, friction: 5 }),
      ]).start();
    } else {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 18 }).start();
    }
  }, [selected]);

  const onIn  = () => !feedback && Animated.timing(scale, { toValue: 0.97, duration: 60, useNativeDriver: true }).start();
  const onOut = () => !feedback && !selected && Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 18 }).start();

  const correctColor = isDark ? '#22A854' : colors.sageDeep;
  const wrongColor   = isDark ? '#E03535' : colors.orangeDeep;

  const checkboxBg =
    feedback === 'correct-selected' ? correctColor :
    feedback === 'wrong-selected'   ? wrongColor :
    selected                        ? colors.ink : 'transparent';

  const checkboxBorderColor =
    feedback === 'correct-selected' ? correctColor :
    feedback === 'wrong-selected'   ? wrongColor :
    feedback === 'correct-missed'   ? correctColor :
    colors.ink;

  const rowBg =
    feedback === 'correct-selected' ? `${correctColor}18` :
    feedback === 'correct-missed'   ? `${correctColor}0D` :
    feedback === 'wrong-selected'   ? `${wrongColor}18` :
    isDark                          ? 'rgba(255,255,255,0.06)' :
    '#F6F6F6';

  const rowBorderColor =
    feedback === 'correct-selected' ? correctColor :
    feedback === 'correct-missed'   ? correctColor :
    feedback === 'wrong-selected'   ? wrongColor :
    colors.ink;

  const rowBorderStyle: any =
    feedback === 'correct-missed' ? 'dashed' : 'solid';

  const showCheck = (selected && !feedback) || feedback === 'correct-selected';

  return (
    <Animated.View style={{ transform: [{ translateX: shake }, { scale }] }}>
      <Pressable onPress={feedback ? undefined : onPress} onPressIn={onIn} onPressOut={onOut}
        style={[s.mcAnswerRow, { backgroundColor: rowBg, borderColor: rowBorderColor, borderStyle: rowBorderStyle }, Shadows.soft]}>
        <View style={[s.mcCheckbox, { backgroundColor: checkboxBg, borderColor: checkboxBorderColor }]}>
          {showCheck && <Ionicons name="checkmark" size={14} color={colors.ivory} />}
          {feedback === 'wrong-selected' && <Ionicons name="close" size={14} color={colors.ivory} />}
        </View>
        <Text style={[s.mcAnswerText, { color: colors.ink, flex: 1 }]}>{text}</Text>
        {feedback === 'correct-selected' && (
          <Text style={[Typography.caption, { color: correctColor }]}>правильно</Text>
        )}
        {feedback === 'wrong-selected' && (
          <Text style={[Typography.caption, { color: wrongColor }]}>неправильно</Text>
        )}
        {feedback === 'correct-missed' && (
          <Text style={[Typography.caption, { color: correctColor }]}>правильна</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ── AnswerToken ───────────────────────────────────────────────────────────────

function AnswerToken({
  word, onPress, isCorrect, isWrong,
}: {
  word: string;
  onPress: () => void;
  isCorrect: boolean;
  isWrong: boolean;
}) {
  const { colors, isDark } = useTheme();
  const scale   = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, useNativeDriver: true, tension: 300, friction: 5 }),
      Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const borderColor = isCorrect ? '#22C55E' : isWrong ? '#EF4444' : colors.ink;
  const bgColor     = isCorrect ? 'rgba(34,197,94,0.14)' : isWrong ? 'rgba(239,68,68,0.14)' : isDark ? 'rgba(255,255,255,0.08)' : '#F6F6F6';

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <Pressable onPress={onPress} style={[s.sentenceToken, { borderColor, backgroundColor: bgColor }]}>
        <Text style={[s.sentenceTokenText, { color: isCorrect ? '#22C55E' : isWrong ? '#EF4444' : colors.ink }]}>
          {word}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ── BankToken ─────────────────────────────────────────────────────────────────

function BankToken({ word, onPress }: { word: string; onPress: () => void }) {
  const { colors, isDark } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onIn  = () => Animated.timing(scale, { toValue: 0.93, duration: 80, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 280, friction: 4 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={onPress} onPressIn={onIn} onPressOut={onOut}
        style={[s.sentenceToken, { borderColor: colors.ink, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F6F6F6' }]}>
        <Text style={[s.sentenceTokenText, { color: colors.ink }]}>{word}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen:  { flex: 1 },
  scroll:  { flex: 1 },
  topnav:  {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingTop: 59, paddingBottom: 10,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  footer:  { paddingHorizontal: 24, paddingBottom: 24, gap: 10 },
  tfCard: {
    padding: 26, borderRadius: 24, marginTop: 20,
    overflow: 'hidden',
    ...Shadows.card,
  },
  tfOptions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  optBtn: {
    height: 56, borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    ...Shadows.soft,
  },
  optLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16, lineHeight: 20,
  },
  answerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  answerLetter: {
    width: 30, height: 30, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  tokenSlot: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    minHeight: 64, padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1, borderStyle: 'dashed',
  },
  tokenBank: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  token: {
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12,
    borderWidth: 1,
    ...Shadows.soft,
  },
  tokenSage: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  tokenText: {
    fontFamily: 'Montserrat_600SemiBold', fontSize: 15, lineHeight: 18,
  },
  tutorCard: {
    flexDirection: 'row', gap: 12, padding: 14, borderRadius: 18,
    borderWidth: 1, marginTop: 20,
    ...Shadows.soft,
  },
  tutorAvatar: {
    width: 36, height: 36, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
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
  daliBtn: {
    height: 56, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
    ...Shadows.button,
  },
  daliBtnText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16, lineHeight: 20, letterSpacing: 0.1,
  },
  mcCard: {
    padding: 26,
    paddingTop: 72,
    borderRadius: 24,
    overflow: 'hidden',
    ...Shadows.card,
  },
  mcHintBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mcQuestion: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 24,
    lineHeight: 31,
    textAlign: 'center',
  },
  mcAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 10,
    borderWidth: 1,
  },
  mcCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mcAnswerText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  sentenceCard: {
    borderRadius: 24,
    padding: 26,
    overflow: 'hidden',
    ...Shadows.card,
  },
  sentenceLabel: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  sentenceAnswerSlot: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    minHeight: 56,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
  },
  sentenceBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sentenceToken: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentenceTokenText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  sentenceMemTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 24,
    lineHeight: 31,
    textAlign: 'center',
  },
  sentenceMemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sentenceMemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sentenceMemText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
    flex: 1,
  },
  sentenceSubmitBtn: {
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentenceSubmitText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
});
