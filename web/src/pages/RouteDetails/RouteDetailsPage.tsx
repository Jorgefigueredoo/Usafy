import { Navigate, useNavigate } from 'react-router';

import { Header, Screen, Spacer } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { useCurrentRoute } from '@/hooks';
import { paths, type MapNavigationState } from '@/paths';

import { OverallScoreCard } from './OverallScoreCard';
import styles from './RouteDetailsPage.module.css';
import { SegmentCard } from './SegmentCard';

export function RouteDetailsPage() {
  const navigate = useNavigate();
  const { route } = useCurrentRoute();

  if (!route) return <Navigate to={paths.home} replace />;

  const backToMap = () => navigate(paths.map);

  return (
    <Screen
      footer={
        <Button label="Voltar ao mapa" variant="secondary" icon="chevronLeft" fullWidth onClick={backToMap} />
      }
    >
      <Header
        title="Detalhes da rota"
        subtitle={`${route.origin} → ${route.destination}`}
        onBack={backToMap}
        backLabel="Voltar ao mapa"
      />

      <Spacer size="lg" />
      <OverallScoreCard route={route} />

      <Spacer size="xl" />
      <Text variant="subtitle" as="h2">
        Trechos do caminho ({route.segments.length})
      </Text>
      <Spacer size="md" />

      <ol className={styles.segments}>
        {route.segments.map((segment, index) => (
          <SegmentCard
            key={segment.id}
            segment={segment}
            position={index + 1}
            onShowOnMap={() => {
              const state: MapNavigationState = { segmentId: segment.id };
              navigate(paths.map, { state });
            }}
          />
        ))}
      </ol>

      <Spacer size="lg" />
      <Text variant="caption" tone="secondary" align="center">
        Os níveis de risco desta versão são simulados. Os dados reais de criminalidade, iluminação e
        movimento chegam com o backend.
      </Text>
    </Screen>
  );
}
