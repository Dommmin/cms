'use client';

import {
    AddressFieldset,
    addressToPayload,
} from '@/components/checkout/address-fieldset';
import { useTranslation } from '@/hooks/use-translation';

import type { CheckoutAddressSectionProps } from '../checkout.types';

export function CheckoutAddressSection({
    billing,
    sameAddress,
    savedAddresses,
    saveBilling,
    saveShipping,
    shipping,
    submitAttempted,
    token,
    onBillingChange,
    onSameAddressChange,
    onSaveBillingChange,
    onSaveShippingChange,
    onShippingChange,
}: CheckoutAddressSectionProps) {
    const { t } = useTranslation();

    return (
        <>
            <AddressFieldset
                title={t('checkout.billing_address', 'Billing Address')}
                value={billing}
                onChange={onBillingChange}
                savedAddresses={savedAddresses}
                autocompleteSection="billing"
                showAllErrors={submitAttempted}
            />
            {token && savedAddresses.length === 0 && (
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={saveBilling}
                        onChange={(e) => onSaveBillingChange(e.target.checked)}
                        className="border-input accent-primary h-4 w-4 rounded"
                    />
                    {t(
                        'checkout.save_billing',
                        'Save billing address to account',
                    )}
                </label>
            )}

            <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={sameAddress}
                    onChange={(e) => onSameAddressChange(e.target.checked)}
                    className="border-input accent-primary h-4 w-4 rounded"
                />
                {t(
                    'checkout.same_as_billing',
                    'Shipping address same as billing',
                )}
            </label>

            {!sameAddress && (
                <>
                    <AddressFieldset
                        title={t(
                            'checkout.shipping_address',
                            'Shipping Address',
                        )}
                        value={shipping}
                        onChange={onShippingChange}
                        savedAddresses={savedAddresses.filter(
                            (a) => a.type === 'shipping',
                        )}
                        autocompleteSection="shipping"
                        showAllErrors={submitAttempted}
                    />
                    {token && (
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={saveShipping}
                                onChange={(e) =>
                                    onSaveShippingChange(e.target.checked)
                                }
                                className="border-input accent-primary h-4 w-4 rounded"
                            />
                            {t(
                                'checkout.save_shipping',
                                'Save shipping address to account',
                            )}
                        </label>
                    )}
                </>
            )}
        </>
    );
}

export { addressToPayload };
