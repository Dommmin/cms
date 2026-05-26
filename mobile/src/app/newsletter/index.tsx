import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { subscribe } from '@/api/newsletter';
import { GlassSurface } from '@/components/ui/glass-surface';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';

export default function NewsletterScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const normalizedEmail = email.trim();
  const subscribeMutation = useMutation({
    mutationFn: subscribe,
  });
  const isDisabled = !normalizedEmail.includes('@') || subscribeMutation.isPending;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">Newsletter</ThemedText>
            <ThemedText themeColor="textSecondary">
              Zapisz się na wiadomości o nowościach, premierach i promocjach.
            </ThemedText>
          </ThemedView>
          <GlassSurface style={styles.panel}>
            <ThemedView style={styles.benefits}>
              {['Nowe kolekcje jako pierwsze', 'Promocje i kody rabatowe', 'Poradniki zakupowe z bloga'].map((benefit) => (
                <ThemedView key={benefit} style={styles.benefitRow}>
                  <ThemedView style={styles.dot} />
                  <ThemedText type="small">{benefit}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Imię"
              placeholderTextColor={Storefront.colors.muted}
              style={styles.input}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={Storefront.colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
            />
            {subscribeMutation.isSuccess ? (
              <ThemedView style={styles.successPanel}>
                <ThemedText type="smallBold">Zapisano.</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Sprawdź skrzynkę, jeśli wymagane jest potwierdzenie subskrypcji.
                </ThemedText>
              </ThemedView>
            ) : null}
            {subscribeMutation.isError ? <ThemedText style={styles.errorText}>Nie udało się zapisać.</ThemedText> : null}
            <Pressable
              disabled={isDisabled}
              onPress={() => subscribeMutation.mutate({ email: normalizedEmail, name: name.trim() || undefined })}
              style={[styles.primaryButton, isDisabled && styles.disabled]}>
              <ThemedText type="smallBold" style={styles.primaryButtonText}>
                {subscribeMutation.isPending ? 'Zapisywanie' : 'Zapisz'}
              </ThemedText>
            </Pressable>
            <ThemedText type="code" themeColor="textSecondary">
              Zapis oznacza zgodę na otrzymywanie komunikacji marketingowej. Możesz wypisać się w każdej wiadomości.
            </ThemedText>
          </GlassSurface>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboard: { flex: 1 },
  content: { gap: Spacing.three, padding: Spacing.four, paddingBottom: Spacing.six },
  header: { gap: Spacing.one, backgroundColor: 'transparent' },
  panel: { gap: Spacing.three, padding: Spacing.four, borderRadius: Storefront.radius.xl },
  benefits: {
    gap: Spacing.two,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
    padding: Spacing.three,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, backgroundColor: 'transparent' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Storefront.colors.primary,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  successPanel: {
    gap: Spacing.one,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
    padding: Spacing.three,
  },
  primaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primary,
  },
  primaryButtonText: { color: '#FFFFFF' },
  disabled: { opacity: 0.45 },
  errorText: { color: '#B91C1C' },
});
