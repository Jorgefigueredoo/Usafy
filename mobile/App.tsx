import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initMapbox } from '@/config/mapbox';
import { RootNavigator } from '@/navigation';

initMapbox();

export default function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
