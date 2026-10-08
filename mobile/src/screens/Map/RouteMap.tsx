import Mapbox from '@rnmapbox/maps';
import type { FeatureCollection, LineString } from 'geojson';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { BrandMap } from '@/components/map';
import { Text } from '@/components/ui';
import { colors, radius, riskFillColors, riskToneColors, spacing } from '@/theme';
import type { Coordinate, RiskLevel, Route } from '@/types';
import { formatDuration } from '@/utils/format';
import { mostDistinctPoint } from '@/utils/geo';
import { RISK_SUMMARY_LABELS } from '@/utils/risk';

export interface RouteMapProps {
  route: Route;
  /** Opções de caminho da busca (incluindo `route`). Vazia: só a rota escolhida aparece. */
  alternatives: Route[];
  /** Trecho tocado na faixa de risco: fica em destaque e a câmera enquadra só ele. */
  highlightedSegmentId: string | null;
  /** Usuário tocou numa rota alternativa (na linha ou na etiqueta). */
  onSelectRoute: (routeId: string) => void;
  /** Folga embaixo para o enquadramento não ficar atrás do painel. */
  bottomInset: number;
}

const LINE_WIDTH = 6;
const CASING_WIDTH = LINE_WIDTH + spacing.xs;
/** Halo desfocado da cor do risco por baixo da linha: destaca a rota em qualquer tema. */
const GLOW_WIDTH = LINE_WIDTH + spacing.md;
const HIGHLIGHT_GLOW_WIDTH = GLOW_WIDTH + spacing.sm;
const GLOW_OPACITY = 0.45;
const HIGHLIGHT_GLOW_OPACITY = 0.7;
/** Trecho escondido atrás de prédios 3D continua aparecendo, só mais apagado. */
const OCCLUDED_OPACITY = 0.4;
const ALTERNATIVE_OPACITY = 0.85;
/** Faixa de toque das alternativas: linha fina é difícil de acertar com o dedo. */
const ALTERNATIVE_HITBOX = spacing.lg;
const FIT_DURATION_MS = 800;
/** Folga do enquadramento: em cima ficam os botões flutuantes. */
const FIT_PADDING_TOP = spacing.xxl + spacing.xl;
const FIT_PADDING_SIDE = spacing.xl;

const RISK_COLOR = [
  'match',
  ['get', 'riskLevel'],
  'low',
  riskFillColors.low,
  'medium',
  riskFillColors.medium,
  'high',
  riskFillColors.high,
  colors.primary,
] as const;

// `middle`: acima das ruas e abaixo dos rótulos e dos prédios 3D do estilo Standard.
// Emissiva: a iluminação de entardecer/noite do Standard não escurece as cores de risco.
const LIT = { lineEmissiveStrength: 1, lineOcclusionOpacity: OCCLUDED_OPACITY, lineCap: 'round', lineJoin: 'round' } as const;

function boundsOf(points: Coordinate[]): { ne: Coordinate; sw: Coordinate } | null {
  if (points.length === 0) return null;
  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);
  return {
    ne: [Math.max(...longitudes), Math.max(...latitudes)],
    sw: [Math.min(...longitudes), Math.min(...latitudes)],
  };
}

function segmentsAsGeoJson(route: Route): FeatureCollection<LineString, { id: string; riskLevel: RiskLevel }> {
  return {
    type: 'FeatureCollection',
    features: route.segments.map((segment) => ({
      type: 'Feature',
      properties: { id: segment.id, riskLevel: segment.riskLevel },
      geometry: { type: 'LineString', coordinates: segment.coordinates },
    })),
  };
}

function alternativesAsGeoJson(alternatives: Route[], selectedId: string): FeatureCollection<LineString, { id: string }> {
  return {
    type: 'FeatureCollection',
    features: alternatives
      .filter((option) => option.id !== selectedId)
      .map((option) => ({
        type: 'Feature',
        properties: { id: option.id },
        geometry: { type: 'LineString', coordinates: option.geometry },
      })),
  };
}

export function RouteMap({ route, alternatives, highlightedSegmentId, onSelectRoute, bottomInset }: RouteMapProps) {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [mapHeight, setMapHeight] = useState(0);

  const segmentsShape = useMemo(() => segmentsAsGeoJson(route), [route]);
  const alternativesShape = useMemo(() => alternativesAsGeoJson(alternatives, route.id), [alternatives, route.id]);

  // Etiqueta de cada opção no ponto onde ela se separa das outras.
  const chips = useMemo(() => {
    if (alternatives.length < 2) return [];
    return alternatives.flatMap((option) => {
      const others = alternatives.filter((other) => other.id !== option.id).map((other) => other.geometry);
      const point = mostDistinctPoint(option.geometry, others);
      return point ? [{ option, point }] : [];
    });
  }, [alternatives]);

  // Enquadra o trecho escolhido, todas as opções ou a rota — e de novo quando o painel muda.
  const target = useMemo(() => {
    const segment = route.segments.find((item) => item.id === highlightedSegmentId);
    if (segment && segment.coordinates.length > 0) return boundsOf(segment.coordinates);
    const all = alternatives.flatMap((option) => option.geometry);
    return boundsOf(all.length > 0 ? all : route.geometry);
  }, [route, alternatives, highlightedSegmentId]);

  useEffect(() => {
    if (!target || mapHeight === 0) return;
    cameraRef.current?.fitBounds(
      target.ne,
      target.sw,
      [FIT_PADDING_TOP, FIT_PADDING_SIDE, bottomInset + spacing.lg, FIT_PADDING_SIDE],
      FIT_DURATION_MS,
    );
  }, [target, mapHeight, bottomInset]);

  const isSelected = ['==', ['get', 'id'], highlightedSegmentId ?? ''] as const;
  const start = route.geometry[0];
  const end = route.geometry[route.geometry.length - 1];
  const initialBounds = boundsOf(route.geometry);

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(event: LayoutChangeEvent) => setMapHeight(event.nativeEvent.layout.height)}
    >
      <BrandMap
        accessibilityLabel={`Mapa da rota de ${route.origin} até ${route.destination}`}
        // Logo e atribuição acima da borda do painel, inteiros (exigência dos termos do Mapbox).
        logoPosition={{ bottom: bottomInset + spacing.sm, left: spacing.sm }}
        attributionPosition={{ bottom: bottomInset + spacing.sm, right: spacing.sm }}
      >
        <Mapbox.Camera
          ref={cameraRef}
          defaultSettings={
            initialBounds
              ? {
                  bounds: initialBounds,
                  padding: {
                    paddingTop: FIT_PADDING_TOP,
                    paddingBottom: bottomInset + spacing.lg,
                    paddingLeft: FIT_PADDING_SIDE,
                    paddingRight: FIT_PADDING_SIDE,
                  },
                }
              : undefined
          }
        />

        {/* Alternativas por baixo de tudo, em cinza: visíveis para comparar, sem competir. */}
        <Mapbox.ShapeSource
          id="route-alternatives"
          shape={alternativesShape}
          hitbox={{ width: ALTERNATIVE_HITBOX, height: ALTERNATIVE_HITBOX }}
          onPress={(event) => {
            const id: unknown = event.features[0]?.properties?.id;
            if (typeof id === 'string') onSelectRoute(id);
          }}
        >
          <Mapbox.LineLayer
            id="route-alt-casing"
            slot="middle"
            style={{ ...LIT, lineColor: colors.surface, lineWidth: CASING_WIDTH, lineOpacity: ALTERNATIVE_OPACITY }}
          />
          <Mapbox.LineLayer
            id="route-alt"
            slot="middle"
            style={{ ...LIT, lineColor: colors.textSecondary, lineWidth: LINE_WIDTH, lineOpacity: ALTERNATIVE_OPACITY }}
          />
        </Mapbox.ShapeSource>

        <Mapbox.ShapeSource id="route-segments" shape={segmentsShape}>
          <Mapbox.LineLayer
            id="route-glow"
            slot="middle"
            filter={highlightedSegmentId ? isSelected : undefined}
            style={{
              ...LIT,
              lineColor: RISK_COLOR,
              lineWidth: highlightedSegmentId ? HIGHLIGHT_GLOW_WIDTH : GLOW_WIDTH,
              lineBlur: spacing.sm,
              lineOpacity: highlightedSegmentId ? HIGHLIGHT_GLOW_OPACITY : GLOW_OPACITY,
            }}
          />
          <Mapbox.LineLayer
            id="route-casing"
            slot="middle"
            style={{ ...LIT, lineColor: colors.background, lineWidth: CASING_WIDTH }}
          />
          {/* Com um trecho em destaque, os outros ficam cinza (cor, não opacidade: mantém a oclusão 3D). */}
          <Mapbox.LineLayer
            id="route-risk"
            slot="middle"
            style={{
              ...LIT,
              lineWidth: LINE_WIDTH,
              lineColor: highlightedSegmentId ? (['case', isSelected, RISK_COLOR, colors.textSecondary] as const) : RISK_COLOR,
            }}
          />
        </Mapbox.ShapeSource>

        {start ? (
          <Mapbox.MarkerView coordinate={start} allowOverlap>
            <View style={styles.origin} accessibilityLabel={`Origem: ${route.origin}`} />
          </Mapbox.MarkerView>
        ) : null}
        {end ? (
          <Mapbox.MarkerView coordinate={end} allowOverlap anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.destination} accessibilityLabel={`Destino: ${route.destination}`}>
              <View style={styles.destinationDot} />
            </View>
          </Mapbox.MarkerView>
        ) : null}

        {chips.map(({ option, point }) => {
          const selected = option.id === route.id;
          return (
            <Mapbox.MarkerView key={option.id} coordinate={point} anchor={{ x: 0.5, y: 1 }} allowOverlap>
              <Pressable
                onPress={() => onSelectRoute(option.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${selected ? 'Rota escolhida' : 'Escolher rota'}: ${formatDuration(option.durationMinutes)}, ${RISK_SUMMARY_LABELS[option.overallRisk]}`}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <View style={[styles.chipDot, { backgroundColor: riskToneColors[option.overallRisk] }]} />
                <Text
                  variant={selected ? 'body' : 'caption'}
                  color={selected ? colors.textPrimary : colors.textSecondary}
                  style={styles.chipText}
                >
                  {formatDuration(option.durationMinutes)}
                </Text>
              </Pressable>
            </Mapbox.MarkerView>
          );
        })}
      </BrandMap>
    </View>
  );
}

const ORIGIN_SIZE = spacing.lg;
const DESTINATION_SIZE = spacing.xl;

const styles = StyleSheet.create({
  origin: {
    width: ORIGIN_SIZE,
    height: ORIGIN_SIZE,
    borderRadius: radius.full,
    borderWidth: spacing.xs + 1,
    borderColor: colors.textPrimary,
    backgroundColor: colors.primary,
  },
  destination: {
    width: DESTINATION_SIZE,
    height: DESTINATION_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.textPrimary,
    backgroundColor: colors.accent,
  },
  destinationDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.textPrimary,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: spacing.xl,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSunken,
  },
  chipSelected: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.primary,
  },
  chipDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: radius.full,
  },
  chipText: {
    fontWeight: '600',
  },
});
