import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QueryState } from '@/components/QueryState';
import { AppIcon, AppTopBar, Card, IconBadge, Pill, ProgressBar } from '@/design/components';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { useCampaigns } from '@/hooks/useAppQueries';
import { formatVnd } from '@/lib/format';
import type { Campaign } from '@/lib/types';

export default function CampaignsScreen() {
  const campaigns = useCampaigns();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppTopBar name="Đặng Nguyễn Tiến" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Sự kiện</Text>
          <Text style={styles.screenSubtitle}>Hoàn thành mốc đơn hàng để nhận thêm thưởng.</Text>
        </View>

        <QueryState isLoading={campaigns.isLoading} isError={campaigns.isError} onRetry={() => campaigns.refetch()}>
          <FlatList
            data={campaigns.data ?? []}
            keyExtractor={(item) => String(item.id)}
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={campaigns.isFetching} onRefresh={() => campaigns.refetch()} />}
            ListEmptyComponent={
              <Card style={styles.emptyCard}>
                <IconBadge name="gift-outline" size={42} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.emptyTitle}>Chưa có sự kiện</Text>
                  <Text style={styles.emptyText}>Các chương trình thưởng sẽ hiển thị ở đây.</Text>
                </View>
              </Card>
            }
            renderItem={({ item }) => <CampaignCard campaign={item} />}
          />
        </QueryState>
      </View>
    </SafeAreaView>
  );
}

function CampaignCard({ campaign }: { readonly campaign: Campaign }) {
  const tiers = [...campaign.tiers].sort((a, b) => a.orders - b.orders);
  const nextTier = tiers.find((t) => t.orders > campaign.completedOrders);
  const progress = nextTier ? campaign.completedOrders / nextTier.orders : 1;

  return (
    <Card style={styles.card}>
      <View style={styles.cardTop}>
        <IconBadge name="gift" size={38} backgroundColor={colors.brandSoft} iconColor={colors.brand} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.cardTitle}>{campaign.title}</Text>
          <Text style={styles.cardSub} numberOfLines={2}>
            {campaign.description ?? 'Mua sắm qua link hoàn tiền để mở khóa phần thưởng.'}
          </Text>
        </View>
        <Pill label={campaign.isActive ? 'Đang mở' : 'Đã đóng'} tone={campaign.isActive ? 'success' : 'muted'} />
      </View>
      <View style={styles.progressTop}>
        <Text style={styles.progressLabel}>Tiến độ</Text>
        <Text style={styles.progressValue}>{campaign.completedOrders} đơn</Text>
      </View>
      <ProgressBar progress={progress} height={7} fillColor={colors.success} />
      <View style={styles.tiers}>
        {tiers.map((tier) => (
          <View key={tier.orders} style={styles.tier}>
            <View style={[styles.tierDot, campaign.completedOrders >= tier.orders && styles.tierDone]}>
              <AppIcon name="checkmark" size={11} color={campaign.completedOrders >= tier.orders ? colors.textOnAccent : colors.textMuted} />
            </View>
            <Text style={styles.tierText}>{tier.orders} đơn</Text>
            <Text style={styles.tierReward}>{formatVnd(tier.reward)}</Text>
          </View>
        ))}
      </View>
      {nextTier && <Text style={styles.hint}>Còn {nextTier.orders - campaign.completedOrders} đơn để nhận {formatVnd(nextTier.reward)}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  screen: { flex: 1 },
  header: { padding: spacing.md, paddingBottom: spacing.xs },
  screenTitle: { ...typography.title, color: colors.ink },
  screenSubtitle: { ...typography.caption, color: colors.muted, marginTop: 2 },
  list: { padding: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.xxl, gap: spacing.sm },
  card: { gap: spacing.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { ...typography.body, color: colors.ink, fontWeight: '900' },
  cardSub: { ...typography.caption, color: colors.muted },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { ...typography.caption, color: colors.muted },
  progressValue: { ...typography.caption, color: colors.brand, fontWeight: '800' },
  tiers: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs },
  tier: { flex: 1, alignItems: 'center', gap: 2 },
  tierDot: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierDone: { backgroundColor: colors.brand },
  tierText: { ...typography.caption, color: colors.ink, fontSize: 10, fontWeight: '800' },
  tierReward: { ...typography.caption, color: colors.muted, fontSize: 9 },
  hint: { ...typography.caption, color: colors.brandDark },
  emptyCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emptyTitle: { ...typography.body, color: colors.ink, fontWeight: '800' },
  emptyText: { ...typography.caption, color: colors.muted },
});
