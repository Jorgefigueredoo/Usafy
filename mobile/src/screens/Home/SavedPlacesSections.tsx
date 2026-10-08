import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Icon, Text, type IconName } from '@/components/ui';
import { clearRecents, setFavorite, type FavoriteKind, type SavedPlace } from '@/services/savedPlaces';
import { colors, layout, radius, spacing } from '@/theme';
import type { Coordinate } from '@/types';

import { PlaceField } from './PlaceField';
import { EMPTY_PLACE, type PlaceValue } from './placeValue';

const KINDS: FavoriteKind[] = ['home', 'work'];
const LABELS: Record<FavoriteKind, string> = { home: 'Casa', work: 'Trabalho' };
const ICONS: Record<FavoriteKind, IconName> = { home: 'home', work: 'work' };
/** Quantos recentes aparecem na Home (o aparelho guarda alguns a mais). */
const VISIBLE_RECENTS = 3;

function SectionTitle({ children }: { children: string }) {
  return (
    <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------

export interface FavoritePlacesProps {
  favorites: Partial<Record<FavoriteKind, SavedPlace>>;
  /** Toque num lugar já definido: vira o destino. */
  onUse: (place: SavedPlace) => void;
  near: Coordinate | null;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}

/** Atalhos Casa e Trabalho. Sem endereço ainda, o toque abre o cadastro no lugar dos atalhos. */
export function FavoritePlaces({ favorites, onUse, near, onOpenChange, disabled = false }: FavoritePlacesProps) {
  const [editing, setEditing] = useState<FavoriteKind | null>(null);

  if (editing) {
    return (
      <FavoriteEditor
        kind={editing}
        initial={favorites[editing] ?? null}
        near={near}
        onOpenChange={onOpenChange}
        onDone={() => setEditing(null)}
      />
    );
  }

  return (
    <View style={styles.section}>
      <SectionTitle>Seus lugares</SectionTitle>
      <View style={styles.favoritesGrid}>
        {KINDS.map((kind) => {
          const place = favorites[kind];
          return (
            <View key={kind} style={styles.favoriteCard}>
              <Pressable
                onPress={() => (place ? onUse(place) : setEditing(kind))}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={place ? `Ir para ${LABELS[kind]}: ${place.text}` : `Definir ${LABELS[kind]}`}
                style={({ pressed }) => [styles.favoriteUse, pressed && styles.pressed]}
              >
                <View style={styles.favoriteIcon}>
                  <Icon name={place ? ICONS[kind] : 'plus'} size={layout.iconSm} color={colors.accent} />
                </View>
                <View style={styles.favoriteTexts}>
                  <Text style={styles.strong}>{LABELS[kind]}</Text>
                  <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
                    {place ? place.text : 'Toque para definir'}
                  </Text>
                </View>
              </Pressable>
              {place ? (
                <Pressable
                  onPress={() => setEditing(kind)}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel={`Alterar endereço de ${LABELS[kind]}`}
                  style={({ pressed }) => [styles.favoriteEdit, pressed && styles.pressed]}
                >
                  <Icon name="edit" size={layout.iconSm} color={colors.textSecondary} />
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface FavoriteEditorProps {
  kind: FavoriteKind;
  initial: SavedPlace | null;
  near: Coordinate | null;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

function FavoriteEditor({ kind, initial, near, onOpenChange, onDone }: FavoriteEditorProps) {
  const [value, setValue] = useState<PlaceValue>(initial ?? EMPTY_PLACE);
  const canSave = value.text.trim().length > 0;

  const finish = (place: SavedPlace | null | undefined) => {
    // `undefined`: cancelar sem mexer no que estava salvo.
    if (place !== undefined) setFavorite(kind, place);
    onOpenChange(false);
    onDone();
  };

  return (
    <View style={styles.editor}>
      <PlaceField
        label={`Endereço de ${LABELS[kind].toLocaleLowerCase('pt-BR')}`}
        placeholder="Rua, número ou ponto de referência"
        value={value}
        onChange={setValue}
        near={near}
        onOpenChange={onOpenChange}
        leading={<Icon name={ICONS[kind]} color={colors.textSecondary} />}
        returnKeyType="done"
      />
      <View style={styles.editorActions}>
        {initial ? <Button label="Remover" variant="ghost" onPress={() => finish(null)} /> : null}
        <View style={styles.spacer} />
        <Button label="Cancelar" variant="ghost" onPress={() => finish(undefined)} />
        <Button label="Salvar" onPress={() => finish(value)} disabled={!canSave} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------

export interface RecentPlacesProps {
  recents: SavedPlace[];
  onUse: (place: SavedPlace) => void;
  disabled?: boolean;
}

/** Últimos destinos buscados: um toque refaz o caminho de sempre. */
export function RecentPlaces({ recents, onUse, disabled = false }: RecentPlacesProps) {
  if (recents.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.recentsHeader}>
        <SectionTitle>Recentes</SectionTitle>
        <Pressable onPress={clearRecents} disabled={disabled} accessibilityRole="button" hitSlop={spacing.sm}>
          <Text variant="caption" color={colors.textSecondary}>
            Limpar
          </Text>
        </Pressable>
      </View>
      {recents.slice(0, VISIBLE_RECENTS).map((place, index) => (
        <Pressable
          key={place.text}
          onPress={() => onUse(place)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`Ir para ${place.text}`}
          style={({ pressed }) => [styles.recent, index > 0 && styles.recentDivided, pressed && styles.pressed]}
        >
          <Icon name="clock" color={colors.textSecondary} />
          <Text numberOfLines={1} style={styles.recentText}>
            {place.text}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------

export interface NeighborhoodChipsProps {
  neighborhoods: readonly string[];
  onSelect: (neighborhood: string) => void;
  disabled?: boolean;
}

/** Atalhos de bairro numa fileira que rola para o lado (não empurra o botão para baixo). */
export function NeighborhoodChips({ neighborhoods, onSelect, disabled = false }: NeighborhoodChipsProps) {
  return (
    <View style={styles.section}>
      <SectionTitle>Bairros populares</SectionTitle>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.chips}
        style={styles.chipsScroller}
      >
        {neighborhoods.map((name) => (
          <Pressable
            key={name}
            onPress={() => onSelect(name)}
            disabled={disabled}
            accessibilityRole="button"
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          >
            <Icon name="pin" size={layout.iconSm} color={colors.accent} />
            <Text>{name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pressed: {
    backgroundColor: colors.overlay,
  },
  strong: {
    fontWeight: '600',
  },
  favoritesGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  favoriteCard: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSunken,
  },
  favoriteUse: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.touchTarget,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  favoriteIcon: {
    width: spacing.xl,
    height: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  favoriteTexts: {
    flex: 1,
  },
  favoriteEdit: {
    width: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
  },
  editor: {
    gap: spacing.sm,
    padding: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  editorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
  spacer: {
    flex: 1,
  },
  recentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.touchTarget,
    paddingHorizontal: spacing.xs,
  },
  recentDivided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  recentText: {
    flex: 1,
  },
  chipsScroller: {
    // Rola até a borda da tela: compensa o padding do painel dos dois lados.
    marginHorizontal: -spacing.md,
  },
  chips: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: layout.touchTarget - spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSunken,
  },
  chipPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
});
