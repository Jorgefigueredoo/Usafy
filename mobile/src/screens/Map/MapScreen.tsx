import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapThemePicker } from '@/components/map';
import { Icon } from '@/components/ui';
import { useCurrentRoute } from '@/hooks';
import { colors, layout, radius, spacing } from '@/theme';
import type { Route } from '@/types';

import { RouteMap } from './RouteMap';
import { RouteOverviewSheet } from './RouteOverviewSheet';

export function MapScreen() {
  const { route, alternatives, setRoute } = useCurrentRoute();
  if (!route) return <Redirect href="/home" />;
  return <RouteScreen route={route} alternatives={alternatives} onChangeRoute={setRoute} />;
}

interface RouteScreenProps {
  route: Route;
  alternatives: Route[];
  onChangeRoute: (route: Route) => void;
}

function RouteScreen({ route, alternatives, onChangeRoute }: RouteScreenProps) {
  // Vindo de "Ver no mapa" nos detalhes: abre com aquele trecho já em destaque.
  const { segment } = useLocalSearchParams<{ segment?: string }>();
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [appliedParam, setAppliedParam] = useState<string | undefined>(undefined);

  // Parâmetro novo (outro "Ver no mapa"): aplica o destaque uma vez, ainda nesta renderização.
  if (segment !== appliedParam) {
    setAppliedParam(segment);
    if (segment && route.segments.some((item) => item.id === segment)) setSelectedSegmentId(segment);
  }

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

  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <View style={styles.mapArea}>
        <RouteMap
          route={route}
          alternatives={alternatives}
          highlightedSegmentId={selectedSegmentId}
          onSelectRoute={selectRoute}
          bottomInset={radius.lg}
        />

        <SafeAreaView style={styles.overlayTop} edges={['top']} pointerEvents="box-none">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a busca"
            style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
          >
            <Icon name="chevronLeft" />
          </Pressable>
          <MapThemePicker />
        </SafeAreaView>
      </View>

      <SafeAreaView style={styles.panel} edges={['bottom']}>
        <RouteOverviewSheet
          route={route}
          alternatives={alternatives}
          onSelectRoute={selectRoute}
          selectedSegmentId={selectedSegmentId}
          onSelectSegment={setSelectedSegmentId}
          onOpenDetails={() => router.push('/route-details')}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapArea: {
    flex: 1,
  },
  // Voltar e camadas flutuando sobre o mapa; o resto deixa o mapa receber os toques.
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  back: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.scrim,
  },
  backPressed: {
    backgroundColor: colors.surface,
  },
  // Painel sobe um pouco sobre o mapa, como uma "bottom sheet".
  panel: {
    marginTop: -radius.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    backgroundColor: colors.background,
  },
});
