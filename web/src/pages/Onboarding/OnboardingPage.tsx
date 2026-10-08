import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { Screen, Spacer } from '@/components/layout';
import { Button, Icon, Logo, Text } from '@/components/ui';
import { paths } from '@/paths';
import { layout } from '@/theme';
import { cx } from '@/utils/cx';

import { FeatureRow, type FeatureRowProps } from './FeatureRow';
import { hasSeenOnboarding, markOnboardingSeen } from './onboardingSeen';
import styles from './OnboardingPage.module.css';
import { RoutePreview } from './RoutePreview';

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
  // Lido uma vez na montagem: quem já viu as boas-vindas abre o app direto na busca.
  const [alreadySeen] = useState(hasSeenOnboarding);

  if (alreadySeen) return <Navigate to={paths.home} replace />;

  const start = () => {
    markOnboardingSeen();
    navigate(paths.home);
  };

  return (
    <Screen
      footer={
        <div className={styles.footer}>
          <Button
            label="Começar"
            trailingIcon="chevronRight"
            fullWidth
            onClick={start}
          />
          <Text variant="caption" tone="secondary" align="center">
            Versão de testes · níveis de risco simulados
          </Text>
        </div>
      }
    >
      <header className={styles.topBar}>
        <span className={styles.brand}>
          <Logo size="sm" />
          <Text variant="subtitle" as="span">
            Usafy
          </Text>
        </span>
        <span className={styles.region}>
          <Icon name="pin" size={layout.iconSm} />
          Recife
        </span>
      </header>

      <Spacer size="lg" />

      <div className={styles.reveal}>
        <RoutePreview />
      </div>

      <Spacer size="xl" />

      <div className={cx(styles.reveal, styles.revealLate)}>
        <Text variant="display" as="h1">
          Chegue com <span className={styles.highlight}>segurança</span>.
        </Text>
        <Spacer size="sm" />
        <Text tone="secondary">
          Rotas pelo Recife que desviam dos trechos de risco, não só a mais rápida.
        </Text>
      </div>

      <Spacer size="xl" />

      <section className={cx(styles.reveal, styles.revealLast)}>
        <Text variant="caption" tone="secondary" as="h2" className={styles.eyebrow}>
          Como avaliamos cada trecho
        </Text>
        <Spacer size="sm" />
        <ul className={styles.features}>
          {FEATURES.map((feature) => (
            <FeatureRow key={feature.title} {...feature} />
          ))}
        </ul>
      </section>

      <Spacer size="lg" />
    </Screen>
  );
}
