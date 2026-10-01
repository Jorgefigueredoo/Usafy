import { Icon, Spinner, Text, type IconName } from '@/components/ui';
import type { NavigationPhase } from '@/hooks';
import { layout } from '@/theme';
import type { Maneuver, ManeuverDirection, RouteSegment } from '@/types';
import { cx } from '@/utils/cx';
import { formatManeuverDistance } from '@/utils/format';
import { RISK_LABELS } from '@/utils/risk';

import styles from './NavigationBanner.module.css';

export interface NavigationBannerProps {
  phase: NavigationPhase;
  maneuver: Maneuver | null;
  metersToManeuver: number;
  /** Trecho onde o usuário está agora (`null` enquanto não há posição). */
  segment: RouteSegment | null;
  message: string | null;
  className?: string;
}

const MANEUVER_ICONS: Record<ManeuverDirection, IconName> = {
  left: 'turnLeft',
  right: 'turnRight',
  straight: 'straight',
  uturn: 'uturn',
  arrive: 'flag',
};

export function NavigationBanner({
  phase,
  maneuver,
  metersToManeuver,
  segment,
  message,
  className,
}: NavigationBannerProps) {
  const waitingText = phase === 'rerouting' ? 'Recalculando rota…' : 'Aguardando sinal do GPS…';
  const showWaiting = phase === 'waiting' || phase === 'rerouting';
  const arrived = phase === 'arrived';

  let icon: IconName = 'straight';
  if (arrived) icon = 'flag';
  else if (maneuver) icon = MANEUVER_ICONS[maneuver.direction];

  let headline = 'Siga em frente';
  if (arrived) headline = 'Você chegou ao destino';
  else if (maneuver) headline = formatManeuverDistance(metersToManeuver);

  return (
    // aria-live: leitores de tela anunciam a próxima manobra quando ela muda.
    <section className={cx(styles.banner, className)} aria-label="Navegação" aria-live="polite">
      <div className={styles.instruction}>
        {showWaiting ? (
          <>
            <span className={styles.maneuverIcon}>
              <Spinner label={waitingText} />
            </span>
            <Text variant="subtitle">{waitingText}</Text>
          </>
        ) : (
          <>
            <span className={styles.maneuverIcon}>
              <Icon name={icon} size={layout.iconLg} />
            </span>
            <div className={styles.texts}>
              <Text variant="title" as="strong">
                {headline}
              </Text>
              {maneuver && !arrived && <Text tone="secondary">{maneuver.instruction}</Text>}
            </div>
          </>
        )}
      </div>

      {segment && (
        <div className={cx(styles.risk, styles[segment.riskLevel])}>
          <span className={styles.dot} aria-hidden="true" />
          <span>Trecho atual: {RISK_LABELS[segment.riskLevel]}</span>
          <span className={styles.riskName}>· {segment.name}</span>
        </div>
      )}

      {message && (
        <p className={styles.message} role="alert">
          {message}
        </p>
      )}
    </section>
  );
}
