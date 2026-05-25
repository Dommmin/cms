import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { FlatList, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getOrder } from '@/api/orders';
import { ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/lib/format';

export default function OrderDetailScreen() {
  const { reference } = useLocalSearchParams<{ reference: string }>();
  const orderQuery = useQuery({
    queryKey: ['orders', reference],
    queryFn: () => getOrder(reference),
    enabled: Boolean(reference),
  });

  if (orderQuery.isLoading) return <LoadingState />;
  if (orderQuery.isError || !orderQuery.data) return <ErrorState onRetry={() => orderQuery.refetch()} />;

  const order = orderQuery.data;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle">#{order.reference_number}</ThemedText>
        <ThemedView style={styles.panel}>
          <InfoRow label="Status" value={order.status_label ?? order.status} />
          <InfoRow label="Data" value={new Date(order.created_at).toLocaleDateString('pl-PL')} />
          <InfoRow label="Suma" value={formatMoney(order.total, order.currency_code)} />
        </ThemedView>
        <ThemedView style={styles.panel}>
          <ThemedText type="smallBold">Produkty</ThemedText>
          <FlatList
            scrollEnabled={false}
            data={order.items}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ThemedView style={styles.itemRow}>
                <ThemedView style={styles.itemMain}>
                  <ThemedText type="smallBold">{item.product_name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.variant_sku} · {item.quantity} szt.
                  </ThemedText>
                </ThemedView>
                <ThemedText type="smallBold">{formatMoney(item.subtotal, order.currency_code)}</ThemedText>
              </ThemedView>
            )}
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView style={styles.infoRow}>
      <ThemedText themeColor="textSecondary">{label}</ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { gap: Spacing.three, padding: Spacing.three },
  panel: { gap: Spacing.two, padding: Spacing.three, borderRadius: 8, backgroundColor: '#F3F4F6' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' },
  itemRow: { flexDirection: 'row', gap: Spacing.three, paddingVertical: Spacing.two, backgroundColor: 'transparent' },
  itemMain: { flex: 1, backgroundColor: 'transparent' },
});
