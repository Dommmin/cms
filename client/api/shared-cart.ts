import { getCartToken, setCartToken } from '@/api/cart';
import { api, getToken } from '@/lib/axios';
import type {
    SharedCartImportMode,
    SharedCartImportResult,
    SharedCartPreview,
    SharedCartShareLink,
} from '@/types/api';

function withCartToken() {
    const token = getCartToken();
    return token ? { headers: { 'X-Cart-Token': token } } : {};
}

function syncCartToken(token: string | null | undefined): void {
    if (token) {
        setCartToken(token);
        return;
    }

    if (typeof localStorage !== 'undefined' && getToken()) {
        localStorage.removeItem('cart_token');
    }
}

export async function createSharedCart(
    expiresInDays?: number,
): Promise<SharedCartShareLink> {
    const { data } = await api.post<SharedCartShareLink>(
        '/cart/share',
        expiresInDays ? { expires_in_days: expiresInDays } : {},
        withCartToken(),
    );

    return data;
}

export async function getSharedCartPreview(
    token: string,
): Promise<SharedCartPreview> {
    const { data } = await api.get<SharedCartPreview>(`/cart/shared/${token}`);
    return data;
}

export async function importSharedCart(
    token: string,
    mode: SharedCartImportMode,
): Promise<SharedCartImportResult> {
    const { data } = await api.post<SharedCartImportResult>(
        `/cart/shared/${token}/import`,
        { mode },
        withCartToken(),
    );

    syncCartToken(data.cart.token);

    return data;
}
