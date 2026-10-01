import type { TextStyle } from 'react-native';

/**
 * Estilos de texto padronizados. Usados via spread em StyleSheet.create,
 * então os pesos precisam permanecer como literais (`as const`).
 */
export const typography = {
  display: { fontSize: 40, lineHeight: 46, fontWeight: '700', letterSpacing: -0.5 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.2 },
  subtitle: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
} as const satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
