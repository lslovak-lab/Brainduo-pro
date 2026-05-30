import { Button } from '@/components/Button';
import { Confetti } from '@/components/Confetti';
import { ProgressBar } from '@/components/ProgressBar';
import { useTheme } from '@/lib/ThemeContext';
import { Radius, Typography } from '@/lib/theme';

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Easing,
  Image,
  KeyboardAvoidingView, Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text, TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Step = 'splash' | 'authMethod' | 'signup' | 'goalpath' | 'goals' | 'topicChoice' | 'quiz' | 'quizResult';
type GoalKey = 'focus' | 'logic' | 'memory' | 'concentration';

const QUIZ_ANSWERS = [
  { letter: 'А', text: 'Тільки лютий', correct: false },
  { letter: 'Б', text: 'Усі 12',       correct: true  },
  { letter: 'В', text: 'Один',         correct: false },
  { letter: 'Г', text: 'Жодного',      correct: false },
];

// ── Root ──────────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const router = useRouter();
  const { colors } = useTheme();

  const [step, setStep]             = useState<Step>('splash');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [pathChoice, setPathChoice] = useState<'auto' | 'manual' | null>(null);
  const [goals, setGoals]           = useState<Set<GoalKey>>(new Set());
  const [quizAnswer,   setQuizAnswer]   = useState<number | null>(null);
  const [showHint,     setShowHint]     = useState(false);
  const [topicChoice,  setTopicChoice]  = useState<string | null>(null);

  const pageAnim  = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const go = (next: Step) => {
    Animated.parallel([
      Animated.timing(pageAnim,  { toValue: 0,   duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -16, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      slideAnim.setValue(16);
      Animated.parallel([
        Animated.timing(pageAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 220, friction: 24 }),
      ]).start();
    });
  };

  const toHome = () => router.replace('/(tabs)');

  const toggleGoal = (key: GoalKey) => {
    setGoals(prev => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); }
      else next.add(key);
      return next;
    });
  };

  const renderStep = () => {
    if (step === 'splash')      return <SplashStep onStart={() => go('authMethod')} onSkip={toHome} />;
    if (step === 'authMethod')  return <AuthMethodStep onEmail={() => go('signup')} />;
    if (step === 'signup')      return <SignUpStep onBack={() => go('authMethod')} onNext={() => go('goalpath')} email={email} setEmail={setEmail} password={password} setPassword={setPassword} />;
    if (step === 'goalpath')   return <GoalPathStep onBack={() => go('signup')} onNext={() => go(pathChoice === 'auto' ? 'quiz' : 'goals')} pathChoice={pathChoice} setPathChoice={setPathChoice} />;
    if (step === 'goals')      return <GoalsStep onBack={() => go('goalpath')} onNext={() => go('topicChoice')} goals={goals} toggleGoal={toggleGoal} />;
    if (step === 'topicChoice') return <TopicChoiceStep onBack={() => go('goals')} onNext={toHome} topicChoice={topicChoice} setTopicChoice={setTopicChoice} />;
    if (step === 'quiz')       return <QuizStep onBack={() => go('goalpath')} onNext={() => go('quizResult')} quizAnswer={quizAnswer} setQuizAnswer={setQuizAnswer} showHint={showHint} setShowHint={setShowHint} />;
    if (step === 'quizResult') return <QuizResultStep onHome={toHome} />;
    return null;
  };

  return (
    <View style={[{ flex: 1 }, { backgroundColor: colors.ivory }]}>
      <Animated.View style={{ flex: 1, opacity: pageAnim, transform: [{ translateY: slideAnim }] }}>
        {renderStep()}
      </Animated.View>
    </View>
  );
}

// ── Splash ────────────────────────────────────────────────────────────────────

function SplashStep({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top', 'bottom']}>
      <View style={[s.glowBg, { backgroundColor: colors.yellowSoft }]} pointerEvents="none" />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <View style={s.logoFloat}>
          <Image
            source={require('../../assets/images.png')}
            style={{ width: 520, height: 520 }}
            resizeMode="contain"
          />
        </View>
        <Text style={[s.wordmark, { color: colors.ink }]}>BRAINDUO</Text>
        <Text style={[Typography.body, { textAlign: 'center', maxWidth: 280, marginTop: 14, color: colors.charcoal }]}>
          Майданчик для твоїх щоденних{'\n'}інтелектуальних перемог
        </Text>
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: 30, gap: 10 }}>
        <Button variant="primary" label="Розпочати" fullWidth onPress={onStart} />
        <Pressable style={[s.glassBtn, { borderColor: 'rgba(255,255,255,0.70)' }]} onPress={onSkip}>
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
          <Text style={[s.glassBtnText, { color: colors.ink }]}>Пропустити</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ── Auth Method ───────────────────────────────────────────────────────────────

function AuthMethodBtn({
  icon, activeIcon, label, active, onPress, colors,
}: {
  icon: React.ReactNode; activeIcon: React.ReactNode; label: string;
  active: boolean; onPress: () => void; colors: any;
}) {
  const scale    = useRef(new Animated.Value(1)).current;
  const activeAnim = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(activeAnim, {
      toValue: active ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [active]);

  const bgColor   = activeAnim.interpolate({ inputRange: [0, 1], outputRange: ['transparent', colors.ink] });
  const textColor = activeAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.ink, colors.ivory] });

  const onIn  = () => Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 280, friction: 4 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onIn}
        onPressOut={onOut}
      >
        <Animated.View style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
          paddingHorizontal: 20, paddingVertical: 12, borderRadius: 44,
          borderWidth: 1.3, borderColor: colors.ink,
          backgroundColor: bgColor,
        }}>
          {active ? activeIcon : icon}
          <Animated.Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 16, lineHeight: 24, color: textColor }}>
            {label}
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function AuthMethodStep({ onEmail }: { onEmail: () => void }) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<'google' | 'apple' | 'email' | null>(null);

  const handlePress = (method: 'google' | 'apple' | 'email') => {
    setSelected(method);
    if (method === 'email') onEmail();
  };

  return (
    <View style={[s.screen, { backgroundColor: '#FAFFE9' }]}>

      {/* Rotated logo image */}
      <View style={{ position: 'absolute', top: 0, bottom: 350, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-3deg' }] }} pointerEvents="none">
        <Image source={require('../../assets/images.png')} style={{ width: 500, height: 500 }} resizeMode="contain" />
      </View>

      <SafeAreaView style={{ flex: 1, justifyContent: 'flex-end' }} edges={['top', 'bottom']}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          <Text style={{ fontFamily: 'Montserrat_500Medium', fontSize: 28, lineHeight: 34, textAlign: 'center', color: colors.ink, marginBottom: 16 }}>
            Досліджуй застосунок
          </Text>
          <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 16, lineHeight: 22, textAlign: 'center', color: colors.ink, marginBottom: 48 }}>
            Майданчик для твоїх щоденних інтелектуальних перемог
          </Text>

          <View style={{ gap: 12, marginBottom: 52 }}>
            <AuthMethodBtn
              icon={<Ionicons name="logo-google" size={20} color="#4285F4" />}
              activeIcon={<Ionicons name="logo-google" size={20} color={colors.ivory} />}
              label="Увійти за допомогою Google"
              active={selected === 'google'}
              onPress={() => handlePress('google')}
              colors={colors}
            />
            <AuthMethodBtn
              icon={<Ionicons name="logo-apple" size={20} color={colors.ink} />}
              activeIcon={<Ionicons name="logo-apple" size={20} color={colors.ivory} />}
              label="Увійти за допомогою Apple"
              active={selected === 'apple'}
              onPress={() => handlePress('apple')}
              colors={colors}
            />
            <AuthMethodBtn
              icon={<Ionicons name="mail-outline" size={20} color={colors.ink} />}
              activeIcon={<Ionicons name="mail" size={20} color={colors.ivory} />}
              label="Електронна пошта"
              active={selected === 'email'}
              onPress={() => handlePress('email')}
              colors={colors}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline', gap: 4 }}>
            <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 12, lineHeight: 18, color: colors.ink }}>
              Вже маєте акаунт?{' '}
            </Text>
            <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 12, lineHeight: 18, color: colors.orange, textDecorationLine: 'underline' }}>
              Увійти
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ── Sign Up ───────────────────────────────────────────────────────────────────

function SignUpStep({
  onBack, onNext, email, setEmail, password, setPassword,
}: {
  onBack: () => void; onNext: () => void;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const topPad = width <= 480 ? 10 : 71;
  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={[s.topnav, { paddingTop: topPad }]}>
          <IconBtn onPress={onBack} icon="chevron-back" />
          <StepPips total={3} current={0} />
          <View style={{ width: 44 }} />
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={[Typography.display, { marginTop: 6, textAlign: 'center' }]}>Створи акаунт</Text>
          <Text style={[Typography.body, { marginTop: 8, textAlign: 'center' }]}>
            Увійди, щоб зберігати прогрес і синхронізувати між пристроями.
          </Text>

          <View style={{ marginTop: 28, gap: 0 }}>
            <Field label="EMAIL">
              <TextInput
                style={[s.input, { backgroundColor: colors.paper, borderColor: colors.borderDefault, color: colors.ink }]}
                placeholder="імʼя@gmail.com"
                placeholderTextColor={colors.charcoal3}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </Field>
            <Field label="ПАРОЛЬ">
              <TextInput
                style={[s.input, { backgroundColor: colors.paper, borderColor: colors.borderDefault, color: colors.ink }]}
                placeholder="••••••••"
                placeholderTextColor={colors.charcoal3}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </Field>
          </View>

          <View style={{ marginTop: 20 }}>
            <Button variant="primary" label="Продовжити" fullWidth pending={!email.trim() || !password.trim()} onPress={onNext} />
          </View>

          <Divider label="або" />

          <Text style={[Typography.caption, { textAlign: 'center' }]}>Увійти за допомогою</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 12 }}>
            <SocialBtn icon="logo-apple" />
            <SocialBtn icon="logo-google" />
            <SocialBtn icon="mail-outline" />
          </View>

          <Text style={[Typography.caption, { textAlign: 'center', maxWidth: 260, alignSelf: 'center', marginTop: 24 }]}>
            Продовжуючи, ви приймаєте нашу{' '}
            <Text style={{ textDecorationLine: 'underline' }}>Політику конфіденційності</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Goal Path ─────────────────────────────────────────────────────────────────

function GoalPathStep({
  onBack, onNext, pathChoice, setPathChoice,
}: {
  onBack: () => void; onNext: () => void;
  pathChoice: 'auto' | 'manual' | null;
  setPathChoice: (v: 'auto' | 'manual') => void;
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const topPad = width <= 480 ? 10 : 71;
  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top', 'bottom']}>
      <View style={[s.topnav, { paddingTop: topPad }]}>
        <IconBtn onPress={onBack} icon="chevron-back" />
        <StepPips total={3} current={1} />
        <View style={{ width: 44 }} />
      </View>

      <View style={s.stepContent}>
        <View>
          <Text style={[Typography.display, { marginTop: 6 }]}>Оберіть шлях</Text>
          <Text style={[Typography.body, { marginTop: 8 }]}>Можна змінити пізніше в налаштуваннях.</Text>
        </View>

        <View style={{ gap: 12, marginTop: 28 }}>
          <PathCard
            badge="Рекомендовано"
            title="Визначити мій рівень"
            desc="Швидкий тест — і ШІ підлаштує програму під твої сильні сторони."
            active={pathChoice === 'auto'}
            glowColor={colors.orangeSoft}
            onPress={() => setPathChoice('auto')}
          />
          <PathCard
            badge="Самостійно"
            title="Обирати теми самостійно"
            desc="Сам обирай напрямки тренування — повний контроль."
            active={pathChoice === 'manual'}
            glowColor={colors.yellowSoft}
            onPress={() => setPathChoice('manual')}
          />
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ paddingBottom: 12 }}>
          <Button variant="primary" label="Продовжити" fullWidth pending={pathChoice === null} onPress={onNext} />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ── Goals ─────────────────────────────────────────────────────────────────────

function GoalsStep({
  onBack, onNext, goals, toggleGoal,
}: {
  onBack: () => void; onNext: () => void;
  goals: Set<GoalKey>; toggleGoal: (k: GoalKey) => void;
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const topPad = width <= 480 ? 10 : 71;

  const GOALS: { key: GoalKey; title: string; meta: string; icon: string; accent: string }[] = [
    { key: 'focus',         title: 'Увага',        meta: 'Фокус · 5–15 хв', icon: 'eye-outline',             accent: colors.orange    },
    { key: 'logic',         title: 'Логіка',       meta: 'Аргументи',        icon: 'analytics-outline',       accent: colors.sageDeep  },
    { key: 'memory',        title: "Памʼять",       meta: 'Утримання',        icon: 'layers-outline',          accent: colors.orangeDeep },
    { key: 'concentration', title: 'Концентрація',  meta: 'Тривалість',       icon: 'radio-button-on-outline', accent: colors.sage2     },
  ];

  const hasGoals = goals.size > 0;

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top', 'bottom']}>
      <View style={[s.topnav, { paddingTop: topPad }]}>
        <IconBtn onPress={onBack} icon="chevron-back" />
        <StepPips total={3} current={2} />
        <View style={{ width: 44 }} />
      </View>

      <View style={s.goalsWrap}>
        <View>
          <Text style={[Typography.display, { marginTop: 6 }]}>Оберіть цілі</Text>
          <Text style={[Typography.bodySm, { marginTop: 7 }]}>
            Обери одну або кілька — будемо{'\n'}комбінувати їх у щоденних квестах.
          </Text>
        </View>

        <View style={s.goalsGrid}>
          {GOALS.map((g) => (
            <GoalTile
              key={g.key}
              title={g.title}
              selected={goals.has(g.key)}
              onPress={() => toggleGoal(g.key)}
            />
          ))}
        </View>

        <TutorHint text="ШІ не дає готових відповідей — він допомагає тобі думати краще." />

        <View style={{ marginTop: 14, paddingBottom: 12 }}>
          <Button
            variant="primary"
            label="Розпочати тест рівня"
            fullWidth
            pending={!hasGoals}
            onPress={onNext}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ── Quiz ──────────────────────────────────────────────────────────────────────

function QuizStep({
  onBack, onNext, quizAnswer, setQuizAnswer, showHint, setShowHint,
}: {
  onBack: () => void; onNext: () => void;
  quizAnswer: number | null; setQuizAnswer: (i: number) => void;
  showHint: boolean; setShowHint: (v: boolean) => void;
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const topPad = width <= 480 ? 10 : 59;
  const hintAnim   = useRef(new Animated.Value(0)).current;
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (showHint) {
      Animated.spring(hintAnim, { toValue: 1, useNativeDriver: true, tension: 200, friction: 22 }).start();
    }
  }, [showHint]);

  const handleSubmit = () => {
    if (!checked) { setChecked(true); return; }
    onNext();
  };

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top', 'bottom']}>
      <View style={[s.topnav, { marginTop: topPad }]}>
        <IconBtn onPress={onBack} icon="chevron-back" />
        <View style={{ flex: 1, paddingHorizontal: 14 }}>
          <ProgressBar value={0.33} height={8} />
        </View>
        <Text style={[Typography.caption, { minWidth: 30, textAlign: 'right' }]}>1/3</Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        <View style={s.quizCard}>
          <Pressable style={[s.quizHintBtn, { backgroundColor: colors.ink }]} onPress={() => setShowHint(true)}>
            <Ionicons name="musical-notes" size={18} color={colors.ivory} />
          </Pressable>

          <Text style={[s.quizQuestion, { color: colors.ink }]}>
            Скільки місяців у році мають 28 днів?
          </Text>

          <View style={{ gap: 16, marginTop: 20 }}>
            {QUIZ_ANSWERS.map((ans, i) => (
              <QuizAnswer
                key={i}
                text={ans.text}
                selected={quizAnswer === i}
                feedback={checked ? (ans.correct ? 'correct' : quizAnswer === i ? 'wrong' : null) : null}
                onPress={() => !checked && setQuizAnswer(i)}
              />
            ))}
          </View>
        </View>

        {showHint && (
          <Animated.View style={{
            opacity: hintAnim,
            transform: [{ translateY: hintAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
            marginTop: 16,
          }}>
            <TutorHint text="Перевір тлумачення: «мають» означає «принаймні 28», а не «рівно 28»." />
          </Animated.View>
        )}
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <Button
          variant="primary"
          label={checked ? 'Продовжити' : 'Відповісти'}
          fullWidth
          pending={quizAnswer === null && !checked}
          onPress={handleSubmit}
        />
      </View>
    </SafeAreaView>
  );
}

// ── Quiz Result ───────────────────────────────────────────────────────────────

function QuizResultStep({ onHome }: { onHome: () => void }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const topPad = width <= 480 ? 10 : 79;
  const [showConfetti, setShowConfetti] = useState(true);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4200);

    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 80,  useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 900,  useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 900,  useNativeDriver: true }),
      ])
    ).start();

    return () => clearTimeout(t);
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.10, 0.28] });

  return (
    <View style={[s.screen, { backgroundColor: colors.ivory }]}>
      <Confetti active={showConfetti} />

      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { opacity: glowOpacity }]}
      >
        <LinearGradient
          colors={[colors.orange, colors.yellow, 'transparent']}
          start={{ x: 0.5, y: 0.3 }} end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: '#fff', opacity: flashAnim }]}
      />

      <View style={[s.glowBg, { backgroundColor: colors.yellowSoft }]} pointerEvents="none" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={{ paddingHorizontal: 24, paddingTop: topPad }}>
          <Text style={Typography.eyebrow}>РЕЗУЛЬТАТ</Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <ResultRing pct={85} label="точність" strokeColor={colors.yellow} />
          <Text style={[Typography.display, { marginTop: 24, textAlign: 'center' }]}>Ти молодець!</Text>
          <Text style={[Typography.body, { marginTop: 8, textAlign: 'center' }]}>
            Чудовий результат — ти успішно подолав цей етап.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 24, paddingBottom: 24, gap: 10 }}>
          <Button variant="primary" label="До головної" fullWidth onPress={onHome} />
          <Pressable style={[s.glassBtn, { borderColor: 'rgba(255,255,255,0.70)' }]} onPress={onHome}>
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
        </View>
      </SafeAreaView>
    </View>
  );
}

// ── TopicChoiceStep ───────────────────────────────────────────────────────────

const TOPIC_OPTIONS = [
  'Рекомендований мікс завдань',
  'Головоломки',
  "Завдання на пам'ять",
];

function TopicChoiceStep({
  onBack, onNext, topicChoice, setTopicChoice,
}: {
  onBack: () => void; onNext: () => void;
  topicChoice: string | null; setTopicChoice: (v: string) => void;
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const topPad = width <= 480 ? 10 : 71;

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top', 'bottom']}>
      <View style={[s.topnav, { paddingTop: topPad }]}>
        <IconBtn onPress={onBack} icon="chevron-back" />
        <View style={{ flex: 1 }} />
        <View style={{ width: 44 }} />
      </View>

      <View style={s.topicWrap}>
        <Text style={[s.topicTitle, { color: colors.ink }]}>Оберіть тему тренування</Text>

        <View style={{ gap: 16, marginTop: 24 }}>
          {TOPIC_OPTIONS.map(topic => (
            <TopicCard
              key={topic}
              label={topic}
              selected={topicChoice === topic}
              onPress={() => setTopicChoice(topic)}
            />
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ paddingBottom: 12 }}>
          <Button
            variant="primary"
            label="Продовжити"
            fullWidth
            pending={topicChoice === null}
            onPress={topicChoice !== null ? onNext : undefined}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ── TopicCard ─────────────────────────────────────────────────────────────────

function TopicCard({
  label, selected, onPress,
}: {
  label: string; selected: boolean; onPress: () => void;
}) {
  const { colors, gradients } = useTheme();
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const selectScale = useRef(new Animated.Value(1)).current;
  const prevSel    = useRef(selected);

  useEffect(() => {
    const wasSelected = prevSel.current;
    prevSel.current = selected;
    if (selected && !wasSelected) {
      Animated.sequence([
        Animated.timing(selectScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
        Animated.spring(selectScale, { toValue: 1, useNativeDriver: true, tension: 220, friction: 6 }),
      ]).start();
    }
  }, [selected]);

  const onPressIn  = () => Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 280, friction: 4 }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }, { scale: selectScale }] }}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
        style={{ borderRadius: 10, overflow: 'hidden' }}>
        {selected ? (
          <LinearGradient colors={gradients.sage} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.topicCardInner}>
            <Text style={[s.topicCardText, { color: colors.ink }]}>{label}</Text>
          </LinearGradient>
        ) : (
          <View style={[s.topicCardInner, { backgroundColor: colors.paper }]}>
            <Text style={[s.topicCardText, { color: colors.ink }]}>{label}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ── GoalTile ──────────────────────────────────────────────────────────────────

function GoalTile({
  title, selected, onPress,
}: {
  title: string; selected: boolean; onPress: () => void;
}) {
  const { colors } = useTheme();

  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const checkAnim  = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const prevSel    = useRef(selected);

  useEffect(() => {
    const wasSelected = prevSel.current;
    prevSel.current = selected;

    Animated.spring(borderAnim, { toValue: selected ? 1 : 0, useNativeDriver: false, tension: 200, friction: 20 }).start();
    Animated.spring(checkAnim,  { toValue: selected ? 1 : 0, useNativeDriver: true,  tension: 360, friction: 12 }).start();

    if (selected && !wasSelected) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.93, duration: 85, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 280, friction: 4 }),
      ]).start();
    }
  }, [selected]);

  const onPressIn  = () => Animated.timing(scaleAnim, { toValue: 0.94, duration: 90, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 280, friction: 4 }).start();

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#979797', colors.ink],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Animated.View style={[s.goalTileRow, { backgroundColor: '#FFFFFF', borderColor }]}>
        <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
          style={s.goalTileInner}>
          <Text style={[s.goalTileText, { color: colors.ink }]}>{title}</Text>
          <View style={[s.goalCheckbox, {
            borderColor: selected ? colors.ink : '#979797',
            backgroundColor: selected ? colors.ink : 'transparent',
          }]}>
            <Animated.View style={{ transform: [{ scale: checkAnim }] }}>
              <Ionicons name="checkmark" size={18} color={colors.ivory} />
            </Animated.View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepPips({ total, current }: { total: number; current: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            height: 4, borderRadius: 2,
            width: i === current ? 22 : 7,
            backgroundColor:
              i === current ? colors.orange :
              i < current   ? colors.sage   :
              colors.bgMuted,
          }}
        />
      ))}
    </View>
  );
}

function IconBtn({ onPress, icon }: { onPress: () => void; icon: string }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={s.iconBtn}>
      <Ionicons name={icon as any} size={22} color={colors.ink} />
    </Pressable>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[Typography.label, { marginBottom: 6 }]}>{label}</Text>
      {children}
    </View>
  );
}

function Divider({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
      <Text style={Typography.eyebrow}>{label}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
    </View>
  );
}

function SocialBtn({ icon }: { icon: string }) {
  const { colors } = useTheme();
  return (
    <Pressable style={[s.socialBtn, { backgroundColor: colors.paper, borderColor: colors.borderDefault }]}>
      <Ionicons name={icon as any} size={22} color={colors.ink} />
    </Pressable>
  );
}

function PathCard({
  badge, title, desc, active, glowColor, onPress,
}: {
  badge: string; title: string; desc: string;
  active: boolean; glowColor: string; onPress: () => void;
}) {
  const { colors, gradients } = useTheme();
  const pressScale  = useRef(new Animated.Value(1)).current;
  const selectScale = useRef(new Animated.Value(1)).current;

  const onIn  = () => Animated.timing(pressScale, { toValue: 0.94, duration: 90, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, tension: 280, friction: 4 }).start();

  useEffect(() => {
    if (active) {
      Animated.sequence([
        Animated.timing(selectScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
        Animated.spring(selectScale, { toValue: 1, useNativeDriver: true, tension: 220, friction: 6 }),
      ]).start();
    }
  }, [active]);

  return (
    <Animated.View style={{ transform: [{ scale: pressScale }, { scale: selectScale }] }}>
      <Pressable onPress={onPress} onPressIn={onIn} onPressOut={onOut}
        style={{ borderRadius: Radius.lg, overflow: 'hidden' }}>
        {active ? (
          <LinearGradient colors={gradients.sage} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.pathCard}>
            <PathCardContent badge={badge} title={title} desc={desc} active />
          </LinearGradient>
        ) : (
          <View style={[s.pathCard, { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.borderSubtle }]}>
            <View style={[s.pathGlow, { backgroundColor: glowColor }]} pointerEvents="none" />
            <PathCardContent badge={badge} title={title} desc={desc} active={false} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function PathCardContent({ badge, title, desc, active }: { badge: string; title: string; desc: string; active: boolean }) {
  const { colors } = useTheme();
  return (
    <>
      <View style={[s.pathBadge, { backgroundColor: colors.bgOverlay }]}>
        <Text style={[Typography.eyebrow, active && { color: colors.ink }]}>{badge}</Text>
      </View>
      <Text style={[Typography.h2, { marginTop: 8 }]}>{title}</Text>
      <Text style={[Typography.bodySm, { marginTop: 8, maxWidth: 260 }]}>{desc}</Text>
    </>
  );
}

function TutorHint({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View style={[s.tutorCard, { backgroundColor: colors.bgMuted, borderColor: colors.borderSubtle }]}>
      <LinearGradient
        colors={[colors.orange, colors.yellow]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.tutorAvatar}
      >
        <Ionicons name="information-circle-outline" size={16} color={colors.ink} />
      </LinearGradient>
      <Text style={[Typography.bodySm, { flex: 1, lineHeight: 18 }]}>{text}</Text>
    </View>
  );
}

function QuizAnswer({
  text, selected, feedback, onPress,
}: {
  text: string; selected: boolean; feedback: 'correct' | 'wrong' | null; onPress: () => void;
}) {
  const { colors } = useTheme();
  const scale    = useRef(new Animated.Value(1)).current;
  const dotScale = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    if (selected) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 260, friction: 5 }),
      ]).start();
      Animated.spring(dotScale, { toValue: 1, useNativeDriver: true, tension: 360, friction: 12 }).start();
    } else {
      Animated.spring(scale,    { toValue: 1, useNativeDriver: true, tension: 300, friction: 18 }).start();
      Animated.spring(dotScale, { toValue: 0, useNativeDriver: true, tension: 300, friction: 18 }).start();
    }
  }, [selected]);

  const onIn  = () => Animated.timing(scale, { toValue: 0.97, duration: 60, useNativeDriver: true }).start();
  const onOut = () => !selected && Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 18 }).start();

  const borderColor = feedback === 'correct' ? '#22C55E' : feedback === 'wrong' ? '#EF4444' : selected ? colors.ink : '#EFEFF1';
  const bgColor     = feedback === 'correct' ? 'rgba(34,197,94,0.08)' : feedback === 'wrong' ? 'rgba(239,68,68,0.08)' : '#FFFFFF';
  const dotColor    = feedback === 'correct' ? '#22C55E' : feedback === 'wrong' ? '#EF4444' : colors.ink;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onIn}
        onPressOut={onOut}
        style={[s.quizRow, { borderColor, backgroundColor: bgColor }]}
      >
        <View style={[s.quizRadio, { borderColor: feedback ? dotColor : selected ? colors.ink : '#979797' }]}>
          <Animated.View style={[s.quizRadioDot, { backgroundColor: dotColor, transform: [{ scale: dotScale }] }]} />
        </View>
        <Text style={[s.quizAnswerText, { color: colors.ink }]}>
          {text}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function ResultRing({ pct, label, strokeColor }: { pct: number; label: string; strokeColor: string }) {
  const { colors } = useTheme();
  const r      = 78;
  const circ   = 2 * Math.PI * r;
  const target = circ - (pct / 100) * circ;

  const strokeAnim = useRef(new Animated.Value(circ)).current;
  const ringScale  = useRef(new Animated.Value(1)).current;
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    Animated.timing(strokeAnim, {
      toValue: target,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      Animated.sequence([
        Animated.spring(ringScale, { toValue: 1.06, useNativeDriver: true, tension: 400, friction: 8 }),
        Animated.spring(ringScale, { toValue: 1,    useNativeDriver: true, tension: 300, friction: 10 }),
      ]).start();
    });

    const counter = new Animated.Value(0);
    const lid = counter.addListener(({ value }) => setDisplayPct(Math.floor(value)));
    Animated.timing(counter, {
      toValue: pct,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => counter.removeListener(lid);
  }, []);

  return (
    <Animated.View style={{ width: 270, height: 270, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginTop: 28, transform: [{ scale: ringScale }] }}>
      <Svg width={270} height={270} viewBox="0 0 180 180" style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgLinearGradient id="onbRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%"   stopColor={strokeColor} />
            <Stop offset="100%" stopColor={colors.orange} />
          </SvgLinearGradient>
        </Defs>
        <Circle cx={90} cy={90} r={r} stroke={colors.borderSubtle} strokeWidth={13} fill="none" />
        <AnimatedCircle
          cx={90} cy={90} r={r}
          stroke="url(#onbRingGrad)"
          strokeWidth={13} fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          strokeDashoffset={strokeAnim}
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Montserrat_800ExtraBold', fontSize: 48, lineHeight: 52, letterSpacing: -1.2, color: colors.ink }}>
          {displayPct}%
        </Text>
        <Text style={[Typography.eyebrow, { marginTop: 4 }]}>{label}</Text>
      </View>
    </Animated.View>
  );
}



// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1 },

  glowBg: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.4,
  },

  logoFloat: { marginBottom: 22 },

  wordmark: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 36, lineHeight: 38, letterSpacing: -0.6,
  },

  topnav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 12, paddingBottom: 8,
  },

  iconBtn: {
    width: 44, height: 44, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },

  stepContent: {
    flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 10,
  },

  scrollContent: {
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40,
  },

  input: {
    height: 52, paddingHorizontal: 16, borderRadius: Radius.md,
    borderWidth: 1,
    fontFamily: 'Montserrat_400Regular', fontSize: 16,
  },

  socialBtn: {
    width: 52, height: 52, borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },

  goalsWrap: {
    flex: 1, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 6,
  },

  goalsGrid: {
    flex: 1, gap: 16, marginTop: 22,
  },

  goalTileRow: {
    borderRadius: 10,
    overflow: 'hidden',
  },

  goalTileInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    height: 84,
  },

  goalTileText: {
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 20,
    lineHeight: 26,
  },

  goalCheckbox: {
    width: 34, height: 34,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pathCard: {
    borderRadius: Radius.lg, padding: 18, height: 185,
    justifyContent: 'space-between', overflow: 'hidden',
  },

  pathGlow: {
    position: 'absolute', right: -20, top: -20,
    width: 120, height: 120, borderRadius: 60, opacity: 0.8,
  },

  pathBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999,
  },

  tutorCard: {
    flexDirection: 'row', gap: 11, padding: 13,
    borderRadius: Radius.md, marginTop: 14,
    borderWidth: 1,
    alignItems: 'flex-start',
  },

  tutorAvatar: {
    width: 32, height: 32, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },

  quizCard: {
    borderRadius: 32,
    padding: 26,
    paddingTop: 68,
    borderWidth: 1,
    borderColor: 'rgba(151, 151, 151, 0.76)',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },

  quizHintBtn: {
    width: 44, height: 44, borderRadius: 22,
    position: 'absolute', top: 16, right: 16,
    alignItems: 'center', justifyContent: 'center',
  },

  quizQuestion: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 24, lineHeight: 32,
    textAlign: 'center',
  },

  quizRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.3,
    borderColor: '#EFEFF1',
    backgroundColor: '#FFFFFF',
  },

  quizRadio: {
    width: 20, height: 20, borderRadius: 999,
    borderWidth: 1.3,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  quizRadioDot: {
    width: 10, height: 10, borderRadius: 999,
  },

  quizAnswerText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16, lineHeight: 24,
  },

  quizLetter: {
    width: 30, height: 30, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },

  statsGrid: {
    flexDirection: 'row', gap: 10, marginTop: 24,
  },

  statBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md, padding: 16, gap: 5,
    alignItems: 'center',
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

  topicWrap: {
    flex: 1, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12,
  },

  topicTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 24, lineHeight: 31,
  },

  topicCard: {
    borderRadius: 10,
    overflow: 'hidden',
  },

  topicCardInner: {
    height: 116,
    padding: 16,
    justifyContent: 'center',
  },

  topicCardText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 20, lineHeight: 22, letterSpacing: 0.2,
  },
});
