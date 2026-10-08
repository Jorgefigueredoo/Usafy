import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { Header } from '@/components/layout';
import { MapThemePicker } from '@/components/map';
import { Button, Icon, Text } from '@/components/ui';
import { useCurrentRoute, useNavigation, useUserLocation } from '@/hooks';
import { paths } from '@/paths';
import type { Route } from '@/types';

import { ArrivalPanel } from './ArrivalPanel';
import styles from './MapPage.module.css';
import { NavigationBanner } from './NavigationBanner';
import { NavigationPanel } from './NavigationPanel';
import { RiskLegend } from './RiskLegend';
import { RouteMap, type RouteNavigationView } from './RouteMap';
import { RouteSummaryCard } from './RouteSummaryCard';

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
          <RouteSummaryCard route={route} />
          <RiskLegend />
          <Button label="Iniciar navegação" icon="navigate" fullWidth onClick={navigation.start} />
          <Button
            label="Ver detalhes"
            variant="secondary"
            trailingIcon="chevronRight"
            fullWidth
            onClick={() => navigate(paths.routeDetails)}
          />
          <Text variant="caption" tone="secondary" align="center">
            Níveis de risco simulados nesta versão de testes.
          </Text>
        </section>
      )}
    </div>
  );
}
