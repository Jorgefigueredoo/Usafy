import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, radius, riskFillColors } from '@/theme';
import type { RiskLevel } from '@/types';

export interface RiskBarProps {
  /** Score de 0 a 100; valores fora da faixa são limitados. */
  score: number;
  level: RiskLevel;
  height?: number;
}

const MAX_SCORE = 100;
const ANIMATION_DURATION_MS = 420;
const DEFAULT_HEIGHT = 8;

export function RiskBar({ score, level, height = DEFAULT_HEIGHT }: RiskBarProps) {
  const clampedScore = Math.min(Math.max(score, 0), MAX_SCORE);
  // useState com inicializador preserva o mesmo Animated.Value entre renders
  // sem tocar em ref durante o render.
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: clampedScore,
      duration: ANIMATION_DURATION_MS,
      // Largura não é suportada pelo driver nativo.
      useNativeDriver: false,
    }).start();
  }, [clampedScore, progress]);

  const width = progress.interpolate({
    inputRange: [0, MAX_SCORE],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[styles.track, { height }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: MAX_SCORE, now: Math.round(clampedScore) }}
    >
      <Animated.View style={[styles.fill, { width, backgroundColor: riskFillColors[level] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
