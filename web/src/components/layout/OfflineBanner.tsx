import { Icon } from '@/components/ui';
import { useOnlineStatus } from '@/hooks';
import { layout } from '@/theme';

import styles from './OfflineBanner.module.css';

/**
 * Aviso fixo no topo enquanto não há internet. Mapa e buscas dependem do Mapbox; a navegação
 * já iniciada continua guiando pelo GPS com a rota que está no aparelho.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div className={styles.banner} role="status">
      <Icon name="alert" size={layout.iconSm} />
      Sem internet
      {/* Curto na tela para não cobrir o logo do Mapbox nem os botões do mapa. */}
      <span className={styles.srOnly}>. A rota atual continua; mapa e buscas voltam com a conexão.</span>
    </div>
  );
}
