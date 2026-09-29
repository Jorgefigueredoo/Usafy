import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/ui';
import { colors, radius, riskFillColors, spacing } from '@/theme';
import type { RouteSegment } from '@/types';

export interface MapPlaceholderProps {
  segments: RouteSegment[];
}

const VIEW_BOX_WIDTH = 300;
const VIEW_BOX_HEIGHT = 420;

/** Malha viária decorativa — só dá contexto visual ao traçado. */
const STREETS_X = [38, 96, 152, 210, 264];
const STREETS_Y = [54, 122, 190, 258, 326, 384];

/** Um traçado fixo por trecho, encadeados do início ao fim da rota. */
const SEGMENT_PATHS = [
  { d: 'M46 352C70 330 86 300 104 268', marker: { x: 46, y: 352 } },
  { d: 'M104 268C126 232 150 226 176 196', marker: { x: 104, y: 268 } },
  { d: 'M176 196C200 168 212 128 236 72', marker: { x: 176, y: 196 } },
] as const;

const DESTINATION = { x: 236, y: 72 };

export function MapPlaceholder({ segments }: MapPlaceholderProps) {
  // Só desenha os traçados que têm trecho correspondente na rota.
  const drawn = SEGMENT_PATHS.map((path, index) => {
    const segment = segments[index];
    return segment ? { ...path, segment } : null;
  }).filter((item): item is (typeof SEGMENT_PATHS)[number] & { segment: RouteSegment } => item !== null);

  return (
    <View
      style={styles.container}
      accessibilityRole="image"
      accessibilityLabel={`Mapa ilustrativo do trajeto com ${segments.length} trechos`}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${VIEW_BOX_WIDTH} ${VIEW_BOX_HEIGHT}`}>
        <Rect x={0} y={0} width={VIEW_BOX_WIDTH} height={VIEW_BOX_HEIGHT} fill={colors.surfaceSunken} />

        <G opacity={0.5}>
          {STREETS_X.map((x) => (
            <Line key={`x-${x}`} x1={x} y1={0} x2={x} y2={VIEW_BOX_HEIGHT} stroke={colors.border} strokeWidth={6} />
          ))}
          {STREETS_Y.map((y) => (
            <Line key={`y-${y}`} x1={0} y1={y} x2={VIEW_BOX_WIDTH} y2={y} stroke={colors.border} strokeWidth={6} />
          ))}
        </G>

        {drawn.map(({ d, segment }) => (
          <Path
            key={segment.id}
            d={d}
            stroke={riskFillColors[segment.riskLevel]}
            strokeWidth={9}
            strokeLinecap="round"
            fill="none"
          />
        ))}

        {drawn.map(({ marker, segment }) => (
          <Circle
            key={`marker-${segment.id}`}
            cx={marker.x}
            cy={marker.y}
            r={7}
            fill={colors.background}
            stroke={riskFillColors[segment.riskLevel]}
            strokeWidth={4}
          />
        ))}

        <Circle
          cx={DESTINATION.x}
          cy={DESTINATION.y}
          r={8}
          fill={colors.accent}
          stroke={colors.background}
          strokeWidth={3}
        />
      </Svg>

      <View style={styles.caption}>
        <Text variant="caption" color={colors.textSecondary} align="center">
          Mapa ilustrativo. A integração com mapa e GPS reais entra na próxima versão.
        </Text>
      </View>
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
    justifyContent: 'flex-end',
  },
  caption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.scrim,
  },
});
