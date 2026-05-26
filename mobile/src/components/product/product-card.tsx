import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { formatMoney } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import type { Product } from '@/types/api';

export function ProductCard({ product }: { product: Product }) {
  const firstVariant = product.variants.find((variant) => variant.is_available) ?? product.variants[0];
  const { addItem } = useCart();
  const auth = useAuth();
  const wishlist = useWishlist(auth.isAuthenticated);
  const isWishlisted = firstVariant
    ? wishlist.wishlist?.items.some((item) => item.variant_id === firstVariant.id)
    : false;

  return (
    <ThemedView style={styles.card}>
      <Link href={`/products/${product.slug}` as Href} asChild>
        <Pressable style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
          <ThemedView style={styles.imageWrap}>
            <Image
              source={product.thumbnail?.thumb_url ?? product.thumbnail?.url ?? undefined}
              style={styles.image}
              contentFit="contain"
            />
            {product.is_on_sale ? (
              <ThemedView style={styles.badge}>
                <ThemedText type="code" style={styles.badgeText}>
                  {product.discount_percentage ? `-${product.discount_percentage}%` : 'SALE'}
                </ThemedText>
              </ThemedView>
            ) : null}
          </ThemedView>
        </Pressable>
      </Link>

      {auth.isAuthenticated && firstVariant ? (
        <Pressable
          onPress={() =>
            isWishlisted ? wishlist.remove.mutate(firstVariant.id) : wishlist.add.mutate(firstVariant.id)
          }
          style={[styles.wishlist, isWishlisted && styles.wishlistActive]}>
          <ThemedText type="smallBold" style={isWishlisted && styles.wishlistActiveText}>
            {isWishlisted ? '♥' : '♡'}
          </ThemedText>
        </Pressable>
      ) : null}

      <Link href={`/products/${product.slug}` as Href} asChild>
        <Pressable style={({ pressed }) => [styles.body, pressed && styles.pressed]}>
          {product.brand ? (
            <ThemedText type="code" themeColor="textSecondary" numberOfLines={1}>
              {product.brand.name.toUpperCase()}
            </ThemedText>
          ) : null}
          <ThemedText type="smallBold" numberOfLines={2}>
            {product.name}
          </ThemedText>
          <ThemedView style={styles.priceRow}>
            <ThemedText type="smallBold">{formatMoney(product.price_min)}</ThemedText>
            {product.compare_at_price_min ? (
              <ThemedText type="small" style={styles.comparePrice}>
                {formatMoney(product.compare_at_price_min)}
              </ThemedText>
            ) : null}
          </ThemedView>
        </Pressable>
      </Link>

      <Pressable
        disabled={!firstVariant?.is_available || addItem.isPending}
        onPress={() => firstVariant && addItem.mutate({ variant_id: firstVariant.id, quantity: 1 })}
        style={[styles.addButton, (!firstVariant?.is_available || addItem.isPending) && styles.disabled]}>
        <ThemedText type="smallBold" style={styles.addButtonText}>
          {firstVariant?.is_available ? 'Dodaj' : 'Niedostępny'}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.lg,
    backgroundColor: Storefront.colors.surface,
    ...Storefront.shadow.card,
  },
  link: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.78,
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 0.92,
    backgroundColor: Storefront.colors.surfaceWarm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    left: Spacing.two,
    top: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
    backgroundColor: Storefront.colors.primary,
  },
  badgeText: {
    color: '#FFFFFF',
  },
  wishlist: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  wishlistActive: {
    backgroundColor: Storefront.colors.rose,
  },
  wishlistActiveText: {
    color: '#FFFFFF',
  },
  body: {
    minHeight: 112,
    gap: Spacing.one,
    padding: Spacing.three,
    backgroundColor: 'transparent',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
    marginTop: 'auto',
    backgroundColor: 'transparent',
  },
  comparePrice: {
    color: Storefront.colors.muted,
    textDecorationLine: 'line-through',
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primary,
  },
  addButtonText: {
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.45,
  },
});
