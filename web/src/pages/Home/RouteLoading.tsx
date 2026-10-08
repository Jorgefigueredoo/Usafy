import { useEffect, useState } from 'react';

import styles from './RouteLoading.module.css';

/** O que o app faz enquanto calcula: buscar caminhos e pontuar os três critérios de risco. */
const STEPS = [
  'Buscando caminhos',
  'Avaliando criminalidade',
  'Checando iluminação',
  'Medindo movimento',
] as const;

const STEP_INTERVAL_MS = 900;

/**
 * Cartão sobre o mapa enquanto a rota é calculada: uma rota se desenhando em loop e a etapa
 * da análise mudando. Torna a espera mais curta de sentir e mostra o que está sendo avaliado.
 */
export function RouteLoading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setStep((current) => Math.min(current + 1, STEPS.length - 1)),
      STEP_INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.card}>
        <svg className={styles.route} viewBox="0 0 120 40" aria-hidden="true">
          <path className={styles.track} d="M8 32C30 32 30 8 52 8S74 32 96 32 112 20 112 20" />
          <path className={styles.trace} pathLength="1" d="M8 32C30 32 30 8 52 8S74 32 96 32 112 20 112 20" />
          <circle className={styles.origin} cx="8" cy="32" r="4" />
          <circle className={styles.destination} cx="112" cy="20" r="4" />
        </svg>
        <p className={styles.title}>Analisando rotas mais seguras</p>
        <p key={step} className={styles.step}>
          {STEPS[step]}…
        </p>
        <ol className={styles.dots} aria-hidden="true">
          {STEPS.map((label, index) => (
            <li key={label} className={index <= step ? styles.dotDone : styles.dot} />
          ))}
        </ol>
      </div>
    </div>
  );
}
