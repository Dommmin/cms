import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { Product } from '@/types/api';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}` as Href} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <Image
          source={product.thumbnail?.thumb_url ?? product.thumbnail?.url ?? undefined}
          style={styles.image}
          contentFit="cover"
        />
        <ThemedView style={styles.body}>
          <ThemedText type="smallBold" numberOfLines={2}>
            {product.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatMoney(product.price_min)}
          </ThemedText>
          {product.discount_percentage ? (
            <ThemedText type="code">-{product.discount_percentage}%</ThemedText>
          ) : null}
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#F7F7F8',
  },
  pressed: {
    opacity: 0.75,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E5E7EB',
  },
  body: {
    gap: Spacing.one,
    padding: Spacing.two,
    backgroundColor: 'transparent',
  },
});
