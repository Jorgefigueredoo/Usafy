import { Header, Screen, Spacer } from '@/components/layout';
import { Button } from '@/components/ui';
import type { RootStackScreenProps } from '@/navigation/types';

import { MapPlaceholder } from './MapPlaceholder';
import { RiskLegend } from './RiskLegend';
import { RouteSummaryCard } from './RouteSummaryCard';

export function MapScreen({ navigation, route }: RootStackScreenProps<'Map'>) {
  const { plannedRoute } = route.params;

  return (
    <Screen>
      <Header title="Rota sugerida" onBack={() => navigation.goBack()} />

      <Spacer size="md" />
      <MapPlaceholder segments={plannedRoute.segments} />

      <Spacer size="md" />
      <RiskLegend />

      <Spacer size="md" />
      <RouteSummaryCard route={plannedRoute} />

      <Spacer size="md" />
      <Button
        label="Ver detalhes do trajeto"
        onPress={() => navigation.navigate('RouteDetails', { plannedRoute })}
      />
    </Screen>
  );
}
