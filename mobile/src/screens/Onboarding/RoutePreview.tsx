import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { Text } from '@/components/ui';
import { colors, radius, riskFillColors, riskToneColors, spacing } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Trechos da rota do Usafy (grade 320 × 180) com o comprimento de cada um, para o "desenho". */
const SEGMENTS = [
  { d: 'M60 150H180', length: 120, color: riskFillColors.low, delay: 300, duration: 600 },
  { d: 'M180 150V95', length: 55, color: riskFillColors.medium, delay: 900, duration: 250 },
  { d: 'M180 95H290V40', length: 165, color: riskFillColors.low, delay: 1150, duration: 450 },
] as const;

const SAFE_ROUTE = 'M60 150H180V95H290V40';
const FAST_ROUTE = 'M60 150L130 80L220 60L290 40';
const PIN_DELAY_MS = 1500;

/**
 * Ilustração do que o app faz: a rota mais rápida corta um trecho de risco alto e a rota do
 * Usafy contorna por ruas mais seguras. Mesmo desenho da tela de boas-vindas do web.
 */
export function RoutePreview() {
  const [progress] = useState(() => SEGMENTS.map(() => new Animated.Value(0)));
  const [finale] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const draws = SEGMENTS.map((segment, index) =>
      Animated.timing(progress[index] as Animated.Value, {
        toValue: 1,
        delay: segment.delay,
        duration: segment.duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    const pin = Animated.timing(finale, {
      toValue: 1,
      delay: PIN_DELAY_MS,
      duration: 400,
      easing: Easing.out(Easing.back(1.6)),
      useNativeDriver: false,
    });
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: false }),
      ]),
    );
    Animated.parallel([...draws, pin]).start();
    breathing.start();
    return () => breathing.stop();
  }, [progress, finale, pulse]);

  return (
    <View
      style={styles.preview}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Ilustração: a rota mais rápida passa por um trecho de risco alto; a rota do Usafy contorna por ruas mais seguras."
    >
      <Svg width="100%" height="100%" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
        <Path d="M-10 72C70 52 118 124 196 112S292 58 330 74" stroke={colors.surface} strokeWidth={16} fill="none" />
        <Path d="M0 40H320M0 95H320M0 150H320M60 0V180M180 0V180M290 0V180" stroke={colors.border} strokeWidth={3} />
        <Path d="M0 122H320M0 15H320M120 0V180M240 0V180" stroke={colors.border} strokeWidth={1} opacity={0.6} />

        <AnimatedCircle
          cx={130}
          cy={80}
          r={pulse.interpolate({ inputRange: [0, 1], outputRange: [30, 34] })}
          fill={riskFillColors.high}
          opacity={0.2}
        />
        <Circle cx={130} cy={80} r={12} fill={riskFillColors.high} opacity={0.35} />
        <Path d={FAST_ROUTE} stroke={riskToneColors.high} strokeWidth={3} strokeDasharray="2 7" strokeLinecap="round" fill="none" opacity={0.75} />

        <AnimatedPath
          d={SAFE_ROUTE}
          stroke={riskFillColors.low}
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={finale.interpolate({ inputRange: [0, 1], outputRange: [0, 0.25] })}
        />
        <Path d={SAFE_ROUTE} stroke={colors.background} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {SEGMENTS.map((segment, index) => (
          <AnimatedPath
            key={segment.d}
            d={segment.d}
            stroke={segment.color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={[segment.length, segment.length]}
            strokeDashoffset={(progress[index] as Animated.Value).interpolate({
              inputRange: [0, 1],
              outputRange: [segment.length, 0],
            })}
          />
        ))}

        <Circle cx={60} cy={150} r={7} fill={colors.primary} stroke={colors.textPrimary} strokeWidth={3} />
        <AnimatedG opacity={finale}>
          <Path
            d="M290 40c-7.5-8.6-12-14.4-12-20.2a12 12 0 0 1 24 0c0 5.8-4.5 11.6-12 20.2Z"
            fill={colors.accent}
            stroke={colors.textPrimary}
            strokeWidth={2.5}
          />
          <Circle cx={290} cy={20} r={4.2} fill={colors.textPrimary} />
        </AnimatedG>
      </Svg>

      <View style={[styles.chip, styles.chipFast]}>
        <View style={[styles.dot, { backgroundColor: riskToneColors.high }]} />
        <Text variant="caption">Mais rápida · risco alto</Text>
      </View>
      <Animated.View style={[styles.chip, styles.chipSafe, { opacity: finale }]}>
        <View style={[styles.dot, { backgroundColor: riskToneColors.low }]} />
        <Text variant="caption">Usafy · mais segura</Text>
      </Animated.View>
    </View>
  );
}

const DOT_SIZE = spacing.sm;

const styles = StyleSheet.create({
  preview: {
    aspectRatio: 16 / 9,
    overflow: 'hidden',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSunken,
  },
  chip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.scrim,
  },
  chipFast: {
    top: '8%',
    left: '4%',
  },
  chipSafe: {
    right: '3%',
    bottom: '3%',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radius.full,
  },
});
