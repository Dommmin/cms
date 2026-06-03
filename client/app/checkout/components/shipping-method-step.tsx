'use client';

import dynamic from 'next/dynamic';

const InpostPicker = dynamic(
    () =>
        import('@/components/checkout/inpost-picker').then((m) => ({
            default: m.InpostPicker,
        })),
    { ssr: false },
);

import { PickupPointPicker } from '@/components/checkout/pickup-point-picker';
import { useTranslation } from '@/hooks/use-translation';

import type { ShippingMethodStepProps } from '../checkout.types';

export function ShippingMethodStep({
    billing,
    isLoading,
    pickupPointId,
    selectedMethod,
    selectedShippingMethod,
    shippingMethods,
    subtotal,
    onMethodChange,
    onPickupPointChange,
    formatPrice,
}: ShippingMethodStepProps) {
    const { t } = useTranslation();

    return (
        <div className="border-border rounded-xl border p-5">
            <h2 className="mb-3 text-sm font-semibold">
                {t('checkout.shipping_method', 'Shipping Method')}
            </h2>
            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="bg-muted h-14 animate-pulse rounded-lg"
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {shippingMethods.map((method) => {
                        const methodThreshold =
                            method.free_shipping_threshold ?? null;
                        const isFree =
                            methodThreshold !== null &&
                            subtotal >= methodThreshold;
                        const price = isFree ? 0 : method.base_price;
                        const unconfigured = !method.configured;

                        return (
                            <label
                                key={method.id}
                                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                                    unconfigured
                                        ? 'border-border cursor-not-allowed opacity-60'
                                        : selectedMethod === method.id
                                          ? 'border-primary bg-primary/5'
                                          : 'border-border hover:border-primary/50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="shipping_method"
                                        value={method.id}
                                        checked={selectedMethod === method.id}
                                        disabled={unconfigured}
                                        onChange={() =>
                                            !unconfigured &&
                                            onMethodChange(method.id)
                                        }
                                        className="accent-primary"
                                    />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {method.name}
                                        </p>
                                        {method.description && (
                                            <p className="text-muted-foreground text-xs">
                                                {method.description}
                                            </p>
                                        )}
                                        {method.estimated_days_min &&
                                            method.estimated_days_max && (
                                                <p className="text-muted-foreground text-xs">
                                                    {method.estimated_days_min}-
                                                    {method.estimated_days_max}{' '}
                                                    {t(
                                                        'checkout.business_days',
                                                        'business days',
                                                    )}
                                                </p>
                                            )}
                                        {unconfigured &&
                                            method.missing_config.length >
                                                0 && (
                                                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                                    Set in server/.env:{' '}
                                                    {method.missing_config.join(
                                                        ', ',
                                                    )}
                                                </p>
                                            )}
                                    </div>
                                </div>
                                <span className="text-sm font-semibold">
                                    {price === 0 ? (
                                        <span className="text-green-600">
                                            {t('checkout.free', 'Free')}
                                        </span>
                                    ) : (
                                        formatPrice(price)
                                    )}
                                </span>
                            </label>
                        );
                    })}
                </div>
            )}

            {selectedShippingMethod?.requires_pickup_point &&
                (selectedShippingMethod.uses_native_widget ? (
                    <InpostPicker
                        value={pickupPointId || null}
                        onChange={(id) => onPickupPointChange(id)}
                    />
                ) : (
                    <PickupPointPicker
                        carrier={selectedShippingMethod.carrier ?? ''}
                        postalCode={billing.postal_code}
                        value={pickupPointId || null}
                        onChange={(id) => onPickupPointChange(id)}
                    />
                ))}
        </div>
    );
}
