import type { ReactNode } from 'react';

import styles from './Screen.module.css';

export interface ScreenProps {
  children: ReactNode;
  /** Conteúdo fixo no rodapé (normalmente o botão de ação principal). */
  footer?: ReactNode;
}

/** Contêiner de página: coluna centralizada, largura de celular e áreas seguras. */
export function Screen({ children, footer }: ScreenProps) {
  return (
    <div className={styles.screen}>
      <main className={styles.content}>{children}</main>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
