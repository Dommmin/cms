import { useQuery } from '@tanstack/react-query';
import { Link, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getPaymentMethods, getShippingMethods } from '@/api/checkout';
import { ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCart } from '@/hooks/use-cart';
import { formatMoney } from '@/lib/format';

export default function CheckoutScreen() {
  const { cart } = useCart();
  const shippingQuery = useQuery({ queryKey: ['checkout', 'shipping'], queryFn: getShippingMethods });
  const paymentQuery = useQuery({ queryKey: ['checkout', 'payments'], queryFn: getPaymentMethods });

  if (shippingQuery.isLoading || paymentQuery.isLoading) return <LoadingState />;
  if (shippingQuery.isError || paymentQuery.isError) return <ErrorState />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle">Checkout</ThemedText>
        <ThemedView style={styles.panel}>
          <ThemedText type="smallBold">Koszyk</ThemedText>
          <ThemedText themeColor="textSecondary">
            {cart ? `${cart.items_count} szt. · ${formatMoney(cart.total, cart.currency)}` : 'Brak danych koszyka'}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.panel}>
          <ThemedText type="smallBold">Dostawa</ThemedText>
          {shippingQuery.data?.map((method) => (
            <ThemedText key={method.id} themeColor="textSecondary">
              {method.name} · {formatMoney(method.base_price)}
            </ThemedText>
          ))}
        </ThemedView>
        <ThemedView style={styles.panel}>
          <ThemedText type="smallBold">Płatność</ThemedText>
          {paymentQuery.data?.map((method) => (
            <ThemedText key={method.id} themeColor="textSecondary">
              {method.id}
            </ThemedText>
          ))}
        </ThemedView>
        <Link href={'/checkout/pending' as Href} asChild>
          <Pressable style={styles.secondaryButton}>
            <ThemedText type="smallBold">Podgląd ekranu płatności</ThemedText>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: Spacing.three,
    padding: Spacing.three,
  },
  panel: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
});
