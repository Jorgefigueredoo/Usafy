import { Redirect, router } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';

import { Header, Screen, Spacer } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { useCurrentRoute } from '@/hooks';
import { colors, spacing } from '@/theme';

import { OverallScoreCard } from './OverallScoreCard';
import { SegmentCard } from './SegmentCard';

export function RouteDetailsScreen() {
  const { route } = useCurrentRoute();
  if (!route) return <Redirect href="/home" />;

  const backToMap = () => router.back();

  return (
    <Screen
      footer={<Button label="Voltar ao mapa" variant="secondary" icon="chevronLeft" onPress={backToMap} />}
    >
      <Header title="Detalhes da rota" subtitle={`${route.origin} → ${route.destination}`} onBack={backToMap} />

      <FlatList
        data={route.segments}
        keyExtractor={(segment) => segment.id}
        renderItem={({ item, index }) => (
          <SegmentCard
            segment={item}
            position={index + 1}
            // Volta ao mapa (que já está na pilha) com este trecho em destaque.
            onShowOnMap={() => router.navigate({ pathname: '/map', params: { segment: item.id } })}
          />
        )}
        ItemSeparatorComponent={() => <Spacer size="sm" />}
        ListHeaderComponent={
          <>
            <OverallScoreCard route={route} />
            <Spacer size="xl" />
            <Text variant="subtitle">Trechos do caminho ({route.segments.length})</Text>
            <Spacer size="md" />
          </>
        }
        ListFooterComponent={
          <>
            <Spacer size="lg" />
            <Text variant="caption" color={colors.textSecondary} align="center">
              Os níveis de risco desta versão são simulados. Os dados reais de criminalidade, iluminação e
              movimento chegam com o backend.
            </Text>
          </>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
});
