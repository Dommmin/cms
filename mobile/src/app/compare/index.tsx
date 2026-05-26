import { Link, type Href } from 'expo-router';
import { FlatList, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/ui/glass-surface';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';
import { useComparison, useComparisonProducts } from '@/hooks/use-comparison';
import { formatMoney } from '@/lib/format';
import type { Product } from '@/types/api';

export default function CompareScreen() {
  const comparison = useComparison();
  const productsQuery = useComparisonProducts();

  if (comparison.ids.length < 2) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState title="Dodaj co najmniej 2 produkty" body="Porównywarka działa jak w storefrontcie webowym: maksymalnie 4 produkty." />
      </SafeAreaView>
    );
  }

  if (productsQuery.isLoading) return <LoadingState />;
  if (productsQuery.isError || !productsQuery.data) return <ErrorState onRetry={() => productsQuery.refetch()} />;

  const products = productsQuery.data.products;
  const attributeKeys = productsQuery.data.attributeKeys;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.heading}>
          <ThemedText type="subtitle">Porównanie</ThemedText>
          <ThemedText themeColor="textSecondary">{products.length} z 4 produktów</ThemedText>
        </ThemedView>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <CompareProduct product={item} onRemove={() => comparison.remove(item.id)} />}
          contentContainerStyle={styles.products}
        />

        <GlassSurface style={styles.table}>
          <CompareRow label="Cena" values={products.map((product) => formatMoney(product.price_min))} />
          <CompareRow label="Marka" values={products.map((product) => product.brand?.name ?? '-')} />
          <CompareRow label="Kategoria" values={products.map((product) => product.category?.name ?? '-')} />
          <CompareRow label="Dostępność" values={products.map((product) => (product.is_active ? 'Aktywny' : 'Niedostępny'))} />
          {attributeKeys.map((key) => (
            <CompareRow
              key={key}
              label={key}
              values={products.map((product) => product.attribute_map?.[key]?.join(', ') ?? '-')}
            />
          ))}
        </GlassSurface>

        <Pressable onPress={() => comparison.clear()} style={styles.clearButton}>
          <ThemedText type="smallBold">Wyczyść porównanie</ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function CompareProduct({ product, onRemove }: { product: Product; onRemove: () => void }) {
  return (
    <GlassSurface style={styles.productCard}>
      <Link href={`/products/${product.slug}` as Href} asChild>
        <Pressable style={styles.productLink}>
          <ThemedText type="smallBold" numberOfLines={2}>{product.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{formatMoney(product.price_min)}</ThemedText>
        </Pressable>
      </Link>
      <Pressable onPress={onRemove} style={styles.removeButton}>
        <ThemedText type="smallBold">Usuń</ThemedText>
      </Pressable>
    </GlassSurface>
  );
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <ThemedView style={styles.compareRow}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.compareValues}>
        {values.map((value, index) => (
          <ThemedText key={`${label}-${index}`} type="small" style={styles.compareValue}>{value}</ThemedText>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { gap: Spacing.four, padding: Spacing.four },
  heading: { gap: Spacing.one, backgroundColor: 'transparent' },
  products: { gap: Spacing.three },
  productCard: {
    width: 172,
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Storefront.radius.lg,
  },
  productLink: { gap: Spacing.one },
  removeButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  table: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Storefront.radius.xl,
  },
  compareRow: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Storefront.colors.border,
    backgroundColor: 'transparent',
  },
  compareValues: { gap: Spacing.two },
  compareValue: {
    minWidth: 132,
    padding: Spacing.two,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
});
