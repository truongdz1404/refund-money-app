export type AppUser = {
  id: number;
  zaloUserId: string;
  phone: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  createdAt: string;
  updatedAt: string;
  commissionPct: number | null;
  referralCode: string | null;
  referredByUserId: number | null;
  email: string | null;
  fullName: string | null;
  googleId: string | null;
  facebookId: string | null;
};

export type AuthResponse = { token: string; user: AppUser };

export type WithdrawalRequest = {
  id: number;
  userId: number;
  amount: number;
  method: 'bank';
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdAt: string;
  processedAt: string | null;
};

export type WalletSummary = {
  paidOrders: number;
  paidAmount: number;
  unpaidOrders: number;
  unpaidAmount: number;
  pendingOrders: number;
  pendingAmount: number;
  paidThisMonth: number;
  availableAmount: number;
  minWithdrawAmount: number;
  pendingWithdrawal: WithdrawalRequest | null;
};

// display_order_status: 1=Pending, 2=Completed, 3=Cancelled, 4=Unpaid.
export type Order = {
  id: number;
  orderSn: string;
  userId: number;
  subId: string | null;
  totalCommission: number | null;
  userCommission: number | null;
  operatorCommission: number | null;
  displayOrderStatus: 1 | 2 | 3 | 4 | null;
  payoutStatus: 'paid' | 'unpaid' | 'cancelled';
  paidAt: string | null;
  purchaseTime: string | null;
  productName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LinkCommissionRow = {
  channel: string;
  totalAmount: number | null;
  totalPct: number | null;
};

export type LinkResult = {
  results?: { shortLink?: string; longLink?: string; itemId?: string }[];
  commission?: { commissionTable?: LinkCommissionRow[]; error?: string } | null;
  pid: string | null;
  estimate: { userAmount: number; userPct: number | null } | null;
};

export type CampaignTier = { orders: number; reward: number };

export type CampaignReward = {
  id: number;
  campaignId: number;
  userId: number;
  orderThreshold: number;
  rewardAmount: number;
  payoutStatus: 'paid' | 'unpaid';
  paidAt: string | null;
  createdAt: string;
};

export type Campaign = {
  id: number;
  title: string;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean | 0 | 1;
  tiers: CampaignTier[];
  completedOrders: number;
  rewardsEarned: CampaignReward[];
};

export type ReferralInvitee = {
  id: number;
  referrerUserId: number;
  referredUserId: number;
  referredPhone: string;
  status: 'pending' | 'qualified' | 'rewarded';
  rewardAmount: number;
  createdAt: string;
  qualifiedAt: string | null;
};

export type ReferralView = {
  referralCode: string;
  stats: { totalInvited: number; qualified: number; totalReward: number };
  invited: ReferralInvitee[];
};

export type LinkHistoryItem = {
  id: number;
  userId: number;
  itemId: string | null;
  subId: string;
  shopeeUrl: string | null;
  affiliateUrl: string | null;
  createdAt: string;
};

export type OAuthConfig = {
  google: { enabled: true; clientId: string } | { enabled: false };
  facebook: { enabled: true; appId: string } | { enabled: false };
};
