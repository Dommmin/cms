import { useMutation, useQuery } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getPaymentMethods, getShippingMethods, submitCheckout } from '@/api/checkout';
import { ErrorState, LoadingState } from '@/components/ui/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
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
      router.push('/checkout/pending' as Href);
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
        <ThemedText type="subtitle">Checkout</ThemedText>
        {formError ? <ThemedText style={styles.errorText}>{formError}</ThemedText> : null}

        <ThemedView style={styles.panel}>
          <ThemedText type="smallBold">Koszyk</ThemedText>
          <ThemedText themeColor="textSecondary">
            {cart ? `${cart.items_count} szt. · ${formatMoney(cart.total, cart.currency)}` : 'Brak danych koszyka'}
          </ThemedText>
        </ThemedView>

        {!auth.user ? (
          <ThemedView style={styles.panel}>
            <ThemedText type="smallBold">Kontakt</ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </ThemedView>
        ) : null}

        <ThemedView style={styles.panel}>
          <ThemedText type="smallBold">Adres dostawy</ThemedText>
          <TextInput value={address.first_name} onChangeText={(value) => updateAddressField('first_name', value)} placeholder="Imię" style={styles.input} />
          <TextInput value={address.last_name} onChangeText={(value) => updateAddressField('last_name', value)} placeholder="Nazwisko" style={styles.input} />
          <TextInput value={address.street} onChangeText={(value) => updateAddressField('street', value)} placeholder="Ulica i numer" style={styles.input} />
          <TextInput value={address.postal_code} onChangeText={(value) => updateAddressField('postal_code', value)} placeholder="Kod pocztowy" style={styles.input} />
          <TextInput value={address.city} onChangeText={(value) => updateAddressField('city', value)} placeholder="Miasto" style={styles.input} />
          <TextInput value={address.phone} onChangeText={(value) => updateAddressField('phone', value)} placeholder="Telefon" keyboardType="phone-pad" style={styles.input} />
        </ThemedView>

        <ThemedView style={styles.panel}>
          <ThemedText type="smallBold">Dostawa</ThemedText>
          {shippingMethods.map((method) => (
            <SelectableRow
              key={method.id}
              selected={(selectedShipping?.id ?? shippingMethods[0]?.id) === method.id}
              label={`${method.name} · ${formatMoney(method.base_price)}`}
              onPress={() => setSelectedShippingId(method.id)}
            />
          ))}
        </ThemedView>

        <ThemedView style={styles.panel}>
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
        </ThemedView>

        <Pressable
          onPress={() => setTermsAccepted((value) => !value)}
          style={[styles.termsRow, termsAccepted && styles.selectedRow]}>
          <ThemedText type="smallBold" style={termsAccepted && styles.selectedText}>
            Akceptuję regulamin i informację o 14-dniowym odstąpieniu
          </ThemedText>
        </Pressable>

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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  selectRow: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  selectedRow: {
    backgroundColor: '#111827',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  termsRow: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
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
  disabled: {
    opacity: 0.45,
  },
  errorText: {
    color: '#B91C1C',
  },
});
