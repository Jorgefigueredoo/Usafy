import { Pressable, StyleSheet, View } from 'react-native';

import { RiskBadge, Text } from '@/components/ui';
import { colors, radius, riskFillColors, spacing } from '@/theme';
import type { RouteSegment } from '@/types';
import { formatDistanceMeters } from '@/utils/format';
import { RISK_LABELS } from '@/utils/risk';

export interface RiskStripProps {
  segments: RouteSegment[];
  selectedSegmentId: string | null;
  /** Recebe `null` quando o trecho já selecionado é tocado de novo. */
  onSelectSegment: (segmentId: string | null) => void;
}

const BAR_HEIGHT = spacing.sm;
const SELECTED_BAR_HEIGHT = spacing.md;
/** Trechos muito curtos ainda ganham uma largura mínima tocável. */
const MIN_PIECE_WIDTH = spacing.md;

/**
 * O trajeto numa barra: cada pedaço é um trecho, com largura proporcional à distância e cor
 * do risco. Mostra de relance onde está o perigo; tocar num pedaço destaca o trecho no mapa.
 */
export function RiskStrip({ segments, selectedSegmentId, onSelectSegment }: RiskStripProps) {
  const selectedIndex = segments.findIndex((segment) => segment.id === selectedSegmentId);
  const selected = segments[selectedIndex];

  return (
    <View style={styles.wrapper}>
      <View style={styles.strip} accessibilityLabel="Risco ao longo do trajeto">
        {segments.map((segment, index) => {
          const isSelected = segment.id === selectedSegmentId;
          return (
            <Pressable
              key={segment.id}
              onPress={() => onSelectSegment(isSelected ? null : segment.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Trecho ${index + 1}: ${segment.name}, ${RISK_LABELS[segment.riskLevel]}, ${formatDistanceMeters(segment.distanceMeters)}`}
              // Proporção pela distância: o dado decide a largura, não o layout.
              style={[styles.piece, { flexGrow: Math.max(segment.distanceMeters, 1) }]}
            >
              <View
                style={[
                  styles.bar,
                  { backgroundColor: riskFillColors[segment.riskLevel] },
                  selected && !isSelected && styles.barDimmed,
                  isSelected && styles.barSelected,
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.caption} accessibilityLiveRegion="polite">
        {selected ? (
          <>
            <View style={styles.selectedText}>
              <Text variant="caption" color={colors.textSecondary}>
                Trecho {selectedIndex + 1} · {formatDistanceMeters(selected.distanceMeters)}
              </Text>
              <Text numberOfLines={1} style={styles.selectedName}>
                {selected.name}
              </Text>
            </View>
            <RiskBadge level={selected.riskLevel} />
          </>
        ) : (
          <>
            <Text variant="caption" color={colors.textSecondary}>
              Saída
            </Text>
            <Text variant="caption" color={colors.textSecondary}>
              Toque num trecho para ver no mapa
            </Text>
            <Text variant="caption" color={colors.textSecondary}>
              Chegada
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  strip: {
    flexDirection: 'row',
    gap: 2,
  },
  piece: {
    flexBasis: 0,
    minWidth: MIN_PIECE_WIDTH,
    height: spacing.xl,
    justifyContent: 'center',
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: radius.full,
  },
  barDimmed: {
    opacity: 0.35,
  },
  barSelected: {
    height: SELECTED_BAR_HEIGHT,
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
  caption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: spacing.xl + spacing.xs,
  },
  selectedText: {
    flex: 1,
  },
  selectedName: {
    fontWeight: '600',
  },
});
