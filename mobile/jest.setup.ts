// Token fictício: os testes nunca chamam o Mapbox de verdade (o fetch é simulado).
process.env.EXPO_PUBLIC_MAPBOX_TOKEN = 'pk.test';

// O jest-expo troca módulos nativos por versões vazias; no Node, o UUID vem do próprio crypto.
jest.mock('expo-crypto', () => ({
  randomUUID: () => globalThis.crypto.randomUUID(),
}));
