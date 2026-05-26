import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';
import { useWishlist } from '@/hooks/use-wishlist';
import { formatMoney } from '@/lib/format';
import type { WishlistItem } from '@/types/api';

export default function WishlistScreen() {
  const wishlist = useWishlist();

  if (wishlist.isLoading) return <LoadingState />;
  if (!wishlist.wishlist || wishlist.wishlist.items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState title="Wishlist jest pusta" body="Dodaj produkt z listingu lub karty produktu." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.heading}>
          <ThemedText type="subtitle">Wishlist</ThemedText>
          <ThemedText themeColor="textSecondary">
            {wishlist.wishlist.items_count} zapisanych produktów
          </ThemedText>
        </ThemedView>
        <FlatList
          data={wishlist.wishlist.items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <WishlistRow item={item} onRemove={() => wishlist.remove.mutate(item.variant_id)} />}
          contentContainerStyle={styles.list}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

function WishlistRow({ item, onRemove }: { item: WishlistItem; onRemove: () => void }) {
  return (
    <ThemedView style={styles.row}>
      <Link href={`/products/${item.product.slug}` as Href} asChild>
        <Pressable style={({ pressed }) => [styles.productLink, pressed && styles.pressed]}>
          <Image
            source={item.product.thumbnail?.thumb_url ?? item.product.thumbnail?.url ?? undefined}
            style={styles.image}
            contentFit="contain"
          />
          <ThemedView style={styles.body}>
            <ThemedText type="smallBold" numberOfLines={2}>
              {item.product.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {Object.values(item.variant.attributes).join(' / ') || item.variant.sku}
            </ThemedText>
            <ThemedText type="smallBold">{formatMoney(item.variant.price)}</ThemedText>
          </ThemedView>
        </Pressable>
      </Link>
      <Pressable onPress={onRemove} style={styles.removeButton}>
        <ThemedText type="smallBold">Usuń</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    gap: Spacing.three,
    padding: Spacing.four,
  },
  heading: {
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  list: {
    gap: Spacing.three,
  },
  row: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.lg,
    backgroundColor: Storefront.colors.surface,
  },
  productLink: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  image: {
    width: 86,
    height: 104,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.surfaceWarm,
  },
  body: {
    flex: 1,
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  removeButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  pressed: {
    opacity: 0.78,
  },
});
