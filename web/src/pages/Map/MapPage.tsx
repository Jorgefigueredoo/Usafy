import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { Header } from '@/components/layout';
import { MapThemePicker } from '@/components/map';
import { Icon } from '@/components/ui';
import { useCurrentRoute, useNavigation, useUserLocation } from '@/hooks';
import { paths } from '@/paths';
import type { Route } from '@/types';

import { ArrivalPanel } from './ArrivalPanel';
import styles from './MapPage.module.css';
import { NavigationBanner } from './NavigationBanner';
import { NavigationPanel } from './NavigationPanel';
import { RouteMap, type RouteNavigationView } from './RouteMap';
import { RouteOverviewSheet } from './RouteOverviewSheet';

export default function MapPage() {
  const { route } = useCurrentRoute();
  if (!route) return <Navigate to={paths.home} replace />;
  return <RouteScreen route={route} />;
}

interface RouteScreenProps {
  route: Route;
}

function RouteScreen({ route }: RouteScreenProps) {
  const navigate = useNavigate();
  const { coordinate: userLocation } = useUserLocation();
  const navigation = useNavigation(route);
  const { progress, following } = navigation;
  /** Trecho tocado na faixa de risco (só na visão geral). */
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);

  const startNavigation = () => {
    setSelectedSegmentId(null);
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
            <ArrivalPanel destination={route.destination} onFinish={navigation.stop} />
          ) : (
            <NavigationPanel progress={progress} onStop={navigation.stop} />
          )}
        </section>
      ) : (
        <section className={styles.panel} aria-label="Resumo da rota">
          <RouteOverviewSheet
            route={route}
            selectedSegmentId={selectedSegmentId}
            onSelectSegment={setSelectedSegmentId}
            onStartNavigation={startNavigation}
          />
        </section>
      )}
    </div>
  );
}
