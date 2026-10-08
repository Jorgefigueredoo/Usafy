import { useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { colors, layout, radius, spacing } from '@/theme';

import { MAP_THEMES, useMapTheme } from './mapTheme';

export interface MapThemePickerProps {
  /** Posição do botão sobre o mapa. O menu abre para baixo, alinhado à direita. */
  style?: StyleProp<ViewStyle>;
}

/** Botão flutuante que troca o estilo do mapa (vale para todos os mapas do app). */
export function MapThemePicker({ style }: MapThemePickerProps) {
  const [theme, setTheme] = useMapTheme();
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.root, style]}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel="Estilo do mapa"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.trigger, (pressed || open) && styles.triggerActive]}
      >
        <Icon name="layers" color={open ? colors.accent : colors.textPrimary} />
      </Pressable>

      {open ? (
        <View style={styles.menu} accessibilityRole="radiogroup" accessibilityLabel="Estilo do mapa">
          {MAP_THEMES.map((option) => {
            const selected = option.id === theme;
            return (
              <Pressable
                key={option.id}
                onPress={() => {
                  setTheme(option.id);
                  setOpen(false);
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
              >
                <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
                  <Icon
                    name={option.icon}
                    size={layout.iconSm + spacing.xs}
                    color={selected ? colors.textPrimary : colors.textSecondary}
                  />
                </View>
                <View style={styles.optionTexts}>
                  <Text variant="body" style={styles.optionLabel}>
                    {option.label}
                  </Text>
                  <Text variant="caption" color={colors.textSecondary}>
                    {option.description}
                  </Text>
                </View>
                {selected ? <Icon name="check" color={colors.accent} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const MENU_WIDTH = 248;

const styles = StyleSheet.create({
  root: {
    zIndex: 2,
    alignItems: 'flex-end',
  },
  trigger: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.scrim,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: spacing.sm,
    shadowOffset: { width: 0, height: spacing.xs },
    elevation: 4,
  },
  triggerActive: {
    backgroundColor: colors.surface,
  },
  menu: {
    position: 'absolute',
    top: layout.touchTarget + spacing.sm,
    right: 0,
    width: MENU_WIDTH,
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.background,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: spacing.lg,
    shadowOffset: { width: 0, height: spacing.sm },
    elevation: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.touchTarget,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.transparent,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSunken,
  },
  optionPressed: {
    backgroundColor: colors.overlay,
  },
  optionIcon: {
    width: layout.touchTarget - spacing.sm,
    height: layout.touchTarget - spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  optionIconSelected: {
    backgroundColor: colors.primary,
  },
  optionTexts: {
    flex: 1,
  },
  optionLabel: {
    fontWeight: '600',
  },
});
