import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getBlogPosts } from '@/api/cms';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { stripHtml } from '@/lib/format';

export default function BlogScreen() {
  const postsQuery = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => getBlogPosts({ per_page: 12 }),
  });

  if (postsQuery.isLoading) return <LoadingState />;
  if (postsQuery.isError) return <ErrorState onRetry={() => postsQuery.refetch()} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={postsQuery.data?.data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<ThemedText type="subtitle">Blog</ThemedText>}
        ListEmptyComponent={<EmptyState title="Brak wpisów" />}
        renderItem={({ item }) => (
          <Link href={`/blog/${item.slug}` as Href} asChild>
            <Pressable style={({ pressed }) => [styles.post, pressed && styles.pressed]}>
              {item.featured_image ? <Image source={item.featured_image} style={styles.image} contentFit="cover" /> : null}
              <ThemedView style={styles.postBody}>
                <ThemedText type="smallBold">{item.title}</ThemedText>
                {item.excerpt ? (
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={3}>
                    {stripHtml(item.excerpt)}
                  </ThemedText>
                ) : null}
                <ThemedText type="code" themeColor="textSecondary">
                  {item.reading_time ? `${item.reading_time} min` : 'Artykuł'}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { gap: Spacing.three, padding: Spacing.three },
  post: {
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  pressed: { opacity: 0.75 },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#E5E7EB',
  },
  postBody: {
    gap: Spacing.two,
    padding: Spacing.three,
    backgroundColor: 'transparent',
  },
});
