import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, type Href } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getOrders } from '@/api/orders';
import { GlassSurface } from '@/components/ui/glass-surface';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { Order } from '@/types/api';

export default function OrdersScreen() {
  const ordersQuery = useInfiniteQuery({
    queryKey: ['orders', 'all'],
    queryFn: ({ pageParam }) => getOrders({ page: pageParam, per_page: 12 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page >= lastPage.meta.last_page) return undefined;
      return lastPage.meta.current_page + 1;
    },
  });
  const orders = ordersQuery.data?.pages.flatMap((page) => page.data) ?? [];

  if (ordersQuery.isLoading) return <LoadingState />;
  if (ordersQuery.isError) return <ErrorState onRetry={() => ordersQuery.refetch()} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.heading}>
          <ThemedText type="subtitle">Zamówienia</ThemedText>
          <ThemedText themeColor="textSecondary">{orders.length} pobranych zamówień</ThemedText>
        </ThemedView>
        {orders.length === 0 ? (
          <EmptyState title="Brak zamówień" body="Po złożeniu zamówienia pojawi się tutaj historia zakupów." />
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <OrderRow order={item} />}
            contentContainerStyle={styles.list}
            onEndReached={() => {
              if (ordersQuery.hasNextPage && !ordersQuery.isFetchingNextPage) {
                void ordersQuery.fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.45}
            ListFooterComponent={
              <ThemedView style={styles.footer}>
                {ordersQuery.isFetchingNextPage ? <ThemedText themeColor="textSecondary">Ładowanie kolejnych zamówień</ThemedText> : null}
              </ThemedView>
            }
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

function OrderRow({ order }: { order: Order }) {
  return (
    <Link href={`/account/orders/${order.reference_number}` as Href} asChild>
      <Pressable>
        <GlassSurface style={styles.row} interactive>
          <ThemedView style={styles.rowMain}>
            <ThemedText type="smallBold">#{order.reference_number}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {new Date(order.created_at).toLocaleDateString('pl-PL')} · {order.items.length} poz.
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.rowSide}>
            <ThemedText type="code" style={styles.status}>{order.status_label ?? order.status}</ThemedText>
            <ThemedText type="smallBold">{formatMoney(order.total, order.currency_code)}</ThemedText>
          </ThemedView>
        </GlassSurface>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, gap: Spacing.three, padding: Spacing.four },
  heading: { gap: Spacing.one, backgroundColor: 'transparent' },
  list: { gap: Spacing.three },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Storefront.radius.lg,
  },
  rowMain: { flex: 1, backgroundColor: 'transparent' },
  rowSide: { alignItems: 'flex-end', gap: Spacing.one, backgroundColor: 'transparent' },
  status: { color: Storefront.colors.primary },
  footer: { minHeight: Spacing.six, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
});
