import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DailyRewardDay } from '../types';
import {
  Gift,
  Zap,
  Users,
  CheckSquare,
  Sparkles,
  ShieldCheck,
  Flame,
  ArrowRight,
  Check,
  Lock,
} from 'lucide-react';
import { motion } from 'motion/react';

interface EarnItem {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  rewardAmount: number;
  rewardUnit?: string;
  status: 'available' | 'claimed' | 'active' | 'locked';
  actionLabel: string;
  category: 'daily' | 'boost' | 'tasks' | 'referrals' | 'bonus';
  onClick: () => void;
}

export const EarnPage: React.FC = () => {
  const {
    dailyReward,
    claimDailyReward,
    setActiveTab,
    showToast,
    balance,
  } = useApp();

  const [activeTabFilter, setActiveTabFilter] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const earnItems: EarnItem[] = [
    {
      id: 'daily_login',
      icon: Gift,
      iconColor: 'text-[#00F0FF]',
      iconBg: 'bg-[#00F0FF]/15 border-[#00F0FF]/30',
      title: 'Daily Streak Check-In',
      description: 'Log in daily to claim escalating TAP rewards. Reset after 7 consecutive days.',
      rewardAmount: dailyReward?.days.find((d: DailyRewardDay) => d.day === dailyReward.currentDay)?.reward || 5000,
      status: dailyReward?.isClaimableToday ? 'available' : 'claimed',
      actionLabel: dailyReward?.isClaimableToday ? 'Claim Now' : 'Claimed Today',
      category: 'daily',
      onClick: async () => {
        if (!dailyReward?.isClaimableToday) {
          showToast('Already claimed today. Next reward unlocks tomorrow!', 'info');
          return;
        }
        setIsProcessing('daily_login');
        await claimDailyReward();
        setIsProcessing(null);
      },
    },
    {
      id: 'telegram_channel_quest',
      icon: CheckSquare,
      iconColor: 'text-[#38BDF8]',
      iconBg: 'bg-[#38BDF8]/15 border-[#38BDF8]/30',
      title: 'Official Channel Subscription',
      description: 'Join the verified announcements channel. Verified server-side via Bot API.',
      rewardAmount: 5000,
      status: 'available',
      actionLabel: 'Verify Quest',
      category: 'tasks',
      onClick: () => setActiveTab('tasks'),
    },
    {
      id: 'social_follow_quest',
      icon: Sparkles,
      iconColor: 'text-[#A855F7]',
      iconBg: 'bg-[#A855F7]/15 border-[#A855F7]/30',
      title: 'Follow on X (Twitter)',
      description: 'Connect with our social media community for airdrop alerts.',
      rewardAmount: 4000,
      status: 'available',
      actionLabel: 'Start Quest',
      category: 'tasks',
      onClick: () => setActiveTab('tasks'),
    },
    {
      id: 'referral_invite',
      icon: Users,
      iconColor: 'text-[#FFB800]',
      iconBg: 'bg-[#FFB800]/15 border-[#FFB800]/30',
      title: 'Invite Telegram Friends',
      description: 'Get +2,500 TAP for each standard friend and +7,500 TAP for Telegram Premium friends.',
      rewardAmount: 2500,
      status: 'available',
      actionLabel: 'Invite Link',
      category: 'referrals',
      onClick: () => setActiveTab('friends'),
    },
    {
      id: 'tap_overdrive_boost',
      icon: Flame,
      iconColor: 'text-[#FF3366]',
      iconBg: 'bg-[#FF3366]/15 border-[#FF3366]/30',
      title: 'Energy Overdrive Boost',
      description: 'Instantly restore +500 energy points to continue tapping without waiting.',
      rewardAmount: 500,
      rewardUnit: 'Energy',
      status: 'available',
      actionLabel: 'Activate Boost',
      category: 'boost',
      onClick: () => {
        showToast('Overdrive active! Energy +500 recharged.', 'success');
      },
    },
    {
      id: 'community_milestone',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      title: 'Genesis Miner Badge Bonus',
      description: 'Early adopter bonus for participating in Phase 1 TT BOT distribution.',
      rewardAmount: 10000,
      status: 'locked',
      actionLabel: 'Unlocks at Lv 5',
      category: 'bonus',
      onClick: () => {
        showToast('Genesis Badge unlocks when you reach Level 5 rank!', 'warning');
      },
    },
  ];

  const filteredItems = activeTabFilter === 'all'
    ? earnItems
    : earnItems.filter((i) => i.category === activeTabFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center w-full px-4 pt-3 pb-24 max-w-md mx-auto"
    >
      {/* Page Title & Balance Header */}
      <div className="w-full mb-4 text-center">
        <h2 className="text-xl font-black text-white tracking-tight">
          Earn Opportunities
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Multiply your TAP holdings with verified tasks, daily check-ins, and bonuses.
        </p>

        <div className="mt-3 p-3 rounded-2xl glass-panel border border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-left">
            <div className="p-2 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF]">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                Current Earnings Balance
              </span>
              <span className="text-base font-black font-mono text-white">
                {balance.toLocaleString()} TAP
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('wallet')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-[#00F0FF] border border-[#00F0FF]/30 transition-colors flex items-center space-x-1"
          >
            <span>Wallet</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="w-full flex space-x-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none">
        {['all', 'daily', 'tasks', 'referrals', 'boost'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTabFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all border ${
              activeTabFilter === tab
                ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white'
            }`}
          >
            {tab === 'all' ? 'All Opportunities' : tab}
          </button>
        ))}
      </div>

      {/* Earning Items List */}
      <div className="w-full space-x-0 space-y-2.5">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isClaimed = item.status === 'claimed';
          const isLocked = item.status === 'locked';

          return (
            <div
              key={item.id}
              className={`glass-card p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isClaimed
                  ? 'opacity-70 border-white/5'
                  : isLocked
                  ? 'border-white/5 opacity-80'
                  : 'border-white/[0.08] hover:border-[#00F0FF]/30 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${item.iconBg} ${item.iconColor}`}>
                    <Icon size={20} />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {item.title}
                      </h3>
                      {isClaimed && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10">
                          Claimed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Reward amount & Action button */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
                <div className="flex items-baseline space-x-1">
                  <span className="text-sm font-black font-mono text-[#00F0FF]">
                    +{item.rewardAmount.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-bold font-mono text-[#FFB800]">
                    {item.rewardUnit || 'TAP'}
                  </span>
                </div>

                <button
                  onClick={item.onClick}
                  disabled={isClaimed || isProcessing === item.id}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    isClaimed
                      ? 'bg-white/5 text-neutral-400 border border-white/10 cursor-not-allowed'
                      : isLocked
                      ? 'bg-neutral-800/80 text-neutral-400 border border-neutral-700'
                      : 'bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#07090E] hover:opacity-90 active:scale-95 shadow-[0_2px_10px_rgba(0,240,255,0.25)]'
                  }`}
                >
                  {isProcessing === item.id ? (
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isClaimed ? (
                    <>
                      <Check size={13} />
                      <span>{item.actionLabel}</span>
                    </>
                  ) : isLocked ? (
                    <>
                      <Lock size={13} />
                      <span>{item.actionLabel}</span>
                    </>
                  ) : (
                    <>
                      <span>{item.actionLabel}</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
