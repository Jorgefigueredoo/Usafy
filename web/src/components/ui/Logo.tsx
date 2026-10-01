export type LogoSize = 'sm' | 'md' | 'lg';

export interface LogoProps {
  size?: LogoSize;
}

/** Altura em px; a largura segue a proporção do escudo (600 × 636). */
const LOGO_HEIGHTS: Record<LogoSize, number> = {
  sm: 40,
  md: 64,
  lg: 96,
};

const ASPECT_RATIO = 600 / 636;

/**
 * Marca do Usafy: escudo (segurança) com pin de localização e estrada.
 * O arquivo em `public/logo.svg` é a fonte única — também gera favicon e ícones do PWA.
 */
export function Logo({ size = 'md' }: LogoProps) {
  const height = LOGO_HEIGHTS[size];

  return (
    <img
      src="/logo.svg"
      alt="Usafy"
      width={Math.round(height * ASPECT_RATIO)}
      height={height}
      draggable={false}
    />
  );
}
