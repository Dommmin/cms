'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import type { SocialProvider } from '@/api/auth';
import {
    forgotPassword,
    getMe,
    handleSocialCallback,
    login,
    logout,
    register,
} from '@/api/auth';
import { getCartToken } from '@/api/cart';
import { clearWishlistToken, getWishlistToken } from '@/api/wishlist';
import type { MergeDialogState } from '@/components/merge-dialog';
import { cartKeys } from '@/hooks/use-cart';
import { wishlistKeys } from '@/hooks/use-wishlist';
import { getToken, removeToken, setToken } from '@/lib/axios';
import { trackLogin, trackSignUp } from '@/lib/datalayer';
import type { LoginPayload, RegisterPayload } from '@/types/api';

function getLocalePath(path: string): string {
    const localeMatch =
        typeof document !== 'undefined'
            ? document.cookie.match(/(?:^|; )locale=([^;]*)/)
            : null;
    const locale = localeMatch ? decodeURIComponent(localeMatch[1]) : 'en';
    return locale === 'en' ? path : `/${locale}${path}`;
}

/** Always called after a successful login/register to commit auth state and navigate. */
function buildCommitLogin(
    setToken: (t: string) => void,
    queryClient: ReturnType<typeof useQueryClient>,
    onTrack: () => void,
) {
    return function commitLogin(
        token: string,
        user: unknown,
        redirect: string,
        options?: {
            preserveGuestTokens?: boolean;
        },
    ) {
        if (!options?.preserveGuestTokens) {
            localStorage.removeItem('cart_token');
            clearWishlistToken();
        }

        setToken(token);
        queryClient.setQueryData(authKeys.me, user);
        queryClient.invalidateQueries({ queryKey: cartKeys.cart });
        queryClient.invalidateQueries({ queryKey: wishlistKeys.wishlist });
        onTrack();

        if (typeof window !== 'undefined') {
            window.location.href = getLocalePath(redirect);
        }
    };
}

/** Read the pending redirect from the current URL's ?redirect= search param. */
function getPendingRedirect(): string {
    if (typeof window === 'undefined') return '/';
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || '/';
    return /^\/[^/]/.test(redirect) || redirect === '/' ? redirect : '/';
}

/** Snapshot guest item counts from the query cache (best-effort). */
function getGuestCounts(queryClient: ReturnType<typeof useQueryClient>) {
    type Cart = { items_count: number };
    type Wishlist = { items_count: number };
    const cartCount =
        queryClient.getQueryData<Cart>(cartKeys.cart)?.items_count ?? 0;
    const wishlistCount =
        queryClient.getQueryData<Wishlist>(wishlistKeys.wishlist)
            ?.items_count ?? 0;
    return { cartCount, wishlistCount };
}

// ── Query keys ───────────────────────────────────────────────────────────────

export const authKeys = {
    me: ['auth', 'me'] as const,
};

// ── Queries ──────────────────────────────────────────────────────────────────

export function useMe() {
    return useQuery({
        queryKey: authKeys.me,
        queryFn: getMe,
        enabled: !!getToken(),
        retry: false,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
}

// ── useLogin ──────────────────────────────────────────────────────────────────

/**
 * Returns the standard mutation object plus:
 * - `mergeDialogState` — non-null when the merge dialog should be shown.
 * - `confirmMerge(mergeCart, mergeWishlist)` — call from the dialog's onConfirm.
 * - `mutate(payload)` — intercepts the call to check for guest data first.
 */
export function useLogin() {
    const queryClient = useQueryClient();

    // Pending merge state: we've received auth credentials but haven't
    // committed them yet — waiting for the user's merge choice.
    const [mergeDialogState, setMergeDialogState] =
        useState<MergeDialogState | null>(null);

    // Stash auth response + redirect until the dialog resolves.
    const pendingRef = useRef<{
        token: string;
        user: unknown;
        redirect: string;
    } | null>(null);

    const commitLogin = buildCommitLogin(setToken, queryClient, trackLogin);

    const mutation = useMutation({
        mutationFn: (payload: LoginPayload) => login(payload),
        onSuccess: ({ token, user }) => {
            const redirect = getPendingRedirect();
            const cartToken = getCartToken();
            const wishlistToken = getWishlistToken();
            const { cartCount, wishlistCount } = getGuestCounts(queryClient);

            const hasGuestCart = !!cartToken && cartCount > 0;
            const hasGuestWishlist = !!wishlistToken && wishlistCount > 0;

            if (hasGuestCart || hasGuestWishlist) {
                // Hold auth state and show the merge dialog.
                pendingRef.current = { token, user, redirect };
                setMergeDialogState({
                    cartCount: hasGuestCart ? cartCount : 0,
                    wishlistCount: hasGuestWishlist ? wishlistCount : 0,
                });
            } else {
                // No guest data — fast path, commit immediately.
                commitLogin(token, user, redirect);
            }
        },
    });

    /**
     * Called by the merge dialog after the user makes their choice.
     * "Keep" preserves guest tokens long enough for the first authenticated
     * cart / wishlist fetch to merge them server-side. "Discard" drops them
     * before the redirect so nothing gets merged.
     */
    function confirmMerge(mergeCart: boolean, mergeWishlist: boolean) {
        if (!pendingRef.current) return;
        const { token, user, redirect } = pendingRef.current;
        pendingRef.current = null;
        setMergeDialogState(null);
        commitLogin(token, user, redirect, {
            preserveGuestTokens: mergeCart || mergeWishlist,
        });
    }

    return {
        ...mutation,
        /**
         * Overrides useMutation's mutate: accepts payload without tokens
         * (tokens are injected by api/auth.ts from localStorage).
         */
        mutate: (
            payload: Omit<LoginPayload, 'cart_token' | 'wishlist_token'>,
            options?: Parameters<typeof mutation.mutate>[1],
        ) => mutation.mutate(payload as LoginPayload, options),
        mergeDialogState,
        confirmMerge,
    };
}

// ── useRegister ───────────────────────────────────────────────────────────────

export function useRegister() {
    const queryClient = useQueryClient();

    const [mergeDialogState, setMergeDialogState] =
        useState<MergeDialogState | null>(null);

    const pendingRef = useRef<{
        token: string;
        user: unknown;
        redirect: string;
    } | null>(null);

    const commitLogin = buildCommitLogin(setToken, queryClient, trackSignUp);

    const mutation = useMutation({
        mutationFn: (payload: RegisterPayload) => register(payload),
        onSuccess: ({ token, user }) => {
            const redirect = getPendingRedirect();
            const cartToken = getCartToken();
            const wishlistToken = getWishlistToken();
            const { cartCount, wishlistCount } = getGuestCounts(queryClient);

            const hasGuestCart = !!cartToken && cartCount > 0;
            const hasGuestWishlist = !!wishlistToken && wishlistCount > 0;

            if (hasGuestCart || hasGuestWishlist) {
                pendingRef.current = { token, user, redirect };
                setMergeDialogState({
                    cartCount: hasGuestCart ? cartCount : 0,
                    wishlistCount: hasGuestWishlist ? wishlistCount : 0,
                });
            } else {
                commitLogin(token, user, redirect);
            }
        },
    });

    function confirmMerge(mergeCart: boolean, mergeWishlist: boolean) {
        if (!pendingRef.current) return;
        const { token, user, redirect } = pendingRef.current;
        pendingRef.current = null;
        setMergeDialogState(null);
        commitLogin(token, user, redirect, {
            preserveGuestTokens: mergeCart || mergeWishlist,
        });
    }

    return {
        ...mutation,
        mutate: (
            payload: Omit<RegisterPayload, 'cart_token' | 'wishlist_token'>,
            options?: Parameters<typeof mutation.mutate>[1],
        ) => mutation.mutate(payload as RegisterPayload, options),
        mergeDialogState,
        confirmMerge,
    };
}

// ── useLogout ─────────────────────────────────────────────────────────────────

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logout,
        onSettled: () => {
            removeToken();
            // Always clear both guest tokens on logout so that the guest
            // wishlist / cart don't re-appear after the user signs out.
            localStorage.removeItem('cart_token');
            clearWishlistToken();
            queryClient.clear();
            const localeMatch =
                typeof document !== 'undefined'
                    ? document.cookie.match(/(?:^|; )locale=([^;]*)/)
                    : null;
            const locale = localeMatch
                ? decodeURIComponent(localeMatch[1])
                : 'en';
            window.location.href =
                locale === 'en' ? '/login' : `/${locale}/login`;
        },
    });
}

// ── useForgotPassword ─────────────────────────────────────────────────────────

export function useForgotPassword() {
    return useMutation({
        mutationFn: (email: string) => forgotPassword(email),
    });
}

// ── useSocialCallback ─────────────────────────────────────────────────────────

export function useSocialCallback(provider: SocialProvider) {
    const queryClient = useQueryClient();
    const commitLogin = buildCommitLogin(setToken, queryClient, trackLogin);

    return useMutation({
        mutationFn: (code: string) => handleSocialCallback(provider, code),
        onSuccess: ({ token, user }) => {
            // Social login merges silently on the first authenticated cart /
            // wishlist fetch, so keep guest tokens until that happens.
            commitLogin(token, user, getPendingRedirect(), {
                preserveGuestTokens: true,
            });
        },
    });
}
