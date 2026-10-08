import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initMapbox } from '@/config/initMapbox';
import { RootNavigator } from '@/navigation';

initMapbox();

export default function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
