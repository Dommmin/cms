import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';

export default function AccountScreen() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (auth.isLoading) return <LoadingState />;

  async function handleLogin() {
    setError(false);
    try {
      await auth.login({ email, password });
      setPassword('');
    } catch {
      setError(true);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.content}>
        {auth.isAuthenticated && auth.user ? (
          <>
            <ThemedText type="subtitle">Konto</ThemedText>
            <ThemedView style={styles.panel}>
              <ThemedText type="smallBold">{auth.user.name}</ThemedText>
              <ThemedText themeColor="textSecondary">{auth.user.email}</ThemedText>
            </ThemedView>
            <Pressable onPress={() => auth.logout()} style={styles.secondaryButton}>
              <ThemedText type="smallBold">Wyloguj</ThemedText>
            </Pressable>
          </>
        ) : (
          <>
            <ThemedText type="subtitle">Logowanie</ThemedText>
            {error ? <ErrorState /> : null}
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Hasło"
              secureTextEntry
              style={styles.input}
            />
            <Pressable onPress={handleLogin} style={styles.primaryButton}>
              <ThemedText type="smallBold" style={styles.primaryButtonText}>
                Zaloguj
              </ThemedText>
            </Pressable>
          </>
        )}
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
    gap: Spacing.three,
    padding: Spacing.three,
  },
  panel: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  primaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
});
