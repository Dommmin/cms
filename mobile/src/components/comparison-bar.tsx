import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { GlassSurface } from '@/components/ui/glass-surface';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';
import { useComparison } from '@/hooks/use-comparison';

export function ComparisonBar() {
  const comparison = useComparison();

  if (comparison.ids.length === 0) return null;

  return (
    <GlassSurface style={styles.bar}>
      <ThemedView style={styles.copy}>
        <ThemedText type="smallBold">Porównanie</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">{comparison.ids.length}/4 produktów</ThemedText>
      </ThemedView>
      <ThemedView style={styles.actions}>
        <Pressable onPress={() => comparison.clear()} style={styles.secondaryButton}>
          <ThemedText type="smallBold">Wyczyść</ThemedText>
        </Pressable>
        <Link href={'/compare' as Href} asChild>
          <Pressable disabled={comparison.ids.length < 2} style={[styles.primaryButton, comparison.ids.length < 2 && styles.disabled]}>
            <ThemedText type="smallBold" style={styles.primaryButtonText}>Porównaj</ThemedText>
          </Pressable>
        </Link>
      </ThemedView>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: Spacing.four,
    right: Spacing.four,
    bottom: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Storefront.radius.xl,
  },
  copy: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  secondaryButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  primaryButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.45,
  },
});
