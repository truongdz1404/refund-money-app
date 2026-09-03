import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QueryState } from '@/components/QueryState';
import { TextField } from '@/components/TextField';
import { AppButton, AppIcon, AppTopBar, Card, IconBadge, Mascot } from '@/design/components';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { useMe, useWallet, useWithdraw, useWithdrawals } from '@/hooks/useAppQueries';
import { getDisplayName } from '@/lib/displayName';
import { formatDateTime, formatVnd } from '@/lib/format';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Đang chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Bị từ chối',
  paid: 'Đã thanh toán',
};

const HISTORY_STATUS_STYLE: Record<string, { color: string }> = {
  pending: { color: '#9A6B00' },
  approved: { color: colors.brand },
  rejected: { color: colors.danger },
  paid: { color: colors.success },
};

export default function WalletScreen() {
  const router = useRouter();
  const me = useMe();
  const wallet = useWallet();
  const withdraw = useWithdraw();
  const withdrawals = useWithdrawals();
  const [amount, setAmount] = useState('');

  const missingBankInfo = me.data && (!me.data.bankName || !me.data.bankAccountNumber || !me.data.bankAccountHolder);
  const pendingWithdrawal = wallet.data?.pendingWithdrawal ?? null;
  const availableAmount = wallet.data?.availableAmount ?? 0;
  const minWithdrawAmount = wallet.data?.minWithdrawAmount ?? 0;
  const amountNumber = Number(amount.replace(/[^0-9]/g, ''));
  const canSubmit =
    !missingBankInfo &&
    !pendingWithdrawal &&
    amountNumber >= minWithdrawAmount &&
    amountNumber <= availableAmount;

  function refetchAll() {
    me.refetch();
    wallet.refetch();
    withdrawals.refetch();
  }

  function submitWithdraw() {
    withdraw.mutate(
      { amount: amountNumber },
      {
        onSuccess: () => {
          setAmount('');
          Alert.alert('Đã gửi yêu cầu', 'Yêu cầu thanh toán của bạn đang chờ admin duyệt.');
        },
        onError: (err) => {
          Alert.alert('Không tạo được yêu cầu', err instanceof Error ? err.message : 'Vui lòng thử lại.');
        },
      },
    );
  }

  function handleSubmit() {
    if (!canSubmit) return;
    Alert.alert(
      'Xác nhận thanh toán',
      `Rút ${formatVnd(amountNumber)} về ${me.data?.bankName ?? 'ngân hàng'} · ${me.data?.bankAccountNumber ?? ''} (${me.data?.bankAccountHolder ?? ''})?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Xác nhận', onPress: submitWithdraw },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppTopBar name={getDisplayName(me.data)} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={wallet.isFetching || me.isFetching} onRefresh={refetchAll} />}
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.screenTitle}>Thanh toán</Text>
            <Text style={styles.screenSubtitle}>Chọn ví và nhập số tiền muốn thanh toán</Text>
          </View>
          <Mascot size={50} />
        </View>

        <QueryState isLoading={wallet.isLoading} isError={wallet.isError} onRetry={refetchAll}>
          <View style={styles.summaryRow}>
            <AmountTile label="Đã duyệt" value={formatVnd(availableAmount)} active />
            <AmountTile label="Chờ đối soát" value={formatVnd(wallet.data?.pendingAmount)} />
            <AmountTile label="Đã nhận" value={formatVnd(wallet.data?.paidAmount)} />
          </View>

          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Tạo yêu cầu thanh toán</Text>

            <View style={styles.inputHeader}>
              <Text style={styles.label}>Số dư khả dụng</Text>
              <Text style={styles.valueText}>{formatVnd(availableAmount)}</Text>
            </View>
            <TextField
              label="Số tiền yêu cầu"
              placeholder="0"
              keyboardType="number-pad"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
            />
            <View style={styles.inputHintRow}>
              <Text style={styles.hintText}>Tối thiểu {formatVnd(minWithdrawAmount)}</Text>
              <Text style={styles.useAll} onPress={() => setAmount(String(Math.floor(availableAmount)))}>
                Tất cả
              </Text>
            </View>

            <View style={styles.methodWrap}>
              <Text style={styles.label}>Phương thức nhận</Text>
              <View style={styles.methodRow}>
                <View style={[styles.methodOption, styles.methodActive]}>
                  <AppIcon name="card" size={18} color={colors.brand} />
                  <Text style={styles.methodText}>Ngân hàng</Text>
                </View>
              </View>
            </View>

            {missingBankInfo ? (
              <View style={styles.warningCard}>
                <AppIcon name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.warningText}>Bạn cần cập nhật thông tin ngân hàng trước khi thanh toán.</Text>
                <Text style={styles.profileLink} onPress={() => router.push('/profile')}>
                  Cập nhật
                </Text>
              </View>
            ) : (
              <View style={styles.bankCard}>
                <IconBadge name="business" size={36} backgroundColor={colors.brandSoft} iconColor={colors.brand} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.bankName}>{me.data?.bankName ?? 'Ngân hàng nhận'}</Text>
                  <Text style={styles.bankInfo}>
                    {me.data?.bankAccountNumber ?? '0000000000'} · {me.data?.bankAccountHolder ?? 'Chủ tài khoản'}
                  </Text>
                </View>
                <AppIcon name="checkmark-circle" size={20} color={colors.success} />
              </View>
            )}

            {pendingWithdrawal && (
              <View style={styles.pendingBox}>
                <Text style={styles.pendingTitle}>Yêu cầu đang xử lý</Text>
                <Text style={styles.pendingDesc}>
                  {formatVnd(pendingWithdrawal.amount)} · {STATUS_LABEL[pendingWithdrawal.status] ?? pendingWithdrawal.status}
                </Text>
              </View>
            )}

            <AppButton
              label="Xác nhận thanh toán"
              onPress={handleSubmit}
              loading={withdraw.isPending}
              disabled={!canSubmit}
            />
          </Card>

          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Lịch sử rút tiền</Text>
            {(withdrawals.data ?? []).length === 0 ? (
              <Text style={styles.hintText}>Chưa có yêu cầu rút tiền nào.</Text>
            ) : (
              (withdrawals.data ?? []).map((item) => (
                <View key={item.id} style={styles.historyRow}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.bankName}>{formatVnd(item.amount)}</Text>
                    <Text style={styles.hintText}>{formatDateTime(item.createdAt)}</Text>
                  </View>
                  <Text style={[styles.historyStatus, HISTORY_STATUS_STYLE[item.status]]}>
                    {STATUS_LABEL[item.status] ?? item.status}
                  </Text>
                </View>
              ))
            )}
          </Card>
        </QueryState>
      </ScrollView>
    </SafeAreaView>
  );
}

function AmountTile({
  label,
  value,
  active,
}: {
  readonly label: string;
  readonly value: string;
  readonly active?: boolean;
}) {
  return (
    <View style={[styles.amountTile, active && styles.amountTileActive]}>
      <View style={[styles.radioDot, active && styles.radioDotActive]} />
      <Text style={[styles.amountLabel, active && styles.amountLabelActive]}>{label}</Text>
      <Text style={[styles.amountValue, active && styles.amountValueActive]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  container: { padding: spacing.sm, paddingBottom: spacing.xxl, gap: spacing.xs },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 62,
  },
  screenTitle: { ...typography.title, color: colors.ink },
  screenSubtitle: { ...typography.caption, color: colors.muted, marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: spacing.xs },
  amountTile: {
    flex: 1,
    minHeight: 56,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.xs,
    gap: 2,
  },
  amountTileActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.hairline },
  radioDotActive: { backgroundColor: colors.textOnAccent },
  amountLabel: { ...typography.caption, color: colors.muted, fontSize: 10 },
  amountLabelActive: { color: 'rgba(255,255,255,0.86)' },
  amountValue: { ...typography.caption, color: colors.ink, fontWeight: '800' },
  amountValueActive: { color: colors.textOnAccent },
  formCard: { gap: spacing.xs },
  sectionTitle: { ...typography.section, color: colors.ink },
  inputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...typography.caption, color: colors.muted, fontWeight: '800' },
  valueText: { ...typography.caption, color: colors.brand, fontWeight: '800' },
  inputHintRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hintText: { ...typography.caption, color: colors.muted },
  useAll: { ...typography.caption, color: colors.brand, fontWeight: '800' },
  methodWrap: { gap: spacing.xs },
  methodRow: { flexDirection: 'row', gap: spacing.xs },
  methodOption: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  methodActive: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  methodText: { ...typography.caption, color: colors.brandDark, fontWeight: '800' },
  methodMuted: { ...typography.caption, color: colors.muted },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: '#FFF1F1',
  },
  warningText: { ...typography.caption, color: colors.muted, flex: 1 },
  profileLink: { ...typography.caption, color: colors.danger, fontWeight: '800' },
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.brandSoft,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  bankName: { ...typography.body, color: colors.ink, fontWeight: '800' },
  bankInfo: { ...typography.caption, color: colors.muted },
  pendingBox: { borderRadius: radius.md, padding: spacing.sm, backgroundColor: '#FFF7D6', gap: 2 },
  pendingTitle: { ...typography.caption, color: '#9A6B00', fontWeight: '800' },
  pendingDesc: { ...typography.caption, color: colors.muted },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  historyStatus: { ...typography.caption, fontWeight: '800' },
});
