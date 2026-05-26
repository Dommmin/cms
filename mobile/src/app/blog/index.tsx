import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getBlogCategories, getBlogPosts } from '@/api/cms';
import { GlassSurface } from '@/components/ui/glass-surface';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';
import { stripHtml } from '@/lib/format';

export default function BlogScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoriesQuery = useQuery({
    queryKey: ['blog-categories'],
    queryFn: getBlogCategories,
  });
  const postsQuery = useInfiniteQuery({
    queryKey: ['blog-posts', selectedCategory],
    queryFn: ({ pageParam }) => getBlogPosts({ page: pageParam, per_page: 12, category: selectedCategory ?? undefined }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page >= lastPage.meta.last_page) return undefined;
      return lastPage.meta.current_page + 1;
    },
  });
  const posts = postsQuery.data?.pages.flatMap((page) => page.data) ?? [];

  if (postsQuery.isLoading) return <LoadingState />;
  if (postsQuery.isError) return <ErrorState onRetry={() => postsQuery.refetch()} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">Blog</ThemedText>
            <ThemedText themeColor="textSecondary">
              Artykuły, poradniki i aktualności z tym samym rytmem kart co storefront webowy.
            </ThemedText>
            {categoriesQuery.data && categoriesQuery.data.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
                <Pressable
                  onPress={() => setSelectedCategory(null)}
                  style={[styles.filterChip, selectedCategory === null && styles.filterChipActive]}>
                  <ThemedText type="code" style={selectedCategory === null && styles.filterChipActiveText}>
                    Wszystkie
                  </ThemedText>
                </Pressable>
                {categoriesQuery.data.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => setSelectedCategory(category.slug)}
                    style={[styles.filterChip, selectedCategory === category.slug && styles.filterChipActive]}>
                    <ThemedText type="code" style={selectedCategory === category.slug && styles.filterChipActiveText}>
                      {category.name}
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
          </ThemedView>
        }
        ListFooterComponent={
          postsQuery.isFetchingNextPage ? (
            <ThemedView style={styles.footer}>
              <ThemedText type="small" themeColor="textSecondary">
                Ładowanie kolejnych wpisów...
              </ThemedText>
            </ThemedView>
          ) : null
        }
        ListEmptyComponent={<EmptyState title="Brak wpisów" />}
        renderItem={({ item }) => (
          <Link href={`/blog/${item.slug}` as Href} asChild>
            <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
              <GlassSurface style={styles.post} interactive>
                {item.featured_image ? <Image source={item.featured_image} style={styles.image} contentFit="cover" /> : null}
                <ThemedView style={styles.postBody}>
                  <ThemedView style={styles.metaRow}>
                    {item.category ? (
                      <ThemedView style={styles.pill}>
                        <ThemedText type="code" style={styles.pillText}>
                          {item.category.name}
                        </ThemedText>
                      </ThemedView>
                    ) : null}
                    {item.is_featured ? (
                      <ThemedView style={styles.featuredPill}>
                        <ThemedText type="code" style={styles.featuredText}>
                          Polecane
                        </ThemedText>
                      </ThemedView>
                    ) : null}
                  </ThemedView>
                  <ThemedText type="smallBold">{item.title}</ThemedText>
                  {item.excerpt ? (
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={3}>
                      {stripHtml(item.excerpt)}
                    </ThemedText>
                  ) : null}
                  <ThemedView style={styles.metaRow}>
                    <ThemedText type="code" themeColor="textSecondary">
                      {item.published_at ? new Date(item.published_at).toLocaleDateString('pl-PL') : 'Artykuł'}
                    </ThemedText>
                    <ThemedText type="code" themeColor="textSecondary">
                      {item.reading_time ? `${item.reading_time} min` : 'Do przeczytania'}
                    </ThemedText>
                  </ThemedView>
                  {item.tags.length > 0 ? (
                    <ThemedText type="code" themeColor="textSecondary" numberOfLines={1}>
                      {item.tags.map((tag) => `#${tag}`).join('  ')}
                    </ThemedText>
                  ) : null}
                </ThemedView>
              </GlassSurface>
            </Pressable>
          </Link>
        )}
        onEndReached={() => {
          if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
            void postsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.45}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { gap: Spacing.three, padding: Spacing.four, paddingBottom: Spacing.six },
  header: { gap: Spacing.two, backgroundColor: 'transparent' },
  footer: { alignItems: 'center', paddingVertical: Spacing.three, backgroundColor: 'transparent' },
  filters: { gap: Spacing.two, paddingVertical: Spacing.one },
  filterChip: {
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  filterChipActive: {
    borderColor: Storefront.colors.primary,
    backgroundColor: Storefront.colors.primary,
  },
  filterChipActiveText: { color: '#FFFFFF' },
  post: {
    overflow: 'hidden',
    borderRadius: Storefront.radius.xl,
  },
  pressed: { opacity: 0.75 },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Storefront.colors.surfaceWarm,
  },
  postBody: {
    gap: Spacing.two,
    padding: Spacing.three,
    backgroundColor: 'transparent',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  pill: {
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  pillText: { color: Storefront.colors.primaryDark },
  featuredPill: {
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  featuredText: { color: Storefront.colors.primaryDark },
});
