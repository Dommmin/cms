import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, type Href } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getOrders } from '@/api/orders';
import { updateProfile } from '@/api/profile';
import { ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';

export default function AccountScreen() {
  const auth = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [error, setError] = useState(false);
  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders({ per_page: 5 }),
    enabled: auth.isAuthenticated,
  });
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
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
            <ThemedView style={styles.quickActions}>
              <AccountLink href="/account/wishlist" label="Wishlist" />
              <AccountLink href="/checkout" label="Checkout" />
            </ThemedView>
            <ThemedView style={styles.panel}>
              <ThemedText type="smallBold">Profil</ThemedText>
              <TextInput
                defaultValue={auth.user.name}
                onChangeText={setProfileName}
                placeholder="Imię i nazwisko"
                autoCapitalize="words"
                style={styles.input}
              />
              <TextInput
                defaultValue={auth.user.email}
                onChangeText={setProfileEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              {updateProfileMutation.isSuccess ? <ThemedText type="smallBold">Zapisano profil.</ThemedText> : null}
              {updateProfileMutation.isError ? <ThemedText style={styles.errorText}>Nie udało się zapisać profilu.</ThemedText> : null}
              <Pressable
                disabled={updateProfileMutation.isPending}
                onPress={() =>
                  updateProfileMutation.mutate({
                    name: profileName || auth.user?.name || '',
                    email: profileEmail || auth.user?.email || '',
                  })
                }
                style={[styles.primaryButton, updateProfileMutation.isPending && styles.disabled]}>
                <ThemedText type="smallBold" style={styles.primaryButtonText}>
                  Zapisz profil
                </ThemedText>
              </Pressable>
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
                    <Link href={`/account/orders/${item.reference_number}` as Href} asChild>
                      <Pressable style={styles.orderRow}>
                        <ThemedView style={styles.orderMain}>
                          <ThemedText type="smallBold">#{item.reference_number}</ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            {new Date(item.created_at).toLocaleDateString('pl-PL')} · {item.status_label ?? item.status}
                          </ThemedText>
                        </ThemedView>
                        <ThemedText type="smallBold">{formatMoney(item.total, item.currency_code)}</ThemedText>
                      </Pressable>
                    </Link>
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

function AccountLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href as Href} asChild>
      <Pressable style={styles.accountLink}>
        <ThemedText type="smallBold">{label}</ThemedText>
      </Pressable>
    </Link>
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
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.lg,
    backgroundColor: Storefront.colors.surface,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  accountLink: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.four,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.canvas,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  primaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  disabled: {
    opacity: 0.45,
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
