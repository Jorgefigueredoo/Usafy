import { FlatList, StyleSheet } from 'react-native';

import { Header, Screen, Spacer } from '@/components/layout';
import { Button } from '@/components/ui';
import type { RootStackScreenProps } from '@/navigation/types';
import { spacing } from '@/theme';

import { OverallScoreCard } from './OverallScoreCard';
import { SegmentCard } from './SegmentCard';

export function RouteDetailsScreen({ navigation, route }: RootStackScreenProps<'RouteDetails'>) {
  const { plannedRoute } = route.params;

  return (
    <Screen>
      <Header
        title="Detalhes do trajeto"
        subtitle={`${plannedRoute.origin} → ${plannedRoute.destination}`}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={plannedRoute.segments}
        keyExtractor={(segment) => segment.id}
        renderItem={({ item, index }) => <SegmentCard segment={item} position={index + 1} />}
        ItemSeparatorComponent={() => <Spacer size="sm" />}
        ListHeaderComponent={
          <>
            <OverallScoreCard route={plannedRoute} />
            <Spacer size="lg" />
          </>
        }
        ListFooterComponent={
          <>
            <Spacer size="lg" />
            <Button
              label="Voltar para o mapa"
              variant="secondary"
              icon="chevronLeft"
              onPress={() => navigation.goBack()}
            />
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
