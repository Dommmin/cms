import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
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
  const [sort, setSort] = useState('-created_at');
  const [inStock, setInStock] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const deferredSearch = search.trim();

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const productsQuery = useQuery({
    queryKey: ['products', { search: deferredSearch, category, sort, inStock }],
    queryFn: () =>
      getProducts({
        per_page: 20,
        search: deferredSearch || undefined,
        category,
        sort,
        in_stock: inStock,
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

        <ThemedView style={styles.toolbar}>
          <Pressable onPress={() => setFiltersOpen(true)} style={styles.toolbarButton}>
            <ThemedText type="smallBold">Filtry</ThemedText>
          </Pressable>
          <ThemedText type="small" themeColor="textSecondary">
            {productsQuery.data?.meta.total ?? 0} produktów
          </ThemedText>
        </ThemedView>

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

        <Modal
          visible={filtersOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setFiltersOpen(false)}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setFiltersOpen(false)} />
          <ThemedView style={styles.sheet}>
            <ThemedText type="smallBold">Sortowanie</ThemedText>
            {[
              { label: 'Najnowsze', value: '-created_at' },
              { label: 'Cena rosnąco', value: 'price' },
              { label: 'Cena malejąco', value: '-price' },
              { label: 'Nazwa A-Z', value: 'name' },
            ].map((option) => {
              const isActive = option.value === sort;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setSort(option.value)}
                  style={[styles.sheetOption, isActive && styles.sheetOptionActive]}>
                  <ThemedText type="smallBold" style={isActive && styles.activeChipText}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => setInStock((value) => !value)}
              style={[styles.sheetOption, inStock && styles.sheetOptionActive]}>
              <ThemedText type="smallBold" style={inStock && styles.activeChipText}>
                Tylko dostępne
              </ThemedText>
            </Pressable>
            <Pressable onPress={() => setFiltersOpen(false)} style={styles.doneButton}>
              <ThemedText type="smallBold" style={styles.doneButtonText}>
                Zastosuj
              </ThemedText>
            </Pressable>
          </ThemedView>
        </Modal>
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  toolbarButton: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
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
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: Spacing.two,
    padding: Spacing.three,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  sheetOption: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  sheetOptionActive: {
    backgroundColor: '#111827',
  },
  doneButton: {
    alignItems: 'center',
    marginTop: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  doneButtonText: {
    color: '#FFFFFF',
  },
});
