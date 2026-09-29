import { useState } from 'react';

import { Header, Screen, Spacer } from '@/components/layout';
import { Button, Input, Text } from '@/components/ui';
import { useRouteSearch } from '@/hooks';
import type { RootStackScreenProps } from '@/navigation/types';
import { colors } from '@/theme';

export function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const { searchRoute, isLoading, error } = useRouteSearch();

  const canSubmit = origin.trim().length > 0 && destination.trim().length > 0;

  async function handleSearch() {
    const plannedRoute = await searchRoute(origin, destination);
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
        Versão de demonstração com trechos reais do Recife.
      </Text>
    </Screen>
  );
}
