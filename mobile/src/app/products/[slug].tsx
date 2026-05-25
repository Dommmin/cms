import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getProduct } from '@/api/products';
import { ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCart } from '@/hooks/use-cart';
import { formatMoney, stripHtml } from '@/lib/format';

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const { addItem } = useCart();

  const productQuery = useQuery({
    queryKey: ['products', slug],
    queryFn: () => getProduct(slug),
    enabled: Boolean(slug),
  });

  const product = productQuery.data;
  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find((variant) => variant.id === selectedVariantId) ??
      product.variants.find((variant) => variant.is_available) ??
      product.variants[0] ??
      null
    );
  }, [product, selectedVariantId]);

  if (productQuery.isLoading) return <LoadingState />;
  if (productQuery.isError || !product) return <ErrorState onRetry={() => productQuery.refetch()} />;

  const image = product.images[0] ?? product.thumbnail;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={image?.url ?? undefined} style={styles.image} contentFit="cover" />
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">{product.name}</ThemedText>
          <ThemedText type="smallBold">{formatMoney(selectedVariant?.price ?? product.price_min)}</ThemedText>
          {product.omnibus_price_min ? (
            <ThemedText type="small" themeColor="textSecondary">
              Najniższa cena 30 dni: {formatMoney(product.omnibus_price_min)}
            </ThemedText>
          ) : null}
        </ThemedView>

        {product.variants.length > 1 ? (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">Wariant</ThemedText>
            <ThemedView style={styles.variants}>
              {product.variants.map((variant) => {
                const isActive = variant.id === selectedVariant?.id;
                const label = Object.values(variant.attributes).join(' / ') || variant.sku;
                return (
                  <Pressable
                    key={variant.id}
                    disabled={!variant.is_available}
                    onPress={() => setSelectedVariantId(variant.id)}
                    style={[styles.variant, isActive && styles.activeVariant, !variant.is_available && styles.disabled]}>
                    <ThemedText type="smallBold" style={isActive && styles.activeText}>
                      {label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ThemedView>
          </ThemedView>
        ) : null}

        {product.short_description || product.description ? (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">Opis</ThemedText>
            <ThemedText themeColor="textSecondary">
              {stripHtml(product.short_description ?? product.description)}
            </ThemedText>
          </ThemedView>
        ) : null}
      </ScrollView>
      <ThemedView style={styles.stickyBar}>
        <Pressable
          disabled={!selectedVariant?.is_available || addItem.isPending}
          onPress={() => selectedVariant && addItem.mutate({ variant_id: selectedVariant.id, quantity: 1 })}
          style={[styles.primaryButton, (!selectedVariant?.is_available || addItem.isPending) && styles.disabled]}>
          <ThemedText type="smallBold" style={styles.primaryButtonText}>
            {selectedVariant?.is_available ? 'Dodaj do koszyka' : 'Niedostępny'}
          </ThemedText>
        </Pressable>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingBottom: 112,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E5E7EB',
  },
  header: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  section: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  variants: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  variant: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  activeVariant: {
    backgroundColor: '#111827',
  },
  activeText: {
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.45,
  },
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
