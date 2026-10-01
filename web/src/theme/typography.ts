export interface TextStyleToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  letterSpacing: number;
}

export const fontFamily =
  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/** Estilos de texto padronizados (medidas em px). */
export const typography = {
  display: { fontSize: 40, lineHeight: 46, fontWeight: 700, letterSpacing: -0.5 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: 700, letterSpacing: -0.2 },
  subtitle: { fontSize: 18, lineHeight: 24, fontWeight: 600, letterSpacing: 0 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: 400, letterSpacing: 0 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: 500, letterSpacing: 0.2 },
} as const satisfies Record<string, TextStyleToken>;

export type TypographyToken = keyof typeof typography;
