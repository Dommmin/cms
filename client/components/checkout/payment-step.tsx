'use client';

import { AlertTriangle, Building2 } from 'lucide-react';

import type { PaymentMethodConfig } from '@/api/checkout';
import { ApplePayButton } from '@/components/checkout/apple-pay-button';
import { BlikInput } from '@/components/checkout/blik-input';
import { GooglePayButton } from '@/components/checkout/google-pay-button';
import { useTranslation } from '@/hooks/use-translation';
import type {
    PaymentMethodValue,
    PaymentStepProps,
} from './payment-step.types';

const METHOD_DEFS: Array<{
    value: PaymentMethodValue;
    labelKey: string;
    labelDefault: string;
    descKey: string;
    descDefault: string;
    providerIds: PaymentMethodConfig['id'][];
}> = [
    {
        value: 'blik',
        labelKey: 'checkout.method_blik',
        labelDefault: 'BLIK',
        descKey: 'checkout.method_blik_desc',
        descDefault: 'Pay with a BLIK code from your banking app',
        providerIds: ['payu', 'paynow'],
    },
    {
        value: 'paynow',
        labelKey: 'checkout.method_paynow',
        labelDefault: 'Fast online payment',
        descKey: 'checkout.method_paynow_desc',
        descDefault:
            'BLIK, card, Apple Pay, Google Pay and bank transfer via Paynow',
        providerIds: ['paynow'],
    },
    {
        value: 'paypo',
        labelKey: 'checkout.method_paypo',
        labelDefault: 'Pay later',
        descKey: 'checkout.method_paypo_desc',
        descDefault: 'Deferred payment via PayPo in Paynow',
        providerIds: ['paypo', 'paynow'],
    },
    {
        value: 'p24',
        labelKey: 'checkout.method_p24',
        labelDefault: 'Przelewy24',
        descKey: 'checkout.method_p24_desc',
        descDefault: 'Bank transfer, card, BLIK and other methods',
        providerIds: ['p24'],
    },
    {
        value: 'stripe',
        labelKey: 'checkout.method_stripe',
        labelDefault: 'Stripe Checkout',
        descKey: 'checkout.method_stripe_desc',
        descDefault: 'Card, wallets and local payment methods via Stripe',
        providerIds: ['stripe'],
    },
    {
        value: 'bank_transfer',
        labelKey: 'checkout.method_bank_transfer',
        labelDefault: 'Bank Transfer',
        descKey: 'checkout.method_bank_transfer_desc',
        descDefault: 'Transfer funds to our bank account',
        providerIds: ['bank_transfer'],
    },
    {
        value: 'cash_on_delivery',
        labelKey: 'checkout.method_cod',
        labelDefault: 'Cash on Delivery',
        descKey: 'checkout.method_cod_desc',
        descDefault: 'Pay the courier upon delivery',
        providerIds: ['cash_on_delivery'],
    },
];

export function PaymentStep({
    selected,
    onSelect,
    blikCode,
    onBlikCode,
    onApplePayToken,
    onGooglePayToken,
    cartTotal,
    currency,
    providerConfig,
    isPickup = false,
}: PaymentStepProps) {
    const { t } = useTranslation();

    function providerCfg(
        id: PaymentMethodConfig['id'],
    ): PaymentMethodConfig | undefined {
        return providerConfig?.find((p) => p.id === id);
    }

    function methodProviderCfg(
        ids: PaymentMethodConfig['id'][],
    ): PaymentMethodConfig | undefined {
        const configured = ids
            .map((id) => providerCfg(id))
            .find(
                (cfg): cfg is PaymentMethodConfig =>
                    cfg !== undefined && cfg.configured,
            );

        return (
            configured ??
            ids
                .map((id) => providerCfg(id))
                .find((cfg): cfg is PaymentMethodConfig => cfg !== undefined)
        );
    }

    function isMethodConfigured(ids: PaymentMethodConfig['id'][]): boolean {
        if (!providerConfig) {
            return true;
        }

        return ids.some((id) => providerCfg(id)?.configured === true);
    }

    const applePayCfg = providerCfg('apple_pay');
    const googlePayCfg = providerCfg('google_pay');

    return (
        <div className="border-border rounded-xl border p-5">
            <h2 className="mb-3 text-sm font-semibold">
                {t('checkout.payment_method', 'Payment Method')}
            </h2>

            {/* Apple Pay / Google Pay — shown above radio options when configured */}
            {(applePayCfg?.configured || googlePayCfg?.configured) && (
                <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                    {applePayCfg?.configured && (
                        <div className="flex-1">
                            <ApplePayButton
                                amount={cartTotal}
                                currency={currency}
                                onToken={(token) => {
                                    onSelect('apple_pay');
                                    onApplePayToken(token);
                                }}
                            />
                        </div>
                    )}
                    {googlePayCfg?.configured && (
                        <div className="flex-1">
                            <GooglePayButton
                                amount={cartTotal}
                                currency={currency}
                                onToken={(token) => {
                                    onSelect('google_pay');
                                    onGooglePayToken(token);
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Radio options */}
            <div className="space-y-2">
                {METHOD_DEFS.map((method) => {
                    const cfg = methodProviderCfg(method.providerIds);
                    const isUnconfigured = !isMethodConfigured(
                        method.providerIds,
                    );

                    // Dynamic label for Cash on Delivery when personal pickup is selected
                    const labelKey =
                        method.value === 'cash_on_delivery' && isPickup
                            ? 'checkout.method_cod_pickup'
                            : method.labelKey;
                    const labelDefault =
                        method.value === 'cash_on_delivery' && isPickup
                            ? 'Pay at pickup'
                            : method.labelDefault;
                    const descKey =
                        method.value === 'cash_on_delivery' && isPickup
                            ? 'checkout.method_cod_pickup_desc'
                            : method.value === 'blik' &&
                                !providerCfg('payu')?.configured &&
                                providerCfg('paynow')?.configured
                              ? 'checkout.method_blik_paynow_desc'
                              : method.descKey;
                    const descDefault =
                        method.value === 'cash_on_delivery' && isPickup
                            ? 'Pay in-store when collecting your order'
                            : method.value === 'blik' &&
                                !providerCfg('payu')?.configured &&
                                providerCfg('paynow')?.configured
                              ? 'Choose BLIK on the Paynow payment page'
                              : method.descDefault;

                    return (
                        <label
                            key={method.value}
                            className={`flex cursor-pointer flex-col rounded-lg border p-3 transition-colors ${
                                isUnconfigured
                                    ? 'border-border cursor-not-allowed opacity-60'
                                    : selected === method.value
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border hover:border-primary/50'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value={method.value}
                                    checked={selected === method.value}
                                    onChange={() =>
                                        !isUnconfigured &&
                                        onSelect(method.value)
                                    }
                                    disabled={isUnconfigured}
                                    className="accent-primary mt-0.5"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        {t(labelKey, labelDefault)}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {t(descKey, descDefault)}
                                    </p>

                                    {/* Missing config notice */}
                                    {isUnconfigured &&
                                        cfg !== undefined &&
                                        cfg.missing_settings.length > 0 && (
                                            <div className="mt-1.5 flex items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 dark:bg-amber-950">
                                                <AlertTriangle className="mt-px h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
                                                <span className="text-xs text-amber-700 dark:text-amber-300">
                                                    Configure in Admin Settings:{' '}
                                                    {cfg.missing_settings.join(
                                                        ', ',
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* BLIK code input — shown inline when BLIK is selected */}
                            {method.value === 'blik' &&
                                selected === 'blik' &&
                                providerCfg('payu')?.configured && (
                                    <BlikInput
                                        value={blikCode}
                                        onChange={onBlikCode}
                                    />
                                )}

                            {/* Bank transfer — note that details are shown on the success page */}
                            {method.value === 'bank_transfer' &&
                                selected === 'bank_transfer' &&
                                !isUnconfigured && (
                                    <div className="mt-2 flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1.5 dark:bg-blue-950">
                                        <Building2 className="h-3 w-3 shrink-0 text-blue-600 dark:text-blue-400" />
                                        <span className="text-xs text-blue-700 dark:text-blue-300">
                                            {t(
                                                'checkout.bank_transfer_after_order',
                                                'Bank account details will be shown after you place your order.',
                                            )}
                                        </span>
                                    </div>
                                )}
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
