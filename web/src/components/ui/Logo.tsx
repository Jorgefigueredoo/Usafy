import { colors } from '@/theme';

export type LogoSize = 'sm' | 'md' | 'lg';

export interface LogoProps {
  size?: LogoSize;
}

const LOGO_SIZES: Record<LogoSize, number> = {
  sm: 40,
  md: 64,
  lg: 88,
};

/** Marca do Usafy: escudo (segurança) com um trajeto atravessando (rota). */
export function Logo({ size = 'md' }: LogoProps) {
  const pixels = LOGO_SIZES[size];

  return (
    <svg width={pixels} height={pixels} viewBox="0 0 48 48" role="img" aria-label="Usafy">
      <path
        d="M24 4 41 10.4v12.4c0 9.6-6.9 17.7-17 19.8C13.9 40.5 7 32.4 7 22.8V10.4L24 4Z"
        fill={colors.surface}
        stroke={colors.primary}
        strokeWidth={2}
      />
      <path
        d="M16 29c4.2 0 4.2-6.5 8-6.5s3.8-6.5 8-6.5"
        stroke={colors.accent}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={16} cy={29} r={2.8} fill={colors.accent} />
      <circle cx={32} cy={16} r={2.8} fill={colors.riskLow} />
    </svg>
  );
}
