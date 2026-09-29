import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from '@/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
