import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, spacing, typography } from '@/design/tokens';

export function TextField({
  label,
  error,
  style,
  ...inputProps
}: {
  readonly label: string;
  readonly error?: string | null;
} & TextInputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error && styles.inputError, style]}
        {...inputProps}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { ...typography.caption, color: colors.textSecondary, fontSize: 10, fontWeight: '800' },
  input: {
    borderWidth: 1,
    borderColor: '#DDE7F7',
    borderRadius: 7,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: 13,
    minHeight: 42,
    color: colors.ink,
    backgroundColor: colors.card,
  },
  inputError: { borderColor: colors.danger },
  error: { ...typography.caption, color: colors.danger },
});
