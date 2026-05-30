import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Switch,
  Alert, Animated, Share, Linking, ActionSheetIOS, Platform, useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Radius, Shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

// ── Data ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'Як розраховується стрік?',
    a: 'Стрік збільшується, коли ти виконуєш хоча б одне завдання щодня. Якщо пропустити день — серія скидається до нуля.',
  },
  {
    q: 'Що таке бонуси та на що їх витрачати?',
    a: 'Бонуси нараховуються за виконані завдання. У майбутніх оновленнях ти зможеш використовувати їх для розблокування ексклюзивного контенту.',
  },
  {
    q: 'Чи можна скасувати підписку?',
    a: 'Так, підписку можна скасувати будь-коли в налаштуваннях App Store або Google Play. Доступ залишатиметься до кінця оплаченого періоду.',
  },
];

const LANG_OPTIONS = ['Українська', 'English', 'Polski'];

// ── SettingsSection ───────────────────────────────────────────────────────────

function SettingsSection({
  title,
  children,
  overflow,
}: {
  title?: string;
  children: React.ReactNode;
  overflow?: boolean;
}) {
  const { colors } = useTheme();
  const items = React.Children.toArray(children);
  return (
    <View style={s.section}>
      {title ? <Text style={[s.sectionTitle, { color: colors.charcoal3 }]}>{title.toUpperCase()}</Text> : null}
      <View style={[s.card, { backgroundColor: colors.paper, borderColor: colors.borderSubtle }, overflow && { overflow: 'hidden' }]}>
        {items.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <View style={[s.separator, { backgroundColor: colors.divider }]} />}
            {item}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

// ── SettingsItemRow ───────────────────────────────────────────────────────────

function SettingsItemRow({
  icon,
  label,
  subtitle,
  onPress,
  danger = false,
  chevron = true,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  chevron?: boolean;
}) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const onIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 20 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 300, friction: 20 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={s.row}
        onPress={onPress}
        onPressIn={onIn}
        onPressOut={onOut}
      >
        <View style={[s.iconWrap, { backgroundColor: danger ? `${colors.orange}1A` : `${colors.sage}22` }]}>
          <Ionicons name={icon as any} size={18} color={danger ? colors.orange : colors.sageDeep} />
        </View>
        <View style={s.labelBlock}>
          <Text style={[s.rowLabel, { color: danger ? colors.orange : colors.ink }]}>{label}</Text>
          {subtitle ? <Text style={[s.rowSub, { color: colors.charcoal3 }]}>{subtitle}</Text> : null}
        </View>
        {chevron && <Ionicons name="chevron-forward" size={16} color={colors.charcoal3} />}
      </Pressable>
    </Animated.View>
  );
}

// ── ToggleRow ─────────────────────────────────────────────────────────────────

function ToggleRow({
  icon,
  label,
  subtitle,
  value,
  onValueChange,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable style={s.row} onPress={onValueChange}>
      <View style={[s.iconWrap, { backgroundColor: `${colors.sage}22` }]}>
        <Ionicons name={icon as any} size={18} color={colors.sageDeep} />
      </View>
      <View style={s.labelBlock}>
        <Text style={[s.rowLabel, { color: colors.ink }]}>{label}</Text>
        {subtitle ? <Text style={[s.rowSub, { color: colors.charcoal3 }]}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.bgMuted, true: colors.sage }}
        thumbColor={colors.paper}
        ios_backgroundColor={colors.bgMuted}
      />
    </Pressable>
  );
}

// ── AccordionItem ─────────────────────────────────────────────────────────────

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const rowScale   = useRef(new Animated.Value(1)).current;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    Animated.spring(expandAnim, {
      toValue: next ? 1 : 0,
      useNativeDriver: false,
      tension: 180, friction: 22,
    }).start();
  };

  const onIn  = () => Animated.spring(rowScale, { toValue: 0.98, useNativeDriver: true, tension: 300, friction: 20 }).start();
  const onOut = () => Animated.spring(rowScale, { toValue: 1,    useNativeDriver: true, tension: 300, friction: 20 }).start();

  const maxH = expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 160] });
  const rot  = expandAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View>
      <Animated.View style={{ transform: [{ scale: rowScale }] }}>
        <Pressable onPress={toggle} onPressIn={onIn} onPressOut={onOut} style={s.row}>
          <View style={[s.iconWrap, { backgroundColor: `${colors.sage}22` }]}>
            <Ionicons name="help-circle-outline" size={18} color={colors.sageDeep} />
          </View>
          <View style={s.labelBlock}>
            <Text style={[s.rowLabel, { color: colors.ink }]}>{question}</Text>
          </View>
          <Animated.View style={{ transform: [{ rotate: rot }] }}>
            <Ionicons name="chevron-down" size={16} color={colors.charcoal3} />
          </Animated.View>
        </Pressable>
      </Animated.View>
      <Animated.View style={{ maxHeight: maxH, overflow: 'hidden' }}>
        <Text style={[s.accordionAnswer, { color: colors.charcoal }]}>{answer}</Text>
      </Animated.View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const topPad = width <= 480 ? 10 : 59;

  const [toggles, setToggles] = useState({
    pushEnabled:    true,
    streakReminder: true,
    weeklyDigest:   false,
    haptics:        true,
  });
  const [lang, setLang] = useState('Українська');

  const flip = (key: keyof typeof toggles) =>
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  const openURL = (url: string) =>
    Linking.openURL(url).catch(() =>
      Alert.alert('Помилка', 'Не вдалося відкрити посилання.')
    );

  const pickLanguage = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Мова застосунку',
          options: [...LANG_OPTIONS, 'Скасувати'],
          cancelButtonIndex: LANG_OPTIONS.length,
        },
        (i) => { if (i < LANG_OPTIONS.length) setLang(LANG_OPTIONS[i]); }
      );
    } else {
      Alert.alert(
        'Мова застосунку',
        undefined,
        [
          ...LANG_OPTIONS.map(l => ({ text: l, onPress: () => setLang(l) })),
          { text: 'Скасувати', style: 'cancel' as const },
        ]
      );
    }
  };

  const shareInvite = () =>
    Share.share({ message: 'Приєднуйся до Brainduo з моїм кодом OLYA-2026 та отримай +50 бонусів! 🎯' });

  const confirmSignOut = () =>
    Alert.alert('Вийти', 'Ви впевнені, що хочете вийти?', [
      { text: 'Скасувати', style: 'cancel' },
      { text: 'Вийти', style: 'destructive', onPress: () => router.replace('/(auth)/onboarding') },
    ]);

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.ivory }]} edges={['top', 'bottom']}>
      <View style={[s.topnav, { paddingTop: topPad }]}>
        <Pressable style={s.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={[Typography.eyebrow, { color: colors.charcoal3 }]}>НАЛАШТУВАННЯ</Text>
        <View style={s.iconBtn} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile ──────────────────────────────────────────────────── */}
        <SettingsSection title="Профіль">
          <SettingsItemRow
            icon="person-outline"
            label="Редагувати профіль"
            onPress={() => router.push('/(tabs)/profile')}
          />
          <SettingsItemRow
            icon="lock-closed-outline"
            label="Змінити пароль"
            onPress={() =>
              Alert.alert(
                'Змінити пароль',
                'Лист для зміни паролю буде надіслано на вашу адресу.',
                [{ text: 'Надіслати' }, { text: 'Скасувати', style: 'cancel' }]
              )
            }
          />
          <SettingsItemRow
            icon="language-outline"
            label="Мова"
            subtitle={lang}
            onPress={pickLanguage}
          />
        </SettingsSection>

        {/* ── Notifications ─────────────────────────────────────────── */}
        <SettingsSection title="Сповіщення">
          <ToggleRow
            icon="notifications-outline"
            label="Push-сповіщення"
            value={toggles.pushEnabled}
            onValueChange={() => flip('pushEnabled')}
          />
          <ToggleRow
            icon="flame-outline"
            label="Нагадування про стрік"
            subtitle="20:00 щодня"
            value={toggles.streakReminder}
            onValueChange={() => flip('streakReminder')}
          />
          <ToggleRow
            icon="mail-outline"
            label="Щотижневий дайджест"
            value={toggles.weeklyDigest}
            onValueChange={() => flip('weeklyDigest')}
          />
        </SettingsSection>

        {/* ── Appearance ────────────────────────────────────────────── */}
        <SettingsSection title="Вигляд">
          <ToggleRow
            icon="moon-outline"
            label="Темна тема"
            value={isDark}
            onValueChange={toggleTheme}
          />
          <ToggleRow
            icon="phone-portrait-outline"
            label="Тактильний відгук"
            value={toggles.haptics}
            onValueChange={() => flip('haptics')}
          />
        </SettingsSection>

        {/* ── Support ───────────────────────────────────────────────── */}
        <SettingsSection title="Підтримка">
          <SettingsItemRow
            icon="help-circle-outline"
            label="Довідка"
            onPress={() =>
              Alert.alert('Довідка', 'Відповіді на часті запитання знаходяться нижче на цій сторінці.')
            }
          />
          <SettingsItemRow
            icon="chatbubble-outline"
            label="Написати нам"
            onPress={() => openURL('mailto:support@brainduo.app')}
          />
          <SettingsItemRow
            icon="star-outline"
            label="Оцінити застосунок"
            onPress={() => openURL('itms-apps://itunes.apple.com/app/id000000000')}
          />
        </SettingsSection>

        {/* ── Legal ─────────────────────────────────────────────────── */}
        <SettingsSection title="Правова інформація">
          <SettingsItemRow
            icon="document-text-outline"
            label="Умови використання"
            onPress={() => openURL('https://brainduo.app/terms')}
          />
          <SettingsItemRow
            icon="shield-checkmark-outline"
            label="Політика конфіденційності"
            onPress={() => openURL('https://brainduo.app/privacy')}
          />
          <SettingsItemRow
            icon="information-circle-outline"
            label="Про застосунок"
            subtitle="Версія 1.0.0"
            onPress={() =>
              Alert.alert(
                'Brainduo 1.0.0',
                'Expo SDK 54 · React Native 0.81\n\n© 2026 Brainduo. Усі права захищено.',
                [{ text: 'ОК' }]
              )
            }
          />
        </SettingsSection>

        {/* ── Invite ────────────────────────────────────────────────── */}
        <SettingsSection title="Запросити друзів" overflow>
          <View style={s.inviteBlock}>
            <View style={s.inviteHeader}>
              <View style={[s.iconWrap, { backgroundColor: `${colors.sage}22` }]}>
                <Ionicons name="person-add-outline" size={18} color={colors.sageDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.rowLabel, { color: colors.ink }]}>Твій код запрошення</Text>
                <Text style={[s.rowSub, { color: colors.charcoal3, marginTop: 2 }]}>Друг отримає +50 бонусів при реєстрації</Text>
              </View>
            </View>
            <View style={[s.codeWrap, { backgroundColor: colors.bgOverlay }]}>
              <Text style={[s.codeText, { color: colors.ink }]}>OLYA-2026</Text>
              <Pressable
                style={[s.copyBtn, { backgroundColor: colors.sage }]}
                onPress={() => Alert.alert('Скопійовано!', 'Код запрошення скопійовано в буфер обміну.')}
              >
                <Text style={[s.copyBtnText, { color: colors.ink }]}>Копіювати</Text>
              </Pressable>
            </View>
            <Pressable style={[s.shareBtn, { backgroundColor: colors.ink }]} onPress={shareInvite}>
              <Text style={[s.shareBtnText, { color: colors.paper }]}>Поділитись посиланням</Text>
            </Pressable>
          </View>
        </SettingsSection>

        {/* ── FAQ ───────────────────────────────────────────────────── */}
        <SettingsSection title="Часті запитання">
          {FAQ_ITEMS.map(item => (
            <AccordionItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </SettingsSection>

        {/* ── Sign out ──────────────────────────────────────────────── */}
        <SettingsSection>
          <SettingsItemRow
            icon="log-out-outline"
            label="Вийти з акаунту"
            danger
            chevron={false}
            onPress={confirmSignOut}
          />
        </SettingsSection>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

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
  content:      { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  section:      { marginTop: 20 },
  sectionTitle: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 10, lineHeight: 12, letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8, paddingHorizontal: 4,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...Shadows.soft,
  },
  separator: {
    height: 1,
    marginLeft: 62,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  iconWrap: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  labelBlock: { flex: 1 },
  rowLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 15, lineHeight: 19,
  },
  rowSub: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12, lineHeight: 16, marginTop: 1,
  },
  accordionAnswer: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14, lineHeight: 21,
    paddingHorizontal: 16, paddingLeft: 62, paddingBottom: 16,
  },
  inviteBlock: { paddingBottom: 2 },
  inviteHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
  },
  codeWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 12, padding: 12, gap: 10,
  },
  codeText: {
    flex: 1,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 18, lineHeight: 21, letterSpacing: 2,
  },
  copyBtn: {
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 999,
  },
  copyBtnText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13, lineHeight: 16,
  },
  shareBtn: {
    marginHorizontal: 16, marginBottom: 14,
    paddingVertical: 12,
    borderRadius: 14, alignItems: 'center',
  },
  shareBtnText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 15, lineHeight: 19,
  },
});
