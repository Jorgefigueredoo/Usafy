import { Icon, Text } from '@/components/ui';
import { MAPBOX_TOKEN } from '@/services/mapboxConfig';
import { layout } from '@/theme';

import styles from './MapFallback.module.css';

/** Ocupa o lugar do mapa quando não há token ou o estilo base não carregou. */
export function MapFallback() {
  return (
    <div className={styles.fallback} role="status">
      <Icon name="alert" size={layout.iconLg} />
      <Text variant="subtitle" align="center">
        Não foi possível carregar o mapa
      </Text>
      <Text tone="secondary" align="center">
        {MAPBOX_TOKEN
          ? 'Verifique sua conexão e o token do Mapbox.'
          : 'Defina VITE_MAPBOX_TOKEN no arquivo .env e reinicie o servidor.'}
      </Text>
    </div>
  );
}
