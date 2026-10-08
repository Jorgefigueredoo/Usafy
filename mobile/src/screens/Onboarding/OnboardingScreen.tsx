import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Screen, Spacer } from '@/components/layout';
import { Button, Icon, Logo, Text } from '@/components/ui';
import { hasSeenOnboarding, markOnboardingSeen } from '@/services/onboardingSeen';
import { colors, layout, radius, spacing } from '@/theme';

import { FeatureRow, type FeatureRowProps } from './FeatureRow';
import { RoutePreview } from './RoutePreview';

/** Os três sinais que o Usafy cruza para pontuar um trecho. */
const FEATURES: Omit<FeatureRowProps, 'divided'>[] = [
  { icon: 'crime', title: 'Criminalidade', description: 'Ocorrências registradas por trecho e por horário.' },
  { icon: 'lighting', title: 'Iluminação', description: 'Cobertura e falhas na iluminação pública da via.' },
  { icon: 'footTraffic', title: 'Movimento', description: 'Fluxo de pessoas ao longo do dia e da noite.' },
];

const REVEAL_DELAYS_MS = [0, 150, 300];

/** Entrada em cascata: ilustração, título e critérios sobem um depois do outro. */
function useReveal(count: number) {
  const [values] = useState(() => Array.from({ length: count }, () => new Animated.Value(0)));
  useEffect(() => {
    Animated.parallel(
      values.map((value, index) =>
        Animated.timing(value, {
          toValue: 1,
          delay: REVEAL_DELAYS_MS[index] ?? 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [values]);

  return values.map((value) => ({
    opacity: value,
    transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [spacing.md, 0] }) }],
  }));
}

export function OnboardingScreen() {
  // Lido uma vez: quem já viu as boas-vindas abre o app direto na busca.
  const [alreadySeen] = useState(hasSeenOnboarding);
  const [heroStyle, titleStyle, criteriaStyle] = useReveal(3);

  if (alreadySeen) return <Redirect href="/home" />;

  const start = () => {
    markOnboardingSeen();
    router.replace('/home');
  };

  return (
    <Screen
      scrollable
      footer={
        <>
          <Button label="Começar" onPress={start} />
          <Text variant="caption" color={colors.textSecondary} align="center">
            Versão de testes · níveis de risco simulados
          </Text>
        </>
      }
    >
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <Logo size={40} />
          <Text variant="subtitle">Usafy</Text>
        </View>
        <View style={styles.region}>
          <Icon name="pin" size={layout.iconSm} color={colors.accent} />
          <Text variant="caption" color={colors.textSecondary}>
            Recife
          </Text>
        </View>
      </View>

      <Spacer size="lg" />
      <Animated.View style={heroStyle}>
        <RoutePreview />
      </Animated.View>

      <Spacer size="xl" />
      <Animated.View style={titleStyle}>
        <Text variant="display" accessibilityRole="header">
          Chegue com <Text variant="display" color={colors.accent}>segurança</Text>.
        </Text>
        <Spacer size="sm" />
        <Text color={colors.textSecondary}>
          Rotas pelo Recife que desviam dos trechos de risco, não só a mais rápida.
        </Text>
      </Animated.View>

      <Spacer size="xl" />
      <Animated.View style={criteriaStyle}>
        <Text variant="caption" color={colors.textSecondary} style={styles.eyebrow}>
          Como avaliamos cada trecho
        </Text>
        <Spacer size="sm" />
        <View style={styles.features}>
          {FEATURES.map((feature, index) => (
            <FeatureRow key={feature.title} {...feature} divided={index > 0} />
          ))}
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  region: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSunken,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  features: {
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSunken,
  },
});
