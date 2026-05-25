import { useQuery } from '@tanstack/react-query';
import { FlatList, Linking, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getStores } from '@/api/stores';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function StoresScreen() {
  const storesQuery = useQuery({
    queryKey: ['stores'],
    queryFn: getStores,
  });

  if (storesQuery.isLoading) return <LoadingState />;
  if (storesQuery.isError) return <ErrorState onRetry={() => storesQuery.refetch()} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={storesQuery.data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<ThemedText type="subtitle">Sklepy</ThemedText>}
        ListEmptyComponent={<EmptyState title="Brak sklepów" />}
        renderItem={({ item }) => (
          <ThemedView style={styles.store}>
            <ThemedText type="smallBold">{item.name}</ThemedText>
            <ThemedText themeColor="textSecondary">
              {item.address}, {item.city}
            </ThemedText>
            <ThemedView style={styles.actions}>
              <Pressable
                onPress={() => Linking.openURL(`https://maps.google.com/?q=${item.lat},${item.lng}`)}
                style={styles.secondaryButton}>
                <ThemedText type="smallBold">Mapa</ThemedText>
              </Pressable>
              {item.phone ? (
                <Pressable onPress={() => Linking.openURL(`tel:${item.phone}`)} style={styles.secondaryButton}>
                  <ThemedText type="smallBold">Telefon</ThemedText>
                </Pressable>
              ) : null}
            </ThemedView>
          </ThemedView>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { gap: Spacing.three, padding: Spacing.three },
  store: { gap: Spacing.two, padding: Spacing.three, borderRadius: 8, backgroundColor: '#F3F4F6' },
  actions: { flexDirection: 'row', gap: Spacing.two, backgroundColor: 'transparent' },
  secondaryButton: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 8, backgroundColor: '#E5E7EB' },
});
