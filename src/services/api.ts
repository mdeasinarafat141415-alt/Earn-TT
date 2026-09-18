/**
 * TT BOT - Centralized API Service Layer
 * 
 * Architecture:
 * Telegram Mini App (Frontend) -> Cloudflare Worker API -> Cloudflare D1 Database
 * 
 * In production, requests include:
 * - Authorization: Bearer <session_jwt>
 * - X-Telegram-Init-Data: <raw_init_data_for_hmac_sha256_validation>
 * 
 * ANTI-CHEAT ARCHITECTURE:
 * The frontend never calculates or trusts:
 * - Current balance
 * - Reward amounts
 * - Task completion verification
 * - Referral rewards
 * - Withdrawal approval
 * All mutations are server-authoritative.
 */

import {
  ApiResponse,
  EnergyState,
  LeaderboardResponse,
  ReferralStats,
  Referral,
  Task,
  User,
  WithdrawalRequest,
  DailyRewardState,
  AdminStats,
  AdminUser,
  AdminWithdrawal,
  AdminTask,
  AdminActivityLog,
} from '../types';
import { telegram } from './telegram';

// Base URL configured via environment variables (e.g., Cloudflare Worker endpoint)
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

let authToken: string | null = null;

// ==========================================
// In-Memory Server Simulation Adapter
// Used when VITE_API_BASE_URL is not set.
// Note: This does NOT use localStorage as source of truth.
// ==========================================
class ServerSimulationState {
  public user: User = {
    id: '748291045',
    telegramId: 748291045,
    firstName: telegram.getUser().user.first_name || 'Alex',
    lastName: telegram.getUser().user.last_name,
    username: telegram.getUser().user.username || 'alex_tapmaster',
    photoUrl: telegram.getUser().user.photo_url,
    isPremium: telegram.getUser().user.is_premium || true,
    joinDate: '2026-08-14T09:30:00.000Z',
    rank: 142,
    referralCode: 'TT748291',
    role: 'user',
    status: 'active',
  };

  public balance: number = 24850;
  public todayEarned: number = 3450;
  public totalTaps: number = 18240;
  public totalEarned: number = 32850;
  public totalWithdrawn: number = 8000;

  public energy: EnergyState = {
    current: 940,
    max: 1000,
    regenRatePerSec: 3,
    lastUpdated: Date.now(),
  };

  public tasks: Task[] = [
    {
      id: 'task_tg_channel',
      title: 'Join TT BOT Official Channel',
      description: 'Subscribe to our verified Telegram announcements channel for updates.',
      category: 'telegram',
      rewardAmount: 5000,
      status: 'available',
      actionUrl: 'https://t.me/TTBot_Announcements',
      iconType: 'telegram',
      requiresBackendVerification: true,
      verificationTimerSeconds: 15,
    },
    {
      id: 'task_tg_chat',
      title: 'Join Global Community Chat',
      description: 'Connect with over 250,000 active TAP holders worldwide.',
      category: 'telegram',
      rewardAmount: 3500,
      status: 'available',
      actionUrl: 'https://t.me/TTBot_Community',
      iconType: 'chat',
      requiresBackendVerification: true,
      verificationTimerSeconds: 15,
    },
    {
      id: 'task_twitter_follow',
      title: 'Follow TT BOT on X (Twitter)',
      description: 'Stay ahead with our tokenomics, airdrop dates, and roadmap drops.',
      category: 'social',
      rewardAmount: 4000,
      status: 'available',
      actionUrl: 'https://x.com/TTBot_TAP',
      iconType: 'twitter',
      requiresBackendVerification: true,
      verificationTimerSeconds: 20,
    },
    {
      id: 'task_youtube_sub',
      title: 'Subscribe to YouTube Ecosystem Channel',
      description: 'Watch tutorials on maximizing TAP earnings & TON wallet setup.',
      category: 'social',
      rewardAmount: 4500,
      status: 'available',
      actionUrl: 'https://youtube.com',
      iconType: 'youtube',
      requiresBackendVerification: true,
      verificationTimerSeconds: 20,
    },
    {
      id: 'task_daily_boost',
      title: 'Daily Tap Blitz (200 Taps)',
      description: 'Perform at least 200 taps today to unlock the energy overdrive bonus.',
      category: 'daily',
      rewardAmount: 2000,
      status: 'completed',
      actionUrl: '#',
      iconType: 'flame',
      requiresBackendVerification: true,
      completedAt: '2026-09-18T10:00:00Z',
    },
    {
      id: 'task_invite_first',
      title: 'Invite 1 Friend to TT BOT',
      description: 'Share your personal referral link and expand the network.',
      category: 'daily',
      rewardAmount: 2500,
      status: 'available',
      actionUrl: '#friends',
      iconType: 'star',
      requiresBackendVerification: true,
    },
  ];

  public withdrawals: WithdrawalRequest[] = [
    {
      id: 'w_001',
      userId: '748291045',
      amount: 8000,
      address: 'EQD...38k9aVw9L0m1_TON',
      network: 'TON',
      status: 'approved',
      createdAt: '2026-09-12T14:22:00.000Z',
      processedAt: '2026-09-12T15:00:00.000Z',
      txHash: '0x94f08e1a8b9e...29c4',
    },
  ];

  public referrals: Referral[] = [
    {
      id: 'ref_1',
      telegramId: 819230491,
      username: 'crypto_tony',
      firstName: 'Tony',
      joinedAt: '2026-09-15T18:40:00.000Z',
      earnedFromUser: 4500,
      hasMadeTaps: true,
      isPremium: true,
    },
    {
      id: 'ref_2',
      telegramId: 554902189,
      username: 'elena_web3',
      firstName: 'Elena',
      joinedAt: '2026-09-16T11:15:00.000Z',
      earnedFromUser: 3200,
      hasMadeTaps: true,
      isPremium: false,
    },
    {
      id: 'ref_3',
      telegramId: 910284732,
      username: 'marcus_k',
      firstName: 'Marcus',
      joinedAt: '2026-09-17T09:05:00.000Z',
      earnedFromUser: 1200,
      hasMadeTaps: true,
      isPremium: false,
    },
  ];

  public dailyReward: DailyRewardState = {
    currentDay: 4,
    consecutiveDays: 3,
    isClaimableToday: true,
    nextClaimTime: Date.now() + 86400000,
    days: [
      { day: 1, reward: 500, status: 'claimed' },
      { day: 2, reward: 1000, status: 'claimed' },
      { day: 3, reward: 2500, status: 'claimed' },
      { day: 4, reward: 5000, status: 'available' },
      { day: 5, reward: 10000, status: 'locked' },
      { day: 6, reward: 15000, status: 'locked' },
      { day: 7, reward: 25000, status: 'locked' },
    ],
  };

  // Admin Mock Database
  public adminStats: AdminStats = {
    totalUsers: 142980,
    activeToday: 38450,
    totalTapMinted: 1845020000,
    totalWithdrawn: 420950000,
    pendingWithdrawalsCount: 3,
    serverStatus: 'healthy',
    cloudflareWorkerLatencyMs: 24,
  };

  public adminUsers: AdminUser[] = [
    {
      id: '748291045',
      telegramId: 748291045,
      username: 'alex_tapmaster',
      firstName: 'Alex',
      balance: 24850,
      status: 'active',
      joinedAt: '2026-08-14T09:30:00.000Z',
      totalTaps: 18240,
      referralCount: 3,
    },
    {
      id: '994021890',
      telegramId: 994021890,
      username: 'whale_tapper',
      firstName: 'Dmitri',
      balance: 4892000,
      status: 'active',
      joinedAt: '2026-08-01T12:00:00.000Z',
      totalTaps: 412000,
      referralCount: 142,
    },
    {
      id: '109283741',
      telegramId: 109283741,
      username: 'bot_spammer_99',
      firstName: 'Suspicious',
      balance: 950000,
      status: 'banned',
      joinedAt: '2026-09-02T04:12:00.000Z',
      totalTaps: 850000,
      referralCount: 0,
    },
  ];

  public adminActivityLogs: AdminActivityLog[] = [
    {
      id: 'log_1',
      action: 'SYSTEM_BOOT',
      actor: 'Cloudflare Worker',
      details: 'Worker runtime initialized. D1 connection verified.',
      timestamp: '2026-09-18T00:00:00.000Z',
    },
    {
      id: 'log_2',
      action: 'WITHDRAWAL_PROCESSED',
      actor: 'Admin_Ops',
      details: 'Approved 8,000 TAP withdrawal to EQD...38k9aVw9L0m1_TON',
      timestamp: '2026-09-12T15:00:00.000Z',
    },
  ];

  public calculateRegeneratedEnergy(): EnergyState {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - this.energy.lastUpdated) / 1000);
    if (elapsedSeconds > 0 && this.energy.current < this.energy.max) {
      const regenerated = Math.min(
        this.energy.max,
        this.energy.current + elapsedSeconds * this.energy.regenRatePerSec
      );
      this.energy.current = regenerated;
      this.energy.lastUpdated = now;
    }
    return { ...this.energy };
  }
}

const mockDb = new ServerSimulationState();

// Utility for simulated network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generic request wrapper supporting both real Cloudflare Worker and fallback simulation
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  mockFallback: () => Promise<T>
): Promise<ApiResponse<T>> {
  const timestamp = Date.now();

  // If real Cloudflare Worker URL is specified, call it over HTTPS
  if (API_BASE_URL) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': telegram.getRawInitData(),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...((options.headers as Record<string, string>) || {}),
      };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const json = await res.json();
      return {
        success: res.ok && json.success !== false,
        data: json.data || json,
        error: json.error,
        code: json.code,
        timestamp,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to connect to Cloudflare Worker API',
        timestamp,
      };
    }
  }

  // Fallback to local server simulation
  try {
    await delay(180 + Math.random() * 120); // 180-300ms realistic network jitter
    const data = await mockFallback();
    return {
      success: true,
      data,
      timestamp,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Server error occurred',
      timestamp,
    };
  }
}

/**
 * Centralized TT BOT API Service
 */
export const api = {
  /**
   * 1. Authenticate with Telegram initData
   * The backend validates HMAC-SHA256 signature using the Bot Token (kept strictly on the server).
   */
  async auth(initData?: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const rawData = initData || telegram.getRawInitData();

    return request<{ user: User; token: string }>(
      '/api/auth',
      {
        method: 'POST',
        body: JSON.stringify({ initData: rawData }),
      },
      async () => {
        // Sync user info if telegram user is available
        const tgUser = telegram.getUser().user;
        mockDb.user.firstName = tgUser.first_name || mockDb.user.firstName;
        mockDb.user.lastName = tgUser.last_name;
        mockDb.user.username = tgUser.username || mockDb.user.username;
        mockDb.user.telegramId = tgUser.id || mockDb.user.telegramId;
        
        authToken = `jwt_sim_${mockDb.user.id}_${Date.now()}`;
        return {
          user: { ...mockDb.user },
          token: authToken,
        };
      }
    );
  },

  /**
   * 2. Fetch server-authoritative balance & energy
   */
  async getBalance(): Promise<
    ApiResponse<{
      balance: number;
      energy: EnergyState;
      todayEarned: number;
      totalTaps: number;
      totalEarned: number;
      totalWithdrawn: number;
    }>
  > {
    return request(
      '/api/balance',
      { method: 'GET' },
      async () => {
        const energy = mockDb.calculateRegeneratedEnergy();
        return {
          balance: mockDb.balance,
          energy,
          todayEarned: mockDb.todayEarned,
          totalTaps: mockDb.totalTaps,
          totalEarned: mockDb.totalEarned,
          totalWithdrawn: mockDb.totalWithdrawn,
        };
      }
    );
  },

  /**
   * 3. Send tap batch to backend
   * Server validates rate limits, energy drain, and anti-macro thresholds.
   */
  async tap(
    count: number,
    clientTimestamp: number = Date.now()
  ): Promise<
    ApiResponse<{
      balance: number;
      energy: EnergyState;
      added: number;
      serverTime: number;
    }>
  > {
    return request(
      '/api/tap',
      {
        method: 'POST',
        body: JSON.stringify({ count, clientTimestamp }),
      },
      async () => {
        const energy = mockDb.calculateRegeneratedEnergy();

        // Server-side validation: cannot tap without sufficient energy
        if (energy.current <= 0) {
          throw new Error('Energy depleted. Please wait for recharge.');
        }

        // Anti-cheat limit: max 20 taps per batch
        const sanitizedCount = Math.min(Math.max(1, count), 20, energy.current);
        const addedReward = sanitizedCount * 1; // 1 TAP per energy point

        // Server state mutation
        mockDb.energy.current = Math.max(0, energy.current - sanitizedCount);
        mockDb.energy.lastUpdated = Date.now();
        mockDb.balance += addedReward;
        mockDb.todayEarned += addedReward;
        mockDb.totalTaps += sanitizedCount;
        mockDb.totalEarned += addedReward;

        return {
          balance: mockDb.balance,
          energy: { ...mockDb.energy },
          added: addedReward,
          serverTime: Date.now(),
        };
      }
    );
  },

  /**
   * 4. Fetch list of tasks with server verification statuses
   */
  async getTasks(): Promise<ApiResponse<{ tasks: Task[] }>> {
    return request(
      '/api/tasks',
      { method: 'GET' },
      async () => {
        return {
          tasks: [...mockDb.tasks],
        };
      }
    );
  },

  /**
   * 5. Request backend task verification
   * CRITICAL REQUIREMENT:
   * "Task verification must later be performed by the backend.
   * The frontend must never decide that a Telegram task is completed."
   */
  async verifyTask(taskId: string): Promise<
    ApiResponse<{
      task: Task;
      rewardClaimed: boolean;
      newBalance: number;
      verificationPending?: boolean;
    }>
  > {
    return request(
      `/api/tasks/${taskId}/verify`,
      { method: 'POST' },
      async () => {
        const task = mockDb.tasks.find((t) => t.id === taskId);
        if (!task) {
          throw new Error('Task not found');
        }

        if (task.status === 'completed') {
          throw new Error('Task already completed and rewarded');
        }

        // If task is still 'available', start verification on server and transition to 'pending'
        if (task.status === 'available') {
          task.status = 'pending';
          task.cooldownEndsAt = Date.now() + (task.verificationTimerSeconds || 15) * 1000;

          return {
            task: { ...task },
            rewardClaimed: false,
            newBalance: mockDb.balance,
            verificationPending: true,
          };
        }

        // If task is 'pending', check if backend verification condition has passed
        if (task.status === 'pending') {
          const isReady = task.cooldownEndsAt && Date.now() >= task.cooldownEndsAt;
          if (!isReady) {
            const remaining = Math.ceil(((task.cooldownEndsAt || Date.now()) - Date.now()) / 1000);
            throw new Error(`Server verification in progress. Please wait ${remaining}s.`);
          }

          // Backend validates membership/social action
          task.status = 'completed';
          task.completedAt = new Date().toISOString();
          mockDb.balance += task.rewardAmount;
          mockDb.todayEarned += task.rewardAmount;
          mockDb.totalEarned += task.rewardAmount;

          return {
            task: { ...task },
            rewardClaimed: true,
            newBalance: mockDb.balance,
          };
        }

        return {
          task: { ...task },
          rewardClaimed: false,
          newBalance: mockDb.balance,
        };
      }
    );
  },

  /**
   * 6. Fetch referral stats & invited users
   */
  async getReferrals(): Promise<ApiResponse<{ stats: ReferralStats; list: Referral[] }>> {
    return request(
      '/api/referrals',
      { method: 'GET' },
      async () => {
        const stats: ReferralStats = {
          totalInvited: mockDb.referrals.length,
          successfulReferrals: mockDb.referrals.filter((r) => r.hasMadeTaps).length,
          referralEarnings: mockDb.referrals.reduce((sum, r) => sum + r.earnedFromUser, 0),
          referralLink: `https://t.me/TTBot_official_bot?start=ref_${mockDb.user.referralCode}`,
          bonusPerFriend: 2500,
          bonusPerPremiumFriend: 7500,
        };

        return {
          stats,
          list: [...mockDb.referrals],
        };
      }
    );
  },

  /**
   * 7. Fetch global leaderboard
   */
  async getLeaderboard(
    period: 'all' | 'weekly' = 'all',
    page: number = 1
  ): Promise<ApiResponse<LeaderboardResponse>> {
    return request(
      `/api/leaderboard?period=${period}&page=${page}`,
      { method: 'GET' },
      async () => {
        const topUsers = [
          { rank: 1, telegramId: 1001, username: 'satoshi_ton', firstName: 'Satoshi', tapEarned: 8492000, isPremium: true },
          { rank: 2, telegramId: 1002, username: 'cyber_king', firstName: 'Dmitri', tapEarned: 6120000, isPremium: true },
          { rank: 3, telegramId: 1003, username: 'tap_queen', firstName: 'Valeria', tapEarned: 4980500, isPremium: false },
          { rank: 4, telegramId: 1004, username: 'neon_rider', firstName: 'Kai', tapEarned: 3820000, isPremium: true },
          { rank: 5, telegramId: 1005, username: 'crypto_eagle', firstName: 'Arthur', tapEarned: 3240000, isPremium: false },
          { rank: 6, telegramId: 1006, username: 'ton_runner', firstName: 'Ivan', tapEarned: 2950000, isPremium: true },
          { rank: 7, telegramId: 1007, username: 'tap_titan', firstName: 'Elena', tapEarned: 2430000, isPremium: false },
          { rank: 8, telegramId: 1008, username: 'matrix_flow', firstName: 'Leo', tapEarned: 1980000, isPremium: true },
          { rank: 9, telegramId: 1009, username: 'alpha_tapper', firstName: 'Zoe', tapEarned: 1650000, isPremium: false },
          { rank: 10, telegramId: 1010, username: 'quantum_sol', firstName: 'Nate', tapEarned: 1420000, isPremium: true },
        ];

        return {
          topUsers,
          currentUser: {
            rank: mockDb.user.rank,
            telegramId: mockDb.user.telegramId,
            username: mockDb.user.username || 'alex_tapmaster',
            firstName: mockDb.user.firstName,
            tapEarned: mockDb.totalEarned,
            isCurrentUser: true,
            isPremium: mockDb.user.isPremium,
          },
          totalParticipants: 142980,
          updatedAt: new Date().toISOString(),
        };
      }
    );
  },

  /**
   * 8. Request token withdrawal
   * CRITICAL REQUIREMENT:
   * "Withdrawal must later be processed only by the backend.
   * Never trust a balance sent from the frontend."
   */
  async requestWithdrawal(
    amount: number,
    address: string,
    network: 'TON' | 'SOLANA' | 'BSC'
  ): Promise<ApiResponse<WithdrawalRequest>> {
    return request(
      '/api/withdrawals',
      {
        method: 'POST',
        body: JSON.stringify({ amount, address, network }),
      },
      async () => {
        const MIN_WITHDRAWAL = 20000;

        if (amount < MIN_WITHDRAWAL) {
          throw new Error(`Minimum withdrawal is ${MIN_WITHDRAWAL.toLocaleString()} TAP.`);
        }

        if (!address || address.trim().length < 10) {
          throw new Error('Please enter a valid wallet address.');
        }

        // Server checks user balance in database
        if (mockDb.balance < amount) {
          throw new Error(`Insufficient TAP balance on server. Available: ${mockDb.balance.toLocaleString()} TAP`);
        }

        // Deduct from server balance and create pending request
        mockDb.balance -= amount;
        mockDb.totalWithdrawn += amount;

        const newReq: WithdrawalRequest = {
          id: `w_${Date.now()}`,
          userId: mockDb.user.id,
          amount,
          address: address.trim(),
          network,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        mockDb.withdrawals.unshift(newReq);
        mockDb.adminStats.pendingWithdrawalsCount += 1;

        return newReq;
      }
    );
  },

  /**
   * 9. Fetch withdrawal history
   */
  async getWithdrawals(): Promise<ApiResponse<WithdrawalRequest[]>> {
    return request(
      '/api/withdrawals',
      { method: 'GET' },
      async () => {
        return [...mockDb.withdrawals];
      }
    );
  },

  /**
   * 10. Daily reward check-in
   */
  async getDailyRewardStatus(): Promise<ApiResponse<DailyRewardState>> {
    return request(
      '/api/daily-reward',
      { method: 'GET' },
      async () => {
        return { ...mockDb.dailyReward };
      }
    );
  },

  async claimDailyReward(): Promise<
    ApiResponse<{
      day: number;
      reward: number;
      newBalance: number;
      nextClaimAt: number;
    }>
  > {
    return request(
      '/api/daily-reward/claim',
      { method: 'POST' },
      async () => {
        if (!mockDb.dailyReward.isClaimableToday) {
          throw new Error('Daily reward already claimed today. Next reward unlocks tomorrow.');
        }

        const currentDayIndex = mockDb.dailyReward.currentDay - 1;
        const currentRewardObj = mockDb.dailyReward.days[currentDayIndex];
        const rewardAmount = currentRewardObj ? currentRewardObj.reward : 5000;

        if (currentRewardObj) {
          currentRewardObj.status = 'claimed';
        }

        mockDb.dailyReward.isClaimableToday = false;
        mockDb.dailyReward.consecutiveDays += 1;
        mockDb.dailyReward.nextClaimTime = Date.now() + 86400000; // 24 hours

        mockDb.balance += rewardAmount;
        mockDb.todayEarned += rewardAmount;
        mockDb.totalEarned += rewardAmount;

        return {
          day: mockDb.dailyReward.currentDay,
          reward: rewardAmount,
          newBalance: mockDb.balance,
          nextClaimAt: mockDb.dailyReward.nextClaimTime,
        };
      }
    );
  },

  // ==========================================
  // Admin Panel API Preparation
  // ==========================================
  admin: {
    async getDashboard(): Promise<ApiResponse<AdminStats>> {
      return request(
        '/api/admin/dashboard',
        { method: 'GET' },
        async () => {
          return { ...mockDb.adminStats };
        }
      );
    },

    async getUsers(search?: string): Promise<ApiResponse<AdminUser[]>> {
      return request(
        `/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`,
        { method: 'GET' },
        async () => {
          if (!search) return [...mockDb.adminUsers];
          const query = search.toLowerCase();
          return mockDb.adminUsers.filter(
            (u) =>
              u.username.toLowerCase().includes(query) ||
              u.firstName.toLowerCase().includes(query) ||
              u.telegramId.toString().includes(query)
          );
        }
      );
    },

    async updateUserStatus(
      userId: string,
      action: 'ban' | 'unban' | 'adjust_balance',
      amount?: number
    ): Promise<ApiResponse<AdminUser>> {
      return request(
        `/api/admin/users/${userId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ action, amount }),
        },
        async () => {
          const user = mockDb.adminUsers.find((u) => u.id === userId);
          if (!user) throw new Error('User not found in admin records');

          if (action === 'ban') {
            user.status = 'banned';
            mockDb.adminActivityLogs.unshift({
              id: `log_${Date.now()}`,
              action: 'USER_BANNED',
              actor: 'Admin',
              details: `User ${user.username} (${user.telegramId}) was banned.`,
              timestamp: new Date().toISOString(),
            });
          } else if (action === 'unban') {
            user.status = 'active';
            mockDb.adminActivityLogs.unshift({
              id: `log_${Date.now()}`,
              action: 'USER_UNBANNED',
              actor: 'Admin',
              details: `User ${user.username} (${user.telegramId}) was unbanned.`,
              timestamp: new Date().toISOString(),
            });
          } else if (action === 'adjust_balance' && typeof amount === 'number') {
            user.balance = Math.max(0, user.balance + amount);
            if (userId === mockDb.user.id) {
              mockDb.balance = user.balance;
            }
            mockDb.adminActivityLogs.unshift({
              id: `log_${Date.now()}`,
              action: 'BALANCE_ADJUSTED',
              actor: 'Admin',
              details: `Adjusted balance for ${user.username} by ${amount > 0 ? '+' : ''}${amount} TAP`,
              timestamp: new Date().toISOString(),
            });
          }

          return { ...user };
        }
      );
    },

    async getWithdrawals(): Promise<ApiResponse<AdminWithdrawal[]>> {
      return request(
        '/api/admin/withdrawals',
        { method: 'GET' },
        async () => {
          return mockDb.withdrawals.map((w) => ({
            ...w,
            username: mockDb.user.username || 'alex_tapmaster',
            firstName: mockDb.user.firstName,
            userBalance: mockDb.balance,
          }));
        }
      );
    },

    async reviewWithdrawal(
      id: string,
      status: 'approved' | 'rejected',
      note?: string
    ): Promise<ApiResponse<WithdrawalRequest>> {
      return request(
        `/api/admin/withdrawals/${id}`,
        {
          method: 'POST',
          body: JSON.stringify({ status, note }),
        },
        async () => {
          const item = mockDb.withdrawals.find((w) => w.id === id);
          if (!item) throw new Error('Withdrawal request not found');

          item.status = status;
          item.processedAt = new Date().toISOString();

          if (status === 'approved') {
            item.txHash = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
            mockDb.adminStats.pendingWithdrawalsCount = Math.max(0, mockDb.adminStats.pendingWithdrawalsCount - 1);
          } else {
            item.rejectionReason = note || 'Security compliance check failed';
            // Refund to user balance
            mockDb.balance += item.amount;
            mockDb.totalWithdrawn -= item.amount;
            mockDb.adminStats.pendingWithdrawalsCount = Math.max(0, mockDb.adminStats.pendingWithdrawalsCount - 1);
          }

          mockDb.adminActivityLogs.unshift({
            id: `log_${Date.now()}`,
            action: `WITHDRAWAL_${status.toUpperCase()}`,
            actor: 'Admin',
            details: `Withdrawal ${id} (${item.amount} TAP) ${status}. ${note ? `Note: ${note}` : ''}`,
            timestamp: new Date().toISOString(),
          });

          return { ...item };
        }
      );
    },

    async getTasks(): Promise<ApiResponse<AdminTask[]>> {
      return request(
        '/api/admin/tasks',
        { method: 'GET' },
        async () => {
          return mockDb.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            category: t.category,
            rewardAmount: t.rewardAmount,
            actionUrl: t.actionUrl,
            isActive: true,
            completionsCount: t.status === 'completed' ? 1420 : 890,
          }));
        }
      );
    },

    async getLogs(): Promise<ApiResponse<AdminActivityLog[]>> {
      return request(
        '/api/admin/logs',
        { method: 'GET' },
        async () => {
          return [...mockDb.adminActivityLogs];
        }
      );
    },
  },
};
