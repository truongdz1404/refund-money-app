import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/design/components';
import { colors, spacing, typography } from '@/design/tokens';

export function QueryState({
  isLoading,
  isError,
  onRetry,
  children,
}: {
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly onRetry?: () => void;
  readonly children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }
  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không tải được dữ liệu. Kiểm tra kết nối mạng và thử lại.</Text>
        {onRetry && <AppButton label="Thử lại" onPress={onRetry} variant="secondary" />}
      </View>
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  errorText: { ...typography.body, color: colors.muted, textAlign: 'center' },
});
