import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Text } from '@/components/ui';
import { colors, radius, riskFillColors, spacing } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** O que o app faz enquanto calcula: buscar caminhos e pontuar os três critérios de risco. */
const STEPS = ['Buscando caminhos', 'Avaliando criminalidade', 'Checando iluminação', 'Medindo movimento'] as const;
const STEP_INTERVAL_MS = 900;
const TRACE = 'M8 32C30 32 30 8 52 8S74 32 96 32 112 20 112 20';
/** Comprimento aproximado do traçado (grade 120 × 40), para o efeito de "desenhar". */
const TRACE_LENGTH = 130;
const ROUTE_WIDTH = spacing.xxl * 3;

/**
 * Cartão sobre o mapa enquanto a rota é calculada: uma rota se desenhando em loop e a etapa
 * da análise mudando. Torna a espera mais curta de sentir e mostra o que está sendo avaliado.
 */
export function RouteLoading() {
  const [step, setStep] = useState(0);
  const [draw] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const id = setInterval(() => setStep((current) => Math.min(current + 1, STEPS.length - 1)), STEP_INTERVAL_MS);
    const loop = Animated.loop(
      Animated.timing(draw, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
    );
    loop.start();
    return () => {
      clearInterval(id);
      loop.stop();
    };
  }, [draw]);

  return (
    <View style={styles.overlay} accessibilityLiveRegion="polite" accessibilityLabel={`Analisando rotas mais seguras. ${STEPS[step]}`}>
      <View style={styles.card}>
        <Svg width={ROUTE_WIDTH} height={ROUTE_WIDTH / 3} viewBox="0 0 120 40">
          <Path d={TRACE} stroke={colors.border} strokeWidth={4} strokeLinecap="round" fill="none" />
          <AnimatedPath
            d={TRACE}
            stroke={riskFillColors.low}
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={[TRACE_LENGTH, TRACE_LENGTH]}
            strokeDashoffset={draw.interpolate({ inputRange: [0, 0.6, 1], outputRange: [TRACE_LENGTH, 0, 0] })}
          />
          <Circle cx={8} cy={32} r={4} fill={colors.primary} stroke={colors.textPrimary} strokeWidth={2} />
          <Circle cx={112} cy={20} r={4} fill={colors.accent} stroke={colors.textPrimary} strokeWidth={2} />
        </Svg>
        <Text variant="subtitle" align="center">
          Analisando rotas mais seguras
        </Text>
        <Text color={colors.textSecondary}>{STEPS[step]}…</Text>
        <View style={styles.dots}>
          {STEPS.map((label, index) => (
            <View key={label} style={[styles.dot, index <= step && styles.dotDone]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.scrim,
  },
  card: {
    alignItems: 'center',
    gap: spacing.xs,
    width: '100%',
    maxWidth: 300,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  dot: {
    width: spacing.lg,
    height: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  dotDone: {
    backgroundColor: colors.accent,
  },
});
