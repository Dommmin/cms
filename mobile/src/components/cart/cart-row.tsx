import { Image } from 'expo-image';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { CartItem } from '@/types/api';

interface CartRowProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function CartRow({ item, onIncrement, onDecrement, onRemove }: CartRowProps) {
  return (
    <ThemedView style={styles.row}>
      <Image
        source={item.product.thumbnail?.thumb_url ?? item.product.thumbnail?.url ?? undefined}
        style={styles.image}
        contentFit="contain"
      />
      <ThemedView style={styles.content}>
        <ThemedText type="smallBold" numberOfLines={2}>
          {item.product.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatMoney(item.unit_price)}
        </ThemedText>
        <ThemedView style={styles.actions}>
          <Pressable onPress={onDecrement} style={styles.stepper}>
            <ThemedText type="smallBold">-</ThemedText>
          </Pressable>
          <ThemedText type="smallBold">{item.quantity}</ThemedText>
          <Pressable onPress={onIncrement} style={styles.stepper}>
            <ThemedText type="smallBold">+</ThemedText>
          </Pressable>
          <Pressable onPress={onRemove} style={styles.remove}>
            <ThemedText type="small">Usuń</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
      <ThemedText type="smallBold">{formatMoney(item.subtotal)}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
    backgroundColor: 'transparent',
  },
  image: {
    width: 82,
    height: 92,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.surfaceWarm,
  },
  content: {
    flex: 1,
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Storefront.radius.sm,
    backgroundColor: Storefront.colors.primarySoft,
  },
  remove: {
    marginLeft: Spacing.two,
  },
});
