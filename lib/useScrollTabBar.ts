import { useCallback, useRef } from 'react';
import { useTabBarCtx } from './TabBarContext';

export function useScrollTabBar() {
  const { notifyScroll } = useTabBarCtx();
  const prevY = useRef(0);

  return useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    notifyScroll(y - prevY.current, y);
    prevY.current = y;
  }, [notifyScroll]);
}
