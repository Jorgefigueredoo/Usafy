import { useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View, type ReturnKeyTypeOptions } from 'react-native';

import { Icon, Text, type IconName } from '@/components/ui';
import { usePlaceSuggestions } from '@/hooks';
import type { PlaceKind, PlaceSuggestion } from '@/services/placeSearch';
import { colors, layout, radius, spacing, typography } from '@/theme';
import type { Coordinate } from '@/types';

import type { PlaceValue } from './placeValue';

const KIND_ICONS: Record<PlaceKind, IconName> = { poi: 'pin', address: 'route', area: 'locate' };

export interface PlaceFieldProps {
  label: string;
  placeholder: string;
  value: PlaceValue;
  onChange: (value: PlaceValue) => void;
  /** Usada para priorizar lugares próximos nas sugestões. */
  near: Coordinate | null;
  /** Avisado quando a lista de sugestões abre ou fecha (a tela recolhe o mapa para caber). */
  onOpenChange?: (open: boolean) => void;
  /** Marcador no início do campo (origem/destino) ou ícone. */
  leading: ReactNode;
  trailing?: ReactNode;
  /** Texto exibido no lugar de `value.text` (ex.: "Minha localização"). */
  displayText?: string;
  readOnly?: boolean;
  disabled?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmit?: () => void;
}

/** Linha de um cartão de busca: rótulo pequeno, texto e sugestões do Mapbox abaixo. */
export function PlaceField({
  label,
  placeholder,
  value,
  onChange,
  near,
  onOpenChange,
  leading,
  trailing,
  displayText,
  readOnly = false,
  disabled = false,
  returnKeyType,
  onSubmit,
}: PlaceFieldProps) {
  const [focused, setFocused] = useState(false);
  const [open, setOpenState] = useState(false);
  /** Cada escolha ganha um número; se o usuário digitar de novo, a resposta antiga é ignorada. */
  const choiceRef = useRef(0);

  const searchable = open && !readOnly && !disabled;
  const { suggestions, loading, empty, select } = usePlaceSuggestions(value.text, searchable, near);
  const expanded = searchable && (suggestions.length > 0 || loading || empty);

  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };

  const handleType = (text: string) => {
    choiceRef.current += 1;
    onChange({ text, coordinate: null });
    setOpen(true);
  };

  const choose = async (suggestion: PlaceSuggestion) => {
    const choice = ++choiceRef.current;
    setOpen(false);
    // Mostra o nome na hora; a coordenada chega logo depois. Se não vier, a busca usa o texto.
    onChange({ text: suggestion.name, coordinate: null });
    const place = await select(suggestion);
    if (place && choice === choiceRef.current) onChange({ text: place.label, coordinate: place.coordinate });
  };

  return (
    <View>
      <View style={[styles.row, focused && styles.rowFocused]}>
        <View style={styles.leading}>{leading}</View>
        <View style={styles.stack}>
          <Text variant="caption" color={focused ? colors.accent : colors.textSecondary} style={styles.label}>
            {label}
          </Text>
          <TextInput
            value={displayText ?? value.text}
            onChangeText={handleType}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            editable={!readOnly && !disabled}
            onFocus={() => {
              setFocused(true);
              // Ao voltar para um texto digitado (sem lugar escolhido), reabre as sugestões dele.
              if (value.text && !value.coordinate) setOpen(true);
            }}
            onBlur={() => {
              setFocused(false);
              setOpen(false);
            }}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmit}
            autoCorrect={false}
            accessibilityLabel={label}
            style={styles.input}
          />
        </View>
        {trailing}
      </View>

      {expanded ? (
        <View style={styles.list} accessibilityLabel="Sugestões de lugares">
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion.id}
              onPress={() => void choose(suggestion)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            >
              <View style={styles.optionIcon}>
                <Icon name={KIND_ICONS[suggestion.kind]} size={layout.iconSm + spacing.xs} color={colors.textSecondary} />
              </View>
              <View style={styles.optionTexts}>
                <Text numberOfLines={1} style={styles.optionName}>
                  {suggestion.name}
                </Text>
                {suggestion.description ? (
                  <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
                    {suggestion.description}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))}
          {loading && suggestions.length === 0 ? (
            <View style={styles.status}>
              <ActivityIndicator size="small" color={colors.textSecondary} />
              <Text variant="caption" color={colors.textSecondary}>
                Buscando lugares…
              </Text>
            </View>
          ) : null}
          {empty ? (
            <View style={styles.status}>
              <Text variant="caption" color={colors.textSecondary}>
                Nenhum lugar encontrado. Você ainda pode buscar pelo texto digitado.
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/** Altura de cada linha do cartão: base para alinhar a linha pontilhada entre os marcadores. */
export const PLACE_ROW_HEIGHT = layout.touchTarget + spacing.sm;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: PLACE_ROW_HEIGHT,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    borderRadius: radius.md,
  },
  rowFocused: {
    backgroundColor: colors.overlay,
  },
  leading: {
    width: layout.iconMd,
    alignItems: 'center',
  },
  stack: {
    flex: 1,
  },
  label: {
    textTransform: 'uppercase',
  },
  input: {
    ...typography.subtitle,
    fontWeight: '400',
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  list: {
    paddingVertical: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.touchTarget,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  optionPressed: {
    backgroundColor: colors.overlay,
  },
  optionIcon: {
    padding: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSunken,
  },
  optionTexts: {
    flex: 1,
  },
  optionName: {
    fontWeight: '600',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
