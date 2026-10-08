// Antes de tudo: instala um localStorage (SQLite) — o mesmo armazenamento que o web usa para
// lugares salvos, tema do mapa e boas-vindas vistas.
import 'expo-sqlite/localStorage/install';

import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initMapbox } from '@/config/initMapbox';
import { LocationProvider, RouteProvider } from '@/hooks';
import { colors } from '@/theme';

initMapbox();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LocationProvider>
        <RouteProvider>
          <Stack
            screenOptions={{
              // Cada tela desenha o próprio cabeçalho, para controlar o layout sobre o mapa.
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}
          />
        </RouteProvider>
      </LocationProvider>
    </SafeAreaProvider>
  );
}
