import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { searchAutocomplete, searchProducts } from '@/api/search';
import { GlassSurface } from '@/components/ui/glass-surface';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';
import { formatMoney, stripHtml } from '@/lib/format';
import type { SearchProduct } from '@/types/api';

const SORT_OPTIONS = [
  { label: 'Trafność', value: '' },
  { label: 'Cena rosnąco', value: 'price:asc' },
  { label: 'Cena malejąco', value: 'price:desc' },
  { label: 'Najnowsze', value: 'created_at:desc' },
] as const;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [brand, setBrand] = useState<string | undefined>();
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = useMemo(
    () => ({
      q: submittedQuery || undefined,
      category,
      brand,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      sort: sort || undefined,
      per_page: 24,
    }),
    [brand, category, maxPrice, minPrice, sort, submittedQuery],
  );

  const searchQuery = useInfiniteQuery({
    queryKey: ['search', filters],
    queryFn: ({ pageParam }) => searchProducts({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.meta.current_page >= lastPage.meta.last_page) return undefined;
      return lastPage.meta.current_page + 1;
    },
    enabled: Boolean(submittedQuery || category || brand),
  });

  const autocompleteQuery = useQuery({
    queryKey: ['search-autocomplete', query],
    queryFn: () => searchAutocomplete(query, 5),
    enabled: query.trim().length >= 2 && query.trim() !== submittedQuery,
  });

  const result = searchQuery.data?.pages[0] ?? null;
  const products = searchQuery.data?.pages.flatMap((page) => page?.data ?? []) ?? [];
  const facets = result?.meta.facets;
  const activeCount = [category, brand, minPrice, maxPrice, sort].filter(Boolean).length;

  function submitSearch() {
    setSubmittedQuery(query.trim());
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.heading}>
          <ThemedText type="subtitle">Szukaj</ThemedText>
          <ThemedText themeColor="textSecondary">
            Osobny widok wyszukiwania z facetami, sortowaniem i sugestią korekty zapytania.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.searchStack}>
          <ThemedView style={styles.searchRow}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={submitSearch}
              placeholder="Nazwa produktu, kategoria, marka"
              placeholderTextColor={Storefront.colors.muted}
              autoCapitalize="none"
              returnKeyType="search"
              style={styles.searchInput}
            />
            <Pressable onPress={submitSearch} style={styles.searchButton}>
              <ThemedText type="smallBold" style={styles.searchButtonText}>
                Szukaj
              </ThemedText>
            </Pressable>
          </ThemedView>
          {autocompleteQuery.data?.suggestions.length ? (
            <GlassSurface style={styles.suggestions}>
              {autocompleteQuery.data.suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion.id}
                  onPress={() => {
                    setQuery(suggestion.name);
                    setSubmittedQuery(suggestion.name);
                  }}
                  style={styles.suggestionRow}>
                  <Image source={suggestion.thumbnail || undefined} style={styles.suggestionImage} contentFit="contain" />
                  <ThemedView style={styles.suggestionBody}>
                    <ThemedText type="smallBold" numberOfLines={1}>
                      {suggestion.name}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatMoney(suggestion.price)}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              ))}
            </GlassSurface>
          ) : null}
        </ThemedView>

        <ThemedView style={styles.toolbar}>
          <Pressable onPress={() => setFiltersOpen(true)} style={styles.filterButton}>
            <ThemedText type="smallBold">Filtry{activeCount ? ` (${activeCount})` : ''}</ThemedText>
          </Pressable>
          <ThemedText type="small" themeColor="textSecondary">
            {result ? `${result.meta.total} wyników` : 'Wpisz frazę lub wybierz filtr'}
          </ThemedText>
        </ThemedView>

        {result?.meta.did_you_mean ? (
          <Pressable
            onPress={() => {
              setQuery(result.meta.did_you_mean ?? '');
              setSubmittedQuery(result.meta.did_you_mean ?? '');
            }}
            style={styles.didYouMean}>
            <ThemedText type="small">
              Czy chodziło o: <ThemedText type="smallBold">{result.meta.did_you_mean}</ThemedText>?
            </ThemedText>
          </Pressable>
        ) : null}

        {!submittedQuery && !category && !brand ? (
          <EmptyState title="Zacznij od wyszukania produktu" body="Wyniki pojawią się wraz z kategoriami, markami i sortowaniem." />
        ) : null}
        {searchQuery.isLoading ? <LoadingState /> : null}
        {searchQuery.isError ? <ErrorState onRetry={() => searchQuery.refetch()} /> : null}
        {result && products.length === 0 ? (
          <EmptyState title="Brak wyników" body="Zmień frazę lub zdejmij część filtrów." />
        ) : null}
        {result ? (
          <FlatList
            data={products}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <SearchProductCard product={item} />}
            contentContainerStyle={styles.results}
            onEndReached={() => {
              if (searchQuery.hasNextPage && !searchQuery.isFetchingNextPage) {
                void searchQuery.fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.45}
            ListFooterComponent={
              <ThemedView style={styles.footer}>
                {searchQuery.isFetchingNextPage ? <ThemedText themeColor="textSecondary">Ładowanie kolejnych produktów</ThemedText> : null}
              </ThemedView>
            }
          />
        ) : null}
      </ThemedView>

      <Modal visible={filtersOpen} transparent animationType="slide" onRequestClose={() => setFiltersOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setFiltersOpen(false)} />
        <ThemedView style={styles.sheet}>
          <ThemedText type="smallBold">Sortowanie</ThemedText>
          {SORT_OPTIONS.map((option) => (
            <SheetOption
              key={option.value}
              label={option.label}
              active={sort === option.value}
              onPress={() => setSort(option.value)}
            />
          ))}

          {facets?.categories.length ? (
            <>
              <ThemedText type="smallBold">Kategorie</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sheetChips}>
                {facets.categories.map((item) => (
                  <SheetChip
                    key={item.slug}
                    label={`${item.name} (${item.count})`}
                    active={category === item.slug}
                    onPress={() => setCategory((current) => (current === item.slug ? undefined : item.slug))}
                  />
                ))}
              </ScrollView>
            </>
          ) : null}

          {facets?.brands.length ? (
            <>
              <ThemedText type="smallBold">Marki</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sheetChips}>
                {facets.brands.map((item) => (
                  <SheetChip
                    key={item.id}
                    label={`${item.name} (${item.count})`}
                    active={brand === item.id}
                    onPress={() => setBrand((current) => (current === item.id ? undefined : item.id))}
                  />
                ))}
              </ScrollView>
            </>
          ) : null}

          {facets ? (
            <>
              <ThemedText type="smallBold">Cena</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Zakres w wynikach: {formatMoney(facets.price_ranges.min)} - {formatMoney(facets.price_ranges.max)}
              </ThemedText>
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
            </>
          ) : null}

          <ThemedView style={styles.sheetActions}>
            <Pressable
              onPress={() => {
                setCategory(undefined);
                setBrand(undefined);
                setMinPrice('');
                setMaxPrice('');
                setSort('');
              }}
              style={styles.secondaryButton}>
              <ThemedText type="smallBold">Wyczyść</ThemedText>
            </Pressable>
            <Pressable onPress={() => setFiltersOpen(false)} style={styles.doneButton}>
              <ThemedText type="smallBold" style={styles.doneButtonText}>
                Zastosuj
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </Modal>
    </SafeAreaView>
  );
}

function SearchProductCard({ product }: { product: SearchProduct }) {
  return (
    <Link href={`/products/${product.slug}` as Href} asChild>
      <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
        <GlassSurface style={styles.resultCard} interactive>
        <Image
          source={product.thumbnail?.thumb_url ?? product.thumbnail?.url ?? undefined}
          style={styles.resultImage}
          contentFit="contain"
        />
        <ThemedView style={styles.resultBody}>
          <ThemedText type="code" themeColor="textSecondary" numberOfLines={1}>
            {(product.brand?.name ?? product.category?.name ?? 'PRODUKT').toUpperCase()}
          </ThemedText>
          <ThemedText type="smallBold" numberOfLines={2}>
            {product.name}
          </ThemedText>
          {product.short_description ? (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
              {stripHtml(product.short_description)}
            </ThemedText>
          ) : null}
          <ThemedView style={styles.resultPriceRow}>
            <ThemedText type="smallBold">{formatMoney(product.price_min)}</ThemedText>
            {product.price_max > product.price_min ? (
              <ThemedText type="small" themeColor="textSecondary">
                do {formatMoney(product.price_max)}
              </ThemedText>
            ) : null}
          </ThemedView>
        </ThemedView>
        </GlassSurface>
      </Pressable>
    </Link>
  );
}

function SheetOption({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.sheetOption, active && styles.sheetOptionActive]}>
      <ThemedText type="smallBold" style={active && styles.activeText}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function SheetChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.sheetChip, active && styles.sheetOptionActive]}>
      <ThemedText type="smallBold" style={active && styles.activeText}>
        {label}
      </ThemedText>
    </Pressable>
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
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  searchStack: {
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  searchInput: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.lg,
    backgroundColor: Storefront.colors.glassStrong,
    paddingHorizontal: Spacing.four,
    fontSize: 16,
  },
  searchButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primary,
  },
  searchButtonText: {
    color: '#FFFFFF',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  filterButton: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  didYouMean: {
    padding: Spacing.three,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  suggestions: {
    overflow: 'hidden',
    borderRadius: Storefront.radius.lg,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  suggestionImage: {
    width: 44,
    height: 44,
    borderRadius: Storefront.radius.sm,
    backgroundColor: Storefront.colors.surfaceWarm,
  },
  suggestionBody: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  results: {
    gap: Spacing.three,
  },
  resultCard: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    overflow: 'hidden',
    borderRadius: Storefront.radius.lg,
  },
  resultImage: {
    width: 96,
    height: 116,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.surfaceWarm,
  },
  resultBody: {
    flex: 1,
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  resultPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
    marginTop: 'auto',
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.78,
  },
  footer: {
    minHeight: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
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
    maxHeight: '82%',
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
  sheetChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: 999,
    backgroundColor: Storefront.colors.surface,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
    backgroundColor: 'transparent',
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
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.four,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  doneButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.four,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primary,
  },
  doneButtonText: {
    color: '#FFFFFF',
  },
  activeText: {
    color: '#FFFFFF',
  },
});
