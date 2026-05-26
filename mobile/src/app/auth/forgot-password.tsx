import { useMutation } from '@tanstack/react-query';
import { Link, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { forgotPassword } from '@/api/auth';
import { GlassSurface } from '@/components/ui/glass-surface';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const mutation = useMutation({ mutationFn: forgotPassword });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.content}>
        <ThemedText type="subtitle">Reset hasła</ThemedText>
        <GlassSurface style={styles.panel}>
          <ThemedText themeColor="textSecondary">Podaj email, a API wyśle link resetujący hasło.</ThemedText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={Storefront.colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <Pressable
            disabled={mutation.isPending || !email.trim()}
            onPress={() => mutation.mutate(email.trim())}
            style={[styles.primaryButton, (mutation.isPending || !email.trim()) && styles.disabled]}>
            <ThemedText type="smallBold" style={styles.primaryButtonText}>Wyślij link</ThemedText>
          </Pressable>
          {mutation.isSuccess ? <ThemedText type="small" themeColor="textSecondary">{mutation.data.message}</ThemedText> : null}
        </GlassSurface>
        <Link href={'/account' as Href} asChild>
          <Pressable style={styles.secondaryButton}>
            <ThemedText type="smallBold">Wróć do logowania</ThemedText>
          </Pressable>
        </Link>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { gap: Spacing.three, padding: Spacing.four },
  panel: { gap: Spacing.three, padding: Spacing.four, borderRadius: Storefront.radius.xl },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.glassStrong,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  primaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primary,
  },
  primaryButtonText: { color: '#FFFFFF' },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  disabled: { opacity: 0.45 },
});
