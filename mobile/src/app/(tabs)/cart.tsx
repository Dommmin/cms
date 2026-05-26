import { Link, type Href } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CartRow } from '@/components/cart/cart-row';
import { GlassSurface } from '@/components/ui/glass-surface';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';
import { useCart } from '@/hooks/use-cart';
import { formatMoney } from '@/lib/format';

export default function CartScreen() {
  const [discountCode, setDiscountCode] = useState('');
  const { cart, isLoading, isError, refetch, updateItem, removeItem, applyDiscount } = useCart();

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      {!cart || cart.items.length === 0 ? (
        <EmptyState title="Koszyk jest pusty" body="Dodaj produkt, żeby rozpocząć checkout." />
      ) : (
        <ThemedView style={styles.content}>
          <ThemedView style={styles.heading}>
            <ThemedText type="subtitle">Koszyk</ThemedText>
            <ThemedText themeColor="textSecondary">
              {cart.items_count} produktów gotowych do zamówienia
            </ThemedText>
          </ThemedView>
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
          <GlassSurface style={styles.summary}>
            <ThemedView style={styles.discountRow}>
              <TextInput
                value={discountCode}
                onChangeText={setDiscountCode}
                placeholder="Kod rabatowy"
                placeholderTextColor={Storefront.colors.muted}
                autoCapitalize="characters"
                style={styles.discountInput}
              />
              <Pressable
                disabled={!discountCode.trim() || applyDiscount.isPending}
                onPress={() =>
                  applyDiscount.mutate(discountCode.trim(), {
                    onSuccess: () => setDiscountCode(''),
                  })
                }
                style={[styles.discountButton, (!discountCode.trim() || applyDiscount.isPending) && styles.disabled]}>
                <ThemedText type="smallBold">Dodaj</ThemedText>
              </Pressable>
            </ThemedView>
            {cart.discount_code ? (
              <ThemedView style={styles.summaryRow}>
                <ThemedText themeColor="textSecondary">Rabat {cart.discount_code}</ThemedText>
                <ThemedText type="smallBold">-{formatMoney(cart.discount_amount, cart.currency)}</ThemedText>
              </ThemedView>
            ) : null}
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
          </GlassSurface>
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
    paddingHorizontal: Spacing.four,
  },
  heading: {
    gap: Spacing.one,
    paddingVertical: Spacing.four,
    backgroundColor: 'transparent',
  },
  separator: {
    height: 1,
    backgroundColor: Storefront.colors.border,
  },
  summary: {
    gap: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Storefront.radius.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  discountRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  discountInput: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.surface,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  discountButton: {
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
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
  disabled: {
    opacity: 0.45,
  },
});
