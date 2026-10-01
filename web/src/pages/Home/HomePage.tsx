import { lazy, Suspense, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';

import { Header } from '@/components/layout';
import { Button, Card, Icon, Input, Logo } from '@/components/ui';
import { useCurrentRoute, useRouteSearch, useUserLocation } from '@/hooks';
import { paths } from '@/paths';
import type { RouteEndpoint } from '@/services/routeService';
import { layout } from '@/theme';

import { ErrorMessage } from './ErrorMessage';
import styles from './HomePage.module.css';
import { NeighborhoodChips } from './NeighborhoodChips';

// Mapbox GL fica fora do bundle inicial: o formulário aparece na hora, o mapa chega logo depois.
const HomeMap = lazy(() => import('./HomeMap'));

const FORM_ID = 'route-search-form';
const CURRENT_LOCATION_LABEL = 'Minha localização';

const RECIFE_NEIGHBORHOODS = ['Boa Viagem', 'Pina', 'Graças', 'Casa Amarela', 'Santo Amaro'] as const;

/**
 * - `auto`: usa a localização como origem assim que ela existir (permissão já concedida).
 * - `current`: o usuário tocou em "usar minha localização".
 * - `text`: o usuário digita a origem.
 */
type OriginMode = 'auto' | 'current' | 'text';

export function HomePage() {
  const navigate = useNavigate();
  const { setRoute } = useCurrentRoute();
  const { loading, error, search, clearError } = useRouteSearch();
  const location = useUserLocation();

  const [originMode, setOriginMode] = useState<OriginMode>('auto');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const locating = location.status === 'locating';
  const locationFailed = location.status === 'error' && location.coordinate === null;
  // Se o GPS falhar (ex.: permissão negada), o campo volta a aceitar texto automaticamente.
  const usingCurrentLocation =
    (originMode === 'current' && !locationFailed) ||
    (originMode === 'auto' && location.coordinate !== null);

  const waitingForFix = usingCurrentLocation && !location.coordinate && locating;
  const originValue = !usingCurrentLocation
    ? origin
    : waitingForFix
      ? 'Obtendo localização…'
      : CURRENT_LOCATION_LABEL;

  const hasOrigin = usingCurrentLocation ? location.coordinate !== null : origin.trim().length > 0;
  const canSubmit = hasOrigin && destination.trim().length > 0 && !loading;

  // Erro de GPS só importa se o usuário quer usar a localização (não quando digita a origem).
  const locationError = originMode !== 'text' && location.status === 'error' ? location.error : null;

  const updateOrigin = (value: string) => {
    setOriginMode('text');
    setOrigin(value);
    clearError();
  };

  const updateDestination = (value: string) => {
    setDestination(value);
    clearError();
  };

  const chooseCurrentLocation = () => {
    setOriginMode('current');
    clearError();
    location.request();
  };

  const typeOrigin = () => {
    setOriginMode('text');
    setOrigin('');
    clearError();
  };

  // Atalho: preenche o primeiro campo vazio (origem, depois destino).
  const fillNextEmpty = (neighborhood: string) => {
    if (!usingCurrentLocation && !origin.trim()) updateOrigin(neighborhood);
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

    const originEndpoint: RouteEndpoint =
      usingCurrentLocation && location.coordinate
        ? { label: CURRENT_LOCATION_LABEL, coordinate: location.coordinate }
        : origin;

    const route = await search(originEndpoint, destination);
    if (route) {
      setRoute(route);
      navigate(paths.map);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.mapArea}>
        <Suspense fallback={null}>
          <HomeMap
            userLocation={location.coordinate}
            locating={locating}
            onRequestLocation={location.request}
          />
        </Suspense>
      </div>

      <main className={styles.panel}>
        <Header subtitle="Usafy" title="Para onde vamos?" trailing={<Logo size="sm" />} />

        <form id={FORM_ID} className={styles.form} onSubmit={handleSubmit} noValidate>
          <Card>
            <div className={styles.fields}>
              <Input
                label="Origem"
                icon={usingCurrentLocation ? 'locate' : 'pin'}
                placeholder="Ex.: Boa Viagem"
                value={originValue}
                onChangeText={updateOrigin}
                readOnly={usingCurrentLocation}
                disabled={loading}
                enterKeyHint="next"
                trailing={
                  usingCurrentLocation ? (
                    <button
                      type="button"
                      className={styles.fieldAction}
                      onClick={typeOrigin}
                      disabled={loading}
                      aria-label="Digitar outro endereço de origem"
                    >
                      <Icon name="close" size={layout.iconSm} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.fieldAction}
                      onClick={chooseCurrentLocation}
                      disabled={loading}
                      aria-label="Usar minha localização como origem"
                    >
                      <Icon name="locate" />
                    </button>
                  )
                }
              />
              <button
                type="button"
                className={styles.swap}
                onClick={swap}
                disabled={loading || usingCurrentLocation || (!origin && !destination)}
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

          {/* Logo abaixo dos campos: mais embaixo o botão fixo do rodapé cobriria a mensagem. */}
          {locationError && <ErrorMessage message={locationError} />}
          {error && <ErrorMessage message={error} />}

          <NeighborhoodChips
            neighborhoods={RECIFE_NEIGHBORHOODS}
            onSelect={fillNextEmpty}
            disabled={loading}
          />
        </form>
      </main>

      <div className={styles.footer}>
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
      </div>
    </div>
  );
}
