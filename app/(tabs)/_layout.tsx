import { Shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const TABS = [
  { name: 'index'       },
  { name: 'quests'      },
  { name: 'streak'      },
  { name: 'leaderboard' },
  { name: 'profile'     },
] as const;

function TabIcon({ name, isActive, color }: { name: string; isActive: boolean; color: string }) {
  if (name === 'index') {
    return isActive ? (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M20.1114 7.43933L13.3626 2.44987C12.5616 1.85634 11.4417 1.85697 10.6392 2.44925L3.88925 7.4387C3.33305 7.84964 3.00031 8.5012 3.00031 9.18152V18.5658C3.00031 20.4624 4.58611 22.0049 6.53602 22.0049H17.4646C19.4145 22.0049 21.0003 20.4624 21.0003 18.5658V9.18152C21.0003 8.50132 20.6676 7.84977 20.1114 7.43933Z" fill={color} />
      </Svg>
    ) : (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M20.1114 7.43933L13.3626 2.44987C12.5616 1.85634 11.4417 1.85697 10.6392 2.44925L3.88925 7.4387C3.33305 7.84964 3.00031 8.5012 3.00031 9.18152V18.5658C3.00031 20.4624 4.58611 22.0049 6.53602 22.0049H17.4646C19.4145 22.0049 21.0003 20.4624 21.0003 18.5658V9.18152C21.0003 8.50132 20.6676 7.84977 20.1114 7.43933Z" stroke={color} strokeWidth={1.5} />
      </Svg>
    );
  }
  if (name === 'quests') {
    return isActive ? (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path fillRule="evenodd" clipRule="evenodd" d="M5.88 3H18.12C19.7106 3 21 4.28942 21 5.88V18.12C21 19.7106 19.7106 21 18.12 21H5.88C4.28942 21 3 19.7106 3 18.12V5.88C3 4.28942 4.28942 3 5.88 3ZM9.84144 8.31216L15.0989 11.3779V11.3794C15.5755 11.6573 15.5755 12.3456 15.0989 12.6235L9.84144 15.6893C9.36192 15.9686 8.75856 15.623 8.75856 15.0672V8.93424C8.75856 8.3784 9.36192 8.0328 9.84144 8.31216Z" fill={color} />
      </Svg>
    ) : (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path fillRule="evenodd" clipRule="evenodd" d="M5.88 3H18.12C19.7106 3 21 4.28942 21 5.88V18.12C21 19.7106 19.7106 21 18.12 21H5.88C4.28942 21 3 19.7106 3 18.12V5.88C3 4.28942 4.28942 3 5.88 3ZM9.84144 8.31216L15.0989 11.3779V11.3794C15.5755 11.6573 15.5755 12.3456 15.0989 12.6235L9.84144 15.6893C9.36192 15.9686 8.75856 15.623 8.75856 15.0672V8.93424C8.75856 8.3784 9.36192 8.0328 9.84144 8.31216Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  if (name === 'streak') {
    return isActive ? (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M12.4514 2.28037L15.2685 7.96556L21.5675 8.8783C21.9808 8.93902 22.1465 9.44378 21.8475 9.73411L17.2895 14.1612L18.3656 20.4119C18.4361 20.8217 18.0037 21.1348 17.6342 20.9413L12 17.9905L6.36579 20.9413C5.99627 21.1348 5.56389 20.8217 5.63437 20.4119L6.71054 14.1612L2.15251 9.73411C1.85346 9.44378 2.01918 8.93712 2.4325 8.8783L8.73147 7.96556L11.5486 2.28037C11.7333 1.90654 12.2667 1.90654 12.4514 2.28037Z" fill={color} />
      </Svg>
    ) : (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M12.4514 2.28037L15.2685 7.96556L21.5675 8.8783C21.9808 8.93902 22.1465 9.44378 21.8475 9.73411L17.2895 14.1612L18.3656 20.4119C18.4361 20.8217 18.0037 21.1348 17.6342 20.9413L12 17.9905L6.36579 20.9413C5.99627 21.1348 5.56389 20.8217 5.63437 20.4119L6.71054 14.1612L2.15251 9.73411C1.85346 9.44378 2.01918 8.93712 2.4325 8.8783L8.73147 7.96556L11.5486 2.28037C11.7333 1.90654 12.2667 1.90654 12.4514 2.28037Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  if (name === 'leaderboard') {
    return isActive ? (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M16.725 13.3535V20.9892C16.725 21.4032 16.2506 21.6378 15.9216 21.3866L12.5 18.7742L9.07842 21.3866C8.74937 21.6378 8.275 21.4032 8.275 20.9892V13.3535" fill={color} />
        <Path d="M12.5 14.9032C16.0899 14.9032 19 12.0147 19 8.45161C19 4.88849 16.0899 2 12.5 2C8.91015 2 6 4.88849 6 8.45161C6 12.0147 8.91015 14.9032 12.5 14.9032Z" fill={color} />
      </Svg>
    ) : (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M16.725 13.3535V22L12.5 18.7742L8.275 22V13.3535M19 8.45161C19 12.0147 16.0899 14.9032 12.5 14.9032C8.91015 14.9032 6 12.0147 6 8.45161C6 4.88849 8.91015 2 12.5 2C16.0899 2 19 4.88849 19 8.45161Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  // profile
  return isActive ? (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 10.3271C14.3155 10.3271 16.1926 8.46307 16.1926 6.1636C16.1926 3.86414 14.3155 2.00006 12 2.00006C9.68449 2.00006 7.8074 3.86414 7.8074 6.1636C7.8074 8.46307 9.68449 10.3271 12 10.3271Z" fill={color} />
      <Path d="M19.602 17.2297C18.039 14.5184 15.126 12.8346 12 12.8346C8.87399 12.8346 5.9593 14.5184 4.39797 17.2297C3.98039 17.9524 3.88647 18.8185 4.13971 19.6079C4.39126 20.3939 4.97152 21.0451 5.72786 21.3932C7.80907 22.3491 9.9037 22.8271 12 22.8271C14.0963 22.8271 16.1909 22.3491 18.2721 21.3932C19.0285 21.0451 19.6071 20.3939 19.8603 19.6079C20.1135 18.8185 20.0196 17.9524 19.602 17.2313V17.2297Z" fill={color} />
    </Svg>
  ) : (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 10.3271C14.3155 10.3271 16.1926 8.46301 16.1926 6.16354C16.1926 3.86408 14.3155 2 12 2C9.68449 2 7.8074 3.86408 7.8074 6.16354C7.8074 8.46301 9.68449 10.3271 12 10.3271Z" stroke={color} strokeWidth={1.5} />
      <Path d="M19.602 17.4025C18.039 14.6912 15.126 13.0075 12 13.0075C8.87399 13.0075 5.9593 14.6912 4.39797 17.4025C3.98039 18.1253 3.88647 18.9913 4.13971 19.7807C4.39126 20.5668 4.97152 21.218 5.72786 21.566C7.80907 22.522 9.9037 23 12 23C14.0963 23 16.1909 22.522 18.2721 21.566C19.0285 21.218 19.6071 20.5668 19.8603 19.7807C20.1135 18.9913 20.0196 18.1253 19.602 17.4042V17.4025Z" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

function TabItem({
  name, isActive, onPress,
}: {
  name: string; isActive: boolean; onPress: () => void;
}) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const dotAnim   = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const mounted   = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (isActive) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.76, duration: 70, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 420, friction: 10 }),
      ]).start();
      Animated.spring(dotAnim, { toValue: 1, useNativeDriver: true, tension: 320, friction: 16 }).start();
    } else {
      Animated.spring(dotAnim, { toValue: 0, useNativeDriver: true, tension: 320, friction: 20 }).start();
    }
  }, [isActive]);

  const onPressIn  = () => Animated.spring(scaleAnim, { toValue: 0.84, useNativeDriver: true, tension: 320, friction: 20 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, tension: 320, friction: 20 }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={s.tabItem}>
      <Animated.View style={[s.tabInner, { transform: [{ scale: scaleAnim }] }]}>
        <TabIcon name={name} isActive={isActive} color={isActive ? colors.ink : colors.charcoal3} />
        <Animated.View style={[s.tabDot, { transform: [{ scale: dotAnim }], backgroundColor: colors.orange }]} />
      </Animated.View>
    </Pressable>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const { colors, isDark } = useTheme();
  const insets    = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View style={[s.tabBarContainer, { paddingBottom: bottomPad }]} pointerEvents="box-none">
      <View style={[s.tabBarOuter, { borderColor: colors.borderSubtle }]}>
        <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: isDark ? 'rgba(0,0,0,0.30)' : 'rgba(255,255,255,0.55)' }]} />

        {state.routes.map((route: any, index: number) => {
          const tab = TABS.find(t => t.name === route.name);
          if (!tab) return null;
          const isActive = state.index === index;
          return (
            <TabItem
              key={route.key}
              name={tab.name}
              isActive={isActive}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isActive && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"       options={{ title: 'Головна' }} />
      <Tabs.Screen name="quests"      options={{ title: 'Квести'  }} />
      <Tabs.Screen name="streak"      options={{ title: 'Стрік'   }} />
      <Tabs.Screen name="leaderboard" options={{ title: 'Рейтинг' }} />
      <Tabs.Screen name="profile"     options={{ title: 'Профіль' }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 10, left: 0, right: 0,
    paddingHorizontal: 16,
    paddingTop: 59,
  },
  tabBarOuter: {
    height: 62,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    overflow: 'hidden',
    borderWidth: 1,
    ...Shadows.tabBar,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabInner: {
    alignItems: 'center',
    gap: 5,
  },
  tabDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
