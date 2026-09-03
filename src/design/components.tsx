import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { ComponentProps } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/design/tokens';

export type AppIconName = ComponentProps<typeof Ionicons>['name'];

export function AppIcon({
  name,
  size = 20,
  color = colors.ink,
}: {
  readonly name: AppIconName;
  readonly size?: number;
  readonly color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

export function Card({
  children,
  style,
}: {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  style,
  ...pressableProps
}: {
  readonly label: string;
  readonly onPress?: () => void;
  readonly variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly icon?: AppIconName;
  readonly style?: StyleProp<ViewStyle>;
} & Omit<PressableProps, 'onPress' | 'style' | 'disabled'>) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variantStyles[variant],
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
        style,
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.textOnAccent : colors.brand} />
      ) : (
        <>
          {icon && (
            <AppIcon
              name={icon}
              size={17}
              color={variant === 'primary' || variant === 'danger' ? colors.textOnAccent : colors.brand}
            />
          )}
          <Text style={[styles.buttonLabel, variantLabelStyles[variant]]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Pill({
  label,
  tone = 'brand',
}: {
  readonly label: string;
  readonly tone?: 'brand' | 'success' | 'danger' | 'muted' | 'warning';
}) {
  return (
    <View style={[styles.pill, pillToneStyles[tone]]}>
      <Text style={[styles.pillLabel, pillLabelToneStyles[tone]]}>{label}</Text>
    </View>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  readonly title: string;
  readonly subtitle?: string;
  readonly right?: React.ReactNode;
}) {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.screenHeaderText}>
        <Text style={styles.screenTitle}>{title}</Text>
        {subtitle && <Text style={styles.screenSubtitle}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

export function AppTopBar({
  name,
  subtitle = 'Cộng tác viên hoàn tiền',
}: {
  readonly name: string;
  readonly subtitle?: string;
}) {
  const avatarLetter = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <View style={styles.topBar}>
      <View style={styles.topAvatar}>
        <Text style={styles.topAvatarText}>{avatarLetter}</Text>
      </View>
      <View style={styles.topText}>
        <Text style={styles.topName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.topSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

export function Mascot({ size = 58 }: { readonly size?: number }) {
  return (
    <Image
      source={require('../../assets/rewally-mascot.png')}
      style={{ width: size, height: size }}
      contentFit="contain"
    />
  );
}

export function ProgressBar({
  progress,
  trackColor = colors.cardMuted,
  fillColor = colors.brand,
  height = 8,
}: {
  readonly progress: number;
  readonly trackColor?: string;
  readonly fillColor?: string;
  readonly height?: number;
}) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.progressTrack, { backgroundColor: trackColor, height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.progressFill,
          { backgroundColor: fillColor, width: `${pct * 100}%`, height, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

export function Avatar({
  label,
  size = 44,
  backgroundColor = colors.brand,
}: {
  readonly label: string;
  readonly size?: number;
  readonly backgroundColor?: string;
}) {
  const initial = label.trim().charAt(0).toUpperCase() || '?';
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
      <Text style={[styles.avatarLabel, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
}

export function IconBadge({
  name,
  size = 40,
  backgroundColor = colors.brandSoft,
  iconColor = colors.brand,
  iconSize,
}: {
  readonly name: AppIconName;
  readonly size?: number;
  readonly backgroundColor?: string;
  readonly iconColor?: string;
  readonly iconSize?: number;
}) {
  return (
    <View style={[styles.iconBadge, { width: size, height: size, borderRadius: size * 0.24, backgroundColor }]}>
      <AppIcon name={name} size={iconSize ?? size * 0.5} color={iconColor} />
    </View>
  );
}

export function TimelineStep({
  index,
  title,
  description,
  isLast,
}: {
  readonly index: number;
  readonly title: string;
  readonly description: string;
  readonly isLast?: boolean;
}) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineMarkerCol}>
        <View style={styles.timelineDot}>
          <Text style={styles.timelineDotLabel}>{index}</Text>
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.timelineContent}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineDescription}>{description}</Text>
      </View>
    </View>
  );
}

export function SectionHeader({
  title,
  action,
  onActionPress,
}: {
  readonly title: string;
  readonly action?: string;
  readonly onActionPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const variantStyles: Record<string, ViewStyle> = {
  primary: { backgroundColor: colors.brand },
  secondary: {
    backgroundColor: colors.brandSoft,
    borderColor: '#C9D8FF',
    boxShadow: 'none',
  },
  ghost: {
    backgroundColor: colors.card,
    borderColor: '#DCE6FA',
    boxShadow: 'none',
  },
  danger: { backgroundColor: colors.danger },
};

const variantLabelStyles: Record<string, { color: string }> = {
  primary: { color: colors.textOnAccent },
  secondary: { color: colors.brandDark },
  ghost: { color: colors.ink },
  danger: { color: colors.textOnAccent },
};

const pillToneStyles: Record<string, ViewStyle> = {
  brand: { backgroundColor: colors.brandSoft },
  success: { backgroundColor: '#DCFCE7' },
  danger: { backgroundColor: '#FEE2E2' },
  muted: { backgroundColor: colors.cardMuted },
  warning: { backgroundColor: '#FFF7D6' },
};

const pillLabelToneStyles: Record<string, { color: string }> = {
  brand: { color: colors.brandDark },
  success: { color: '#15803D' },
  danger: { color: '#B91C1C' },
  muted: { color: colors.muted },
  warning: { color: '#9A6B00' },
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#E7EDF8',
    boxShadow: '0 1px 4px rgba(27, 35, 51, 0.06)',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 0,
    paddingHorizontal: spacing.lg,
    borderRadius: 7,
    minHeight: 42,
    borderWidth: 1,
    borderColor: 'transparent',
    boxShadow: '0 3px 8px rgba(76, 126, 243, 0.18)',
  },
  buttonPressed: { opacity: 0.9, transform: [{ translateY: 1 }] },
  buttonDisabled: { opacity: 0.55, boxShadow: 'none' },
  buttonLabel: { ...typography.body, fontWeight: '900', letterSpacing: 0 },
  pill: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
  },
  pillLabel: { ...typography.caption, fontSize: 9, fontWeight: '800' },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  screenHeaderText: { flex: 1, gap: spacing.xxs },
  screenTitle: { ...typography.hero, color: colors.ink },
  screenSubtitle: { ...typography.body, color: colors.muted },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  topAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.brandSoft,
  },
  topAvatarText: { color: colors.textOnAccent, fontSize: 14, fontWeight: '900' },
  topText: { flex: 1, gap: 1 },
  topName: { ...typography.body, color: colors.ink, fontWeight: '800' },
  topSubtitle: { ...typography.caption, color: colors.muted, fontSize: 10 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sectionTitle: { ...typography.section, color: colors.ink },
  sectionAction: { ...typography.caption, color: colors.brand, fontWeight: '800' },
  progressTrack: { width: '100%', overflow: 'hidden' },
  progressFill: {},
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { color: colors.textOnAccent, fontWeight: '800' },
  iconBadge: { alignItems: 'center', justifyContent: 'center' },
  timelineRow: { flexDirection: 'row', gap: spacing.sm },
  timelineMarkerCol: { alignItems: 'center', width: 30 },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotLabel: { ...typography.caption, color: colors.textOnAccent, fontWeight: '900' },
  timelineLine: { flex: 1, width: 2, backgroundColor: colors.hairline, marginVertical: spacing.xxs, minHeight: 20 },
  timelineContent: { flex: 1, paddingBottom: spacing.md, gap: spacing.xxs },
  timelineTitle: { ...typography.body, color: colors.ink, fontWeight: '800' },
  timelineDescription: { ...typography.caption, color: colors.muted },
});
