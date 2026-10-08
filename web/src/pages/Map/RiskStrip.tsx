import { RiskBadge, Text } from '@/components/ui';
import type { RouteSegment } from '@/types';
import { cx } from '@/utils/cx';
import { formatDistanceMeters } from '@/utils/format';
import { RISK_LABELS } from '@/utils/risk';

import styles from './RiskStrip.module.css';

export interface RiskStripProps {
  segments: RouteSegment[];
  selectedSegmentId: string | null;
  /** Recebe `null` quando o trecho já selecionado é tocado de novo. */
  onSelectSegment: (segmentId: string | null) => void;
}

/**
 * O trajeto numa barra: cada pedaço é um trecho, com largura proporcional à distância e cor
 * do risco. Mostra de relance onde está o perigo; tocar num pedaço destaca o trecho no mapa.
 */
export function RiskStrip({ segments, selectedSegmentId, onSelectSegment }: RiskStripProps) {
  const selectedIndex = segments.findIndex((segment) => segment.id === selectedSegmentId);
  const selected = segments[selectedIndex];

  return (
    <div className={styles.wrapper}>
      <div className={styles.strip} role="group" aria-label="Risco ao longo do trajeto">
        {segments.map((segment, index) => {
          const isSelected = segment.id === selectedSegmentId;
          return (
            <button
              key={segment.id}
              type="button"
              className={cx(styles.piece, styles[segment.riskLevel])}
              // Proporção pela distância: o dado decide a largura, não o layout.
              style={{ flexGrow: Math.max(segment.distanceMeters, 1) }}
              aria-pressed={isSelected}
              aria-label={`Trecho ${index + 1}: ${segment.name}, ${RISK_LABELS[segment.riskLevel]}, ${formatDistanceMeters(segment.distanceMeters)}`}
              onClick={() => onSelectSegment(isSelected ? null : segment.id)}
            />
          );
        })}
      </div>

      <div className={styles.caption} aria-live="polite">
        {selected ? (
          <>
            <span className={styles.selectedText}>
              <Text variant="caption" tone="secondary" as="span">
                Trecho {selectedIndex + 1} · {formatDistanceMeters(selected.distanceMeters)}
              </Text>
              <Text as="strong" className={styles.selectedName}>
                {selected.name}
              </Text>
            </span>
            <RiskBadge level={selected.riskLevel} />
          </>
        ) : (
          <>
            <Text variant="caption" tone="secondary" as="span">
              Saída
            </Text>
            <Text variant="caption" tone="secondary" as="span">
              Toque num trecho para ver no mapa
            </Text>
            <Text variant="caption" tone="secondary" as="span">
              Chegada
            </Text>
          </>
        )}
      </div>
    </div>
  );
}
