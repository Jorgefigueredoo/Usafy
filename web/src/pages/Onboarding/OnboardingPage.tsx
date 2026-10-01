import { useNavigate } from 'react-router';

import { Screen, Spacer } from '@/components/layout';
import { Button, Logo, Text } from '@/components/ui';
import { paths } from '@/paths';

import { FeatureRow, type FeatureRowProps } from './FeatureRow';
import styles from './OnboardingPage.module.css';

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

export function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <Screen
      footer={<Button label="Começar" fullWidth onClick={() => navigate(paths.home)} />}
    >
      <Spacer flex />

      <div className={styles.brand}>
        <Logo size="lg" />
        <Text variant="display" as="h1">
          Usafy
        </Text>
        <Text variant="subtitle" tone="accent">
          Chegue com segurança
        </Text>
      </div>

      <Spacer size="xl" />

      <Text tone="secondary" align="center">
        Rotas urbanas que priorizam sua segurança, não a pressa. Cada trecho é avaliado por três
        fontes de dados:
      </Text>

      <Spacer size="lg" />

      <ul className={styles.features}>
        {FEATURES.map((feature) => (
          <FeatureRow key={feature.title} {...feature} />
        ))}
      </ul>

      <Spacer flex />
    </Screen>
  );
}
