import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getOrders } from '@/api/orders';
import { ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';

export default function AccountScreen() {
  const auth = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState(false);
  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders({ per_page: 5 }),
    enabled: auth.isAuthenticated,
  });

  if (auth.isLoading) return <LoadingState />;

  async function handleSubmit() {
    setError(false);
    try {
      if (mode === 'login') {
        await auth.login({ email, password });
      } else {
        await auth.register({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        });
        setName('');
        setPasswordConfirmation('');
      }
      setPassword('');
    } catch {
      setError(true);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {auth.isAuthenticated && auth.user ? (
          <>
            <ThemedText type="subtitle">Konto</ThemedText>
            <ThemedView style={styles.panel}>
              <ThemedText type="smallBold">{auth.user.name}</ThemedText>
              <ThemedText themeColor="textSecondary">{auth.user.email}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.panel}>
              <ThemedText type="smallBold">Ostatnie zamówienia</ThemedText>
              {ordersQuery.isLoading ? <ThemedText themeColor="textSecondary">Ładowanie</ThemedText> : null}
              {ordersQuery.isError ? <ThemedText style={styles.errorText}>Nie udało się pobrać zamówień.</ThemedText> : null}
              {ordersQuery.data?.data.length === 0 ? (
                <ThemedText themeColor="textSecondary">Nie masz jeszcze zamówień.</ThemedText>
              ) : null}
              {ordersQuery.data ? (
                <FlatList
                  scrollEnabled={false}
                  data={ordersQuery.data.data}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <ThemedView style={styles.orderRow}>
                      <ThemedView style={styles.orderMain}>
                        <ThemedText type="smallBold">#{item.reference_number}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {new Date(item.created_at).toLocaleDateString('pl-PL')} · {item.status_label ?? item.status}
                        </ThemedText>
                      </ThemedView>
                      <ThemedText type="smallBold">{formatMoney(item.total, item.currency_code)}</ThemedText>
                    </ThemedView>
                  )}
                />
              ) : null}
            </ThemedView>
            <Pressable onPress={() => auth.logout()} style={styles.secondaryButton}>
              <ThemedText type="smallBold">Wyloguj</ThemedText>
            </Pressable>
          </>
        ) : (
          <>
            <ThemedText type="subtitle">{mode === 'login' ? 'Logowanie' : 'Rejestracja'}</ThemedText>
            {error ? <ErrorState /> : null}
            {mode === 'register' ? (
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Imię i nazwisko"
                autoCapitalize="words"
                style={styles.input}
              />
            ) : null}
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
            {mode === 'register' ? (
              <TextInput
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                placeholder="Powtórz hasło"
                secureTextEntry
                style={styles.input}
              />
            ) : null}
            <Pressable onPress={handleSubmit} style={styles.primaryButton}>
              <ThemedText type="smallBold" style={styles.primaryButtonText}>
                {mode === 'login' ? 'Zaloguj' : 'Utwórz konto'}
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setMode((current) => (current === 'login' ? 'register' : 'login'))}
              style={styles.secondaryButton}>
              <ThemedText type="smallBold">
                {mode === 'login' ? 'Załóż konto' : 'Mam już konto'}
              </ThemedText>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
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
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: 'transparent',
  },
  orderMain: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#B91C1C',
  },
});
