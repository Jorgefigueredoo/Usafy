import type { SpacingToken } from '@/theme';
import { cx } from '@/utils/cx';

import styles from './Spacer.module.css';

export interface SpacerProps {
  size?: SpacingToken;
  /** Ocupa todo o espaço livre da coluna (empurra o conteúdo seguinte para baixo). */
  flex?: boolean;
}

export function Spacer({ size = 'md', flex = false }: SpacerProps) {
  return <div className={cx(styles.spacer, flex ? styles.flex : styles[size])} aria-hidden="true" />;
}
