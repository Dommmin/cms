import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo } from 'react';

import * as authApi from '@/api/auth';
import { setUnauthorizedHandler } from '@/api/client';
import type { LoginPayload, RegisterPayload, User } from '@/types/api';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
  });

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.setQueryData(['auth', 'me'], null);
    });

    return () => setUnauthorizedHandler(null);
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? null,
      isLoading: meQuery.isLoading,
      isAuthenticated: Boolean(meQuery.data),
      login: async (payload) => {
        const response = await authApi.login(payload);
        queryClient.setQueryData(['auth', 'me'], response.user);
      },
      register: async (payload) => {
        const response = await authApi.register(payload);
        queryClient.setQueryData(['auth', 'me'], response.user);
      },
      logout: async () => {
        await authApi.logout();
        queryClient.setQueryData(['auth', 'me'], null);
      },
    }),
    [meQuery.data, meQuery.isLoading, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}
