import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { LayoutAnimation, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Icon, Text } from '@/components/ui';
import { useCurrentRoute, useRouteSearch, useSavedPlaces, useUserLocation } from '@/hooks';
import type { RouteEndpoint } from '@/services/routeService';
import { addRecent, type SavedPlace } from '@/services/savedPlaces';
import { colors, layout, radius, spacing } from '@/theme';

import { HomeMap } from './HomeMap';
import { PLACE_ROW_HEIGHT, PlaceField } from './PlaceField';
import { EMPTY_PLACE, type PlaceValue } from './placeValue';
import { RouteLoading } from './RouteLoading';
import { FavoritePlaces, NeighborhoodChips, RecentPlaces } from './SavedPlacesSections';

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
/** Mapa de contexto: ~40% da tela, o resto fica para a busca ao alcance do polegar. */
const MAP_HEIGHT_RATIO = 0.4;

/**
 * - `auto`: usa a localização como origem assim que ela existir (permissão já concedida).
 * - `current`: o usuário tocou em "usar minha localização".
 * - `text`: o usuário digita a origem.
 */
type OriginMode = 'auto' | 'current' | 'text';

function greeting(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** Lugar escolhido nas sugestões vai com coordenada; texto livre passa pelo geocoding. */
function toEndpoint(place: PlaceValue): RouteEndpoint {
  return place.coordinate ? { label: place.text.trim(), coordinate: place.coordinate } : place.text;
}

export function HomeScreen() {
  const { height } = useWindowDimensions();
  const { setRouteOptions } = useCurrentRoute();
  const { loading, error, search, clearError } = useRouteSearch();
  const location = useUserLocation();
  const savedPlaces = useSavedPlaces();

  const [originMode, setOriginMode] = useState<OriginMode>('auto');
  const [origin, setOrigin] = useState<PlaceValue>(EMPTY_PLACE);
  const [destination, setDestination] = useState<PlaceValue>(EMPTY_PLACE);
  const [suggestionsOpen, setSuggestionsOpenState] = useState(false);

  const locating = location.status === 'locating';
  const locationFailed = location.status === 'error' && location.coordinate === null;
  // Se o GPS falhar (ex.: permissão negada), o campo volta a aceitar texto automaticamente.
  const usingCurrentLocation =
    (originMode === 'current' && !locationFailed) || (originMode === 'auto' && location.coordinate !== null);
  const waitingForFix = usingCurrentLocation && !location.coordinate && locating;
  const currentLocationText = waitingForFix ? 'Obtendo localização…' : CURRENT_LOCATION_LABEL;

  const hasOrigin = usingCurrentLocation ? location.coordinate !== null : origin.text.trim().length > 0;
  const canSubmit = hasOrigin && destination.text.trim().length > 0 && !loading;
  // Erro de GPS só importa se o usuário quer usar a localização (não quando digita a origem).
  const locationError = originMode !== 'text' && location.status === 'error' ? location.error : null;

  /** Com sugestões abertas, o mapa recolhe: o teclado cobre metade da tela no celular. */
  const setSuggestionsOpen = (open: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSuggestionsOpenState(open);
  };

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

  const submit = async () => {
    if (!canSubmit) return;
    const originEndpoint: RouteEndpoint =
      usingCurrentLocation && location.coordinate
        ? { label: CURRENT_LOCATION_LABEL, coordinate: location.coordinate }
        : toEndpoint(origin);

    const routes = await search(originEndpoint, toEndpoint(destination));
    if (routes) {
      addRecent({ text: destination.text.trim(), coordinate: destination.coordinate });
      setRouteOptions(routes);
      router.push('/map');
    }
  };

  const originTrailing = usingCurrentLocation ? (
    <Pressable
      onPress={typeOrigin}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="Digitar outro endereço de origem"
      hitSlop={spacing.sm}
      style={styles.fieldAction}
    >
      <Icon name="close" size={layout.iconSm} color={colors.accent} />
    </Pressable>
  ) : (
    <Pressable
      onPress={chooseCurrentLocation}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="Usar minha localização como origem"
      hitSlop={spacing.sm}
      style={styles.fieldAction}
    >
      <Icon name="locate" color={colors.accent} />
    </Pressable>
  );

  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <View style={[styles.mapArea, { height: suggestionsOpen ? 0 : height * MAP_HEIGHT_RATIO }]}>
        <HomeMap userLocation={location.coordinate} locating={locating} onRequestLocation={location.request} />
        {loading ? <RouteLoading /> : null}
      </View>

      <SafeAreaView style={styles.panel} edges={suggestionsOpen ? ['top', 'bottom'] : ['bottom']}>
        <ScrollView
          contentContainerStyle={styles.panelContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text variant="caption" color={colors.textSecondary}>
              {greeting(new Date())}
            </Text>
            <Text variant="title" accessibilityRole="header">
              Para onde vamos?
            </Text>
          </View>

          <View style={[styles.searchCard, suggestionsOpen && styles.searchCardOpen]}>
            <View style={styles.fields}>
              {/* Linha pontilhada entre os marcadores; some com a lista aberta entre os campos. */}
              {!suggestionsOpen ? <View style={styles.connector} /> : null}
              <PlaceField
                label="Origem"
                placeholder="Ex.: Shopping Recife"
                value={origin}
                displayText={usingCurrentLocation ? currentLocationText : undefined}
                onChange={updateOrigin}
                near={location.coordinate}
                onOpenChange={setSuggestionsOpen}
                readOnly={usingCurrentLocation}
                disabled={loading}
                returnKeyType="next"
                leading={<View style={[styles.originMarker, usingCurrentLocation && styles.originMarkerLive]} />}
                trailing={originTrailing}
              />
              <View style={styles.divider} />
              <PlaceField
                label="Destino"
                placeholder="Ex.: RioMar, hospital, rua..."
                value={destination}
                onChange={updateDestination}
                near={location.coordinate}
                onOpenChange={setSuggestionsOpen}
                disabled={loading}
                returnKeyType="go"
                onSubmit={() => void submit()}
                leading={
                  <View style={styles.destinationMarker}>
                    <View style={styles.destinationMarkerDot} />
                  </View>
                }
              />
            </View>
            {!suggestionsOpen ? (
              <Pressable
                onPress={swap}
                disabled={loading || usingCurrentLocation || (!origin.text && !destination.text)}
                accessibilityRole="button"
                accessibilityLabel="Inverter origem e destino"
                style={({ pressed }) => [
                  styles.swap,
                  (loading || usingCurrentLocation || (!origin.text && !destination.text)) && styles.swapDisabled,
                  pressed && styles.swapPressed,
                ]}
              >
                <Icon name="swap" size={layout.iconSm} color={colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>

          {locationError ? <ErrorMessage message={locationError} /> : null}
          {error ? <ErrorMessage message={error} /> : null}

          {!suggestionsOpen ? (
            <>
              <FavoritePlaces
                favorites={savedPlaces.favorites}
                onUse={pickSavedPlace}
                near={location.coordinate}
                onOpenChange={setSuggestionsOpen}
                disabled={loading}
              />
              <RecentPlaces recents={savedPlaces.recents} onUse={pickSavedPlace} disabled={loading} />
              <NeighborhoodChips neighborhoods={RECIFE_NEIGHBORHOODS} onSelect={fillNextEmpty} disabled={loading} />
            </>
          ) : null}
        </ScrollView>

        {/* Enquanto o usuário escolhe um lugar, o botão fixo sairia por cima das sugestões. */}
        {!suggestionsOpen ? (
          <View style={styles.footer}>
            <Button
              label={loading ? 'Calculando rota…' : 'Ver rota segura'}
              onPress={() => void submit()}
              loading={loading}
              disabled={!canSubmit}
            />
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <View style={styles.error} accessibilityRole="alert">
      <Icon name="alert" size={layout.iconSm + spacing.xs} color={colors.danger} />
      <Text color={colors.danger} style={styles.errorText}>
        {message}
      </Text>
    </View>
  );
}

const MARKER_SIZE = spacing.md;
/** Centro dos marcadores: padding da linha + metade do espaço do ícone. */
const MARKER_CENTER_X = spacing.md + layout.iconMd / 2;
const CONNECTOR_INSET = PLACE_ROW_HEIGHT / 2 + spacing.md - spacing.xs;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapArea: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceSunken,
  },
  panel: {
    flex: 1,
    // Painel sobe um pouco sobre o mapa, como uma "bottom sheet".
    marginTop: -radius.lg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    backgroundColor: colors.background,
  },
  panelContent: {
    gap: spacing.md,
    padding: spacing.md,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchCardOpen: {
    borderColor: colors.primary,
  },
  fields: {
    flex: 1,
  },
  connector: {
    position: 'absolute',
    top: CONNECTOR_INSET,
    bottom: CONNECTOR_INSET,
    left: MARKER_CENTER_X - 1,
    borderLeftWidth: 2,
    borderStyle: 'dotted',
    borderColor: colors.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.md + layout.iconMd + spacing.sm,
    backgroundColor: colors.border,
  },
  // Origem: ponto azul com borda branca, igual ao marcador de origem do mapa.
  originMarker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: radius.full,
    borderWidth: spacing.xs - 1,
    borderColor: colors.textPrimary,
    backgroundColor: colors.primary,
  },
  // Usando o GPS: halo como o "você está aqui".
  originMarkerLive: {
    shadowColor: colors.primary,
    shadowOpacity: 1,
    shadowRadius: spacing.sm,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  // Destino: gota laranja (quadrado com três cantos arredondados, girado).
  destinationMarker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: radius.full,
    borderTopRightRadius: radius.full,
    borderBottomRightRadius: radius.full,
    backgroundColor: colors.accent,
    transform: [{ translateY: -2 }, { rotate: '-45deg' }],
  },
  destinationMarkerDot: {
    width: spacing.sm - 2,
    height: spacing.sm - 2,
    borderRadius: radius.full,
    backgroundColor: colors.textPrimary,
  },
  fieldAction: {
    width: spacing.xxl,
    height: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swap: {
    width: layout.touchTarget - spacing.sm,
    height: layout.touchTarget - spacing.sm,
    marginRight: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSunken,
  },
  swapDisabled: {
    opacity: 0.4,
  },
  swapPressed: {
    transform: [{ rotate: '180deg' }],
  },
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.riskHigh,
    backgroundColor: colors.dangerSurface,
  },
  errorText: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
