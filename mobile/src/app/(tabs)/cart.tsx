import { Link, type Href } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CartRow } from '@/components/cart/cart-row';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCart } from '@/hooks/use-cart';
import { formatMoney } from '@/lib/format';

export default function CartScreen() {
  const { cart, isLoading, isError, refetch, updateItem, removeItem } = useCart();

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      {!cart || cart.items.length === 0 ? (
        <EmptyState title="Koszyk jest pusty" body="Dodaj produkt, żeby rozpocząć checkout." />
      ) : (
        <ThemedView style={styles.content}>
          <FlatList
            data={cart.items}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <CartRow
                item={item}
                onIncrement={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                onDecrement={() =>
                  item.quantity > 1
                    ? updateItem.mutate({ id: item.id, quantity: item.quantity - 1 })
                    : removeItem.mutate(item.id)
                }
                onRemove={() => removeItem.mutate(item.id)}
              />
            )}
            ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
          />
          <ThemedView style={styles.summary}>
            <ThemedView style={styles.summaryRow}>
              <ThemedText themeColor="textSecondary">Suma</ThemedText>
              <ThemedText type="smallBold">{formatMoney(cart.total, cart.currency)}</ThemedText>
            </ThemedView>
            <Link href={'/checkout' as Href} asChild>
              <Pressable style={styles.primaryButton}>
                <ThemedText type="smallBold" style={styles.primaryButtonText}>
                  Przejdź do checkoutu
                </ThemedText>
              </Pressable>
            </Link>
          </ThemedView>
        </ThemedView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.three,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  summary: {
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
