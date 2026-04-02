'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { SocialProvider } from '@/api/auth';
import {
    forgotPassword,
    getMe,
    handleSocialCallback,
    login,
    logout,
    register,
} from '@/api/auth';
import { cartKeys } from '@/hooks/use-cart';
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

export const authKeys = {
    me: ['auth', 'me'] as const,
};

export function useMe() {
    return useQuery({
        queryKey: authKeys.me,
        queryFn: getMe,
        enabled: !!getToken(),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 min — user profile doesn't change frequently
        gcTime: 30 * 60 * 1000, // 30 min — keep logged-in user in memory
    });
}

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: LoginPayload) => login(payload),
        onSuccess: ({ token, user }) => {
            setToken(token);
            queryClient.setQueryData(authKeys.me, user);
            queryClient.invalidateQueries({ queryKey: cartKeys.cart });
            trackLogin();
            window.location.href = getLocalePath('/');
        },
    });
}

export function useRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RegisterPayload) => register(payload),
        onSuccess: ({ token, user }) => {
            setToken(token);
            queryClient.setQueryData(authKeys.me, user);
            queryClient.invalidateQueries({ queryKey: cartKeys.cart });
            trackSignUp();
            window.location.href = getLocalePath('/');
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logout,
        onSettled: () => {
            removeToken();
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

export function useForgotPassword() {
    return useMutation({
        mutationFn: (email: string) => forgotPassword(email),
    });
}

export function useSocialCallback(provider: SocialProvider) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (code: string) => handleSocialCallback(provider, code),
        onSuccess: ({ token, user }) => {
            setToken(token);
            queryClient.setQueryData(authKeys.me, user);
            queryClient.invalidateQueries({ queryKey: cartKeys.cart });
            trackLogin();
        },
    });
}
