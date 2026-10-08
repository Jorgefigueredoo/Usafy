import { lazy, Suspense, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';

import { Header } from '@/components/layout';
import { Button, Icon } from '@/components/ui';
import { useCurrentRoute, useRouteSearch, useSavedPlaces, useUserLocation } from '@/hooks';
import { paths } from '@/paths';
import type { RouteEndpoint } from '@/services/routeService';
import { addRecent, type SavedPlace } from '@/services/savedPlaces';
import { layout } from '@/theme';
import { cx } from '@/utils/cx';

import { ErrorMessage } from './ErrorMessage';
import { FavoritePlaces } from './FavoritePlaces';
import styles from './HomePage.module.css';
import { NeighborhoodChips } from './NeighborhoodChips';
import { PlaceField } from './PlaceField';
import { EMPTY_PLACE, type PlaceValue } from './placeValue';
import { RecentPlaces } from './RecentPlaces';
import { RouteLoading } from './RouteLoading';

// Mapbox GL fica fora do bundle inicial: o formulário aparece na hora, o mapa chega logo depois.
const HomeMap = lazy(() => import('./HomeMap'));

const FORM_ID = 'route-search-form';
const CURRENT_LOCATION_LABEL = 'Minha localização';

const RECIFE_NEIGHBORHOODS = [
  'Boa Viagem',
  'Pina',
  'Graças',
  'Casa Amarela',
  'Santo Amaro',
  'Recife Antigo',
  'Madalena',
] as const;

function greeting(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

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
  const { setRouteOptions } = useCurrentRoute();
  const { loading, error, search, clearError } = useRouteSearch();
  const location = useUserLocation();
  const savedPlaces = useSavedPlaces();

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

  // Casa, Trabalho ou recente: sempre vira o destino (a origem costuma ser a localização atual).
  const pickSavedPlace = (place: SavedPlace) => updateDestination({ text: place.text, coordinate: place.coordinate });

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

    const routes = await search(originEndpoint, toEndpoint(destination));
    if (routes) {
      addRecent({ text: destination.text.trim(), coordinate: destination.coordinate });
      setRouteOptions(routes);
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
        {loading && <RouteLoading />}
      </div>

      <main className={styles.panel}>
        <Header subtitle={greeting(new Date())} title="Para onde vamos?" />

        <form id={FORM_ID} className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={cx(styles.searchCard, suggestionsOpen && styles.searchCardOpen)}>
            <div className={styles.fields}>
              <PlaceField
                label="Origem"
                leading={
                  <span
                    className={cx(styles.originMarker, usingCurrentLocation && styles.originMarkerLive)}
                  />
                }
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
              <div className={styles.divider} aria-hidden="true" />
              <PlaceField
                label="Destino"
                leading={<span className={styles.destinationMarker} />}
                placeholder="Ex.: RioMar, hospital, rua..."
                value={destination}
                onChange={updateDestination}
                near={location.coordinate}
                onOpenChange={setSuggestionsOpen}
                disabled={loading}
                enterKeyHint="go"
              />
            </div>
            {/* Some com a lista aberta: os campos ganham a largura toda para as sugestões. */}
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
          </div>

          {/* Logo abaixo dos campos: mais embaixo o botão fixo do rodapé cobriria a mensagem. */}
          {locationError && <ErrorMessage message={locationError} />}
          {error && <ErrorMessage message={error} />}
        </form>

        {/* Fora do <form>: Enter no cadastro de Casa/Trabalho não pode disparar a busca da rota. */}
        <FavoritePlaces
          favorites={savedPlaces.favorites}
          onUse={pickSavedPlace}
          near={location.coordinate}
          onOpenChange={setSuggestionsOpen}
          disabled={loading}
        />
        <RecentPlaces recents={savedPlaces.recents} onUse={pickSavedPlace} disabled={loading} />
        <NeighborhoodChips
          neighborhoods={RECIFE_NEIGHBORHOODS}
          onSelect={fillNextEmpty}
          disabled={loading}
        />
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
