import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CheckoutPayload } from '@/api/checkout';
import { submitCheckout } from '@/api/checkout';
import { api } from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
    api: { post: vi.fn() },
}));

const postMock = vi.mocked(api.post);

const address = {
    first_name: 'Jan',
    last_name: 'Kowalski',
    street: 'Main St 1',
    city: 'Warsaw',
    postal_code: '00-001',
    country_code: 'PL',
    phone: '+48123456789',
};

const payload: CheckoutPayload = {
    shipping_method_id: 1,
    payment_provider: 'payu',
    payment_method: 'card',
    billing_address: address,
    shipping_address: address,
};

describe('submitCheckout idempotency', () => {
    beforeEach(() => {
        postMock.mockReset();
        postMock.mockResolvedValue({ data: { order: { id: 1 } } });
    });

    it('forwards the provided Idempotency-Key header verbatim', async () => {
        await submitCheckout(payload, 'fixed-key-123');

        expect(postMock).toHaveBeenCalledWith('/checkout', payload, {
            headers: { 'Idempotency-Key': 'fixed-key-123' },
        });
    });

    it('reuses the same key across retries of the same attempt', async () => {
        await submitCheckout(payload, 'attempt-key');
        await submitCheckout(payload, 'attempt-key');

        const sentKeys = postMock.mock.calls.map(
            (call) => call[2]?.headers?.['Idempotency-Key'],
        );

        expect(sentKeys).toEqual(['attempt-key', 'attempt-key']);
    });
});
