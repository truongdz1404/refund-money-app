import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField } from '@/components/TextField';
import { AppButton, AppIcon, AppTopBar, type AppIconName, Card, IconBadge, Mascot } from '@/design/components';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { useCreateLink } from '@/hooks/useAppQueries';
import { formatPct, formatVnd } from '@/lib/format';
import type { LinkResult } from '@/lib/types';

type Platform = {
  key: string;
  label: string;
  icon: AppIconName;
  enabled: boolean;
  color: string;
  soft: string;
};

const PLATFORMS: Platform[] = [
  { key: 'shopee', label: 'Shopee', icon: 'bag-handle', enabled: true, color: '#EE4D2D', soft: '#FFEAE2' },
  { key: 'shopeefood', label: 'ShopeeFood', icon: 'fast-food', enabled: false, color: '#F05A28', soft: '#FFEFE8' },
  { key: 'tiktok', label: 'TikTok', icon: 'logo-tiktok', enabled: false, color: '#111827', soft: '#E9E9EC' },
  { key: 'lazada', label: 'Lazada', icon: 'storefront', enabled: false, color: '#1D2AA8', soft: '#E7E9FB' },
  { key: 'tiki', label: 'Tiki', icon: 'bag-check', enabled: false, color: '#1677FF', soft: '#EAF1FF' },
  { key: 'cellphones', label: 'CellphoneS', icon: 'phone-portrait', enabled: false, color: '#D70018', soft: '#FFE7EA' },
];

type HistoryItem = { id: string; url: string; result: LinkResult; platform: Platform };

export default function LinkScreen() {
  const [platform, setPlatform] = useState('shopee');
  const [url, setUrl] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const createLink = useCreateLink();

  const selectedPlatform = PLATFORMS.find((p) => p.key === platform) ?? PLATFORMS[0];

  function handleSelectPlatform(next: Platform) {
    if (!next.enabled) {
      Alert.alert('Sắp ra mắt', `${next.label} sẽ được hỗ trợ trong bản cập nhật sau.`);
      return;
    }
    setPlatform(next.key);
  }

  function handleSubmit() {
    if (!url.trim()) return;
    createLink.mutate(
      { platform, productUrl: url.trim() },
      {
        onSuccess: (result) => {
          setHistory((prev) =>
            [{ id: `${Date.now()}`, url: url.trim(), result, platform: selectedPlatform }, ...prev].slice(0, 8),
          );
          setUrl('');
        },
        onError: (err) => {
          Alert.alert('Không tạo được link', err instanceof Error ? err.message : 'Vui lòng thử lại.');
        },
      },
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppTopBar name="Đặng Nguyễn Tiến" />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Tạo link hoàn tiền</Text>
            <Text style={styles.heroSubtitle}>Chọn sàn và dán link sản phẩm để lấy link mới.</Text>
          </View>
          <Mascot size={60} />
        </View>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Chọn nền tảng</Text>
          <View style={styles.platformGrid}>
            {PLATFORMS.map((p) => {
              const selected = p.key === platform;
              return (
                <Pressable
                  key={p.key}
                  onPress={() => handleSelectPlatform(p)}
                  style={[styles.platformItem, selected && styles.platformItemSelected]}
                >
                  <IconBadge name={p.icon} size={38} backgroundColor={p.soft} iconColor={p.color} iconSize={20} />
                  <Text style={[styles.platformLabel, selected && styles.platformLabelSelected]} numberOfLines={1}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextField
            label="Link sản phẩm Shopee"
            placeholder="https://shopee.vn/..."
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <AppButton
            label="Tạo link hoàn tiền"
            onPress={handleSubmit}
            loading={createLink.isPending}
            disabled={!url.trim()}
          />
        </Card>

        {createLink.data && (
          <Card style={styles.resultCard}>
            <View style={styles.resultTitleRow}>
              <AppIcon name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.resultTitle}>Đã tạo link thành công</Text>
            </View>
            <Text style={styles.resultLink} numberOfLines={1}>
              {createLink.data.results?.[0]?.shortLink ?? createLink.data.results?.[0]?.longLink ?? 'Link đã sẵn sàng'}
            </Text>
            {createLink.data.estimate && (
              <Text style={styles.resultEstimate}>
                Hoàn dự kiến {formatVnd(createLink.data.estimate.userAmount)}
                {formatPct(createLink.data.estimate.userPct) ? ` · ${formatPct(createLink.data.estimate.userPct)}` : ''}
              </Text>
            )}
          </Card>
        )}

        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Lịch sử tạo link</Text>
          <Text style={styles.countText}>{history.length} link</Text>
        </View>
        <View style={styles.historyList}>
          {history.length === 0 ? (
            <Card style={styles.emptyHistory}>
              <IconBadge name="link-outline" size={34} />
              <View style={{ flex: 1 }}>
                <Text style={styles.emptyTitle}>Chưa có link nào</Text>
                <Text style={styles.emptyText}>Link mới tạo sẽ xuất hiện ở đây.</Text>
              </View>
            </Card>
          ) : (
            history.map((item) => <HistoryRow key={item.id} item={item} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HistoryRow({ item }: { readonly item: HistoryItem }) {
  const shortLink = item.result.results?.[0]?.shortLink ?? item.result.results?.[0]?.longLink ?? item.url;

  async function copyLink() {
    await Clipboard.setStringAsync(shortLink);
    Alert.alert('Đã sao chép', 'Link hoàn tiền đã được sao chép.');
  }

  return (
    <Card style={styles.historyCard}>
      <IconBadge name={item.platform.icon} size={36} backgroundColor={item.platform.soft} iconColor={item.platform.color} />
      <View style={styles.historyText}>
        <Text style={styles.historyUrl} numberOfLines={1}>
          {item.url}
        </Text>
        <Text style={styles.historySub} numberOfLines={1}>
          {shortLink}
        </Text>
      </View>
      <Pressable onPress={copyLink} style={styles.smallButton}>
        <AppIcon name="copy-outline" size={15} color={colors.brand} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  container: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.sm },
  hero: {
    minHeight: 94,
    borderRadius: radius.lg,
    backgroundColor: colors.brandSoft,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroText: { flex: 1, gap: 3 },
  heroTitle: { ...typography.title, color: colors.ink },
  heroSubtitle: { ...typography.caption, color: colors.muted },
  formCard: { gap: spacing.sm },
  sectionTitle: { ...typography.section, color: colors.ink },
  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  platformItem: {
    width: '31%',
    flexGrow: 1,
    minHeight: 72,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.card,
  },
  platformItemSelected: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  platformLabel: { ...typography.caption, color: colors.ink, fontSize: 10, fontWeight: '700' },
  platformLabelSelected: { color: colors.brandDark },
  resultCard: { gap: spacing.xs, backgroundColor: '#F3FFF7', borderColor: '#CFF7DA' },
  resultTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  resultTitle: { ...typography.body, color: colors.ink, fontWeight: '800' },
  resultLink: { ...typography.body, color: colors.brandDark },
  resultEstimate: { ...typography.caption, color: colors.success, fontWeight: '800' },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  countText: { ...typography.caption, color: colors.muted },
  historyList: { gap: spacing.xs },
  historyCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm },
  historyText: { flex: 1, gap: 2 },
  historyUrl: { ...typography.caption, color: colors.ink, fontWeight: '800' },
  historySub: { ...typography.caption, color: colors.muted, fontSize: 10 },
  smallButton: {
    width: 32,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHistory: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emptyTitle: { ...typography.body, color: colors.ink, fontWeight: '800' },
  emptyText: { ...typography.caption, color: colors.muted },
});
