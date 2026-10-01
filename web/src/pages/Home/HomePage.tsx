import { lazy, Suspense, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';

import { Header } from '@/components/layout';
import { Button, Card, Icon, Logo } from '@/components/ui';
import { useCurrentRoute, useRouteSearch, useUserLocation } from '@/hooks';
import { paths } from '@/paths';
import type { RouteEndpoint } from '@/services/routeService';
import { layout } from '@/theme';
import { cx } from '@/utils/cx';

import { ErrorMessage } from './ErrorMessage';
import styles from './HomePage.module.css';
import { NeighborhoodChips } from './NeighborhoodChips';
import { PlaceField } from './PlaceField';
import { EMPTY_PLACE, type PlaceValue } from './placeValue';

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

/** Lugar escolhido nas sugestões vai com coordenada; texto livre passa pelo geocoding. */
function toEndpoint(place: PlaceValue): RouteEndpoint {
  return place.coordinate ? { label: place.text.trim(), coordinate: place.coordinate } : place.text;
}

export function HomePage() {
  const navigate = useNavigate();
  const { setRoute } = useCurrentRoute();
  const { loading, error, search, clearError } = useRouteSearch();
  const location = useUserLocation();

  const [originMode, setOriginMode] = useState<OriginMode>('auto');
  const [origin, setOrigin] = useState<PlaceValue>(EMPTY_PLACE);
  const [destination, setDestination] = useState<PlaceValue>(EMPTY_PLACE);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const locating = location.status === 'locating';
  const locationFailed = location.status === 'error' && location.coordinate === null;
  // Se o GPS falhar (ex.: permissão negada), o campo volta a aceitar texto automaticamente.
  const usingCurrentLocation =
    (originMode === 'current' && !locationFailed) ||
    (originMode === 'auto' && location.coordinate !== null);

  const waitingForFix = usingCurrentLocation && !location.coordinate && locating;
  const currentLocationText = waitingForFix ? 'Obtendo localização…' : CURRENT_LOCATION_LABEL;

  const hasOrigin = usingCurrentLocation ? location.coordinate !== null : origin.text.trim().length > 0;
  const canSubmit = hasOrigin && destination.text.trim().length > 0 && !loading;

  // Erro de GPS só importa se o usuário quer usar a localização (não quando digita a origem).
  const locationError = originMode !== 'text' && location.status === 'error' ? location.error : null;

  const updateOrigin = (value: PlaceValue) => {
    setOriginMode('text');
    setOrigin(value);
    clearError();
  };

  const updateDestination = (value: PlaceValue) => {
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
    setOrigin(EMPTY_PLACE);
    clearError();
  };

  // Atalho: preenche o primeiro campo vazio (origem, depois destino).
  const fillNextEmpty = (neighborhood: string) => {
    const place = { text: neighborhood, coordinate: null };
    if (!usingCurrentLocation && !origin.text.trim()) updateOrigin(place);
    else updateDestination(place);
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
        : toEndpoint(origin);

    const route = await search(originEndpoint, toEndpoint(destination));
    if (route) {
      setRoute(route);
      navigate(paths.map);
    }
  };

  return (
    <div className={cx(styles.page, suggestionsOpen && styles.searching)}>
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
              <PlaceField
                label="Origem"
                icon={usingCurrentLocation ? 'locate' : 'pin'}
                placeholder="Ex.: Shopping Recife"
                value={origin}
                displayText={usingCurrentLocation ? currentLocationText : undefined}
                onChange={updateOrigin}
                near={location.coordinate}
                onOpenChange={setSuggestionsOpen}
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
              {/* Some com a lista aberta: ela empurra os campos e o botão ficaria fora do lugar. */}
              {!suggestionsOpen && (
                <button
                  type="button"
                  className={styles.swap}
                  onClick={swap}
                  disabled={loading || usingCurrentLocation || (!origin.text && !destination.text)}
                  aria-label="Inverter origem e destino"
                >
                  <Icon name="swap" size={layout.iconSm} />
                </button>
              )}
              <PlaceField
                label="Destino"
                icon="flag"
                placeholder="Ex.: RioMar, hospital, rua..."
                value={destination}
                onChange={updateDestination}
                near={location.coordinate}
                onOpenChange={setSuggestionsOpen}
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

      {/* Enquanto o usuário escolhe um lugar, o botão fixo sairia por cima das sugestões. */}
      {!suggestionsOpen && (
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
      )}
    </div>
  );
}
