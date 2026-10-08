import { useMemo, useState } from 'react';
import { LayoutAnimation, PanResponder, Pressable, StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';
import type { Route } from '@/types';

import { RiskLegend } from './RiskLegend';
import { RouteOptions } from './RouteOptions';
import { RouteSummaryCard } from './RouteSummaryCard';

export interface RouteOverviewSheetProps {
  route: Route;
  /** Opções de caminho da busca; com 2 ou mais, aparece a comparação entre elas. */
  alternatives: Route[];
  onSelectRoute: (routeId: string) => void;
  selectedSegmentId: string | null;
  onSelectSegment: (segmentId: string | null) => void;
  onOpenDetails: () => void;
}

/** Arraste mínimo na alça para abrir/fechar o painel (pt). */
const SWIPE_THRESHOLD = spacing.lg;

/**
 * Painel da visão geral da rota, estilo "bottom sheet": começa compacto (opções, resumo e
 * faixa de risco) para o mapa ficar grande, e abre com legenda e aviso ao arrastar a alça
 * para cima ou tocar nela.
 */
export function RouteOverviewSheet({
  route,
  alternatives,
  onSelectRoute,
  selectedSegmentId,
  onSelectSegment,
  onOpenDetails,
}: RouteOverviewSheetProps) {
  const [expanded, setExpandedState] = useState(false);

  const setExpanded = (next: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedState(next);
  };

  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > spacing.xs,
        onPanResponderRelease: (_, gesture) => {
          if (Math.abs(gesture.dy) < SWIPE_THRESHOLD) return;
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpandedState(gesture.dy < 0);
        },
      }),
    [],
  );

  return (
    <View style={styles.sheet}>
      <Pressable
        {...swipe.panHandlers}
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={expanded ? 'Mostrar menos' : 'Mostrar legenda e detalhes'}
        style={styles.handle}
      >
        <View style={[styles.grabber, expanded && styles.grabberActive]} />
      </Pressable>

      {alternatives.length > 1 ? (
        <RouteOptions options={alternatives} selectedId={route.id} onSelect={onSelectRoute} />
      ) : null}
      <RouteSummaryCard route={route} selectedSegmentId={selectedSegmentId} onSelectSegment={onSelectSegment} />
      <Button label="Ver detalhes dos trechos" icon="route" onPress={onOpenDetails} />

      {expanded ? (
        <View style={styles.more}>
          <RiskLegend />
          <Text variant="caption" color={colors.textSecondary} align="center">
            Níveis de risco simulados nesta versão de testes.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: spacing.md,
  },
  // Área de toque larga no topo, com a barrinha visível no meio.
  handle: {
    alignItems: 'center',
    justifyContent: 'center',
    height: spacing.lg,
    marginTop: -spacing.md,
    marginBottom: -spacing.sm,
  },
  grabber: {
    width: spacing.xxl,
    height: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  grabberActive: {
    backgroundColor: colors.textSecondary,
  },
  more: {
    gap: spacing.md,
  },
});
