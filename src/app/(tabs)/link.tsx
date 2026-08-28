import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
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

type HistoryItem = { id: string; url: string; result: LinkResult; platform: Platform; sample?: boolean };

const PLATFORMS: Platform[] = [
  { key: 'shopee', label: 'Shopee', icon: 'bag-handle', enabled: true, color: '#EE4D2D', soft: '#FFEAE2' },
  { key: 'shopeefood', label: 'ShopeeFood', icon: 'fast-food', enabled: false, color: '#F05A28', soft: '#FFEFE8' },
  { key: 'tiktok', label: 'TikTok', icon: 'logo-tiktok', enabled: false, color: '#111827', soft: '#E9E9EC' },
  { key: 'lazada', label: 'Lazada', icon: 'storefront', enabled: false, color: '#1D2AA8', soft: '#E7E9FB' },
  { key: 'tiki', label: 'Tiki', icon: 'bag-check', enabled: false, color: '#1677FF', soft: '#EAF1FF' },
  { key: 'cellphones', label: 'CellphoneS', icon: 'phone-portrait', enabled: false, color: '#D70018', soft: '#FFE7EA' },
];

const SAMPLE_HISTORY: HistoryItem[] = [
  {
    id: 'sample-1',
    url: 'https://shopee.vn/san-pham-giam-gia',
    platform: PLATFORMS[0],
    sample: true,
    result: { pid: null, estimate: { userAmount: 12000, userPct: 4.5 }, results: [{ shortLink: 'shp.ee/hoantien12' }] },
  },
  {
    id: 'sample-2',
    url: 'https://shopee.vn/deal-hot-hom-nay',
    platform: PLATFORMS[0],
    sample: true,
    result: { pid: null, estimate: { userAmount: 8000, userPct: 3.2 }, results: [{ shortLink: 'shp.ee/dealblue8' }] },
  },
];

function getResultLink(result: LinkResult) {
  return result.results?.[0]?.shortLink ?? result.results?.[0]?.longLink ?? null;
}

function normalizeExternalUrl(link: string) {
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

async function openCashbackLink(link?: string | null) {
  if (!link) {
    Alert.alert('Chưa có link', 'Link hoàn tiền chưa sẵn sàng.');
    return;
  }

  const url = normalizeExternalUrl(link);
  const canOpen = await Linking.canOpenURL(url).catch(() => false);

  if (!canOpen) {
    Alert.alert('Không mở được link', 'Bạn có thể sao chép link và mở trong trình duyệt.');
    return;
  }

  await Linking.openURL(url);
}

async function copyCashbackLink(link?: string | null) {
  if (!link) {
    Alert.alert('Chưa có link', 'Link hoàn tiền chưa sẵn sàng.');
    return;
  }

  await Clipboard.setStringAsync(link);
  Alert.alert('Đã sao chép', 'Link hoàn tiền đã được sao chép.');
}

export default function LinkScreen() {
  const [platform, setPlatform] = useState('shopee');
  const [url, setUrl] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const createLink = useCreateLink();
  const selectedPlatform = PLATFORMS.find((p) => p.key === platform) ?? PLATFORMS[0];
  const displayHistory = history.length > 0 ? history : SAMPLE_HISTORY;

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
        <Card style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Tạo link hoàn tiền</Text>
            <Text style={styles.heroSubtitle}>Chọn sàn và dán link sản phẩm để lấy link mới.</Text>
          </View>
          <Mascot size={54} />
        </Card>

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
                  <IconBadge name={p.icon} size={34} backgroundColor={p.soft} iconColor={p.color} iconSize={18} />
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

        {createLink.data && <SuccessResultCard result={createLink.data} />}

        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Lịch sử tạo link</Text>
          <Text style={styles.countText}>{displayHistory.length} link</Text>
        </View>
        <View style={styles.historyList}>
          {displayHistory.map((item) => (
            <HistoryRow key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SuccessResultCard({ result }: { readonly result: LinkResult }) {
  const resultLink = getResultLink(result);
  const pct = formatPct(result.estimate?.userPct ?? null);

  return (
    <Card style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <View style={styles.resultIcon}>
          <AppIcon name="checkmark" size={15} color={colors.textOnAccent} />
        </View>
        <View style={styles.resultCopy}>
          <Text style={styles.resultTitle}>Link hoàn tiền đã sẵn sàng</Text>
          <Text style={styles.resultSubtitle}>Bấm mở link hoặc sao chép để gửi cho khách.</Text>
        </View>
      </View>

      <Pressable
        onPress={() => openCashbackLink(resultLink)}
        disabled={!resultLink}
        style={({ pressed }) => [styles.resultLinkPill, pressed && styles.pressed]}
      >
        <View style={styles.resultLinkTextWrap}>
          <Text style={styles.resultLinkLabel}>Link của bạn</Text>
          <Text style={styles.resultLink} numberOfLines={1} selectable>
            {resultLink ?? 'Link đã sẵn sàng'}
          </Text>
        </View>
        <View style={styles.openIconButton}>
          <AppIcon name="open-outline" size={16} color={colors.brand} />
        </View>
      </Pressable>

      {result.estimate && (
        <View style={styles.resultEstimateBox}>
          <View>
            <Text style={styles.resultEstimateLabel}>Hoàn dự kiến</Text>
            <Text style={styles.resultEstimateValue}>{formatVnd(result.estimate.userAmount)}</Text>
          </View>
          {pct && <Text style={styles.resultPct}>{pct}</Text>}
        </View>
      )}

      <View style={styles.resultActions}>
        <AppButton
          label="Sao chép"
          icon="copy-outline"
          variant="secondary"
          onPress={() => copyCashbackLink(resultLink)}
          style={styles.resultActionButton}
        />
        <AppButton
          label="Mở link"
          icon="open-outline"
          onPress={() => openCashbackLink(resultLink)}
          style={styles.resultActionButton}
        />
      </View>
    </Card>
  );
}

function HistoryRow({ item }: { readonly item: HistoryItem }) {
  const shortLink = getResultLink(item.result) ?? item.url;

  function handleCopy(event: GestureResponderEvent) {
    event.stopPropagation();
    copyCashbackLink(shortLink);
  }

  return (
    <Pressable onPress={() => openCashbackLink(shortLink)} style={({ pressed }) => pressed && styles.pressed}>
      <Card style={styles.historyCard}>
        <IconBadge
          name={item.platform.icon}
          size={32}
          backgroundColor={item.platform.soft}
          iconColor={item.platform.color}
          iconSize={17}
        />
        <View style={styles.historyText}>
          <Text style={styles.historyUrl} numberOfLines={1}>
            {item.url}
          </Text>
          <Text style={styles.historySub} numberOfLines={1}>
            {shortLink}
          </Text>
        </View>
        {item.result.estimate && (
          <Text style={styles.historyAmount}>{formatVnd(item.result.estimate.userAmount)}</Text>
        )}
        <Pressable onPress={handleCopy} style={styles.smallButton}>
          <AppIcon name="copy-outline" size={14} color={colors.brand} />
        </Pressable>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  container: { padding: spacing.sm, paddingBottom: spacing.xxl, gap: spacing.xs },
  hero: {
    minHeight: 82,
    backgroundColor: colors.brandSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  heroText: { flex: 1, gap: 3 },
  heroTitle: { ...typography.title, color: colors.ink },
  heroSubtitle: { ...typography.caption, color: colors.muted },
  formCard: { gap: spacing.xs },
  sectionTitle: { ...typography.section, color: colors.ink },
  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  platformItem: {
    width: '31.5%',
    flexGrow: 1,
    minHeight: 64,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.card,
  },
  platformItemSelected: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  platformLabel: { ...typography.caption, color: colors.ink, fontSize: 9, fontWeight: '800' },
  platformLabelSelected: { color: colors.brandDark },
  resultCard: {
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderColor: '#CFF7DA',
    borderWidth: 1,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  resultIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
  },
  resultCopy: { flex: 1, gap: 1 },
  resultTitle: { ...typography.body, color: colors.ink, fontWeight: '900' },
  resultSubtitle: { ...typography.caption, color: colors.muted },
  resultLinkPill: {
    minHeight: 54,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.backgroundAlt,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  resultLinkTextWrap: { flex: 1, gap: 2 },
  resultLinkLabel: { ...typography.caption, color: colors.muted, fontSize: 9, fontWeight: '800' },
  resultLink: { ...typography.body, color: colors.brandDark, fontWeight: '900' },
  openIconButton: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  resultEstimateBox: {
    minHeight: 50,
    borderRadius: radius.sm,
    backgroundColor: '#F3FFF7',
    borderWidth: 1,
    borderColor: '#D9FBE4',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultEstimateLabel: { ...typography.caption, color: colors.muted, fontSize: 9, fontWeight: '800' },
  resultEstimateValue: { ...typography.section, color: colors.success, fontWeight: '900' },
  resultPct: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '900',
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
  },
  resultActions: { flexDirection: 'row', gap: spacing.xs },
  resultActionButton: { flex: 1, minHeight: 40 },
  pressed: { opacity: 0.72 },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  countText: { ...typography.caption, color: colors.muted },
  historyList: { gap: spacing.xs },
  historyCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs },
  historyText: { flex: 1, gap: 1 },
  historyUrl: { ...typography.caption, color: colors.ink, fontWeight: '800' },
  historySub: { ...typography.caption, color: colors.muted, fontSize: 9 },
  historyAmount: { ...typography.caption, color: colors.success, fontSize: 10, fontWeight: '900' },
  smallButton: {
    width: 28,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
