import { useQuery } from '@tanstack/react-query';
import { Link, type Href } from 'expo-router';
import { FlatList, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getProducts } from '@/api/products';
import { ProductCard } from '@/components/product/product-card';
import { ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { formatMoney } from '@/lib/format';
import type { RecentlyViewedProduct } from '@/lib/recently-viewed';

export default function HomeScreen() {
  const recentlyViewed = useRecentlyViewed();
  const featuredQuery = useQuery({
    queryKey: ['products', 'home-featured'],
    queryFn: () => getProducts({ per_page: 8, sort: '-created_at' }),
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.hero}>
          <ThemedText type="subtitle">Sklep mobilny</ThemedText>
          <ThemedText themeColor="textSecondary">
            Produkty, koszyk i konto podpięte do tego samego API co storefront.
          </ThemedText>
          <Link href={'/categories' as Href} asChild>
            <Pressable style={styles.primaryButton}>
              <ThemedText type="smallBold" style={styles.primaryButtonText}>
                Przeglądaj produkty
              </ThemedText>
            </Pressable>
          </Link>
        </ThemedView>

        <ThemedView style={styles.sectionHeader}>
          <ThemedText type="smallBold">Nowości</ThemedText>
        </ThemedView>

        <ThemedView style={styles.quickLinks}>
          <QuickLink href="/blog" label="Blog" />
          <QuickLink href="/stores" label="Sklepy" />
          <QuickLink href="/newsletter" label="Newsletter" />
        </ThemedView>

        {recentlyViewed.products.length > 0 ? (
          <>
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type="smallBold">Ostatnio oglądane</ThemedText>
            </ThemedView>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={recentlyViewed.products}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <RecentProductCard product={item} />}
              contentContainerStyle={styles.recentList}
            />
          </>
        ) : null}

        {featuredQuery.isLoading ? <LoadingState /> : null}
        {featuredQuery.isError ? <ErrorState onRetry={() => featuredQuery.refetch()} /> : null}
        {featuredQuery.data ? (
          <FlatList
            data={featuredQuery.data.data}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <ProductCard product={item} />}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.grid}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function RecentProductCard({ product }: { product: RecentlyViewedProduct }) {
  return (
    <Link href={`/products/${product.slug}` as Href} asChild>
      <Pressable style={styles.recentCard}>
        <ThemedText type="smallBold" numberOfLines={2}>
          {product.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatMoney(product.price_min)}
        </ThemedText>
      </Pressable>
    </Link>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href as Href} asChild>
      <Pressable style={styles.quickLink}>
        <ThemedText type="smallBold">{label}</ThemedText>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  hero: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  primaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    backgroundColor: 'transparent',
  },
  quickLinks: {
    flexDirection: 'row',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  quickLink: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  recentList: {
    gap: Spacing.two,
  },
  recentCard: {
    width: 152,
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  grid: {
    gap: Spacing.three,
  },
  gridRow: {
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
});
