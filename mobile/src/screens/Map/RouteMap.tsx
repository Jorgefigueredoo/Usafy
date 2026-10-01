import Mapbox from '@rnmapbox/maps';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { RECIFE_CENTER } from '@/config/mapbox';
import { colors, radius, riskFillColors } from '@/theme';
import type { Coordinate, RouteSegment } from '@/types';

export interface RouteMapProps {
  segments: RouteSegment[];
  origin: Coordinate;
  destination: Coordinate;
}

const BOUNDS_PADDING = 48;

function boundsOf(segments: RouteSegment[]) {
  const points = segments.flatMap((segment) => segment.coordinates);
  if (points.length === 0) {
    return undefined;
  }

  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);

  return {
    ne: [Math.max(...longitudes), Math.max(...latitudes)],
    sw: [Math.min(...longitudes), Math.min(...latitudes)],
    paddingTop: BOUNDS_PADDING,
    paddingBottom: BOUNDS_PADDING,
    paddingLeft: BOUNDS_PADDING,
    paddingRight: BOUNDS_PADDING,
  };
}

export function RouteMap({ segments, origin, destination }: RouteMapProps) {
  // Uma feature por trecho, com a cor do risco; o LineLayer lê `color` de cada uma.
  const routeShape = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: segments.map((segment) => ({
        type: 'Feature' as const,
        id: segment.id,
        properties: { color: riskFillColors[segment.riskLevel] },
        geometry: { type: 'LineString' as const, coordinates: segment.coordinates },
      })),
    }),
    [segments],
  );
  const bounds = useMemo(() => boundsOf(segments), [segments]);

  return (
    <View
      style={styles.container}
      accessibilityRole="image"
      accessibilityLabel={`Mapa do trajeto com ${segments.length} trechos`}
    >
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Dark}
        scaleBarEnabled={false}
        logoEnabled
        attributionEnabled
      >
        <Mapbox.Camera defaultSettings={{ centerCoordinate: RECIFE_CENTER, zoomLevel: 12, bounds }} />

        <Mapbox.ShapeSource id="route" shape={routeShape}>
          <Mapbox.LineLayer
            id="route-line"
            style={{
              lineColor: ['get', 'color'],
              lineWidth: 6,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </Mapbox.ShapeSource>

        <Mapbox.PointAnnotation id="origin" coordinate={origin}>
          <View style={[styles.marker, { backgroundColor: colors.primary }]} />
        </Mapbox.PointAnnotation>
        <Mapbox.PointAnnotation id="destination" coordinate={destination}>
          <View style={[styles.marker, { backgroundColor: colors.accent }]} />
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 180,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: colors.textPrimary,
  },
});
