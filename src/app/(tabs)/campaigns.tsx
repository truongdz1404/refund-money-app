import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QueryState } from '@/components/QueryState';
import { AppIcon, AppTopBar, Card, IconBadge, Mascot, Pill, ProgressBar } from '@/design/components';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { useCampaigns } from '@/hooks/useAppQueries';
import { formatDate, formatVnd } from '@/lib/format';
import type { Campaign } from '@/lib/types';

const FALLBACK_CAMPAIGNS: Campaign[] = [
  {
    id: -1,
    title: 'Sự kiện hoàn tiền tháng 8',
    description: 'Hoàn thành đơn hàng qua link để mở khóa thưởng theo từng mốc.',
    startsAt: '2026-08-01',
    endsAt: '2026-08-31',
    isActive: true,
    tiers: [
      { orders: 5, reward: 25000 },
      { orders: 10, reward: 60000 },
      { orders: 20, reward: 150000 },
    ],
    completedOrders: 6,
    rewardsEarned: [
      {
        id: -1,
        campaignId: -1,
        userId: -1,
        orderThreshold: 5,
        rewardAmount: 25000,
        payoutStatus: 'unpaid',
        paidAt: null,
        createdAt: '2026-08-20',
      },
    ],
  },
];

const FILTERS = [
  { key: 'active', label: 'Đang diễn ra' },
  { key: 'reward', label: 'Đã nhận' },
  { key: 'rules', label: 'Thể lệ' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

export default function CampaignsScreen() {
  const campaigns = useCampaigns();
  const [filter, setFilter] = useState<FilterKey>('active');
  const data = useMemo(() => {
    const source = campaigns.data && campaigns.data.length > 0 ? campaigns.data : FALLBACK_CAMPAIGNS;
    if (filter === 'reward') return source.filter((item) => item.rewardsEarned.length > 0);
    return source;
  }, [campaigns.data, filter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppTopBar name="Đặng Nguyễn Tiến" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>Sự kiện</Text>
            <Text style={styles.screenSubtitle}>Nhiệm vụ nhận thưởng hoàn tiền</Text>
          </View>
          <Mascot size={48} />
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((item) => (
            <Pressable key={item.key} onPress={() => setFilter(item.key)} style={[styles.filterChip, filter === item.key && styles.filterActive]}>
              <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        {filter === 'rules' ? (
          <FlatList
            data={RULES}
            keyExtractor={(item) => item.title}
            contentContainerStyle={styles.list}
            renderItem={({ item, index }) => <RuleRow item={item} index={index + 1} />}
          />
        ) : (
          <QueryState isLoading={campaigns.isLoading && !campaigns.data} isError={campaigns.isError} onRetry={() => campaigns.refetch()}>
            <FlatList
              data={data}
              keyExtractor={(item) => String(item.id)}
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={styles.list}
              refreshControl={<RefreshControl refreshing={campaigns.isFetching} onRefresh={() => campaigns.refetch()} />}
              renderItem={({ item }) => <CampaignCard campaign={item} />}
            />
          </QueryState>
        )}
      </View>
    </SafeAreaView>
  );
}

const RULES = [
  {
    title: 'Tạo link hợp lệ',
    description: 'Tất cả đơn cần phát sinh từ link hoàn tiền trong app.',
    icon: 'link-outline' as const,
  },
  {
    title: 'Đơn hoàn tất',
    description: 'Đơn được tính khi sàn xác nhận trạng thái hoàn thành.',
    icon: 'checkmark-done-outline' as const,
  },
  {
    title: 'Thưởng cộng vào ví',
    description: 'Khi đạt mốc, phần thưởng hiển thị trong ví và chờ đối soát.',
    icon: 'wallet-outline' as const,
  },
];

function CampaignCard({ campaign }: { readonly campaign: Campaign }) {
  const tiers = [...campaign.tiers].sort((a, b) => a.orders - b.orders);
  const nextTier = tiers.find((t) => t.orders > campaign.completedOrders);
  const progress = nextTier ? campaign.completedOrders / nextTier.orders : 1;
  const rewarded = new Set(campaign.rewardsEarned.map((item) => item.orderThreshold));

  return (
    <Card style={styles.card}>
      <View style={styles.banner}>
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerTitle}>{campaign.title}</Text>
          <Text style={styles.bannerSub} numberOfLines={2}>
            {campaign.description ?? 'Hoàn thành thêm đơn để nhận thưởng.'}
          </Text>
        </View>
        <Pill label={campaign.isActive ? 'Đang mở' : 'Đã đóng'} tone={campaign.isActive ? 'success' : 'muted'} />
      </View>

      <View style={styles.dateRow}>
        <MiniInfo icon="calendar-outline" label="Bắt đầu" value={formatDate(campaign.startsAt) || '01/08/2026'} />
        <MiniInfo icon="flag-outline" label="Kết thúc" value={formatDate(campaign.endsAt) || '31/08/2026'} />
      </View>

      <View style={styles.progressTop}>
        <Text style={styles.progressLabel}>Tiến độ đơn hàng</Text>
        <Text style={styles.progressValue}>{campaign.completedOrders} đơn</Text>
      </View>
      <ProgressBar progress={progress} height={7} fillColor={colors.success} />
      <Text style={styles.hint}>
        {nextTier
          ? `Còn ${Math.max(nextTier.orders - campaign.completedOrders, 0)} đơn để nhận ${formatVnd(nextTier.reward)}`
          : 'Bạn đã hoàn thành tất cả mốc thưởng'}
      </Text>

      <View style={styles.milestones}>
        {tiers.map((tier) => {
          const done = campaign.completedOrders >= tier.orders;
          return (
            <View key={tier.orders} style={styles.milestone}>
              <View style={[styles.milestoneDot, done && styles.milestoneDone]}>
                <AppIcon name={rewarded.has(tier.orders) ? 'checkmark' : 'gift-outline'} size={12} color={done ? colors.textOnAccent : colors.brand} />
              </View>
              <Text style={styles.milestoneOrders}>{tier.orders} đơn</Text>
              <Text style={styles.milestoneReward}>{formatVnd(tier.reward)}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.rewardBox}>
        <View style={styles.rewardLeft}>
          <IconBadge name="trophy-outline" size={32} backgroundColor="#FFF7D6" iconColor="#D99A00" />
          <View>
            <Text style={styles.rewardTitle}>Thưởng đã mở khóa</Text>
            <Text style={styles.rewardSub}>{campaign.rewardsEarned.length} mốc thưởng</Text>
          </View>
        </View>
        <Text style={styles.rewardAmount}>
          {formatVnd(campaign.rewardsEarned.reduce((total, item) => total + item.rewardAmount, 0))}
        </Text>
      </View>
    </Card>
  );
}

function MiniInfo({
  icon,
  label,
  value,
}: {
  readonly icon: 'calendar-outline' | 'flag-outline';
  readonly label: string;
  readonly value: string;
}) {
  return (
    <View style={styles.miniInfo}>
      <AppIcon name={icon} size={14} color={colors.brand} />
      <View>
        <Text style={styles.miniLabel}>{label}</Text>
        <Text style={styles.miniValue}>{value}</Text>
      </View>
    </View>
  );
}

function RuleRow({ item, index }: { readonly item: (typeof RULES)[number]; readonly index: number }) {
  return (
    <Card style={styles.ruleCard}>
      <View style={styles.ruleNumber}>
        <Text style={styles.ruleNumberText}>{index}</Text>
      </View>
      <IconBadge name={item.icon} size={34} backgroundColor={colors.brandSoft} iconColor={colors.brand} />
      <View style={{ flex: 1 }}>
        <Text style={styles.ruleTitle}>{item.title}</Text>
        <Text style={styles.ruleDesc}>{item.description}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  screen: { flex: 1 },
  header: {
    minHeight: 78,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenTitle: { ...typography.title, color: colors.ink },
  screenSubtitle: { ...typography.caption, color: colors.muted, marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingBottom: spacing.xs },
  filterChip: {
    flex: 1,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  filterText: { ...typography.caption, color: colors.muted, fontWeight: '800' },
  filterTextActive: { color: colors.textOnAccent },
  list: { padding: spacing.sm, paddingTop: 0, paddingBottom: spacing.xxl, gap: spacing.sm },
  card: { gap: spacing.sm },
  banner: {
    minHeight: 82,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bannerLeft: { flex: 1, gap: 3 },
  bannerTitle: { ...typography.body, color: colors.ink, fontWeight: '900' },
  bannerSub: { ...typography.caption, color: colors.muted },
  dateRow: { flexDirection: 'row', gap: spacing.xs },
  miniInfo: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    padding: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  miniLabel: { ...typography.caption, color: colors.muted, fontSize: 9 },
  miniValue: { ...typography.caption, color: colors.ink, fontWeight: '900' },
  progressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressLabel: { ...typography.caption, color: colors.muted, fontWeight: '700' },
  progressValue: { ...typography.caption, color: colors.brand, fontWeight: '900' },
  hint: { ...typography.caption, color: colors.muted, fontSize: 10 },
  milestones: { flexDirection: 'row', gap: spacing.xs },
  milestone: { flex: 1, alignItems: 'center', gap: 2 },
  milestoneDot: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneDone: { backgroundColor: colors.brand },
  milestoneOrders: { ...typography.caption, color: colors.ink, fontSize: 10, fontWeight: '900' },
  milestoneReward: { ...typography.caption, color: colors.muted, fontSize: 9 },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.sm,
    backgroundColor: '#F8FBFF',
    padding: spacing.xs,
  },
  rewardLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rewardTitle: { ...typography.caption, color: colors.ink, fontWeight: '900' },
  rewardSub: { ...typography.caption, color: colors.muted, fontSize: 9 },
  rewardAmount: { ...typography.body, color: colors.success, fontWeight: '900' },
  ruleCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ruleNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
  },
  ruleNumberText: { ...typography.caption, color: colors.textOnAccent, fontWeight: '900' },
  ruleTitle: { ...typography.body, color: colors.ink, fontWeight: '900' },
  ruleDesc: { ...typography.caption, color: colors.muted },
});
