/**
 * TT BOT - Global Application State Context
 * Handles server synchronization, optimistic visual tap updates, energy regeneration,
 * haptics, and toast notifications.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { EnergyState, NavTab, User, DailyRewardState } from '../types';
import { api } from '../services/api';
import { telegram } from '../services/telegram';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  user: User | null;
  balance: number;
  energy: EnergyState;
  todayEarned: number;
  totalTaps: number;
  totalEarned: number;
  totalWithdrawn: number;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  clearToast: () => void;
  dailyReward: DailyRewardState | null;
  performTap: (count?: number) => Promise<{ success: boolean; added: number }>;
  refreshData: () => Promise<void>;
  claimDailyReward: () => Promise<boolean>;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (val: boolean) => void;
  isSimulatedUser: boolean;
}

const defaultEnergy: EnergyState = {
  current: 1000,
  max: 1000,
  regenRatePerSec: 3,
  lastUpdated: Date.now(),
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [energy, setEnergy] = useState<EnergyState>(defaultEnergy);
  const [todayEarned, setTodayEarned] = useState<number>(0);
  const [totalTaps, setTotalTaps] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(0);
  const [activeTab, setActiveTabState] = useState<NavTab>('home');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [dailyReward, setDailyReward] = useState<DailyRewardState | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);

  const isSimulatedUser = !telegram.isRunningInTelegram();

  // Tap batching ref to batch rapid taps before sending to server
  const pendingTapsRef = useRef<number>(0);
  const tapTimeoutRef = useRef<any>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, message, type });

    if (hapticsEnabled) {
      if (type === 'success') telegram.triggerHaptic('success');
      else if (type === 'error') telegram.triggerHaptic('error');
      else if (type === 'warning') telegram.triggerHaptic('warning');
    }
  }, [hapticsEnabled]);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const setActiveTab = useCallback((tab: NavTab) => {
    setActiveTabState(tab);
    if (hapticsEnabled) {
      telegram.triggerHaptic('selection');
    }
  }, [hapticsEnabled]);

  // Initial load & authentication
  const initApp = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Authenticate with Telegram data
      const authRes = await api.auth();
      if (!authRes.success || !authRes.data) {
        throw new Error(authRes.error || 'Authentication failed');
      }
      setUser(authRes.data.user);

      // 2. Fetch server balance & energy
      const balanceRes = await api.getBalance();
      if (balanceRes.success && balanceRes.data) {
        setBalance(balanceRes.data.balance);
        setEnergy(balanceRes.data.energy);
        setTodayEarned(balanceRes.data.todayEarned);
        setTotalTaps(balanceRes.data.totalTaps);
        setTotalEarned(balanceRes.data.totalEarned);
        setTotalWithdrawn(balanceRes.data.totalWithdrawn);
      }

      // 3. Fetch daily reward status
      const dailyRes = await api.getDailyRewardStatus();
      if (dailyRes.success && dailyRes.data) {
        setDailyReward(dailyRes.data);
      }
    } catch (err: any) {
      console.error('Init app error:', err);
      setError(err.message || 'Failed to initialize TT BOT');
      showToast(err.message || 'Initialization error', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    initApp();
  }, [initApp]);

  // Client-side smooth energy regeneration ticker (ticks every 1s)
  useEffect(() => {
    const timer = setInterval(() => {
      setEnergy((prev) => {
        if (prev.current >= prev.max) return prev;
        const regenerated = Math.min(prev.max, prev.current + prev.regenRatePerSec);
        return {
          ...prev,
          current: regenerated,
          lastUpdated: Date.now(),
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Sync with backend every 25 seconds
  const refreshData = useCallback(async () => {
    try {
      setIsSyncing(true);
      const balanceRes = await api.getBalance();
      if (balanceRes.success && balanceRes.data) {
        setBalance(balanceRes.data.balance);
        setEnergy(balanceRes.data.energy);
        setTodayEarned(balanceRes.data.todayEarned);
        setTotalTaps(balanceRes.data.totalTaps);
        setTotalEarned(balanceRes.data.totalEarned);
        setTotalWithdrawn(balanceRes.data.totalWithdrawn);
      }

      const dailyRes = await api.getDailyRewardStatus();
      if (dailyRes.success && dailyRes.data) {
        setDailyReward(dailyRes.data);
      }
    } catch (err) {
      console.error('Data refresh error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Tap handler: optimistically updates UI, then flushes batch to backend
  const flushTapsToServer = useCallback(async () => {
    const countToFlush = pendingTapsRef.current;
    if (countToFlush <= 0) return;

    pendingTapsRef.current = 0;

    try {
      const res = await api.tap(countToFlush);
      if (res.success && res.data) {
        // Authoritative reconciliation from server
        setBalance(res.data.balance);
        setEnergy(res.data.energy);
      } else {
        // Rollback or notify on anti-cheat refusal
        if (res.error) {
          showToast(res.error, 'warning');
        }
        await refreshData();
      }
    } catch (err: any) {
      console.error('Failed to sync taps with server:', err);
      await refreshData();
    }
  }, [refreshData, showToast]);

  const performTap = useCallback(
    async (count: number = 1): Promise<{ success: boolean; added: number }> => {
      // Check energy first
      if (energy.current < count) {
        if (hapticsEnabled) telegram.triggerHaptic('warning');
        showToast('Energy depleted! Wait for recharge.', 'warning');
        return { success: false, added: 0 };
      }

      // 1. Optimistic UI update
      setEnergy((prev) => ({
        ...prev,
        current: Math.max(0, prev.current - count),
        lastUpdated: Date.now(),
      }));
      setBalance((prev) => prev + count);
      setTodayEarned((prev) => prev + count);
      setTotalTaps((prev) => prev + count);

      // 2. Trigger Haptic
      if (hapticsEnabled) {
        telegram.triggerHaptic('medium');
      }

      // 3. Queue tap to debounce rapid clicks (flushes after 350ms of quiet or every 10 taps)
      pendingTapsRef.current += count;

      if (pendingTapsRef.current >= 10) {
        clearTimeout(tapTimeoutRef.current);
        flushTapsToServer();
      } else {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = setTimeout(() => {
          flushTapsToServer();
        }, 350);
      }

      return { success: true, added: count };
    },
    [energy.current, hapticsEnabled, showToast, flushTapsToServer]
  );

  const claimDailyReward = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await api.claimDailyReward();
      if (res.success && res.data) {
        setBalance(res.data.newBalance);
        showToast(`Day ${res.data.day} reward claimed: +${res.data.reward.toLocaleString()} TAP!`, 'success');
        
        // Refresh daily reward state
        const dailyRes = await api.getDailyRewardStatus();
        if (dailyRes.success && dailyRes.data) {
          setDailyReward(dailyRes.data);
        }
        return true;
      } else {
        showToast(res.error || 'Failed to claim daily reward', 'error');
        return false;
      }
    } catch (err: any) {
      showToast(err.message || 'Reward claim error', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        user,
        balance,
        energy,
        todayEarned,
        totalTaps,
        totalEarned,
        totalWithdrawn,
        activeTab,
        setActiveTab,
        isLoading,
        isSyncing,
        error,
        toast,
        showToast,
        clearToast,
        dailyReward,
        performTap,
        refreshData,
        claimDailyReward,
        soundEnabled,
        setSoundEnabled,
        hapticsEnabled,
        setHapticsEnabled,
        isSimulatedUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
