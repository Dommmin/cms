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

export default function HomeScreen() {
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
  grid: {
    gap: Spacing.three,
  },
  gridRow: {
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
});
