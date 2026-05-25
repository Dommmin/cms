import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function PaymentPendingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.content}>
        <ThemedText type="subtitle">Płatność w toku</ThemedText>
        <ThemedText themeColor="textSecondary">
          Ten ekran obsłuży redirect/WebView PayU lub P24 oraz polling statusu płatności.
        </ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
});
