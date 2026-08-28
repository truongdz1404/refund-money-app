import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { setCurrentUser } from '@/lib/authStore';
import type {
  AppUser,
  Campaign,
  LinkResult,
  Order,
  ReferralView,
  WalletSummary,
  WithdrawalRequest,
} from '@/lib/types';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<AppUser>('/me'),
  });
}

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => api.get<WalletSummary>('/wallet'),
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get<Order[]>('/orders?limit=100'),
  });
}

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get<Campaign[]>('/campaigns'),
  });
}

export function useReferral() {
  return useQuery({
    queryKey: ['referral'],
    queryFn: () => api.get<ReferralView>('/referral'),
  });
}

export function useCreateLink() {
  return useMutation({
    mutationFn: (input: { platform: string; productUrl: string }) =>
      api.post<LinkResult>('/link', input),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      phone?: string;
      bankName?: string;
      bankAccountNumber?: string;
      bankAccountHolder?: string;
    }) => api.put<AppUser>('/me', input),
    onSuccess: (user) => {
      setCurrentUser(user);
      queryClient.setQueryData(['me'], user);
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { amount: number }) => api.post<WithdrawalRequest>('/wallet/withdraw', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { newPassword: string }) => api.put<{ ok: true }>('/password', input),
  });
}
