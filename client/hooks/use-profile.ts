'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import {
  createAddress,
  deleteAccount,
  deleteAddress,
  getAddresses,
  getProfile,
  setDefaultAddress,
  updateAddress,
  updatePassword,
  updateProfile,
} from '@/api/profile';
import { removeToken } from '@/lib/axios';
import type { UpdatePasswordPayload, UpdateProfilePayload } from '@/types/api';

export const profileKeys = {
  profile: ['profile'] as const,
  addresses: ['profile', 'addresses'] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.profile,
    queryFn: getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(profileKeys.profile, user);
      toast.success('Profile updated.');
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (payload: UpdatePasswordPayload) => updatePassword(payload),
    onSuccess: () => toast.success('Password changed.'),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password: string) => deleteAccount(password),
    onSuccess: () => {
      removeToken();
      queryClient.clear();
      window.location.href = '/';
    },
  });
}

// ── Addresses ─────────────────────────────────────────────────────────────────

export function useAddresses(enabled = true) {
  return useQuery({
    queryKey: profileKeys.addresses,
    queryFn: getAddresses,
    enabled,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.addresses });
      toast.success('Address added.');
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Parameters<typeof updateAddress>[1]) =>
      updateAddress(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.addresses });
      toast.success('Address updated.');
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.addresses });
      toast.success('Address removed.');
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.addresses });
      toast.success('Default address updated.');
    },
    onError: () => {
      toast.error('Failed to update default address.');
    },
  });
}
