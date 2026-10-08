import styles from './RoutePreview.module.css';

/**
 * Ilustração do que o app faz: a rota mais rápida corta um trecho de risco alto e a rota do
 * Usafy contorna por ruas mais seguras. Desenho em grade 320 × 180, cores só por CSS.
 */
export function RoutePreview() {
  return (
    <figure
      className={styles.preview}
      role="img"
      aria-label="Ilustração: a rota mais rápida passa por um trecho de risco alto; a rota do Usafy contorna por ruas mais seguras."
    >
      <svg className={styles.canvas} viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {/* Rio e ruas ao fundo. */}
        <path className={styles.river} d="M-10 72C70 52 118 124 196 112S292 58 330 74" />
        <g className={styles.streets}>
          <path d="M0 40H320M0 95H320M0 150H320" />
          <path d="M60 0V180M180 0V180M290 0V180" />
        </g>
        <g className={styles.minorStreets}>
          <path d="M0 122H320M0 15H320M120 0V180M240 0V180" />
        </g>

        {/* Área de risco alto e a rota rápida que passa por ela. */}
        <circle className={styles.hotspot} cx="130" cy="80" r="30" />
        <circle className={styles.hotspotCore} cx="130" cy="80" r="12" />
        <path className={styles.fastRoute} d="M60 150L130 80L220 60L290 40" />

        {/* Rota do Usafy, trecho a trecho pela cor do risco. */}
        <path className={styles.glow} d="M60 150H180V95H290V40" />
        <path className={styles.casing} d="M60 150H180V95H290V40" />
        <path className={styles.segmentLow} pathLength="1" d="M60 150H180" />
        <path className={styles.segmentMedium} pathLength="1" d="M180 150V95" />
        <path className={styles.segmentLowEnd} pathLength="1" d="M180 95H290V40" />

        <circle className={styles.origin} cx="60" cy="150" r="7" />
        <g className={styles.destination}>
          <path d="M290 40c-7.5-8.6-12-14.4-12-20.2a12 12 0 0 1 24 0c0 5.8-4.5 11.6-12 20.2Z" />
          <circle cx="290" cy="20" r="4.2" />
        </g>
      </svg>

      <span className={styles.chipFast}>
        <span className={styles.dotHigh} />
        Mais rápida · risco alto
      </span>
      <span className={styles.chipSafe}>
        <span className={styles.dotLow} />
        Usafy · mais segura
      </span>
    </figure>
  );
}
