import { Button as ExpoButton, Host, type UniversalStyle } from '@expo/ui';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, radius, shadows, spacing, typography } from '@/design/tokens';

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

function NativeButton({
  label,
  onPress,
  variant,
  disabled,
  style,
}: {
  readonly label: string;
  readonly onPress?: () => void;
  readonly variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  readonly disabled?: boolean;
  readonly style?: StyleProp<ViewStyle>;
}) {
  const flattened = StyleSheet.flatten([
    styles.nativeButton,
    variantStyles[variant],
    disabled && styles.buttonDisabled,
    style,
  ]) as ViewStyle;
  const nativeStyle: UniversalStyle = {
    height: typeof flattened?.height === 'number' ? flattened.height : 46,
    paddingHorizontal: typeof flattened?.paddingHorizontal === 'number' ? flattened.paddingHorizontal : spacing.lg,
    paddingVertical: typeof flattened?.paddingVertical === 'number' ? flattened.paddingVertical : spacing.sm,
    borderRadius: typeof flattened?.borderRadius === 'number' ? flattened.borderRadius : radius.md,
    backgroundColor: flattened?.backgroundColor,
    borderWidth: flattened?.borderWidth,
    borderColor: flattened?.borderColor,
    opacity: flattened?.opacity,
  };

  return (
    <Host matchContents seedColor={variant === 'danger' ? colors.danger : colors.brand}>
      <ExpoButton
        label={label}
        onPress={onPress}
        disabled={disabled}
        variant={variant === 'ghost' ? 'outlined' : variant === 'secondary' ? 'outlined' : 'filled'}
        style={nativeStyle}
      />
    </Host>
  );
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
  if (!icon && !loading) {
    return (
      <NativeButton
        label={label}
        onPress={onPress}
        variant={variant}
        disabled={isDisabled}
        style={style}
      />
    );
  }

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
        <ActivityIndicator color={variant === 'primary' ? colors.textOnAccent : colors.brand} />
      ) : (
        <>
          {icon && (
            <AppIcon
              name={icon}
              size={18}
              color={variant === 'primary' ? colors.textOnAccent : colors.brand}
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
  readonly tone?: 'brand' | 'success' | 'danger' | 'muted';
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
  name = 'Đặng Nguyễn Tiến',
  subtitle = 'Cộng tác viên hoàn tiền',
  showBell = true,
}: {
  readonly name?: string;
  readonly subtitle?: string;
  readonly showBell?: boolean;
}) {
  return (
    <View style={styles.topBar}>
      <View style={styles.topAvatar}>
        <Image source={require('../../assets/icon.png')} style={styles.topAvatarImage} />
      </View>
      <View style={styles.topText}>
        <Text style={styles.topName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.topSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {showBell && (
        <View style={styles.bellButton}>
          <AppIcon name="notifications-outline" size={18} color={colors.ink} />
          <View style={styles.bellDot} />
        </View>
      )}
    </View>
  );
}

export function Mascot({ size = 58 }: { readonly size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M32 5C20 15 11 29 11 41c0 10 8 18 21 18s21-8 21-18C53 29 44 15 32 5Z" fill="#F8FFDE" stroke={colors.success} strokeWidth="2.5" />
      <Path d="M32 15C24 23 18 33 18 41c0 7 5 12 14 12s14-5 14-12c0-8-6-18-14-26Z" fill={colors.brandSoft} />
      <Circle cx="24" cy="37" r="2.3" fill={colors.ink} />
      <Circle cx="40" cy="37" r="2.3" fill={colors.ink} />
      <Path d="M28 44c2.5 2 5.5 2 8 0" stroke={colors.danger} strokeWidth="2" strokeLinecap="round" fill="none" />
      <Path d="M17 19 10 13M48 19l6-7M18 27l-8-2M47 27l8-2" stroke={colors.danger} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="32" cy="41" r="6" fill="#FFE9B6" stroke="#F8B84E" strokeWidth="1.5" />
    </Svg>
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
    <View style={[styles.iconBadge, { width: size, height: size, borderRadius: size * 0.28, backgroundColor }]}>
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
  secondary: { backgroundColor: colors.brandSoft },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.hairline },
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
};

const pillLabelToneStyles: Record<string, { color: string }> = {
  brand: { color: colors.brandDark },
  success: { color: '#15803D' },
  danger: { color: '#B91C1C' },
  muted: { color: colors.muted },
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    boxShadow: shadows.sm,
  },
  nativeButton: {
    height: 46,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    minHeight: 46,
  },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.5 },
  buttonLabel: { ...typography.body, fontWeight: '700' },
  pill: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  pillLabel: { ...typography.caption, fontWeight: '700' },
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  topAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.brandSoft,
  },
  topAvatarImage: { width: '100%', height: '100%' },
  topText: { flex: 1, gap: 1 },
  topName: { ...typography.body, color: colors.ink, fontWeight: '800' },
  topSubtitle: { ...typography.caption, color: colors.muted, fontSize: 10 },
  bellButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardMuted,
  },
  bellDot: {
    position: 'absolute',
    right: 7,
    top: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: colors.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: { ...typography.section, color: colors.ink },
  sectionAction: { ...typography.body, color: colors.brand, fontWeight: '700' },
  progressTrack: { width: '100%', overflow: 'hidden' },
  progressFill: {},
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { color: colors.textOnAccent, fontWeight: '800' },
  iconBadge: { alignItems: 'center', justifyContent: 'center' },
  timelineRow: { flexDirection: 'row', gap: spacing.md },
  timelineMarkerCol: { alignItems: 'center', width: 32 },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotLabel: { ...typography.body, color: colors.textOnAccent, fontWeight: '800' },
  timelineLine: { flex: 1, width: 2, backgroundColor: colors.hairline, marginVertical: spacing.xxs, minHeight: 24 },
  timelineContent: { flex: 1, paddingBottom: spacing.lg, gap: spacing.xxs },
  timelineTitle: { ...typography.section, color: colors.ink },
  timelineDescription: { ...typography.body, color: colors.muted },
});
