import { View } from 'react-native';

import { spacing, type SpacingToken } from '@/theme';

export interface SpacerProps {
  size?: SpacingToken;
  horizontal?: boolean;
  /** Ocupa todo o espaço livre, empurrando o conteúdo seguinte para o fim. */
  flex?: boolean;
}

export function Spacer({ size = 'md', horizontal = false, flex = false }: SpacerProps) {
  if (flex) return <View style={{ flex: 1 }} />;

  return <View style={horizontal ? { width: spacing[size] } : { height: spacing[size] }} />;
}
