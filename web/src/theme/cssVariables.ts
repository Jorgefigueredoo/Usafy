import { colors, riskFillColors, riskSurfaceColors, riskToneColors } from './colors';
import { layout } from './layout';
import { radius } from './radius';
import { spacing } from './spacing';
import { fontFamily, typography } from './typography';

function kebab(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

const px = (value: number): string => `${value}px`;

/**
 * Expõe os tokens do theme como CSS custom properties (`--color-primary`,
 * `--space-md`, ...). Assim os CSS Modules consomem o theme sem duplicar valores.
 */
export function buildCssVariables(): Record<string, string> {
  const variables: Record<string, string> = { '--font-family': fontFamily };

  for (const [name, value] of Object.entries(colors)) variables[`--color-${kebab(name)}`] = value;
  for (const [level, value] of Object.entries(riskFillColors)) variables[`--risk-${level}-fill`] = value;
  for (const [level, value] of Object.entries(riskToneColors)) variables[`--risk-${level}-tone`] = value;
  for (const [level, value] of Object.entries(riskSurfaceColors)) {
    variables[`--risk-${level}-surface`] = value;
  }
  for (const [name, value] of Object.entries(spacing)) variables[`--space-${name}`] = px(value);
  for (const [name, value] of Object.entries(radius)) variables[`--radius-${name}`] = px(value);
  for (const [name, value] of Object.entries(layout)) variables[`--layout-${kebab(name)}`] = px(value);

  for (const [name, style] of Object.entries(typography)) {
    variables[`--text-${name}-size`] = px(style.fontSize);
    variables[`--text-${name}-line`] = px(style.lineHeight);
    variables[`--text-${name}-weight`] = String(style.fontWeight);
    variables[`--text-${name}-tracking`] = px(style.letterSpacing);
  }

  return variables;
}

export function applyCssVariables(target: HTMLElement = document.documentElement): void {
  for (const [name, value] of Object.entries(buildCssVariables())) {
    target.style.setProperty(name, value);
  }
}
