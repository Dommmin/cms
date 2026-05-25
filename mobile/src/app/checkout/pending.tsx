import { useQuery } from '@tanstack/react-query';
import { Link, type Href, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getPaymentStatus } from '@/api/payments';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.content}>
        <ThemedText type="subtitle">{status === 'completed' ? 'Płatność zakończona' : 'Płatność w toku'}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {paymentId ? `Status: ${status}` : 'Zamówienie zostało przekazane do obsługi.'}
        </ThemedText>
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
    paddingVertical: Spacing.three,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});
