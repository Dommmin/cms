import { useMutation, useQuery } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getPaymentMethods, getShippingMethods, submitCheckout } from '@/api/checkout';
import { GlassSurface } from '@/components/ui/glass-surface';
import { ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Storefront } from '@/constants/theme';
import { useCart } from '@/hooks/use-cart';
import { formatMoney } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import type { AddressPayload, PaymentMethodConfig, ShippingMethod } from '@/types/api';

const emptyAddress: AddressPayload = {
  first_name: '',
  last_name: '',
  street: '',
  city: '',
  postal_code: '',
  country_code: 'PL',
  phone: '',
};

export default function CheckoutScreen() {
  const { cart } = useCart();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState<AddressPayload>(emptyAddress);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const shippingQuery = useQuery({ queryKey: ['checkout', 'shipping'], queryFn: getShippingMethods });
  const paymentQuery = useQuery({ queryKey: ['checkout', 'payments'], queryFn: getPaymentMethods });

  const checkoutMutation = useMutation({
    mutationFn: submitCheckout,
    onSuccess: async (response) => {
      if (response.payment.redirect_url) {
        await WebBrowser.openBrowserAsync(response.payment.redirect_url);
      }
      router.push({
        pathname: '/checkout/pending',
        params: {
          payment_id: response.payment.id ? String(response.payment.id) : '',
          order_reference: response.order.reference_number,
        },
      } as unknown as Href);
    },
    onError: () => setFormError('Nie udało się złożyć zamówienia. Sprawdź dane i spróbuj ponownie.'),
  });

  const shippingMethods = useMemo(() => shippingQuery.data ?? [], [shippingQuery.data]);
  const paymentMethods = useMemo(() => paymentQuery.data ?? [], [paymentQuery.data]);
  const selectedShipping = useMemo(
    () => resolveShippingMethod(shippingMethods, selectedShippingId),
    [selectedShippingId, shippingMethods],
  );
  const selectedPayment = useMemo(
    () => resolvePaymentMethod(paymentMethods, selectedPaymentId),
    [paymentMethods, selectedPaymentId],
  );

  if (shippingQuery.isLoading || paymentQuery.isLoading) return <LoadingState />;
  if (shippingQuery.isError || paymentQuery.isError) return <ErrorState />;

  function updateAddressField(key: keyof AddressPayload, value: string) {
    setAddress((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit() {
    setFormError(null);
    if (!cart || cart.items.length === 0) {
      setFormError('Koszyk jest pusty.');
      return;
    }
    if (!auth.user && !email.trim()) {
      setFormError('Podaj email do zamówienia.');
      return;
    }
    if (!selectedShipping || !selectedPayment) {
      setFormError('Wybierz dostawę i płatność.');
      return;
    }
    if (!termsAccepted) {
      setFormError('Zaakceptuj regulamin i informację o odstąpieniu.');
      return;
    }

    checkoutMutation.mutate({
      guest_email: auth.user ? undefined : email.trim(),
      shipping_method_id: selectedShipping.id,
      payment_provider: selectedPayment.id,
      billing_address: address,
      shipping_address: address,
      terms_accepted: true,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.heading}>
          <ThemedText type="subtitle">Checkout</ThemedText>
          <ThemedText themeColor="textSecondary">
            Dane, dostawa i płatność w jednym mobilnym flow z tym samym idempotentnym API co storefront.
          </ThemedText>
        </ThemedView>
        {formError ? <ThemedText style={styles.errorText}>{formError}</ThemedText> : null}

        <ThemedView style={styles.steps}>
          <StepPill label="Kontakt" active={Boolean(auth.user || email.trim())} />
          <StepPill label="Dostawa" active={Boolean(selectedShipping)} />
          <StepPill label="Płatność" active={Boolean(selectedPayment)} />
        </ThemedView>

        <GlassSurface style={styles.summaryPanel}>
          <ThemedView style={styles.summaryRow}>
            <ThemedText type="smallBold">Koszyk</ThemedText>
            <ThemedText type="smallBold">
              {cart ? formatMoney(cart.total, cart.currency) : 'Brak danych'}
            </ThemedText>
          </ThemedView>
          <ThemedText themeColor="textSecondary">
            {cart ? `${cart.items_count} szt. · rabaty ${formatMoney(cart.discount_amount, cart.currency)}` : 'Brak danych koszyka'}
          </ThemedText>
        </GlassSurface>

        {!auth.user ? (
          <GlassSurface style={styles.panel}>
            <ThemedText type="smallBold">Kontakt</ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={Storefront.colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </GlassSurface>
        ) : null}

        <GlassSurface style={styles.panel}>
          <ThemedText type="smallBold">Adres dostawy</ThemedText>
          <TextInput value={address.first_name} onChangeText={(value) => updateAddressField('first_name', value)} placeholder="Imię" placeholderTextColor={Storefront.colors.muted} style={styles.input} />
          <TextInput value={address.last_name} onChangeText={(value) => updateAddressField('last_name', value)} placeholder="Nazwisko" placeholderTextColor={Storefront.colors.muted} style={styles.input} />
          <TextInput value={address.street} onChangeText={(value) => updateAddressField('street', value)} placeholder="Ulica i numer" placeholderTextColor={Storefront.colors.muted} style={styles.input} />
          <TextInput value={address.postal_code} onChangeText={(value) => updateAddressField('postal_code', value)} placeholder="Kod pocztowy" placeholderTextColor={Storefront.colors.muted} style={styles.input} />
          <TextInput value={address.city} onChangeText={(value) => updateAddressField('city', value)} placeholder="Miasto" placeholderTextColor={Storefront.colors.muted} style={styles.input} />
          <TextInput value={address.phone} onChangeText={(value) => updateAddressField('phone', value)} placeholder="Telefon" placeholderTextColor={Storefront.colors.muted} keyboardType="phone-pad" style={styles.input} />
        </GlassSurface>

        <GlassSurface style={styles.panel}>
          <ThemedText type="smallBold">Dostawa</ThemedText>
          {shippingMethods.map((method) => (
            <SelectableRow
              key={method.id}
              selected={(selectedShipping?.id ?? shippingMethods[0]?.id) === method.id}
              label={`${method.name} · ${formatMoney(method.base_price)}`}
              onPress={() => setSelectedShippingId(method.id)}
            />
          ))}
        </GlassSurface>

        <GlassSurface style={styles.panel}>
          <ThemedText type="smallBold">Płatność</ThemedText>
          {paymentMethods.map((method) => (
            <SelectableRow
              key={method.id}
              selected={(selectedPayment?.id ?? paymentMethods[0]?.id) === method.id}
              label={method.id}
              disabled={!method.configured}
              onPress={() => setSelectedPaymentId(method.id)}
            />
          ))}
        </GlassSurface>

        <Pressable
          onPress={() => setTermsAccepted((value) => !value)}
          style={[styles.termsRow, termsAccepted && styles.selectedRow]}>
          <ThemedView style={[styles.checkbox, termsAccepted && styles.checkboxSelected]}>
            <ThemedText type="smallBold" style={termsAccepted && styles.selectedText}>
              {termsAccepted ? '✓' : ''}
            </ThemedText>
          </ThemedView>
          <ThemedText type="smallBold" style={termsAccepted && styles.selectedText}>
            Akceptuję regulamin i informację o 14-dniowym odstąpieniu
          </ThemedText>
        </Pressable>
        <ThemedText type="small" themeColor="textSecondary">
          Przed złożeniem zamówienia potwierdzasz warunki sprzedaży, obowiązek zapłaty oraz prawo odstąpienia zgodne z checkoutem webowym.
        </ThemedText>

        <Pressable
          disabled={checkoutMutation.isPending}
          onPress={handleSubmit}
          style={[styles.primaryButton, checkoutMutation.isPending && styles.disabled]}>
          <ThemedText type="smallBold" style={styles.primaryButtonText}>
            {checkoutMutation.isPending ? 'Składanie zamówienia' : 'Złóż zamówienie'}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function resolveShippingMethod(methods: ShippingMethod[], selectedId: number | null) {
  return methods.find((method) => method.id === selectedId) ?? methods[0] ?? null;
}

function resolvePaymentMethod(methods: PaymentMethodConfig[], selectedId: string | null) {
  return (
    methods.find((method) => method.id === selectedId) ??
    methods.find((method) => method.configured) ??
    methods[0] ??
    null
  );
}

function SelectableRow({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.selectRow, selected && styles.selectedRow, disabled && styles.disabled]}>
      <ThemedText type="smallBold" style={selected && styles.selectedText}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function StepPill({ label, active }: { label: string; active: boolean }) {
  return (
    <ThemedView style={[styles.stepPill, active && styles.stepPillActive]}>
      <ThemedText type="smallBold" style={active && styles.selectedText}>
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  heading: {
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  steps: {
    flexDirection: 'row',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  stepPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: 999,
    backgroundColor: Storefront.colors.surface,
  },
  stepPillActive: {
    borderColor: Storefront.colors.primary,
    backgroundColor: Storefront.colors.primary,
  },
  panel: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Storefront.radius.lg,
  },
  summaryPanel: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Storefront.radius.xl,
    backgroundColor: Storefront.colors.glass,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
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
  selectRow: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.canvas,
  },
  selectedRow: {
    borderColor: Storefront.colors.primary,
    backgroundColor: Storefront.colors.primary,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderWidth: 1,
    borderColor: Storefront.colors.border,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primarySoft,
  },
  checkbox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Storefront.colors.primary,
    borderRadius: Storefront.radius.sm,
    backgroundColor: Storefront.colors.surface,
  },
  checkboxSelected: {
    backgroundColor: Storefront.colors.primaryDark,
  },
  primaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    borderRadius: Storefront.radius.md,
    backgroundColor: Storefront.colors.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.45,
  },
  errorText: {
    color: '#B91C1C',
  },
});
