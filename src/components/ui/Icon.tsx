import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

export type IconName =
  | 'crime'
  | 'lighting'
  | 'footTraffic'
  | 'pin'
  | 'flag'
  | 'clock'
  | 'route'
  | 'chevronLeft';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

type IconShape =
  | { kind: 'path'; d: string }
  | { kind: 'circle'; cx: number; cy: number; r: number };

const VIEW_BOX = 24;

/**
 * Traçados desenhados para o projeto — evita depender de uma biblioteca de ícones.
 * Todos em grade 24x24 e apenas contorno, para herdarem cor e espessura.
 */
const ICON_SHAPES: Record<IconName, IconShape[]> = {
  crime: [
    { kind: 'path', d: 'M12 3.2 19 6v5.6c0 4.2-2.9 7.7-7 8.6-4.1-.9-7-4.4-7-8.6V6l7-2.8Z' },
    { kind: 'path', d: 'M12 9v3.4' },
    { kind: 'path', d: 'M12 15.6h.01' },
  ],
  lighting: [
    { kind: 'path', d: 'M8.2 13.6a5 5 0 1 1 7.6 0c-.7.9-1.1 1.6-1.3 2.4H9.5c-.2-.8-.6-1.5-1.3-2.4Z' },
    { kind: 'path', d: 'M9.8 18.6h4.4' },
    { kind: 'path', d: 'M10.6 21h2.8' },
  ],
  footTraffic: [
    { kind: 'circle', cx: 9, cy: 8, r: 2.4 },
    { kind: 'path', d: 'M4.4 19.4c0-2.8 2-4.9 4.6-4.9s4.6 2.1 4.6 4.9' },
    { kind: 'circle', cx: 16.6, cy: 9.4, r: 1.9 },
    { kind: 'path', d: 'M14.4 19.4c0-2.3 1-3.8 2.8-3.8s2.8 1.5 2.8 3.8' },
  ],
  pin: [
    { kind: 'path', d: 'M12 21.2s-6.6-6.3-6.6-10.6a6.6 6.6 0 1 1 13.2 0c0 4.3-6.6 10.6-6.6 10.6Z' },
    { kind: 'circle', cx: 12, cy: 10.4, r: 2.5 },
  ],
  flag: [
    { kind: 'path', d: 'M6.4 3v18' },
    { kind: 'path', d: 'M6.4 4.2h10.8l-1.9 3.9 1.9 3.9H6.4z' },
  ],
  clock: [
    { kind: 'circle', cx: 12, cy: 12, r: 8.4 },
    { kind: 'path', d: 'M12 7.4V12l3.1 1.9' },
  ],
  route: [
    { kind: 'path', d: 'M5 19c3.5 0 3.5-5 7-5s3.5-5 7-5' },
    { kind: 'circle', cx: 5, cy: 19, r: 1.6 },
    { kind: 'circle', cx: 19, cy: 9, r: 1.6 },
  ],
  chevronLeft: [{ kind: 'path', d: 'M14.6 5.4 8 12l6.6 6.6' }],
};

export function Icon({
  name,
  size = 24,
  color = colors.textPrimary,
  strokeWidth = 1.8,
}: IconProps) {
  const strokeProps = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  } as const;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEW_BOX} ${VIEW_BOX}`} fill="none">
      {ICON_SHAPES[name].map((shape, index) =>
        shape.kind === 'path' ? (
          <Path key={index} d={shape.d} {...strokeProps} />
        ) : (
          <Circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} {...strokeProps} />
        ),
      )}
    </Svg>
  );
}
