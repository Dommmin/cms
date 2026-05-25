import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getBlogPost } from '@/api/cms';
import { ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {postQuery.data.featured_image ? (
          <Image source={postQuery.data.featured_image} style={styles.image} contentFit="cover" />
        ) : null}
        <ThemedText type="subtitle">{postQuery.data.title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {postQuery.data.published_at ? new Date(postQuery.data.published_at).toLocaleDateString('pl-PL') : ''}
          {postQuery.data.reading_time ? ` · ${postQuery.data.reading_time} min` : ''}
        </ThemedText>
        <ThemedText>{stripHtml(postQuery.data.content)}</ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { gap: Spacing.three, padding: Spacing.three },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
});
