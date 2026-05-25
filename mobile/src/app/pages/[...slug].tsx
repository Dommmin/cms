import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getPage } from '@/api/cms';
import { MobilePageRenderer } from '@/components/cms/mobile-page-renderer';
import { ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

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
        <MobilePageRenderer page={pageQuery.data} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { gap: Spacing.three, padding: Spacing.three },
});
