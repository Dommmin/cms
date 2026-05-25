import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCategories, getProducts } from '@/api/products';
import { ProductCard } from '@/components/product/product-card';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function CategoriesScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const deferredSearch = search.trim();

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const productsQuery = useQuery({
    queryKey: ['products', { search: deferredSearch, category }],
    queryFn: () =>
      getProducts({
        per_page: 20,
        search: deferredSearch || undefined,
        category,
      }),
  });

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.content}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Szukaj produktów"
          autoCapitalize="none"
          style={styles.search}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 0, name: 'Wszystkie', slug: undefined }, ...categories]}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const isActive = item.slug === category;
            return (
              <Pressable
                onPress={() => setCategory(item.slug)}
                style={[styles.chip, isActive && styles.activeChip]}>
                <ThemedText type="smallBold" style={isActive && styles.activeChipText}>
                  {item.name}
                </ThemedText>
              </Pressable>
            );
          }}
          contentContainerStyle={styles.chips}
        />

        {productsQuery.isLoading ? <LoadingState /> : null}
        {productsQuery.isError ? <ErrorState onRetry={() => productsQuery.refetch()} /> : null}
        {productsQuery.data && productsQuery.data.data.length === 0 ? (
          <EmptyState title="Brak produktów" body="Zmień wyszukiwanie albo kategorię." />
        ) : null}
        {productsQuery.data ? (
          <FlatList
            data={productsQuery.data.data}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <ProductCard product={item} />}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.grid}
            ListFooterComponent={<View style={styles.footer} />}
          />
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
    padding: Spacing.three,
    gap: Spacing.three,
  },
  search: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  chips: {
    gap: Spacing.two,
  },
  chip: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
  },
  activeChip: {
    backgroundColor: '#111827',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  grid: {
    gap: Spacing.three,
  },
  gridRow: {
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  footer: {
    height: Spacing.five,
  },
});
