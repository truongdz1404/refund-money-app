import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QueryState } from '@/components/QueryState';
import { AppIcon, AppTopBar, Card, IconBadge } from '@/design/components';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { useOrders } from '@/hooks/useAppQueries';
import { formatDate, formatVnd, orderStatusLabel } from '@/lib/format';
import type { Order } from '@/lib/types';

const FILTERS: { key: 'all' | 1 | 2 | 3 | 4; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 2, label: 'Hoàn thành' },
  { key: 1, label: 'Chờ xác nhận' },
  { key: 4, label: 'Chưa thanh toán' },
  { key: 3, label: 'Đã huỷ' },
];

const SAMPLE_ORDERS: Order[] = [
  {
    id: -1,
    orderSn: '250828HT001',
    userId: -1,
    subId: null,
    totalCommission: 5900,
    userCommission: 5900,
    operatorCommission: null,
    displayOrderStatus: 2,
    payoutStatus: 'unpaid',
    paidAt: null,
    purchaseTime: '2026-08-28',
    createdAt: '2026-08-28',
    updatedAt: '2026-08-28',
  },
  {
    id: -2,
    orderSn: '250828HT002',
    userId: -1,
    subId: null,
    totalCommission: 3700,
    userCommission: 3700,
    operatorCommission: null,
    displayOrderStatus: 1,
    payoutStatus: 'unpaid',
    paidAt: null,
    purchaseTime: '2026-08-27',
    createdAt: '2026-08-27',
    updatedAt: '2026-08-27',
  },
];

const STATUS_TONE: Record<number, { bg: string; fg: string }> = {
  1: { bg: '#FFF7D6', fg: '#9A6B00' },
  2: { bg: '#DCFCE7', fg: '#15803D' },
  3: { bg: '#FEE2E2', fg: '#B91C1C' },
  4: { bg: colors.brandSoft, fg: colors.brandDark },
};

export default function OrdersScreen() {
  const orders = useOrders();
  const [filter, setFilter] = useState<'all' | 1 | 2 | 3 | 4>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let data = orders.data && orders.data.length > 0 ? orders.data : SAMPLE_ORDERS;
    if (filter !== 'all') data = data.filter((o) => o.displayOrderStatus === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      data = data.filter((o) => o.orderSn.toLowerCase().includes(q));
    }
    return data;
  }, [orders.data, filter, query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppTopBar name="Đặng Nguyễn Tiến" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Đơn hàng</Text>
          <View style={styles.searchBox}>
            <AppIcon name="search" size={15} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Tìm mã đơn hoặc sản phẩm..."
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.filterRow}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={FILTERS}
            keyExtractor={(item) => String(item.key)}
            contentContainerStyle={styles.filterContent}
            renderItem={({ item }) => {
              const active = item.key === filter;
              return (
                <Text onPress={() => setFilter(item.key)} style={[styles.filterChip, active && styles.filterChipActive]}>
                  {item.label}
                </Text>
              );
            }}
          />
        </View>

        <QueryState isLoading={orders.isLoading && !orders.data} isError={orders.isError} onRetry={() => orders.refetch()}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={orders.isFetching} onRefresh={() => orders.refetch()} />}
            renderItem={({ item }) => <OrderRow order={item} />}
          />
        </QueryState>
      </View>
    </SafeAreaView>
  );
}

function OrderRow({ order }: { readonly order: Order }) {
  const tone = STATUS_TONE[order.displayOrderStatus ?? 0] ?? { bg: colors.cardMuted, fg: colors.muted };
  const title = order.id < 0 ? 'Áo thun / sản phẩm Shopee nổi bật' : `Sản phẩm Shopee ${order.orderSn.slice(-5)}`;

  return (
    <Card style={styles.orderCard}>
      <View style={styles.orderMetaTop}>
        <Text style={styles.shopName}># SHOPEE</Text>
        <Text style={styles.orderDate}>{formatDate(order.purchaseTime ?? order.createdAt)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: tone.bg }]}>
          <Text style={[styles.statusText, { color: tone.fg }]}>{orderStatusLabel(order.displayOrderStatus)}</Text>
        </View>
      </View>
      <View style={styles.orderBody}>
        <View style={styles.thumbnail}>
          <IconBadge name="bag-handle" size={38} backgroundColor="#FFEAE2" iconColor="#EE4D2D" iconSize={20} />
        </View>
        <View style={styles.orderInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.productSub} numberOfLines={1}>
            Mã đơn: {order.orderSn}
          </Text>
          <View style={styles.amountRow}>
            <Text style={styles.cashbackLabel}>Hoàn tiền</Text>
            <Text style={styles.orderAmount}>{formatVnd(order.userCommission)}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: { padding: spacing.sm, gap: spacing.xs },
  screenTitle: { ...typography.title, color: colors.ink },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    height: 36,
  },
  searchInput: { flex: 1, ...typography.caption, color: colors.ink, height: 36 },
  filterRow: { paddingBottom: spacing.xs },
  filterContent: { gap: spacing.xs, paddingHorizontal: spacing.sm },
  filterChip: {
    ...typography.caption,
    color: colors.muted,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  filterChipActive: { backgroundColor: colors.brand, borderColor: colors.brand, color: colors.textOnAccent, fontWeight: '900' },
  list: { paddingHorizontal: spacing.sm, paddingBottom: spacing.xxl, gap: spacing.xs },
  orderCard: { gap: spacing.xs, padding: spacing.xs },
  orderMetaTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  shopName: { ...typography.caption, color: colors.muted, fontSize: 9, fontWeight: '900' },
  orderDate: { ...typography.caption, color: colors.muted, fontSize: 9, flex: 1 },
  statusBadge: { paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: radius.pill },
  statusText: { ...typography.caption, fontSize: 9, fontWeight: '900' },
  orderBody: { flexDirection: 'row', gap: spacing.xs },
  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: radius.sm,
    backgroundColor: '#FFF8F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderInfo: { flex: 1, gap: 3 },
  productTitle: { ...typography.caption, color: colors.ink, fontWeight: '900' },
  productSub: { ...typography.caption, color: colors.muted, fontSize: 10 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  cashbackLabel: { ...typography.caption, color: colors.muted, fontSize: 10 },
  orderAmount: { ...typography.body, color: colors.success, fontWeight: '900' },
});
