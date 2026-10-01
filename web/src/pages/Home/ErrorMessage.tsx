import { Icon, Text } from '@/components/ui';

import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className={styles.error} role="alert">
      <Icon name="alert" className={styles.icon} />
      <Text tone="danger" as="span">
        {message}
      </Text>
    </div>
  );
}
