import Mapbox from '@rnmapbox/maps';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { mapAppearance, useClockLightPreset, useMapTheme } from './mapTheme';

type OrnamentPosition = { top: number; left: number } | { top: number; right: number } | { bottom: number; left: number } | { bottom: number; right: number };

export interface BrandMapProps {
  children?: ReactNode;
  /**
   * Onde ficam o logo e o botão de atribuição do Mapbox. Os termos de uso permitem mudar de
   * canto, mas exigem os dois visíveis: cada tela escolhe um canto livre de painéis e botões.
   */
  logoPosition?: OrnamentPosition;
  attributionPosition?: OrnamentPosition;
  onPress?: () => void;
  /** Usuário arrastou ou deu pinça no mapa (para pausar o "seguir" da navegação). */
  onUserGesture?: () => void;
  accessibilityLabel: string;
}

/**
 * Mapa com a identidade do Usafy: estilo Standard com as cores da marca, iluminação pelo
 * horário (ou tema escolhido) e sem girar/inclinar por gesto — no guidão, só atrapalha.
 * Trocar o tema troca o estilo; as camadas declaradas como filhos são redesenhadas sozinhas.
 */
export function BrandMap({
  children,
  logoPosition,
  attributionPosition,
  onPress,
  onUserGesture,
  accessibilityLabel,
}: BrandMapProps) {
  const [theme] = useMapTheme();
  const clockPreset = useClockLightPreset();
  const { style, config } = mapAppearance(theme, clockPreset);

  return (
    <Mapbox.MapView
      style={StyleSheet.absoluteFill}
      styleURL={style}
      rotateEnabled={false}
      pitchEnabled={false}
      compassEnabled={false}
      scaleBarEnabled={false}
      logoPosition={logoPosition}
      attributionPosition={attributionPosition}
      onPress={onPress}
      onCameraChanged={(state) => {
        if (state.gestures.isGestureActive) onUserGesture?.();
      }}
      accessibilityLabel={accessibilityLabel}
    >
      <Mapbox.StyleImport id="basemap" existing config={config} />
      {children}
    </Mapbox.MapView>
  );
}
