import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { setCurrentUser } from '@/lib/authStore';
import type {
  AppUser,
  Campaign,
  LinkHistoryItem,
  LinkResult,
  OAuthConfig,
  Order,
  ReferralView,
  WalletSummary,
  WithdrawalRequest,
} from '@/lib/types';

export function useOAuthConfig() {
  return useQuery({
    queryKey: ['oauth-config'],
    queryFn: () => api.get<OAuthConfig>('/oauth-config'),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

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

const ORDERS_PAGE_SIZE = 30;
const LINKS_PAGE_SIZE = 20;

// Some backends silently ignore `offset` and keep returning the first page.
// If a fetched page brings no id we haven't already seen, treat it as the end
// instead of paginating forever.
function dedupeById<T extends { id: number | string }>(items: T[]): T[] {
  const seen = new Set<T['id']>();
  const result: T[] = [];
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

export function useOrders() {
  return useInfiniteQuery({
    queryKey: ['orders'],
    queryFn: ({ pageParam }) => api.get<Order[]>(`/orders?limit=${ORDERS_PAGE_SIZE}&offset=${pageParam}`),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < ORDERS_PAGE_SIZE) return undefined;
      const priorIds = new Set(allPages.slice(0, -1).flat().map((o) => o.id));
      if (!lastPage.some((o) => !priorIds.has(o.id))) return undefined;
      return allPages.flat().length;
    },
    select: (data) => dedupeById(data.pages.flat()),
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { platform: string; productUrl: string }) =>
      api.post<LinkResult>('/link', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });
}

export function useLinkHistory() {
  return useInfiniteQuery({
    queryKey: ['links'],
    queryFn: ({ pageParam }) => api.get<LinkHistoryItem[]>(`/links?limit=${LINKS_PAGE_SIZE}&offset=${pageParam}`),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < LINKS_PAGE_SIZE) return undefined;
      const priorIds = new Set(allPages.slice(0, -1).flat().map((l) => l.id));
      if (!lastPage.some((l) => !priorIds.has(l.id))) return undefined;
      return allPages.flat().length;
    },
    select: (data) => dedupeById(data.pages.flat()),
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

export function useWithdrawals() {
  return useQuery({
    queryKey: ['withdrawals'],
    queryFn: () => api.get<WithdrawalRequest[]>('/wallet/withdrawals'),
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { amount: number }) => api.post<WithdrawalRequest>('/wallet/withdraw', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      api.put<{ ok: true }>('/password', input),
  });
}
