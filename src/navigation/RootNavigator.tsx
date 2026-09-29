import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '@/screens/Home';
import { MapScreen } from '@/screens/Map';
import { OnboardingScreen } from '@/screens/Onboarding';
import { RouteDetailsScreen } from '@/screens/RouteDetails';
import { colors } from '@/theme';

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Alinha o tema do React Navigation à paleta do app (fundo entre transições). */
const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.textPrimary,
    border: colors.border,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          // Cada tela desenha seu próprio Header, para manter o controle do layout.
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="RouteDetails" component={RouteDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
