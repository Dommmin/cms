import { useQuery } from '@tanstack/react-query';
import { Link, type Href } from 'expo-router';
import { FlatList, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getProducts } from '@/api/products';
import { ProductCard } from '@/components/product/product-card';
import { ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';
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
          <ThemedText type="code" style={styles.kicker}>
            MOBILE STOREFRONT
          </ThemedText>
          <ThemedText type="title">Zakupy bez tarcia.</ThemedText>
          <ThemedText themeColor="textSecondary">
            Produkty, promocje i koszyk działają na tym samym API co publiczny sklep, ale w układzie zbudowanym pod telefon.
          </ThemedText>
          <Link href={'/categories' as Href} asChild>
            <Pressable style={styles.primaryButton}>
              <ThemedText type="smallBold" style={styles.primaryButtonText}>
                Przeglądaj produkty
              </ThemedText>
            </Pressable>
          </Link>
        </ThemedView>

        <ThemedView style={styles.quickLinks}>
          <QuickLink href="/search" label="Szukaj" />
          <QuickLink href="/blog" label="Blog" />
          <QuickLink href="/stores" label="Sklepy" />
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
          <>
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type="smallBold">Nowości</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {featuredQuery.data.meta.total} produktów
              </ThemedText>
            </ThemedView>
            <FlatList
              data={featuredQuery.data.data}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <ProductCard product={item} />}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.grid}
            />
          </>
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
    padding: Spacing.four,
    gap: Spacing.four,
  },
  hero: {
    gap: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.xl,
    backgroundColor: Storefront.colors.surfaceWarm,
    ...Storefront.shadow.card,
  },
  kicker: {
    color: Storefront.colors.primary,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    paddingVertical: Spacing.four,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.surface,
  },
  recentList: {
    gap: Spacing.two,
  },
  recentCard: {
    width: 152,
    gap: Spacing.one,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.lg,
    backgroundColor: Storefront.colors.surface,
  },
  grid: {
    gap: Spacing.three,
  },
  gridRow: {
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
});
