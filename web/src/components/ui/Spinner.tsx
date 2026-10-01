import styles from './Spinner.module.css';

export interface SpinnerProps {
  /** Texto lido por leitores de tela; o spinner em si é só visual. */
  label?: string;
}

export function Spinner({ label = 'Carregando' }: SpinnerProps) {
  return <span className={styles.spinner} role="status" aria-label={label} />;
}
