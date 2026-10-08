import { layout } from '@/theme';

export type IconName =
  | 'crime'
  | 'lighting'
  | 'footTraffic'
  | 'pin'
  | 'flag'
  | 'clock'
  | 'route'
  | 'swap'
  | 'alert'
  | 'locate'
  | 'close'
  | 'navigate'
  | 'turnLeft'
  | 'turnRight'
  | 'straight'
  | 'uturn'
  | 'chevronLeft'
  | 'chevronRight'
  | 'layers'
  | 'sun'
  | 'moon'
  | 'globe'
  | 'check';

export interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

type IconShape =
  | { kind: 'path'; d: string }
  | { kind: 'circle'; cx: number; cy: number; r: number };

/**
 * Traçados desenhados para o projeto, em grade 24x24 e apenas contorno.
 * Herdam a cor do texto (`currentColor`), então quem usa controla o tom via CSS.
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
  swap: [
    { kind: 'path', d: 'M8 4v15' },
    { kind: 'path', d: 'm4.5 7.5 3.5-3.5 3.5 3.5' },
    { kind: 'path', d: 'M16 20V5' },
    { kind: 'path', d: 'm19.5 16.5-3.5 3.5-3.5-3.5' },
  ],
  alert: [
    { kind: 'circle', cx: 12, cy: 12, r: 8.4 },
    { kind: 'path', d: 'M12 7.8v4.8' },
    { kind: 'path', d: 'M12 16.2h.01' },
  ],
  locate: [
    { kind: 'circle', cx: 12, cy: 12, r: 6.4 },
    { kind: 'circle', cx: 12, cy: 12, r: 2.2 },
    { kind: 'path', d: 'M12 2.6v3' },
    { kind: 'path', d: 'M12 18.4v3' },
    { kind: 'path', d: 'M2.6 12h3' },
    { kind: 'path', d: 'M18.4 12h3' },
  ],
  close: [
    { kind: 'path', d: 'M6.5 6.5l11 11' },
    { kind: 'path', d: 'M17.5 6.5l-11 11' },
  ],
  navigate: [{ kind: 'path', d: 'M12 3.2 19 20l-7-3.8L5 20l7-16.8Z' }],
  turnLeft: [
    { kind: 'path', d: 'M17 20v-6.5A4.5 4.5 0 0 0 12.5 9H5' },
    { kind: 'path', d: 'M9 5 5 9l4 4' },
  ],
  turnRight: [
    { kind: 'path', d: 'M7 20v-6.5A4.5 4.5 0 0 1 11.5 9H19' },
    { kind: 'path', d: 'm15 5 4 4-4 4' },
  ],
  straight: [
    { kind: 'path', d: 'M12 20V4.5' },
    { kind: 'path', d: 'm6.5 10 5.5-5.5 5.5 5.5' },
  ],
  uturn: [
    { kind: 'path', d: 'M7 20V9.5a5 5 0 0 1 10 0V16' },
    { kind: 'path', d: 'm13.5 12.5 3.5 3.5 3.5-3.5' },
  ],
  chevronLeft: [{ kind: 'path', d: 'M14.6 5.4 8 12l6.6 6.6' }],
  chevronRight: [{ kind: 'path', d: 'M9.4 5.4 16 12l-6.6 6.6' }],
  layers: [
    { kind: 'path', d: 'm12 3.6 8.4 4.4-8.4 4.4L3.6 8 12 3.6Z' },
    { kind: 'path', d: 'm3.6 12 8.4 4.4 8.4-4.4' },
    { kind: 'path', d: 'm3.6 16 8.4 4.4 8.4-4.4' },
  ],
  sun: [
    { kind: 'circle', cx: 12, cy: 12, r: 3.8 },
    { kind: 'path', d: 'M12 2.8v2' },
    { kind: 'path', d: 'M12 19.2v2' },
    { kind: 'path', d: 'M2.8 12h2' },
    { kind: 'path', d: 'M19.2 12h2' },
    { kind: 'path', d: 'm5.5 5.5 1.4 1.4' },
    { kind: 'path', d: 'm17.1 17.1 1.4 1.4' },
    { kind: 'path', d: 'm5.5 18.5 1.4-1.4' },
    { kind: 'path', d: 'm17.1 6.9 1.4-1.4' },
  ],
  moon: [{ kind: 'path', d: 'M19.6 14.6A8 8 0 0 1 9.4 4.4a8 8 0 1 0 10.2 10.2Z' }],
  globe: [
    { kind: 'circle', cx: 12, cy: 12, r: 8.4 },
    { kind: 'path', d: 'M3.6 12h16.8' },
    { kind: 'path', d: 'M12 3.6c2.3 2.3 3.4 5.1 3.4 8.4s-1.1 6.1-3.4 8.4c-2.3-2.3-3.4-5.1-3.4-8.4S9.7 5.9 12 3.6Z' },
  ],
  check: [{ kind: 'path', d: 'm5 12.5 4.4 4.4L19 7.3' }],
};

export function Icon({ name, size = layout.iconMd, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {ICON_SHAPES[name].map((shape, index) =>
        shape.kind === 'path' ? (
          <path key={index} d={shape.d} />
        ) : (
          <circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} />
        ),
      )}
    </svg>
  );
}
