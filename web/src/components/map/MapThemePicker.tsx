import { useEffect, useRef, useState } from 'react';

import { Icon } from '@/components/ui';
import { cx } from '@/utils/cx';

import { MAP_THEMES, useMapTheme } from './mapTheme';
import styles from './MapThemePicker.module.css';

export interface MapThemePickerProps {
  /** Posiciona o botão sobre o mapa. O menu abre para baixo, alinhado à direita. */
  className?: string;
}

/** Botão flutuante que troca o estilo do mapa (vale para todos os mapas do app). */
export function MapThemePicker({ className }: MapThemePickerProps) {
  const [theme, setTheme] = useMapTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Fecha com toque fora do menu ou com Esc.
  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cx(styles.root, className)}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((value) => !value)}
        aria-label="Estilo do mapa"
        aria-expanded={open}
      >
        <Icon name="layers" />
      </button>

      {open && (
        <div className={styles.menu} role="radiogroup" aria-label="Estilo do mapa">
          {MAP_THEMES.map((option) => {
            const selected = option.id === theme;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={styles.option}
                onClick={() => {
                  setTheme(option.id);
                  setOpen(false);
                }}
              >
                <span className={styles.optionIcon}>
                  <Icon name={option.icon} />
                </span>
                <span className={styles.optionText}>
                  <span className={styles.optionLabel}>{option.label}</span>
                  <span className={styles.optionHint}>{option.description}</span>
                </span>
                {selected && <Icon name="check" className={styles.check} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
