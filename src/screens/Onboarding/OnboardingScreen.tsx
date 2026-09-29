import { StyleSheet, View } from 'react-native';

import { Screen, Spacer } from '@/components/layout';
import { Button, Logo, Text } from '@/components/ui';
import type { RootStackScreenProps } from '@/navigation/types';
import { colors, spacing } from '@/theme';

import { FeatureRow, type FeatureRowProps } from './FeatureRow';

/** Os três sinais que o Usafy cruza para pontuar um trecho. */
const FEATURES: FeatureRowProps[] = [
  {
    icon: 'crime',
    title: 'Criminalidade',
    description: 'Ocorrências registradas por trecho e por horário.',
  },
  {
    icon: 'lighting',
    title: 'Iluminação',
    description: 'Cobertura e falhas na iluminação pública da via.',
  },
  {
    icon: 'footTraffic',
    title: 'Movimento',
    description: 'Fluxo de pessoas ao longo do dia e da noite.',
  },
];

export function OnboardingScreen({ navigation }: RootStackScreenProps<'Onboarding'>) {
  return (
    <Screen scrollable>
      <Spacer flex />

      <View style={styles.brand}>
        <Logo size={88} />
        <Text variant="display">Usafy</Text>
        <Text variant="subtitle" color={colors.accent}>
          Chegue com segurança
        </Text>
      </View>

      <Spacer size="xl" />

      <Text variant="body" color={colors.textSecondary} align="center">
        Rotas urbanas que priorizam sua segurança, não a pressa. Cada trecho é avaliado por
        três fontes de dados:
      </Text>

      <Spacer size="lg" />

      <View style={styles.features}>
        {FEATURES.map((feature) => (
          <FeatureRow key={feature.title} {...feature} />
        ))}
      </View>

      <Spacer flex />
      <Spacer size="lg" />

      <Button
        label="Começar"
        onPress={() => navigation.navigate('Home')}
        accessibilityLabel="Começar a usar o Usafy"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  features: {
    gap: spacing.lg,
  },
});
