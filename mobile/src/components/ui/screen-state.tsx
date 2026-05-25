import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export function LoadingState({ label = 'Ładowanie' }: { label?: string }) {
  return (
    <ThemedView style={styles.center}>
      <ThemedText themeColor="textSecondary">{label}</ThemedText>
    </ThemedView>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ThemedView style={styles.center}>
      <ThemedText type="smallBold">Nie udało się pobrać danych.</ThemedText>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.button}>
          <ThemedText type="smallBold">Ponów</ThemedText>
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <ThemedView style={styles.center}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {body ? <ThemedText themeColor="textSecondary">{body}</ThemedText> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  button: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
});
