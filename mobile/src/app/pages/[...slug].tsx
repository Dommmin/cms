import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getPage } from '@/api/cms';
import { ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { stripHtml } from '@/lib/format';

export default function CmsPageScreen() {
  const params = useLocalSearchParams<{ slug?: string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : 'home';
  const pageQuery = useQuery({
    queryKey: ['pages', slug],
    queryFn: () => getPage(slug),
  });

  if (pageQuery.isLoading) return <LoadingState />;
  if (pageQuery.isError || !pageQuery.data) return <ErrorState onRetry={() => pageQuery.refetch()} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle">{pageQuery.data.title}</ThemedText>
        {pageQuery.data.excerpt ? (
          <ThemedText themeColor="textSecondary">{pageQuery.data.excerpt}</ThemedText>
        ) : null}
        {pageQuery.data.content ? (
          <ThemedView style={styles.panel}>
            <ThemedText>{stripHtml(pageQuery.data.content)}</ThemedText>
          </ThemedView>
        ) : null}
        {pageQuery.data.sections?.map((section) => (
          <ThemedView key={section.id} style={styles.panel}>
            {section.blocks.map((block) => (
              <ThemedView key={block.id} style={styles.block}>
                <ThemedText type="smallBold">{String(block.configuration.title ?? block.configuration.heading ?? block.type)}</ThemedText>
                {typeof block.configuration.description === 'string' ? (
                  <ThemedText themeColor="textSecondary">{stripHtml(block.configuration.description)}</ThemedText>
                ) : null}
              </ThemedView>
            ))}
          </ThemedView>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { gap: Spacing.three, padding: Spacing.three },
  panel: { gap: Spacing.two, padding: Spacing.three, borderRadius: 8, backgroundColor: '#F3F4F6' },
  block: { gap: Spacing.one, backgroundColor: 'transparent' },
});
