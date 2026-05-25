import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { subscribe } from '@/api/newsletter';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function NewsletterScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const subscribeMutation = useMutation({
    mutationFn: subscribe,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.content}>
        <ThemedText type="subtitle">Newsletter</ThemedText>
        <ThemedText themeColor="textSecondary">Zapisz się na wiadomości o nowościach i promocjach.</ThemedText>
        <TextInput value={name} onChangeText={setName} placeholder="Imię" style={styles.input} />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        {subscribeMutation.isSuccess ? <ThemedText type="smallBold">Zapisano.</ThemedText> : null}
        {subscribeMutation.isError ? <ThemedText style={styles.errorText}>Nie udało się zapisać.</ThemedText> : null}
        <Pressable
          disabled={!email.trim() || subscribeMutation.isPending}
          onPress={() => subscribeMutation.mutate({ email: email.trim(), name: name.trim() || undefined })}
          style={[styles.primaryButton, (!email.trim() || subscribeMutation.isPending) && styles.disabled]}>
          <ThemedText type="smallBold" style={styles.primaryButtonText}>
            {subscribeMutation.isPending ? 'Zapisywanie' : 'Zapisz'}
          </ThemedText>
        </Pressable>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { gap: Spacing.three, padding: Spacing.three },
  input: { minHeight: 48, borderRadius: 8, backgroundColor: '#F3F4F6', paddingHorizontal: Spacing.three, fontSize: 16 },
  primaryButton: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 8, backgroundColor: '#111827' },
  primaryButtonText: { color: '#FFFFFF' },
  disabled: { opacity: 0.45 },
  errorText: { color: '#B91C1C' },
});
