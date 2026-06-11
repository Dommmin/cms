import { getCartToken } from '@/api/cart';
import { getWishlistToken } from '@/api/wishlist';
import { apiGet } from '@/lib/api';
import { api } from '@/lib/axios';
import type {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
    User,
} from '@/types/api';

export type SocialProvider = 'google' | 'github';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', {
        ...payload,
        cart_token: payload.cart_token ?? getCartToken(),
        wishlist_token: payload.wishlist_token ?? getWishlistToken(),
    });
    return data;
}

export async function register(
    payload: RegisterPayload,
): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', {
        ...payload,
        cart_token: payload.cart_token ?? getCartToken(),
        wishlist_token: payload.wishlist_token ?? getWishlistToken(),
    });
    return data;
}

export async function logout(): Promise<void> {
    await api.post('/auth/logout');
}

export async function getMe(): Promise<User | null> {
    return apiGet<User>('/auth/me');
}

export async function forgotPassword(
    email: string,
): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(
        '/auth/forgot-password',
        { email },
    );
    return data;
}

export async function resetPassword(payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(
        '/auth/reset-password',
        payload,
    );
    return data;
}

export async function getSocialRedirectUrl(
    provider: SocialProvider,
): Promise<string> {
    const { data } = await api.get<{ url: string }>(
        `/auth/social/${provider}/redirect`,
    );
    return data.url;
}

export async function handleSocialCallback(
    provider: SocialProvider,
    code: string,
): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
        `/auth/social/${provider}/callback`,
        {
            code,
            // Social login always merges silently — send both guest tokens
            cart_token: getCartToken(),
            wishlist_token: getWishlistToken(),
        },
    );
    return data;
}

export async function sendOtp(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/otp/send', {
        email,
    });
    return data;
}

export async function verifyOtp(payload: {
    email: string;
    code: string;
}): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/otp/verify', {
        ...payload,
        cart_token: getCartToken(),
        wishlist_token: getWishlistToken(),
    });
    return data;
}

// ── Two-Factor Authentication API ──────────────────────────────────────────

export interface TwoFactorQrCodeResponse {
    svg: string;
    secret: string;
}

export interface TwoFactorChallengePayload {
    challenge_token: string;
    code?: string;
    recovery_code?: string;
}

export async function getTwoFactorQrCode(): Promise<TwoFactorQrCodeResponse> {
    const { data } = await api.get<TwoFactorQrCodeResponse>(
        '/auth/two-factor/qr-code',
    );
    return data;
}

export async function getTwoFactorRecoveryCodes(): Promise<string[]> {
    const { data } = await api.get<string[]>('/auth/two-factor/recovery-codes');
    return data;
}

export async function enableTwoFactor(
    force = false,
): Promise<TwoFactorQrCodeResponse> {
    const { data } = await api.post<TwoFactorQrCodeResponse>(
        '/auth/two-factor/authentication',
        { force },
    );
    return data;
}

export async function confirmTwoFactor(
    code: string,
): Promise<{ message: string; recovery_codes: string[] }> {
    const { data } = await api.post<{
        message: string;
        recovery_codes: string[];
    }>('/auth/two-factor/confirmed-authentication', { code });
    return data;
}

export async function disableTwoFactor(): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(
        '/auth/two-factor/authentication',
    );
    return data;
}

export async function regenerateRecoveryCodes(): Promise<string[]> {
    const { data } = await api.post<string[]>(
        '/auth/two-factor/recovery-codes',
    );
    return data;
}

export async function verifyTwoFactorChallenge(
    payload: TwoFactorChallengePayload,
): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
        '/auth/two-factor/challenge',
        payload,
    );
    return data;
}

// ── Passkeys API ────────────────────────────────────────────────────────────

export interface ClientPasskey {
    id: number;
    name: string;
    credential_id: string;
    created_at: string;
    last_used_at: string | null;
}

export async function getPasskeys(): Promise<ClientPasskey[]> {
    const { data } = await api.get<ClientPasskey[]>('/auth/passkeys');
    return data;
}

export async function deletePasskey(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(
        `/auth/passkeys/${id}`,
    );
    return data;
}

// ── Sessions API ───────────────────────────────────────────────────────────

export interface ActiveSession {
    id: number;
    name: string;
    ip_address: string | null;
    user_agent: string | null;
    device: string;
    platform: string;
    browser: string;
    last_used_at: string | null;
    created_at: string;
    is_current: boolean;
}

export async function getSessions(): Promise<ActiveSession[]> {
    const { data } = await api.get<ActiveSession[]>('/auth/sessions');
    return data;
}

export async function deleteSession(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(
        `/auth/sessions/${id}`,
    );
    return data;
}

export async function deleteOtherSessions(): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>('/auth/sessions');
    return data;
}

export async function verifyPasskeyLogin(payload: {
    challenge_id: string;
    credential: unknown;
}): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
        '/auth/passkeys/login',
        payload,
    );
    return data;
}
