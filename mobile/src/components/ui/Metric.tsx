import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface MetricProps {
  icon: IconName;
  value: string;
  label: string;
}

const ICON_SIZE = 18;

/** Par ícone + valor usado nos resumos de rota (tempo, distância). */
export function Metric({ icon, value, label }: MetricProps) {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={ICON_SIZE} color={colors.textSecondary} />
      <View>
        <Text variant="subtitle">{value}</Text>
        <Text variant="caption" color={colors.textSecondary}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
