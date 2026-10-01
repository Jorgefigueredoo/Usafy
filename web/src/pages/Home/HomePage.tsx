import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';

import { Header, Screen, Spacer } from '@/components/layout';
import { Button, Card, Icon, Input, Logo, Text } from '@/components/ui';
import { useCurrentRoute, useRouteSearch } from '@/hooks';
import { paths } from '@/paths';
import { layout } from '@/theme';

import { ErrorMessage } from './ErrorMessage';
import { NeighborhoodChips } from './NeighborhoodChips';
import styles from './HomePage.module.css';

const FORM_ID = 'route-search-form';

const RECIFE_NEIGHBORHOODS = ['Boa Viagem', 'Pina', 'Graças', 'Casa Amarela', 'Santo Amaro'] as const;

export function HomePage() {
  const navigate = useNavigate();
  const { setRoute } = useCurrentRoute();
  const { loading, error, search, clearError } = useRouteSearch();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const canSubmit = origin.trim().length > 0 && destination.trim().length > 0 && !loading;

  const updateOrigin = (value: string) => {
    setOrigin(value);
    clearError();
  };

  const updateDestination = (value: string) => {
    setDestination(value);
    clearError();
  };

  // Atalho: preenche o primeiro campo vazio (origem, depois destino).
  const fillNextEmpty = (neighborhood: string) => {
    if (!origin.trim()) updateOrigin(neighborhood);
    else updateDestination(neighborhood);
  };

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
    clearError();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    const route = await search(origin, destination);
    if (route) {
      setRoute(route);
      navigate(paths.map);
    }
  };

  return (
    <Screen
      footer={
        <Button
          type="submit"
          form={FORM_ID}
          label="Ver rota segura"
          loadingLabel="Calculando rota…"
          trailingIcon="chevronRight"
          loading={loading}
          disabled={!canSubmit}
          fullWidth
        />
      }
    >
      <Header subtitle="Usafy" title="Para onde vamos?" trailing={<Logo size="sm" />} />

      <Spacer size="sm" />
      <Text tone="secondary">
        Informe de onde você sai e para onde vai. A gente mostra o caminho e o risco de cada trecho.
      </Text>

      <Spacer size="lg" />

      <form id={FORM_ID} className={styles.form} onSubmit={handleSubmit} noValidate>
        <Card spacious>
          <div className={styles.fields}>
            <Input
              label="Origem"
              icon="pin"
              placeholder="Ex.: Boa Viagem"
              value={origin}
              onChangeText={updateOrigin}
              disabled={loading}
              enterKeyHint="next"
            />
            <button
              type="button"
              className={styles.swap}
              onClick={swap}
              disabled={loading || (!origin && !destination)}
              aria-label="Inverter origem e destino"
            >
              <Icon name="swap" size={layout.iconSm} />
            </button>
            <Input
              label="Destino"
              icon="flag"
              placeholder="Ex.: Casa Amarela"
              value={destination}
              onChangeText={updateDestination}
              disabled={loading}
              enterKeyHint="go"
            />
          </div>
        </Card>

        <NeighborhoodChips
          neighborhoods={RECIFE_NEIGHBORHOODS}
          onSelect={fillNextEmpty}
          disabled={loading}
        />

        {error && <ErrorMessage message={error} />}
      </form>
    </Screen>
  );
}
