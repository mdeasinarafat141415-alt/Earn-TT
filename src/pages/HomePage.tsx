import React from 'react';
import { useApp } from '../context/AppContext';
import { TapCoin } from '../components/home/TapCoin';
import { EnergyBar } from '../components/home/EnergyBar';
import { DailyRewardCard } from '../components/home/DailyRewardCard';
import { QuickNavCards } from '../components/home/QuickNavCards';
import { Flame, TrendingUp, Award } from 'lucide-react';
import { motion } from 'motion/react';

export const HomePage: React.FC = () => {
  const { user, balance, todayEarned, totalTaps } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center w-full pb-20"
    >
      {/* User greeting & Balance Banner */}
      <div className="w-full px-4 pt-3 max-w-md mx-auto text-center">
        <div className="flex items-center justify-center space-x-1.5 text-xs text-neutral-400 mb-1 font-medium">
          <span>Welcome back,</span>
          <span className="text-white font-bold">{user?.firstName || 'Tapper'}</span>
        </div>

        {/* Huge TAP Balance Display */}
        <div className="relative inline-flex flex-col items-center my-1">
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-b from-white via-[#E0F7FA] to-[#00F0FF] drop-shadow-[0_2px_15px_rgba(0,240,255,0.4)]">
              {balance.toLocaleString()}
            </span>
            <span className="text-lg font-black tracking-wider text-[#FFB800] uppercase font-mono">
              TAP
            </span>
          </div>

          <div className="flex items-center space-x-1 mt-0.5 text-[11px] font-medium text-[#00F0FF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-ping" />
            <span>Live Token Balance</span>
          </div>
        </div>

        {/* Stats strip: Today's earnings & Total taps */}
        <div className="grid grid-cols-2 gap-2 mt-3 mb-2 max-w-sm mx-auto">
          <div className="glass-card px-3 py-2 rounded-xl border border-white/5 flex items-center space-x-2.5 text-left">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <TrendingUp size={14} />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase font-medium">
                Today's Earn
              </span>
              <span className="text-xs font-bold font-mono text-white">
                +{todayEarned.toLocaleString()} TAP
              </span>
            </div>
          </div>

          <div className="glass-card px-3 py-2 rounded-xl border border-white/5 flex items-center space-x-2.5 text-left">
            <div className="p-1.5 rounded-lg bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/20">
              <Flame size={14} />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase font-medium">
                Total Taps
              </span>
              <span className="text-xs font-bold font-mono text-white">
                {totalTaps.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Central Interactive Tap Coin */}
      <TapCoin />

      {/* Energy System UI */}
      <EnergyBar />

      {/* Daily Reward Card */}
      <DailyRewardCard />

      {/* Quick Navigation Cards */}
      <QuickNavCards />
    </motion.div>
  );
};
