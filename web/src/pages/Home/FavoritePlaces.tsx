import { useState } from 'react';

import { Button, Icon, Text, type IconName } from '@/components/ui';
import { setFavorite, type FavoriteKind, type SavedPlace } from '@/services/savedPlaces';
import { layout } from '@/theme';
import type { Coordinate } from '@/types';

import styles from './FavoritePlaces.module.css';
import { PlaceField } from './PlaceField';
import { EMPTY_PLACE, type PlaceValue } from './placeValue';

const KINDS: FavoriteKind[] = ['home', 'work'];

const LABELS: Record<FavoriteKind, string> = { home: 'Casa', work: 'Trabalho' };
const ICONS: Record<FavoriteKind, IconName> = { home: 'home', work: 'work' };

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
    <section className={styles.section} aria-label="Seus lugares">
      <Text variant="caption" tone="secondary" className={styles.heading}>
        Seus lugares
      </Text>
      <div className={styles.grid}>
        {KINDS.map((kind) => {
          const place = favorites[kind];
          return (
            <div key={kind} className={styles.card}>
              <button
                type="button"
                className={styles.use}
                onClick={() => (place ? onUse(place) : setEditing(kind))}
                disabled={disabled}
                aria-label={place ? `Ir para ${LABELS[kind]}: ${place.text}` : `Definir ${LABELS[kind]}`}
              >
                <span className={styles.icon}>
                  <Icon name={place ? ICONS[kind] : 'plus'} size={layout.iconSm} />
                </span>
                <span className={styles.texts}>
                  <span className={styles.label}>{LABELS[kind]}</span>
                  <span className={styles.address}>{place ? place.text : 'Toque para definir'}</span>
                </span>
              </button>
              {place && (
                <button
                  type="button"
                  className={styles.edit}
                  onClick={() => setEditing(kind)}
                  disabled={disabled}
                  aria-label={`Alterar endereço de ${LABELS[kind]}`}
                >
                  <Icon name="edit" size={layout.iconSm} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
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
    <section className={styles.editor} aria-label={`Endereço de ${LABELS[kind]}`}>
      <div className={styles.editorField}>
        <PlaceField
          label={`Endereço de ${LABELS[kind].toLocaleLowerCase('pt-BR')}`}
          icon={ICONS[kind]}
          placeholder="Rua, número ou ponto de referência"
          value={value}
          onChange={setValue}
          near={near}
          onOpenChange={onOpenChange}
          enterKeyHint="done"
        />
      </div>
      <div className={styles.editorActions}>
        {initial && (
          <Button label="Remover" variant="ghost" onClick={() => finish(null)} />
        )}
        <span className={styles.spacer} />
        <Button label="Cancelar" variant="ghost" onClick={() => finish(undefined)} />
        <Button label="Salvar" onClick={() => finish(value)} disabled={!canSave} />
      </div>
    </section>
  );
}
