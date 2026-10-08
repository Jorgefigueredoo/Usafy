import { useState } from 'react';

import { Header, Screen, Spacer } from '@/components/layout';
import { Button, Input, Text } from '@/components/ui';
import { useRouteSearch } from '@/hooks';
import type { RootStackScreenProps } from '@/navigation/types';
import { colors } from '@/theme';
import { safestRoute } from '@/utils/routeOptions';

export function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const { search, loading: isLoading, error } = useRouteSearch();

  const canSubmit = origin.trim().length > 0 && destination.trim().length > 0;

  async function handleSearch() {
    // Texto livre vai para o geocoding do Mapbox; a fase 2 traz sugestões e GPS.
    const routes = await search(origin, destination);
    const plannedRoute = routes ? safestRoute(routes) : undefined;
    if (plannedRoute) {
      navigation.navigate('Map', { plannedRoute });
    }
  }

  return (
    <Screen scrollable>
      <Header
        title="Para onde vamos?"
        subtitle="Informe origem e destino para ver o trajeto mais seguro."
      />

      <Spacer size="xl" />

      <Input
        label="Origem"
        value={origin}
        onChangeText={setOrigin}
        icon="pin"
        placeholder="Ex.: Boa Viagem"
        autoCorrect={false}
        returnKeyType="next"
        editable={!isLoading}
      />

      <Spacer size="md" />

      <Input
        label="Destino"
        value={destination}
        onChangeText={setDestination}
        icon="flag"
        placeholder="Ex.: Casa Amarela"
        autoCorrect={false}
        returnKeyType="search"
        editable={!isLoading}
        onSubmitEditing={() => {
          if (canSubmit) void handleSearch();
        }}
      />

      {error ? (
        <>
          <Spacer size="sm" />
          <Text variant="caption" color={colors.danger}>
            {error}
          </Text>
        </>
      ) : null}

      <Spacer flex />
      <Spacer size="lg" />

      <Button
        label={isLoading ? 'Calculando rota...' : 'Ver rota segura'}
        onPress={() => void handleSearch()}
        disabled={!canSubmit}
        loading={isLoading}
      />

      <Spacer size="md" />

      <Text variant="caption" color={colors.textSecondary} align="center">
        Níveis de risco simulados nesta versão de testes.
      </Text>
    </Screen>
  );
}
