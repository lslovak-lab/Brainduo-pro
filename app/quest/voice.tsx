import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { Typography, Shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

type RecordState = 'idle' | 'recording' | 'recorded';

const BARS = 18;

export default function VoiceQuestScreen() {
  const router = useRouter();
  const { colors, gradients, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const topPad = width <= 480 ? 10 : 59;
  const [recState, setRecState]   = useState<RecordState>('idle');
  const [bars, setBars]           = useState<number[]>(Array(BARS).fill(0.12));
  const [seconds, setSeconds]     = useState(0);

  const ring1      = useRef(new Animated.Value(0)).current;
  const ring2      = useRef(new Animated.Value(0)).current;
  const micScale   = useRef(new Animated.Value(1)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRecRef    = useRef(false);

  const pulseCycle = () => {
    if (!isRecRef.current) return;
    ring1.setValue(0);
    ring2.setValue(0);
    Animated.parallel([
      Animated.timing(ring1, { toValue: 1, duration: 920, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(280),
        Animated.timing(ring2, { toValue: 1, duration: 920, useNativeDriver: true }),
      ]),
    ]).start(() => pulseCycle());
  };

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    isRecRef.current = recState === 'recording';

    if (recState === 'recording') {
      intervalRef.current = setInterval(() => {
        setBars(Array.from({ length: BARS }, () => Math.random() * 0.9 + 0.08));
      }, 100);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
      Animated.spring(micScale, { toValue: 0.9, useNativeDriver: true, tension: 220, friction: 12 }).start();
      pulseCycle();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      setBars(Array(BARS).fill(recState === 'recorded' ? 0.5 : 0.12));
      Animated.spring(micScale, { toValue: 1, useNativeDriver: true, tension: 220, friction: 12 }).start();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recState]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const ringStyle = (anim: Animated.Value) => ({
    opacity:   anim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.3] }) }],
  });

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top', 'bottom']}>
      <View style={[s.topnav, { paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <ProgressBar value={0.6} height={8} />
        </View>
        <Text style={[Typography.caption, { minWidth: 32, textAlign: 'right' }]}>3/5</Text>
      </View>

      <Animated.View style={[s.body, { opacity: fadeAnim }]}>
        <Text style={[Typography.display, { marginTop: 10, textAlign: 'center' }]}>Поясни власними словами</Text>

        <LinearGradient
          colors={gradients.sage}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.questionCard}
        >
          <Text style={Typography.eyebrow}>ПИТАННЯ</Text>
          <Text style={[Typography.h3, { marginTop: 8, lineHeight: 26, textAlign: 'center' }]}>
            Чому якісний сон важливий для збереження нових знань?
          </Text>
        </LinearGradient>

        {/* Waveform area */}
        <View style={s.waveWrap}>
          <View style={s.waveform}>
            {bars.map((h, i) => (
              <View
                key={i}
                style={[
                  s.waveBar,
                  {
                    height: Math.max(4, h * 56),
                    backgroundColor:
                      recState === 'recording'
                        ? i % 3 === 0 ? colors.orange : colors.orangeSoft
                        : recState === 'recorded'
                        ? colors.sage
                        : colors.borderDefault,
                  },
                ]}
              />
            ))}
          </View>

          {recState === 'recording' && (
            <Text style={[s.timer, { color: colors.orange }]}>{fmt(seconds)}</Text>
          )}
          {recState === 'recorded' && (
            <View style={s.recordedRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.sageDeep} />
              <Text style={[Typography.bodySm, { color: colors.sageDeep }]}>
                Відповідь записана · {fmt(seconds)}
              </Text>
            </View>
          )}
          {recState === 'idle' && (
            <Text style={[Typography.caption, { color: colors.charcoal3 }]}>
              Натисни кнопку і говори
            </Text>
          )}
        </View>

        {/* Mic button with pulse rings */}
        <View style={s.micArea}>
          {recState === 'recording' && (
            <>
              <Animated.View style={[s.ring, { backgroundColor: colors.orange }, ringStyle(ring1)]} />
              <Animated.View style={[s.ring, { backgroundColor: colors.orange }, ringStyle(ring2)]} />
            </>
          )}
          <Animated.View style={{ transform: [{ scale: micScale }] }}>
            <Pressable
              style={[
                s.micBtn,
                { backgroundColor: colors.bgMuted, borderColor: colors.borderDefault },
                recState === 'recording' && { backgroundColor: colors.orange, borderColor: colors.orangeDeep },
                recState === 'recorded'  && { backgroundColor: colors.sageDeep, borderColor: colors.sageDeep },
              ]}
              onPress={() => {
                if (recState === 'idle')      { setSeconds(0); setRecState('recording'); }
                if (recState === 'recording') { setRecState('recorded'); }
              }}
            >
              <Ionicons
                name={recState === 'recorded' ? 'checkmark' : 'mic'}
                size={36}
                color={recState === 'idle' ? colors.ink : colors.paper}
              />
            </Pressable>
          </Animated.View>
        </View>

        <View style={s.bottom}>
          {recState === 'recorded' ? (
            <>
              <Pressable
                style={[s.glassBtn, { borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.70)' }]}
                onPress={() => { setSeconds(0); setRecState('idle'); }}
              >
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
                <Text style={[s.glassBtnText, { color: colors.ink }]}>Записати ще раз</Text>
              </Pressable>
              <View style={{ marginTop: 10 }}>
                <Button
                  variant="primary"
                  label="Далі"
                  fullWidth
                  onPress={() => router.push('/quest/result')}
                />
              </View>
            </>
          ) : (
            <Text style={[Typography.caption, { textAlign: 'center', color: colors.charcoal3 }]}>
              {recState === 'idle' ? 'Натисни та говори' : 'Натисни ще раз, щоб зупинити'}
            </Text>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:   { flex: 1 },
  topnav:   {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingTop: 59, paddingBottom: 10,
  },
  iconBtn:  { width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  body:     { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  questionCard: {
    padding: 22, borderRadius: 22, marginTop: 18,
    ...Shadows.card,
  },
  waveWrap: {
    marginTop: 28, height: 86,
    alignItems: 'center', justifyContent: 'flex-end',
    gap: 8,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 60,
  },
  waveBar:  { width: 4, borderRadius: 3 },
  timer:    {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14, lineHeight: 17,
  },
  recordedRow: {
    flexDirection: 'row', gap: 6, alignItems: 'center',
  },
  micArea:  {
    alignItems: 'center', justifyContent: 'center',
    marginTop: 28, height: 100,
  },
  ring: {
    position: 'absolute',
    width: 82, height: 82, borderRadius: 41,
  },
  micBtn: {
    width: 82, height: 82, borderRadius: 41,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
    ...Shadows.button,
  },
  bottom: { marginTop: 'auto' as any, paddingBottom: 16 },
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
});
