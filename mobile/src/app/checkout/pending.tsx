import { useQuery } from '@tanstack/react-query';
import { Link, type Href, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getPaymentStatus } from '@/api/payments';
import { GlassSurface } from '@/components/ui/glass-surface';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';

export default function PaymentPendingScreen() {
  const params = useLocalSearchParams<{ payment_id?: string; order_reference?: string }>();
  const paymentId = params.payment_id ? Number(params.payment_id) : null;
  const statusQuery = useQuery({
    queryKey: ['payment-status', paymentId],
    queryFn: () => getPaymentStatus(paymentId as number),
    enabled: Number.isFinite(paymentId),
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 3000 : false),
  });

  const status = statusQuery.data?.status ?? 'pending';
  const orderReference = statusQuery.data?.order_reference ?? params.order_reference ?? null;
  const isSuccess = status === 'completed' || status === 'authorized';
  const isFailure = status === 'failed';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.content}>
        <GlassSurface style={styles.panel}>
          <ThemedView style={[styles.statusIcon, isSuccess && styles.statusSuccess, isFailure && styles.statusFailure]}>
            <ThemedText type="title" style={styles.statusIconText}>{isSuccess ? '✓' : isFailure ? '!' : '…'}</ThemedText>
          </ThemedView>
          <ThemedText type="subtitle">
            {isSuccess ? 'Płatność zakończona' : isFailure ? 'Płatność nieudana' : 'Płatność w toku'}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            {paymentId ? `Status: ${status}` : 'Zamówienie zostało przekazane do obsługi.'}
          </ThemedText>
          {status === 'pending' ? (
            <ThemedText type="small" themeColor="textSecondary">
              Odświeżamy status co kilka sekund, tak jak storefront webowy.
            </ThemedText>
          ) : null}
        </GlassSurface>
        {orderReference ? (
          <Link href={`/account/orders/${orderReference}` as Href} asChild>
            <Pressable style={styles.primaryButton}>
              <ThemedText type="smallBold" style={styles.primaryButtonText}>
                Zobacz zamówienie
              </ThemedText>
            </Pressable>
          </Link>
        ) : null}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  primaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  panel: {
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.five,
    borderRadius: Storefront.radius.xl,
  },
  statusIcon: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: Storefront.colors.primarySoft,
  },
  statusSuccess: {
    backgroundColor: Storefront.colors.primary,
  },
  statusFailure: {
    backgroundColor: Storefront.colors.rose,
  },
  statusIconText: {
    color: '#FFFFFF',
  },
});
