import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Dimensions, View, Easing } from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

const COLORS = [
  '#F58A3A', '#EFC84A', '#F6DD80', '#FFB17A',
  '#B7CB84', '#8FA764', '#D9E3B4',
  '#FF6B6B', '#FF4FA0', '#A78BFA',
  '#38BDF8', '#34D399',
];

// ── Particle types ────────────────────────────────────────────────────────────

type Shape = 'rect' | 'circle' | 'diamond' | 'star';

interface Particle {
  startX: number;
  startY: number;
  y: Animated.Value;
  x: Animated.Value;
  rot: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
  size: number;
  shape: Shape;
  glowRadius: number;
  wave: 0 | 1 | 2;
}

const SHAPES: Shape[] = ['rect', 'circle', 'diamond', 'star'];

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function makeParticles(): Particle[] {
  const particles: Particle[] = [];

  // Wave 0 — hero burst from center (20 large particles, shoot up & out)
  for (let i = 0; i < 22; i++) {
    particles.push({
      startX: SW * 0.5 + rand(-30, 30),
      startY: SH * 0.45,
      y: new Animated.Value(0),
      x: new Animated.Value(0),
      rot: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      color: pick(COLORS),
      size: rand(12, 22),
      shape: pick(SHAPES),
      glowRadius: rand(6, 14),
      wave: 0,
    });
  }

  // Wave 1 — mid shower (35 medium particles from top)
  for (let i = 0; i < 35; i++) {
    particles.push({
      startX: rand(0, SW),
      startY: -30,
      y: new Animated.Value(0),
      x: new Animated.Value(0),
      rot: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      color: pick(COLORS),
      size: rand(7, 14),
      shape: pick(SHAPES),
      glowRadius: rand(3, 8),
      wave: 1,
    });
  }

  // Wave 2 — fine sparkle rain (40 tiny fast particles)
  for (let i = 0; i < 40; i++) {
    particles.push({
      startX: rand(0, SW),
      startY: rand(-40, -10),
      y: new Animated.Value(0),
      x: new Animated.Value(0),
      rot: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      color: pick(COLORS),
      size: rand(4, 8),
      shape: Math.random() > 0.5 ? 'circle' : 'diamond',
      glowRadius: rand(2, 5),
      wave: 2,
    });
  }

  return particles;
}

// ── Confetti ──────────────────────────────────────────────────────────────────

export function Confetti({ active }: { active: boolean }) {
  const particles = useRef<Particle[]>(makeParticles()).current;

  useEffect(() => {
    if (!active) return;

    particles.forEach(p => {
      p.y.setValue(0);
      p.x.setValue(0);
      p.rot.setValue(0);
      p.opacity.setValue(0);
      p.scale.setValue(0);

      let delay: number;
      let yTo: number;
      let xTo: number;
      let dur: number;
      let rotateFull: number;

      if (p.wave === 0) {
        // Hero burst — explode outward from center
        const angle = rand(0, Math.PI * 2);
        const dist  = rand(180, 420);
        delay  = rand(0, 80);
        dur    = rand(700, 1100);
        yTo    = Math.sin(angle) * dist - rand(60, 160);
        xTo    = Math.cos(angle) * dist;
        rotateFull = rand(2, 5) * (Math.random() > 0.5 ? 1 : -1);
      } else if (p.wave === 1) {
        delay  = rand(80, 600);
        dur    = rand(1800, 2600);
        yTo    = rand(SH * 0.7, SH + 80);
        xTo    = rand(-120, 120);
        rotateFull = rand(3, 6) * (Math.random() > 0.5 ? 1 : -1);
      } else {
        delay  = rand(200, 1000);
        dur    = rand(1200, 2000);
        yTo    = rand(SH * 0.5, SH + 40);
        xTo    = rand(-80, 80);
        rotateFull = rand(4, 8) * (Math.random() > 0.5 ? 1 : -1);
      }

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          // Explosive pop-in
          Animated.spring(p.scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: p.wave === 0 ? 500 : 350,
            friction: 6,
          }),
          Animated.timing(p.opacity, {
            toValue: 1, duration: 60, useNativeDriver: true,
          }),
          // Travel
          Animated.timing(p.y, {
            toValue: yTo, duration: dur,
            easing: p.wave === 0
              ? Easing.out(Easing.quad)
              : Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(p.x, {
            toValue: xTo, duration: dur,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(p.rot, {
            toValue: rotateFull, duration: dur, useNativeDriver: true,
          }),
          // Fade out
          Animated.sequence([
            Animated.delay(dur * 0.55),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: dur * 0.45,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    });
  }, [active]);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((p, i) => {
        const rotate = p.rot.interpolate({
          inputRange: [-8, 8],
          outputRange: ['-1080deg', '1080deg'],
        });

        const isDiamond = p.shape === 'diamond';
        const isStar    = p.shape === 'star';
        const isCircle  = p.shape === 'circle';

        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.startX - p.size / 2,
              top: p.startY - p.size / 2,
              width: p.size,
              height: isStar ? p.size : isCircle ? p.size : isDiamond ? p.size : p.size * 0.55,
              borderRadius: isCircle ? p.size / 2 : isDiamond ? 2 : 2,
              backgroundColor: p.color,
              opacity: p.opacity,
              shadowColor: p.color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: p.glowRadius,
              transform: [
                { translateY: p.y },
                { translateX: p.x },
                { rotate },
                { scale: p.scale },
                ...(isDiamond ? [{ rotate: '45deg' }] : []),
              ],
            }}
          />
        );
      })}
    </View>
  );
}
