/** Medidas estruturais que não pertencem à escala de espaçamento (px). */
export const layout = {
  /** Largura máxima do conteúdo: o app é pensado para celular, mesmo no desktop. */
  maxContentWidth: 480,
  /** Alvo de toque generoso — o entregador costuma usar o app de luva ou em movimento. */
  touchTarget: 52,
  borderWidth: 1,
  focusRingWidth: 2,
  iconSm: 16,
  iconMd: 24,
  iconLg: 32,
} as const;
