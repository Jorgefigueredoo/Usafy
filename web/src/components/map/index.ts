// Importa o Mapbox GL: use só a partir de páginas carregadas sob demanda (React.lazy),
// para o chunk de ~1,9 MB não entrar no bundle inicial.
export { createMap, onMapFatalError, useMapAppearance } from './createMap';
export { MapFallback } from './MapFallback';
export { MapThemePicker, type MapThemePickerProps } from './MapThemePicker';
export { animateMarker, createMarker, type MarkerKind } from './markers';
