import type { Route } from '@/types';
import { cx } from '@/utils/cx';
import { formatDuration } from '@/utils/format';
import { RISK_SUMMARY_LABELS } from '@/utils/risk';
import { ROUTE_TAG_LABELS, routeTag, sortBySafety } from '@/utils/routeOptions';

import styles from './RouteOptions.module.css';

export interface RouteOptionsProps {
  options: Route[];
  selectedId: string;
  onSelect: (routeId: string) => void;
}

/**
 * Comparação lado a lado das opções de caminho: o que cada uma ganha (segurança ou tempo).
 * A mais segura vem primeiro e já chega escolhida.
 */
export function RouteOptions({ options, selectedId, onSelect }: RouteOptionsProps) {
  return (
    <div className={styles.options} role="radiogroup" aria-label="Opções de rota">
      {sortBySafety(options).map((option) => {
        const selected = option.id === selectedId;
        const tag = routeTag(option, options);
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${ROUTE_TAG_LABELS[tag]}: ${formatDuration(option.durationMinutes)}, ${RISK_SUMMARY_LABELS[option.overallRisk]}`}
            className={styles.option}
            onClick={() => onSelect(option.id)}
          >
            <span className={cx(styles.tag, (tag === 'safest' || tag === 'best') && styles.tagSafe)}>
              {ROUTE_TAG_LABELS[tag]}
            </span>
            <span className={styles.duration}>{formatDuration(option.durationMinutes)}</span>
            <span className={cx(styles.risk, styles[option.overallRisk])}>
              <span className={styles.dot} aria-hidden="true" />
              {RISK_SUMMARY_LABELS[option.overallRisk]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
