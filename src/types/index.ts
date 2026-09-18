/**
 * TT BOT - Type Definitions
 * Designed for Telegram Mini App frontend & Cloudflare Worker API
 */

export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramWebAppUser;
    auth_date?: string;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  openTelegramLink: (url: string) => void;
  openLink: (url: string) => void;
}

export interface User {
  id: string; // telegram ID string
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  isPremium?: boolean;
  joinDate: string;
  rank: number;
  referralCode: string;
  referredBy?: string;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
}

export interface EnergyState {
  current: number;
  max: number;
  regenRatePerSec: number;
  lastUpdated: number;
}

export interface UserStats {
  balance: number; // in TAP
  todayEarned: number;
  totalTaps: number;
  totalEarned: number;
  totalWithdrawn: number;
  energy: EnergyState;
  tapMultiplier: number;
}

export type TaskCategory = 'all' | 'telegram' | 'social' | 'daily';
export type TaskStatus = 'available' | 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  rewardAmount: number;
  status: TaskStatus;
  actionUrl: string;
  iconType: 'telegram' | 'twitter' | 'youtube' | 'chat' | 'star' | 'flame' | 'shield';
  requiresBackendVerification: boolean;
  verificationTimerSeconds?: number;
  cooldownEndsAt?: number;
  completedAt?: string;
}

export interface Referral {
  id: string;
  telegramId: number;
  username: string;
  firstName: string;
  joinedAt: string;
  earnedFromUser: number;
  hasMadeTaps: boolean;
  isPremium: boolean;
}

export interface ReferralStats {
  totalInvited: number;
  successfulReferrals: number;
  referralEarnings: number;
  referralLink: string;
  bonusPerFriend: number;
  bonusPerPremiumFriend: number;
}

export interface LeaderboardEntry {
  rank: number;
  telegramId: number;
  username: string;
  firstName: string;
  tapEarned: number;
  avatarUrl?: string;
  isCurrentUser?: boolean;
  isPremium?: boolean;
}

export interface LeaderboardResponse {
  topUsers: LeaderboardEntry[];
  currentUser: LeaderboardEntry;
  totalParticipants: number;
  updatedAt: string;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  address: string;
  network: 'TON' | 'SOLANA' | 'BSC';
  status: WithdrawalStatus;
  createdAt: string;
  processedAt?: string;
  txHash?: string;
  rejectionReason?: string;
}

export interface DailyRewardDay {
  day: number;
  reward: number;
  status: 'claimed' | 'available' | 'locked';
}

export interface DailyRewardState {
  currentDay: number;
  consecutiveDays: number;
  days: DailyRewardDay[];
  isClaimableToday: boolean;
  nextClaimTime: number; // timestamp
}

export interface EarnMethod {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  rewardUnit?: string;
  icon: string;
  category: 'tap' | 'daily' | 'tasks' | 'friends' | 'bonus';
  actionText: string;
  status: 'available' | 'locked' | 'completed';
  targetTab?: NavTab;
}

export type NavTab = 'home' | 'earn' | 'tasks' | 'friends' | 'leaderboard' | 'wallet' | 'profile' | 'admin';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: number;
}

// Admin Panel Types
export interface AdminStats {
  totalUsers: number;
  activeToday: number;
  totalTapMinted: number;
  totalWithdrawn: number;
  pendingWithdrawalsCount: number;
  serverStatus: 'healthy' | 'maintenance' | 'degraded';
  cloudflareWorkerLatencyMs: number;
}

export interface AdminUser {
  id: string;
  telegramId: number;
  username: string;
  firstName: string;
  balance: number;
  status: 'active' | 'banned';
  joinedAt: string;
  totalTaps: number;
  referralCount: number;
  ipHash?: string;
}

export interface AdminWithdrawal extends WithdrawalRequest {
  username: string;
  firstName: string;
  userBalance: number;
}

export interface AdminTask {
  id: string;
  title: string;
  category: TaskCategory;
  rewardAmount: number;
  actionUrl: string;
  isActive: boolean;
  completionsCount: number;
}

export interface AdminActivityLog {
  id: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}
