import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { getStores } from '@/api/stores';
import { GlassSurface } from '@/components/ui/glass-surface';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';
import type { Store } from '@/types/api';

function openingHours(store: Store): [string, string][] {
  return Object.entries(store.opening_hours ?? {}).filter(([, value]) => Boolean(value));
}

export default function StoresScreen() {
  const [expandedStoreId, setExpandedStoreId] = useState<number | null>(null);
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
        ListHeaderComponent={
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">Sklepy</ThemedText>
            <ThemedText themeColor="textSecondary">Lista lokalizacji z szybkim przejściem do mapy, telefonu i emaila.</ThemedText>
          </ThemedView>
        }
        ListEmptyComponent={<EmptyState title="Brak sklepów" />}
        renderItem={({ item }) => {
          const hours = openingHours(item);
          const isExpanded = expandedStoreId === item.id;
          const mapUrl = `https://maps.google.com/maps?q=${item.lat},${item.lng}&z=15&output=embed`;

          return (
            <GlassSurface style={styles.store}>
              <ThemedView style={styles.titleRow}>
                <ThemedView style={styles.storeTitle}>
                  <ThemedText type="smallBold">{item.name}</ThemedText>
                  <ThemedText themeColor="textSecondary">
                    {item.address}, {item.city}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.pill}>
                  <ThemedText type="code" style={styles.pillText}>
                    {item.country}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              {hours.length > 0 ? (
                <ThemedView style={styles.hours}>
                  {hours.slice(0, 4).map(([day, value]) => (
                    <ThemedView key={day} style={styles.hourRow}>
                      <ThemedText type="code" themeColor="textSecondary">
                        {day}
                      </ThemedText>
                      <ThemedText type="code">{value}</ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>
              ) : null}
              {isExpanded ? (
                <ThemedView style={styles.mapPreview}>
                  <WebView
                    source={{ uri: mapUrl }}
                    style={styles.mapWebView}
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                  />
                </ThemedView>
              ) : null}
              <ThemedView style={styles.actions}>
                <Pressable
                  onPress={() => setExpandedStoreId((current) => (current === item.id ? null : item.id))}
                  style={styles.secondaryButton}>
                  <ThemedText type="smallBold">{isExpanded ? 'Ukryj mapę' : 'Podgląd mapy'}</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => Linking.openURL(`https://maps.google.com/?q=${item.lat},${item.lng}`)}
                  style={styles.primaryButton}>
                  <ThemedText type="smallBold" style={styles.primaryButtonText}>
                    Mapa
                  </ThemedText>
                </Pressable>
                {item.phone ? (
                  <Pressable onPress={() => Linking.openURL(`tel:${item.phone}`)} style={styles.secondaryButton}>
                    <ThemedText type="smallBold">Telefon</ThemedText>
                  </Pressable>
                ) : null}
                {item.email ? (
                  <Pressable onPress={() => Linking.openURL(`mailto:${item.email}`)} style={styles.secondaryButton}>
                    <ThemedText type="smallBold">Email</ThemedText>
                  </Pressable>
                ) : null}
              </ThemedView>
            </GlassSurface>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { gap: Spacing.three, padding: Spacing.four, paddingBottom: Spacing.six },
  header: { gap: Spacing.one, backgroundColor: 'transparent' },
  store: { gap: Spacing.three, padding: Spacing.four, borderRadius: Storefront.radius.xl },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
    backgroundColor: 'transparent',
  },
  storeTitle: { flex: 1, gap: Spacing.one, backgroundColor: 'transparent' },
  pill: {
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  pillText: { color: Storefront.colors.primaryDark },
  hours: {
    gap: Spacing.one,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
    padding: Spacing.three,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  mapPreview: {
    height: 180,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.lg,
    backgroundColor: Storefront.colors.glassStrong,
  },
  mapWebView: {
    flex: 1,
    backgroundColor: Storefront.colors.surfaceWarm,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, backgroundColor: 'transparent' },
  primaryButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primary,
  },
  primaryButtonText: { color: '#FFFFFF' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
  },
});
