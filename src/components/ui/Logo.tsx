import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

export interface LogoProps {
  size?: number;
}

/** Marca do Usafy: escudo (segurança) com um trajeto atravessando (rota). */
export function Logo({ size = 72 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        d="M24 4 41 10.4v12.4c0 9.6-6.9 17.7-17 19.8C13.9 40.5 7 32.4 7 22.8V10.4L24 4Z"
        fill={colors.surface}
        stroke={colors.primary}
        strokeWidth={2}
      />
      <Path
        d="M16 29c4.2 0 4.2-6.5 8-6.5s3.8-6.5 8-6.5"
        stroke={colors.accent}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={16} cy={29} r={2.8} fill={colors.accent} />
      <Circle cx={32} cy={16} r={2.8} fill={colors.riskLow} />
    </Svg>
  );
}
