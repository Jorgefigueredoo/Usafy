import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Route } from '@/types';

/**
 * Contrato de navegação. A rota calculada viaja como parâmetro — quando houver
 * backend, o mesmo formato chega da API sem mudança aqui.
 */
export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Map: { plannedRoute: Route };
  RouteDetails: { plannedRoute: Route };
};

export type RootStackScreenProps<TRouteName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, TRouteName>;

/** Torna `useNavigation()` tipado sem precisar de genéricos em cada chamada. */
declare global {
  namespace ReactNavigation {
    // A augmentação exigida pelo React Navigation é necessariamente uma interface vazia.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
