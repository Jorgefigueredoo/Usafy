import { useCallback, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { Header } from '@/components/layout';
import { MapThemePicker } from '@/components/map';
import { Icon } from '@/components/ui';
import { useCurrentRoute, useNavigation, useUserLocation, useVoiceGuidance } from '@/hooks';
import { paths, segmentIdFromState } from '@/paths';
import type { Route } from '@/types';

import { ArrivalPanel } from './ArrivalPanel';
import styles from './MapPage.module.css';
import { NavigationBanner } from './NavigationBanner';
import { NavigationPanel } from './NavigationPanel';
import { RouteMap, type RouteNavigationView } from './RouteMap';
import { RouteOverviewSheet } from './RouteOverviewSheet';

export default function MapPage() {
  const { route, alternatives, setRoute } = useCurrentRoute();
  if (!route) return <Navigate to={paths.home} replace />;
  return <RouteScreen route={route} alternatives={alternatives} onChangeRoute={setRoute} />;
}

interface RouteScreenProps {
  route: Route;
  alternatives: Route[];
  onChangeRoute: (route: Route) => void;
}

function RouteScreen({ route, alternatives, onChangeRoute }: RouteScreenProps) {
  const navigate = useNavigate();
  const { coordinate: userLocation } = useUserLocation();
  const navigation = useNavigation(route);
  const { progress, following } = navigation;
  const voice = useVoiceGuidance({
    route,
    active: navigation.active,
    phase: navigation.phase,
    progress,
  });
  /** Trecho tocado na faixa de risco (só na visão geral). */
  const routerLocation = useLocation();
  // Vindo de "Ver no mapa" nos detalhes: abre com aquele trecho já em destaque.
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(() => {
    const fromDetails = segmentIdFromState(routerLocation.state);
    return route.segments.some((segment) => segment.id === fromDetails) ? fromDetails : null;
  });

  const selectRoute = useCallback(
    (routeId: string) => {
      const next = alternatives.find((option) => option.id === routeId);
      if (!next || next.id === route.id) return;
      // Os ids de trecho se repetem entre rotas ("segment-1"...): a seleção não vale na nova.
      setSelectedSegmentId(null);
      onChangeRoute(next);
    },
    [alternatives, route.id, onChangeRoute],
  );

  const startNavigation = () => {
    setSelectedSegmentId(null);
    // Dentro do toque: no iOS a síntese de voz só é liberada a partir de um gesto do usuário.
    voice.announceStart();
    navigation.start();
  };

  const navigationView = useMemo<RouteNavigationView | null>(
    () =>
      navigation.active && progress
        ? {
            position: progress.displayPosition,
            bearing: progress.bearing,
            following,
            traveled: progress.traveledLine,
          }
        : null,
    [navigation.active, progress, following],
  );

  const currentSegment = progress ? (route.segments[progress.segmentIndex] ?? null) : null;

  return (
    <div className={styles.page}>
      <div className={styles.mapArea}>
        <RouteMap
          route={route}
          userLocation={userLocation}
          navigation={navigationView}
          onUserGesture={navigation.pauseFollowing}
          highlightedSegmentId={navigation.active ? null : selectedSegmentId}
          alternatives={alternatives}
          onSelectRoute={selectRoute}
        />

        {navigation.active ? (
          <NavigationBanner
            phase={navigation.phase}
            maneuver={progress?.nextManeuver ?? null}
            metersToManeuver={progress?.metersToNextManeuver ?? 0}
            segment={currentSegment}
            message={navigation.message}
            className={styles.overlayTop}
          />
        ) : (
          <Header
            floating
            onBack={() => navigate(paths.home)}
            backLabel="Voltar para a busca"
            trailing={<MapThemePicker />}
            className={styles.overlayTop}
          />
        )}

        {navigation.active && voice.supported && (
          <button
            type="button"
            className={styles.voiceToggle}
            onClick={voice.toggle}
            aria-pressed={voice.enabled}
            aria-label={voice.enabled ? 'Desligar instruções por voz' : 'Ligar instruções por voz'}
          >
            <Icon name={voice.enabled ? 'volume' : 'volumeOff'} />
          </button>
        )}

        {navigation.active && navigationView && !following && (
          <button type="button" className={styles.recenter} onClick={navigation.recenter}>
            <Icon name="navigate" />
            Recentralizar
          </button>
        )}
      </div>

      {navigation.active ? (
        <section className={styles.panel} aria-label="Progresso da navegação">
          {navigation.phase === 'arrived' ? (
            <ArrivalPanel
              route={route}
              trip={navigation.trip}
              onFinish={navigation.stop}
              onNewSearch={() => {
                navigation.stop();
                navigate(paths.home);
              }}
            />
          ) : (
            <NavigationPanel route={route} progress={progress} onStop={navigation.stop} />
          )}
        </section>
      ) : (
        <section className={styles.panel} aria-label="Resumo da rota">
          <RouteOverviewSheet
            route={route}
            alternatives={alternatives}
            onSelectRoute={selectRoute}
            selectedSegmentId={selectedSegmentId}
            onSelectSegment={setSelectedSegmentId}
            onStartNavigation={startNavigation}
          />
        </section>
      )}
    </div>
  );
}
