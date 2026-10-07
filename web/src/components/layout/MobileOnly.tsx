import type { ReactNode } from 'react';

import { Card, Icon, Logo, Text } from '@/components/ui';
import { isMobileDevice } from '@/utils/device';

import styles from './MobileOnly.module.css';
import { Screen } from './Screen';
import { Spacer } from './Spacer';

export interface MobileOnlyProps {
  children: ReactNode;
}

/**
 * O Usafy é feito para usar na rua, com GPS. No desktop mostra só um aviso para abrir no celular,
 * sem montar o app (e sem pedir localização).
 */
export function MobileOnly({ children }: MobileOnlyProps) {
  if (isMobileDevice()) return children;

  return (
    <Screen>
      <Spacer flex />

      <div className={styles.brand}>
        <Logo size="lg" />
        <Text variant="title" as="h1" align="center">
          Abra o Usafy no celular
        </Text>
      </div>

      <Spacer size="lg" />

      <Text tone="secondary" align="center">
        O Usafy foi feito para te guiar na rua, usando o GPS do celular. No computador ele não
        funciona.
      </Text>

      <Spacer size="xl" />

      <Card spacious className={styles.card}>
        <span className={styles.iconWrap}>
          <Icon name="locate" />
        </span>
        <Text tone="secondary" variant="caption" align="center">
          No navegador do celular, acesse
        </Text>
        <Text variant="subtitle" tone="accent" align="center">
          {window.location.host}
        </Text>
      </Card>

      <Spacer flex />
    </Screen>
  );
}
