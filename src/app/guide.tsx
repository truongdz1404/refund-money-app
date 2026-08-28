import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon, Card, Mascot } from '@/design/components';
import { colors, radius, shadows, spacing, typography } from '@/design/tokens';

const STEPS = [
  {
    title: 'Quy Trình Mua Sắm',
    description: 'Bạn chọn sản phẩm trên sàn thương mại điện tử, sau đó sao chép link sản phẩm.',
    icon: 'bag-handle-outline',
  },
  {
    title: 'Chọn Nền Tảng',
    description: 'Mở Hoàn tiền, chọn sàn TMĐT phù hợp và dán link sản phẩm cần tạo.',
    icon: 'cart-outline',
  },
  {
    title: 'Dán Link Sản Phẩm',
    description: 'Link hợp lệ sẽ được kiểm tra tự động, app sẽ tạo link hoàn tiền mới cho bạn.',
    icon: 'link-outline',
  },
  {
    title: 'Lấy Link Ưu Đãi',
    description: 'Mở link mới để mua sắm. Hoa hồng sẽ được ghi nhận khi đơn hàng hoàn tất.',
    icon: 'sparkles-outline',
  },
  {
    title: 'Mua Hàng & Nhận Ưu Đãi',
    description: 'Theo dõi đơn hàng trong tab Đơn hàng và nhận thanh toán khi ví đủ điều kiện.',
    icon: 'checkmark-done-outline',
  },
] as const;

const FAQS = [
  {
    question: 'Làm thế nào để biết đơn hàng đã lên?',
    answer: 'Đơn hàng thường xuất hiện sau khi sàn xác nhận giao dịch hợp lệ qua link hoàn tiền.',
  },
  {
    question: 'Khi nào tôi nhận được ưu đãi?',
    answer: 'Tiền hoàn được cộng vào ví sau khi đơn hoàn tất và qua bước đối soát.',
  },
  {
    question: 'Tôi có thể tạo link ở sàn nào?',
    answer: 'Hiện tại Shopee đã sẵn sàng. Các nền tảng khác sẽ được mở dần trong các bản cập nhật.',
  },
];

export default function GuideScreen() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.navHeader}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <AppIcon name="chevron-back" size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.navTitle}>Hướng dẫn</Text>
        <View style={styles.backButton} />
      </View>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              Hướng Dẫn <Text style={styles.heroAccent}>Sử Dụng</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Tìm hiểu cách mua sắm và nhận ưu đãi hoàn tiền chỉ với vài thao tác đơn giản.
            </Text>
          </View>
          <Mascot size={58} />
        </View>

        <View style={styles.timeline}>
          {STEPS.map((step, index) => (
            <View key={step.title} style={styles.stepRow}>
              <View style={styles.stepRail}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                {index < STEPS.length - 1 && <View style={styles.stepLine} />}
              </View>
              <Card style={styles.stepCard}>
                <View style={styles.stepIcon}>
                  <AppIcon name={step.icon} size={18} color={colors.brand} />
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </Card>
            </View>
          ))}
        </View>

        <Text style={styles.faqTitle}>Câu hỏi thường gặp</Text>
        <View style={styles.faqList}>
          {FAQS.map((faq, index) => {
            const open = openFaq === index;
            return (
              <Card key={faq.question} style={styles.faqCard}>
                <Pressable style={styles.faqHeader} onPress={() => setOpenFaq(open ? null : index)}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <AppIcon name={open ? 'chevron-up' : 'chevron-down'} size={17} color={colors.muted} />
                </Pressable>
                {open && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  navHeader: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  navTitle: { ...typography.body, color: colors.ink, fontWeight: '800' },
  container: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.sm },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 92,
  },
  heroCopy: { flex: 1, gap: spacing.xs, alignItems: 'center' },
  heroTitle: { ...typography.title, color: colors.ink, textAlign: 'center' },
  heroAccent: { color: colors.brand },
  heroSubtitle: { ...typography.caption, color: colors.muted, textAlign: 'center', maxWidth: 250 },
  timeline: { gap: 0, marginTop: spacing.xs },
  stepRow: { flexDirection: 'row', gap: spacing.sm },
  stepRail: { width: 34, alignItems: 'center' },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.brand,
  },
  stepNumberText: { ...typography.caption, color: colors.textOnAccent, fontWeight: '900' },
  stepLine: { width: 2, flex: 1, minHeight: 54, backgroundColor: colors.hairline },
  stepCard: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
  },
  stepIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1, gap: 2 },
  stepTitle: { ...typography.body, color: colors.ink, fontWeight: '900' },
  stepDescription: { ...typography.caption, color: colors.muted },
  faqTitle: { ...typography.section, color: colors.ink, marginTop: spacing.sm },
  faqList: { gap: spacing.xs },
  faqCard: { gap: spacing.xs, paddingVertical: spacing.sm },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  faqQuestion: { ...typography.caption, color: colors.ink, fontWeight: '800', flex: 1 },
  faqAnswer: { ...typography.caption, color: colors.muted },
});
