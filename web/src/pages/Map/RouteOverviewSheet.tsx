import { useRef, useState, type PointerEvent } from 'react';
import { useNavigate } from 'react-router';

import { Button, Text } from '@/components/ui';
import { paths } from '@/paths';
import { spacing } from '@/theme';
import type { Route } from '@/types';

import { RiskLegend } from './RiskLegend';
import { RouteOptions } from './RouteOptions';
import styles from './RouteOverviewSheet.module.css';
import { RouteSummaryCard } from './RouteSummaryCard';

export interface RouteOverviewSheetProps {
  route: Route;
  /** Opções de caminho da busca; com 2 ou mais, aparece a comparação entre elas. */
  alternatives: Route[];
  onSelectRoute: (routeId: string) => void;
  selectedSegmentId: string | null;
  onSelectSegment: (segmentId: string | null) => void;
  onStartNavigation: () => void;
}

/** Arraste mínimo na alça para abrir/fechar o painel (px). */
const SWIPE_THRESHOLD = spacing.lg;

/**
 * Painel da visão geral da rota, estilo "bottom sheet": começa compacto (resumo, faixa de
 * risco e Iniciar) para o mapa ficar grande, e abre com legenda e detalhes ao arrastar a alça
 * para cima ou tocar nela.
 */
export function RouteOverviewSheet({
  route,
  alternatives,
  onSelectRoute,
  selectedSegmentId,
  onSelectSegment,
  onStartNavigation,
}: RouteOverviewSheetProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const dragStartY = useRef<number | null>(null);
  /** Um arraste já decidiu o estado; o click que vem logo depois é ignorado. */
  const swiped = useRef(false);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    dragStartY.current = event.clientY;
    swiped.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragStartY.current === null) return;
    const deltaY = event.clientY - dragStartY.current;
    dragStartY.current = null;
    if (Math.abs(deltaY) >= SWIPE_THRESHOLD) {
      swiped.current = true;
      setExpanded(deltaY < 0);
    }
  };

  const handleClick = () => {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    setExpanded((value) => !value);
  };

  return (
    <>
      <button
        type="button"
        className={styles.handle}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragStartY.current = null;
        }}
        onClick={handleClick}
        aria-expanded={expanded}
        aria-label={expanded ? 'Mostrar menos' : 'Mostrar legenda e detalhes'}
      >
        <span className={styles.grabber} />
      </button>

      {alternatives.length > 1 && (
        <RouteOptions options={alternatives} selectedId={route.id} onSelect={onSelectRoute} />
      )}
      <RouteSummaryCard
        route={route}
        selectedSegmentId={selectedSegmentId}
        onSelectSegment={onSelectSegment}
      />
      <Button label="Iniciar navegação" icon="navigate" fullWidth onClick={onStartNavigation} />

      <div className={styles.more} data-expanded={expanded}>
        <div className={styles.moreInner}>
          <RiskLegend />
          <Button
            label="Ver detalhes dos trechos"
            variant="secondary"
            trailingIcon="chevronRight"
            fullWidth
            onClick={() => navigate(paths.routeDetails)}
          />
          <Text variant="caption" tone="secondary" align="center">
            Níveis de risco simulados nesta versão de testes.
          </Text>
        </div>
      </div>
    </>
  );
}
