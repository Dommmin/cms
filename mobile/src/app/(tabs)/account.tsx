import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, type Href } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getOrders } from '@/api/orders';
import {
  exportProfileData,
  deleteAccount,
  getAddresses,
  getConsent,
  liftProcessingRestriction,
  restrictProcessing,
  updateConsent,
  updatePassword,
  updateProfile,
} from '@/api/profile';
import { GlassSurface } from '@/components/ui/glass-surface';
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
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [exportReady, setExportReady] = useState(false);
  const [error, setError] = useState(false);
  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders({ per_page: 5 }),
    enabled: auth.isAuthenticated,
  });
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
  });
  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      setCurrentPassword('');
      setNextPassword('');
    },
  });
  const exportMutation = useMutation({
    mutationFn: exportProfileData,
    onSuccess: () => setExportReady(true),
  });
  const restrictMutation = useMutation({
    mutationFn: () =>
      auth.user?.processing_restricted_at ? liftProcessingRestriction() : restrictProcessing(),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => auth.logout(),
  });
  const consentQuery = useQuery({
    queryKey: ['consent'],
    queryFn: getConsent,
    enabled: auth.isAuthenticated,
  });
  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    enabled: auth.isAuthenticated,
  });
  const consentMutation = useMutation({
    mutationFn: updateConsent,
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
            <GlassSurface style={styles.panel}>
              <ThemedText type="smallBold">{auth.user.name}</ThemedText>
              <ThemedText themeColor="textSecondary">{auth.user.email}</ThemedText>
            </GlassSurface>
            <ThemedView style={styles.quickActions}>
              <AccountLink href="/account/wishlist" label="Wishlist" />
              <AccountLink href="/account/orders" label="Zamówienia" />
              <AccountLink href="/compare" label="Porównaj" />
              <AccountLink href="/checkout" label="Checkout" />
            </ThemedView>
            <GlassSurface style={styles.panel}>
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
            </GlassSurface>
            <GlassSurface style={styles.panel}>
              <ThemedText type="smallBold">Hasło</ThemedText>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Aktualne hasło"
                secureTextEntry
                style={styles.input}
              />
              <TextInput
                value={nextPassword}
                onChangeText={setNextPassword}
                placeholder="Nowe hasło"
                secureTextEntry
                style={styles.input}
              />
              <Pressable
                disabled={passwordMutation.isPending || !currentPassword || nextPassword.length < 8}
                onPress={() =>
                  passwordMutation.mutate({
                    current_password: currentPassword,
                    password: nextPassword,
                    password_confirmation: nextPassword,
                  })
                }
                style={[styles.secondaryButton, (passwordMutation.isPending || !currentPassword || nextPassword.length < 8) && styles.disabled]}>
                <ThemedText type="smallBold">Zmień hasło</ThemedText>
              </Pressable>
              {passwordMutation.isSuccess ? <ThemedText type="small" themeColor="textSecondary">Hasło zostało zmienione.</ThemedText> : null}
            </GlassSurface>
            <GlassSurface style={styles.panel}>
              <ThemedText type="smallBold">Adresy</ThemedText>
              {addressesQuery.isLoading ? <ThemedText themeColor="textSecondary">Ładowanie adresów</ThemedText> : null}
              {addressesQuery.data?.length === 0 ? <ThemedText themeColor="textSecondary">Brak zapisanych adresów.</ThemedText> : null}
              {addressesQuery.data?.map((address) => (
                <ThemedView key={address.id} style={styles.addressRow}>
                  <ThemedText type="smallBold">{address.first_name} {address.last_name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {address.street}, {address.postal_code} {address.city}
                  </ThemedText>
                  {address.is_default ? <ThemedText type="code" style={styles.kicker}>DOMYŚLNY</ThemedText> : null}
                </ThemedView>
              ))}
            </GlassSurface>
            <GlassSurface style={styles.panel}>
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
            </GlassSurface>
            <GlassSurface style={styles.panel}>
              <ThemedText type="smallBold">Prywatność i zgody</ThemedText>
              <ToggleRow
                label="Analityka"
                enabled={Boolean(consentQuery.data?.analytics)}
                onPress={() =>
                  consentMutation.mutate({
                    functional: true,
                    analytics: !consentQuery.data?.analytics,
                    marketing: Boolean(consentQuery.data?.marketing),
                    consent_version: consentQuery.data?.consent_version ?? '1.0',
                  })
                }
              />
              <ToggleRow
                label="Marketing"
                enabled={Boolean(consentQuery.data?.marketing)}
                onPress={() =>
                  consentMutation.mutate({
                    functional: true,
                    analytics: Boolean(consentQuery.data?.analytics),
                    marketing: !consentQuery.data?.marketing,
                    consent_version: consentQuery.data?.consent_version ?? '1.0',
                  })
                }
              />
              <Pressable
                disabled={exportMutation.isPending}
                onPress={() => exportMutation.mutate()}
                style={styles.secondaryButton}>
                <ThemedText type="smallBold">Przygotuj eksport danych</ThemedText>
              </Pressable>
              {exportReady ? <ThemedText type="small" themeColor="textSecondary">Eksport danych został pobrany z API i jest gotowy do obsługi w aplikacji.</ThemedText> : null}
              <Pressable
                disabled={restrictMutation.isPending}
                onPress={() => restrictMutation.mutate()}
                style={styles.secondaryButton}>
                <ThemedText type="smallBold">
                  {auth.user.processing_restricted_at ? 'Cofnij ograniczenie przetwarzania' : 'Ogranicz przetwarzanie danych'}
                </ThemedText>
              </Pressable>
            </GlassSurface>
            <GlassSurface style={styles.dangerPanel}>
              <ThemedText type="smallBold" style={styles.dangerText}>Usunięcie konta</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Konto zostanie zanonimizowane zgodnie z backendowym procesem GDPR.
              </ThemedText>
              <TextInput
                value={deletePassword}
                onChangeText={setDeletePassword}
                placeholder="Potwierdź hasłem"
                secureTextEntry
                style={styles.input}
              />
              <Pressable onPress={() => setDeleteArmed((value) => !value)} style={styles.secondaryButton}>
                <ThemedText type="smallBold">{deleteArmed ? 'Potwierdzenie aktywne' : 'Aktywuj potwierdzenie'}</ThemedText>
              </Pressable>
              <Pressable
                disabled={!deleteArmed || !deletePassword || deleteMutation.isPending}
                onPress={() => deleteMutation.mutate(deletePassword)}
                style={[styles.dangerButton, (!deleteArmed || !deletePassword || deleteMutation.isPending) && styles.disabled]}>
                <ThemedText type="smallBold" style={styles.primaryButtonText}>Usuń konto</ThemedText>
              </Pressable>
            </GlassSurface>
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
            {mode === 'login' ? (
              <Link href={'/auth/forgot-password' as Href} asChild>
                <Pressable style={styles.secondaryButton}>
                  <ThemedText type="smallBold">Nie pamiętam hasła</ThemedText>
                </Pressable>
              </Link>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({ label, enabled, onPress }: { label: string; enabled: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.toggleRow}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <ThemedView style={[styles.toggle, enabled && styles.toggleEnabled]}>
        <ThemedText type="smallBold" style={enabled && styles.toggleText}>{enabled ? 'ON' : 'OFF'}</ThemedText>
      </ThemedView>
    </Pressable>
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
    borderRadius: Storefront.radius.lg,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  accountLink: {
    flexGrow: 1,
    minWidth: '30%',
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
  addressRow: {
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Storefront.colors.border,
    backgroundColor: 'transparent',
  },
  kicker: {
    color: Storefront.colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: 'transparent',
  },
  toggle: {
    minWidth: 52,
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
    backgroundColor: Storefront.colors.primarySoft,
  },
  toggleEnabled: {
    backgroundColor: Storefront.colors.primary,
  },
  toggleText: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#B91C1C',
  },
  dangerPanel: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Storefront.radius.lg,
    borderColor: Storefront.colors.rose,
  },
  dangerText: {
    color: Storefront.colors.rose,
  },
  dangerButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.rose,
  },
});
