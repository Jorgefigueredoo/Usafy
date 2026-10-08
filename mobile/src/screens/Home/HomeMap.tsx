import Mapbox from '@rnmapbox/maps';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { BrandMap, MapThemePicker } from '@/components/map';
import { Icon } from '@/components/ui';
import { RECIFE_CENTER } from '@/config/mapbox';
import { colors, layout, radius, spacing } from '@/theme';
import type { Coordinate } from '@/types';

export interface HomeMapProps {
  userLocation: Coordinate | null;
  locating: boolean;
  /** Chamado quando o usuário pede a localização e ainda não temos posição. */
  onRequestLocation: () => void;
}

const CITY_ZOOM = 11.5;
const STREET_ZOOM = 15;
/** Leve inclinação para os prédios 3D aparecerem já na tela inicial. */
const HOME_PITCH = 45;
const CAMERA_DURATION_MS = 800;
const PULSE_SIZE = spacing.xl + spacing.sm;
const DOT_SIZE = spacing.md + spacing.xs;

/** Mapa de contexto da Home: mostra onde o usuário está antes de escolher o destino. */
export function HomeMap({ userLocation, locating, onRequestLocation }: HomeMapProps) {
  const cameraRef = useRef<Mapbox.Camera>(null);
  /** Centraliza automaticamente só na primeira posição; depois o usuário manda no mapa. */
  const centeredRef = useRef(false);

  useEffect(() => {
    if (!userLocation || centeredRef.current) return;
    centeredRef.current = true;
    cameraRef.current?.setCamera({
      centerCoordinate: userLocation,
      zoomLevel: STREET_ZOOM,
      animationDuration: CAMERA_DURATION_MS,
    });
  }, [userLocation]);

  const locate = () => {
    if (userLocation) {
      cameraRef.current?.setCamera({
        centerCoordinate: userLocation,
        zoomLevel: STREET_ZOOM,
        animationDuration: CAMERA_DURATION_MS,
      });
    } else {
      centeredRef.current = false;
      onRequestLocation();
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <BrandMap
        accessibilityLabel="Mapa da sua região"
        // Logo no topo e atribuição embaixo à esquerda: os dois visíveis (termos do Mapbox).
        logoPosition={{ top: spacing.sm, left: spacing.sm }}
        attributionPosition={{ bottom: radius.lg + spacing.sm, left: spacing.sm }}
      >
        <Mapbox.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: userLocation ?? RECIFE_CENTER,
            zoomLevel: userLocation ? STREET_ZOOM : CITY_ZOOM,
            pitch: HOME_PITCH,
          }}
        />
        {userLocation ? (
          <Mapbox.MarkerView coordinate={userLocation} allowOverlap>
            <View style={styles.userPulse} accessibilityLabel="Você está aqui">
              <View style={styles.userDot} />
            </View>
          </Mapbox.MarkerView>
        ) : null}
      </BrandMap>

      <MapThemePicker style={styles.themePicker} />

      <Pressable
        onPress={locate}
        accessibilityRole="button"
        accessibilityLabel={userLocation ? 'Centralizar na minha localização' : 'Mostrar minha localização'}
        style={({ pressed }) => [styles.locate, pressed && styles.locatePressed]}
      >
        {locating ? (
          <ActivityIndicator size="small" color={colors.textPrimary} />
        ) : (
          <Icon name="locate" color={userLocation ? colors.accent : colors.textPrimary} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  themePicker: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  locate: {
    position: 'absolute',
    right: spacing.md,
    bottom: radius.lg + spacing.md,
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.scrim,
    elevation: 4,
  },
  locatePressed: {
    backgroundColor: colors.surface,
  },
  userPulse: {
    width: PULSE_SIZE,
    height: PULSE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.locationPulse,
  },
  userDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radius.full,
    borderWidth: spacing.xs - 1,
    borderColor: colors.textPrimary,
    backgroundColor: colors.primary,
  },
});
