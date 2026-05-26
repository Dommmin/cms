import { useMutation } from '@tanstack/react-query';
import { Link, type Href, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { resetPassword } from '@/api/auth';
import { GlassSurface } from '@/components/ui/glass-surface';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string; email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [token, setToken] = useState(params.token ?? '');
  const [password, setPassword] = useState('');
  const mutation = useMutation({ mutationFn: resetPassword });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.content}>
        <ThemedText type="subtitle">Nowe hasło</ThemedText>
        <GlassSurface style={styles.panel}>
          <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={Storefront.colors.muted} autoCapitalize="none" style={styles.input} />
          <TextInput value={token} onChangeText={setToken} placeholder="Token resetu" placeholderTextColor={Storefront.colors.muted} autoCapitalize="none" style={styles.input} />
          <TextInput value={password} onChangeText={setPassword} placeholder="Nowe hasło" placeholderTextColor={Storefront.colors.muted} secureTextEntry style={styles.input} />
          <Pressable
            disabled={mutation.isPending || !email || !token || password.length < 8}
            onPress={() => mutation.mutate({ email, token, password, password_confirmation: password })}
            style={[styles.primaryButton, (mutation.isPending || !email || !token || password.length < 8) && styles.disabled]}>
            <ThemedText type="smallBold" style={styles.primaryButtonText}>Zresetuj hasło</ThemedText>
          </Pressable>
          {mutation.isSuccess ? <ThemedText type="small" themeColor="textSecondary">{mutation.data.message}</ThemedText> : null}
        </GlassSurface>
        <Link href={'/account' as Href} asChild>
          <Pressable style={styles.secondaryButton}>
            <ThemedText type="smallBold">Przejdź do logowania</ThemedText>
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
