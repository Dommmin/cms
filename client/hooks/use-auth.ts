"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { forgotPassword, getMe, handleSocialCallback, login, logout, register } from "@/api/auth";
import { getToken, removeToken, setToken } from "@/lib/axios";
import { cartKeys } from "@/hooks/use-cart";
import { trackLogin, trackSignUp } from "@/lib/datalayer";
import type { LoginPayload, RegisterPayload } from "@/types/api";
import type { SocialProvider } from "@/api/auth";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    enabled: !!getToken(),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: ({ token, user }) => {
      setToken(token);
      queryClient.setQueryData(authKeys.me, user);
      queryClient.invalidateQueries({ queryKey: cartKeys.cart });
      trackLogin();
      router.push("/");
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: ({ token, user }) => {
      setToken(token);
      queryClient.setQueryData(authKeys.me, user);
      queryClient.invalidateQueries({ queryKey: cartKeys.cart });
      trackSignUp();
      router.push("/");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      removeToken();
      queryClient.clear();
      router.push("/login");
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
