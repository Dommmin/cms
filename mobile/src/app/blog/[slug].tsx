import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Link, type Href, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Share, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getBlogPost } from '@/api/cms';
import { GlassSurface } from '@/components/ui/glass-surface';
import { ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';
import { stripHtml } from '@/lib/format';

export default function BlogPostScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const postQuery = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => getBlogPost(slug),
    enabled: Boolean(slug),
  });

  if (postQuery.isLoading) return <LoadingState />;
  if (postQuery.isError || !postQuery.data) return <ErrorState onRetry={() => postQuery.refetch()} />;
  const post = postQuery.data;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {post.featured_image ? (
          <Image source={post.featured_image} style={styles.image} contentFit="cover" />
        ) : null}
        <GlassSurface style={styles.article}>
          <ThemedView style={styles.metaRow}>
            {post.category ? (
              <ThemedView style={styles.pill}>
                <ThemedText type="code" style={styles.pillText}>
                  {post.category.name}
                </ThemedText>
              </ThemedView>
            ) : null}
            {post.is_featured ? (
              <ThemedView style={styles.featuredPill}>
                <ThemedText type="code" style={styles.featuredText}>
                  Polecane
                </ThemedText>
              </ThemedView>
            ) : null}
          </ThemedView>
          <ThemedText type="subtitle">{post.title}</ThemedText>
          <ThemedView style={styles.metaRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {post.published_at ? new Date(post.published_at).toLocaleDateString('pl-PL') : 'Artykuł'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {post.reading_time ? `${post.reading_time} min czytania` : 'Do przeczytania'}
            </ThemedText>
            {post.author ? (
              <ThemedText type="small" themeColor="textSecondary">
                {post.author.name}
              </ThemedText>
            ) : null}
          </ThemedView>
          {post.excerpt ? (
            <ThemedText themeColor="textSecondary">
              {stripHtml(post.excerpt)}
            </ThemedText>
          ) : null}
          <ThemedText>{stripHtml(post.content)}</ThemedText>
          {post.tags.length > 0 ? (
            <ThemedView style={styles.tags}>
              {post.tags.map((tag) => (
                <ThemedView key={tag} style={styles.tag}>
                  <ThemedText type="code" themeColor="textSecondary">
                    #{tag}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          ) : null}
          <ThemedView style={styles.actions}>
            <Pressable
              onPress={() => {
                void Share.share({ title: post.title, message: post.title });
              }}
              style={styles.primaryButton}>
              <ThemedText type="smallBold" style={styles.primaryButtonText}>
                Udostępnij
              </ThemedText>
            </Pressable>
            <Link href={'/blog' as Href} asChild>
              <Pressable style={styles.secondaryButton}>
                <ThemedText type="smallBold">Wróć do bloga</ThemedText>
              </Pressable>
            </Link>
          </ThemedView>
        </GlassSurface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { gap: Spacing.three, padding: Spacing.four, paddingBottom: Spacing.six },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: Storefront.radius.xl,
    backgroundColor: Storefront.colors.surfaceWarm,
  },
  article: { gap: Spacing.three, padding: Spacing.four, borderRadius: Storefront.radius.xl },
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
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, backgroundColor: 'transparent' },
  tag: {
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, backgroundColor: 'transparent' },
  primaryButton: {
    alignItems: 'center',
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primary,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  primaryButtonText: { color: '#FFFFFF' },
  secondaryButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
});
