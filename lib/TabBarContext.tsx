import React, { createContext, useCallback, useContext, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';

type Ctx = {
  tabBarTranslate: Animated.Value;
  notifyScroll: (dy: number, y: number) => void;
  showTabBar: () => void;
};

const TabBarCtx = createContext<Ctx | null>(null);

export function TabBarProvider({ children }: { children: React.ReactNode }) {
  const tabBarTranslate = useRef(new Animated.Value(0)).current;
  const lastDir = useRef<'up' | 'down'>('up');
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const animate = useCallback((toValue: number) => {
    if (animRef.current) animRef.current.stop();
    animRef.current = Animated.spring(tabBarTranslate, {
      toValue,
      useNativeDriver: true,
      tension: 260,
      friction: 26,
    });
    animRef.current.start();
  }, [tabBarTranslate]);

  const showTabBar = useCallback(() => {
    if (lastDir.current === 'up') return;
    lastDir.current = 'up';
    animate(0);
  }, [animate]);

  const notifyScroll = useCallback((dy: number, y: number) => {
    if (Dimensions.get('window').width > 480) return;
    if (Math.abs(dy) < 4) return;

    if (y < 20) {
      if (lastDir.current !== 'up') { lastDir.current = 'up'; animate(0); }
      return;
    }

    const dir: 'up' | 'down' = dy > 0 ? 'down' : 'up';
    if (dir === lastDir.current) return;
    lastDir.current = dir;
    animate(dir === 'down' ? 130 : 0);
  }, [animate]);

  return (
    <TabBarCtx.Provider value={{ tabBarTranslate, notifyScroll, showTabBar }}>
      {children}
    </TabBarCtx.Provider>
  );
}

export function useTabBarCtx(): Ctx {
  const c = useContext(TabBarCtx);
  if (!c) throw new Error('useTabBarCtx requires TabBarProvider');
  return c;
}
