import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCategories, getProducts } from '@/api/products';
import { ProductCard } from '@/components/product/product-card';
import { GlassSurface } from '@/components/ui/glass-surface';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';

export default function CategoriesScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [brand, setBrand] = useState<string | undefined>();
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('-created_at');
  const [inStock, setInStock] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const deferredSearch = search.trim();

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const productFilters = useMemo(
    () => ({
      search: deferredSearch || undefined,
      category,
      brand,
      attributes: selectedAttributes,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      sort,
      in_stock: inStock,
    }),
    [brand, category, deferredSearch, inStock, maxPrice, minPrice, selectedAttributes, sort],
  );

  const productsQuery = useInfiniteQuery({
    queryKey: ['products', { search: deferredSearch, category, brand, selectedAttributes, minPrice, maxPrice, sort, inStock }],
    queryFn: ({ pageParam }) =>
      getProducts({
        page: pageParam,
        per_page: 20,
        ...productFilters,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page >= lastPage.meta.last_page) return undefined;
      return lastPage.meta.current_page + 1;
    },
  });

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const firstPage = productsQuery.data?.pages[0];
  const products = productsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const availableFilters = firstPage?.meta.available_filters;
  const activeAttributeCount = Object.values(selectedAttributes).reduce((total, values) => total + values.length, 0);
  const activeFiltersCount = [category, brand, minPrice, maxPrice, inStock ? 'stock' : undefined].filter(Boolean).length + activeAttributeCount;

  function toggleAttribute(attributeSlug: string, valueSlug: string) {
    setSelectedAttributes((current) => {
      const currentValues = current[attributeSlug] ?? [];
      const nextValues = currentValues.includes(valueSlug)
        ? currentValues.filter((value) => value !== valueSlug)
        : [...currentValues, valueSlug];
      const next = { ...current, [attributeSlug]: nextValues };
      if (nextValues.length === 0) delete next[attributeSlug];
      return next;
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.heading}>
          <ThemedText type="subtitle">Produkty</ThemedText>
          <ThemedText themeColor="textSecondary">
            Szybkie filtrowanie, sortowanie i dodawanie do koszyka bez opuszczania listy.
          </ThemedText>
        </ThemedView>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Szukaj produktów"
          placeholderTextColor={Storefront.colors.muted}
          autoCapitalize="none"
          style={styles.search}
        />

        <ThemedView style={styles.toolbar}>
          <Pressable onPress={() => setFiltersOpen(true)} style={styles.toolbarButton}>
            <ThemedText type="smallBold">Filtry{activeFiltersCount ? ` (${activeFiltersCount})` : ''}</ThemedText>
          </Pressable>
          <ThemedText type="small" themeColor="textSecondary">
            {firstPage?.meta.total ?? 0} produktów
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

        {activeFiltersCount > 0 ? (
          <ThemedView style={styles.activeFilters}>
            {category ? (
              <ActiveFilter label={categories.find((item) => item.slug === category)?.name ?? category} onPress={() => setCategory(undefined)} />
            ) : null}
            {brand ? (
              <ActiveFilter
                label={availableFilters?.brands.find((item) => String(item.id) === brand)?.label ?? `Marka ${brand}`}
                onPress={() => setBrand(undefined)}
              />
            ) : null}
            {inStock ? <ActiveFilter label="Tylko dostępne" onPress={() => setInStock(false)} /> : null}
            {minPrice ? <ActiveFilter label={`Od ${minPrice}`} onPress={() => setMinPrice('')} /> : null}
            {maxPrice ? <ActiveFilter label={`Do ${maxPrice}`} onPress={() => setMaxPrice('')} /> : null}
            {Object.entries(selectedAttributes).flatMap(([attributeSlug, values]) =>
              values.map((value) => (
                <ActiveFilter
                  key={`${attributeSlug}-${value}`}
                  label={availableFilters?.attributes.find((item) => item.slug === attributeSlug)?.values.find((item) => item.slug === value)?.label ?? value}
                  onPress={() => toggleAttribute(attributeSlug, value)}
                />
              )),
            )}
          </ThemedView>
        ) : null}

        {productsQuery.isLoading ? <LoadingState /> : null}
        {productsQuery.isError ? <ErrorState onRetry={() => productsQuery.refetch()} /> : null}
        {firstPage && products.length === 0 ? (
          <EmptyState title="Brak produktów" body="Zmień wyszukiwanie albo kategorię." />
        ) : null}
        {firstPage ? (
          <FlatList
            data={products}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <ProductCard product={item} />}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.grid}
            onEndReached={() => {
              if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) {
                void productsQuery.fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.45}
            ListFooterComponent={
              <View style={styles.footer}>
                {productsQuery.isFetchingNextPage ? <ThemedText themeColor="textSecondary">Ładowanie kolejnych produktów</ThemedText> : null}
              </View>
            }
          />
        ) : null}

        <Modal
          visible={filtersOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setFiltersOpen(false)}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setFiltersOpen(false)} />
          <GlassSurface style={styles.sheet}>
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
            {availableFilters?.brands.length ? (
              <>
                <ThemedText type="smallBold">Marka</ThemedText>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={availableFilters.brands}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => {
                    const value = String(item.id);
                    const isActive = value === brand;
                    return (
                      <Pressable
                        onPress={() => setBrand((current) => (current === value ? undefined : value))}
                        style={[styles.sheetChip, isActive && styles.sheetOptionActive]}>
                        <ThemedText type="smallBold" style={isActive && styles.activeChipText}>
                          {item.label} ({item.count})
                        </ThemedText>
                      </Pressable>
                    );
                  }}
                  contentContainerStyle={styles.sheetChips}
                />
              </>
            ) : null}
            {availableFilters?.attributes.map((attribute) => (
              <ThemedView key={attribute.slug} style={styles.sheetGroup}>
                <ThemedText type="smallBold">{attribute.label}</ThemedText>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={attribute.values}
                  keyExtractor={(item) => item.slug}
                  renderItem={({ item }) => {
                    const isActive = selectedAttributes[attribute.slug]?.includes(item.slug) ?? false;
                    return (
                      <Pressable
                        onPress={() => toggleAttribute(attribute.slug, item.slug)}
                        style={[styles.sheetChip, isActive && styles.sheetOptionActive]}>
                        <ThemedText type="smallBold" style={isActive && styles.activeChipText}>
                          {item.label} ({item.count})
                        </ThemedText>
                      </Pressable>
                    );
                  }}
                  contentContainerStyle={styles.sheetChips}
                />
              </ThemedView>
            ))}
            <ThemedView style={styles.sheetGroup}>
              <ThemedText type="smallBold">Cena</ThemedText>
              <ThemedView style={styles.priceInputs}>
                <TextInput
                  value={minPrice}
                  onChangeText={setMinPrice}
                  placeholder="Min"
                  placeholderTextColor={Storefront.colors.muted}
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
                <TextInput
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  placeholder="Max"
                  placeholderTextColor={Storefront.colors.muted}
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
              </ThemedView>
            </ThemedView>
            <Pressable
              onPress={() => setInStock((value) => !value)}
              style={[styles.sheetOption, inStock && styles.sheetOptionActive]}>
              <ThemedText type="smallBold" style={inStock && styles.activeChipText}>
                Tylko dostępne
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => {
                setBrand(undefined);
                setSelectedAttributes({});
                setMinPrice('');
                setMaxPrice('');
                setInStock(false);
                setSort('-created_at');
              }}
              style={styles.clearButton}>
              <ThemedText type="smallBold">Wyczyść filtry</ThemedText>
            </Pressable>
            <Pressable onPress={() => setFiltersOpen(false)} style={styles.doneButton}>
              <ThemedText type="smallBold" style={styles.doneButtonText}>
                Zastosuj
              </ThemedText>
            </Pressable>
          </GlassSurface>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}

function ActiveFilter({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.activeFilter}>
      <ThemedText type="smallBold">{label} ×</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  heading: {
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  search: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.lg,
    backgroundColor: Storefront.colors.glassStrong,
    paddingHorizontal: Spacing.four,
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
    paddingHorizontal: Spacing.four,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  chips: {
    gap: Spacing.two,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  activeFilter: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    backgroundColor: Storefront.colors.primarySoft,
  },
  chip: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: 18,
    backgroundColor: Storefront.colors.glassStrong,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
  },
  activeChip: {
    backgroundColor: Storefront.colors.primary,
    borderColor: Storefront.colors.primary,
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
    minHeight: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: Spacing.four,
    borderTopLeftRadius: Storefront.radius.xl,
    borderTopRightRadius: Storefront.radius.xl,
    backgroundColor: Storefront.colors.glassStrong,
  },
  sheetOption: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  sheetOptionActive: {
    backgroundColor: Storefront.colors.primary,
  },
  sheetChips: {
    gap: Spacing.two,
  },
  sheetGroup: {
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  sheetChip: {
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: 999,
    backgroundColor: Storefront.colors.glassStrong,
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  priceInputs: {
    flexDirection: 'row',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  priceInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  doneButton: {
    alignItems: 'center',
    marginTop: Spacing.two,
    paddingVertical: Spacing.four,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primary,
  },
  doneButtonText: {
    color: '#FFFFFF',
  },
});
