import * as Clipboard from 'expo-clipboard';
import { Alert, FlatList, RefreshControl, Share, StyleSheet, Text, View } from 'react-native';

import { QueryState } from '@/components/QueryState';
import { AppButton, AppIcon, Card, Pill } from '@/design/components';
import { colors, spacing, typography } from '@/design/tokens';
import { useReferral } from '@/hooks/useAppQueries';
import { formatDate, formatVnd } from '@/lib/format';
import type { ReferralInvitee } from '@/lib/types';

const STATUS_LABEL: Record<ReferralInvitee['status'], string> = {
  pending: 'Chờ hoàn tất',
  qualified: 'Đã đủ điều kiện',
  rewarded: 'Đã nhận thưởng',
};

const STATUS_TONE: Record<ReferralInvitee['status'], 'muted' | 'brand' | 'success'> = {
  pending: 'muted',
  qualified: 'brand',
  rewarded: 'success',
};

export default function ReferralScreen() {
  const referral = useReferral();

  async function handleCopy() {
    if (!referral.data) return;
    await Clipboard.setStringAsync(referral.data.referralCode);
    Alert.alert('Đã sao chép', 'Mã giới thiệu đã được sao chép.');
  }

  async function handleShare() {
    if (!referral.data) return;
    try {
      await Share.share({
        message: `Tham gia hoàn tiền Shopee cùng mình! Dùng mã giới thiệu ${referral.data.referralCode} khi đăng ký nhé.`,
      });
    } catch {
      // user dismissed the share sheet
    }
  }

  return (
    <View style={styles.screen}>
      <QueryState isLoading={referral.isLoading} isError={referral.isError} onRetry={() => referral.refetch()}>
        <FlatList
          data={referral.data?.invited ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={referral.isFetching} onRefresh={() => referral.refetch()} />}
          ListHeaderComponent={
            <View style={styles.header}>
              <Card style={styles.codeCard}>
                <Text style={styles.codeLabel}>Mã giới thiệu của bạn</Text>
                <Text style={styles.code}>{referral.data?.referralCode ?? '------'}</Text>
                <View style={styles.codeActions}>
                  <AppButton label="Sao chép" icon="copy-outline" variant="secondary" onPress={handleCopy} style={{ flex: 1 }} />
                  <AppButton label="Chia sẻ" icon="share-social-outline" onPress={handleShare} style={{ flex: 1 }} />
                </View>
              </Card>

              <View style={styles.statsRow}>
                <Card style={styles.statCard}>
                  <Text style={styles.statValue}>{referral.data?.stats.totalInvited ?? 0}</Text>
                  <Text style={styles.statLabel}>Đã mời</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Text style={styles.statValue}>{referral.data?.stats.qualified ?? 0}</Text>
                  <Text style={styles.statLabel}>Đủ điều kiện</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Text style={styles.statValue}>{formatVnd(referral.data?.stats.totalReward)}</Text>
                  <Text style={styles.statLabel}>Tổng thưởng</Text>
                </Card>
              </View>
              <Text style={styles.rewardNote}>Số tiền này đã được cộng vào số dư ví của bạn.</Text>

              <Text style={styles.sectionTitle}>Danh sách bạn đã mời</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <AppIcon name="people-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>Bạn chưa mời ai. Chia sẻ mã ngay để nhận thưởng!</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card style={styles.inviteeCard}>
              <View style={styles.inviteeText}>
                <Text style={styles.inviteePhone}>{item.referredPhone}</Text>
                <Text style={styles.inviteeDate}>{formatDate(item.createdAt)}</Text>
              </View>
              <Pill label={STATUS_LABEL[item.status]} tone={STATUS_TONE[item.status]} />
            </Card>
          )}
        />
      </QueryState>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
  header: { gap: spacing.lg, marginBottom: spacing.md },
  codeCard: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  codeLabel: { ...typography.body, color: colors.muted },
  code: { ...typography.hero, color: colors.brandDark, letterSpacing: 4 },
  codeActions: { flexDirection: 'row', gap: spacing.sm, width: '100%' },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, alignItems: 'center', gap: spacing.xxs },
  statValue: { ...typography.section, color: colors.ink },
  statLabel: { ...typography.caption, color: colors.muted },
  rewardNote: { ...typography.caption, color: colors.muted, textAlign: 'center', marginTop: -spacing.xs },
  sectionTitle: { ...typography.section, color: colors.ink },
  inviteeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inviteeText: { gap: 2 },
  inviteePhone: { ...typography.body, color: colors.ink, fontWeight: '700' },
  inviteeDate: { ...typography.caption, color: colors.muted },
  empty: { alignItems: 'center', padding: spacing.xxl, gap: spacing.sm },
  emptyText: { ...typography.body, color: colors.muted, textAlign: 'center' },
});
