import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { telegram } from '../services/telegram';
import {
  User,
  Shield,
  Copy,
  Check,
  Calendar,
  Award,
  Users,
  Flame,
  Wallet,
  TrendingUp,
  Cpu,
  Smartphone,
  ExternalLink,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { motion } from 'motion/react';

export const ProfilePage: React.FC = () => {
  const {
    user,
    balance,
    totalTaps,
    totalEarned,
    totalWithdrawn,
    showToast,
    soundEnabled,
    setSoundEnabled,
    hapticsEnabled,
    setHapticsEnabled,
  } = useApp();

  const [copiedId, setCopiedId] = useState(false);

  const tgData = telegram.getUser();
  const webApp = telegram.getWebApp();

  const handleCopyId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.telegramId.toString());
    setCopiedId(true);
    showToast('Telegram User ID copied!', 'success');
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center w-full px-4 pt-3 pb-24 max-w-md mx-auto"
    >
      {/* Page Header */}
      <div className="w-full text-center mb-3">
        <h2 className="text-xl font-black text-white tracking-tight">
          Telegram Profile
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Verified Telegram Mini App session details and mining stats.
        </p>
      </div>

      {/* Main Profile Identity Card */}
      <div className="w-full glass-card p-4 rounded-2xl border border-white/[0.08] shadow-lg mb-3 text-center relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00F0FF] via-[#7928CA] to-[#FFB800]" />

        {/* Avatar */}
        <div className="relative w-16 h-16 mx-auto mb-2.5 rounded-full bg-gradient-to-tr from-[#00F0FF] to-[#7928CA] p-0.5 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
          <div className="w-full h-full rounded-full bg-[#0E1322] flex items-center justify-center text-xl font-black text-white font-mono">
            {user?.firstName?.charAt(0) || 'T'}
          </div>
          {user?.isPremium && (
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FFB800] text-[#07090E] flex items-center justify-center text-xs font-bold shadow-md"
              title="Telegram Premium Member"
            >
              ★
            </div>
          )}
        </div>

        {/* User Names */}
        <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-center space-x-1.5">
          <span>{user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Anonymous User'}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Active
          </span>
        </h3>

        <span className="text-xs font-mono text-[#00F0FF] block mt-0.5">
          @{user?.username || 'tap_miner'}
        </span>

        {/* Telegram ID with Copy Button */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 mt-2.5 text-xs font-mono text-neutral-300">
          <span>ID: {user?.telegramId || '748291045'}</span>
          <button
            onClick={handleCopyId}
            className="text-neutral-400 hover:text-white transition-colors"
            title="Copy ID"
          >
            {copiedId ? (
              <Check size={13} className="text-emerald-400" />
            ) : (
              <Copy size={13} />
            )}
          </button>
        </div>

        {/* Join Date */}
        <div className="flex items-center justify-center space-x-1 text-[11px] text-neutral-400 mt-2">
          <Calendar size={12} />
          <span>Member since: {user ? new Date(user.joinDate).toLocaleDateString() : 'August 2026'}</span>
        </div>
      </div>

      {/* Account Statistics Grid */}
      <div className="w-full mb-3">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2 px-1">
          Account Performance
        </span>

        <div className="grid grid-cols-2 gap-2">
          <div className="glass-card p-3 rounded-xl border border-white/5 text-left">
            <div className="flex items-center space-x-2 text-neutral-400 text-xs mb-1">
              <Wallet size={14} className="text-[#00F0FF]" />
              <span>TAP Balance</span>
            </div>
            <span className="text-base font-black font-mono text-white block">
              {balance.toLocaleString()}
            </span>
          </div>

          <div className="glass-card p-3 rounded-xl border border-white/5 text-left">
            <div className="flex items-center space-x-2 text-neutral-400 text-xs mb-1">
              <Flame size={14} className="text-[#FFB800]" />
              <span>Total Taps</span>
            </div>
            <span className="text-base font-black font-mono text-white block">
              {totalTaps.toLocaleString()}
            </span>
          </div>

          <div className="glass-card p-3 rounded-xl border border-white/5 text-left">
            <div className="flex items-center space-x-2 text-neutral-400 text-xs mb-1">
              <Users size={14} className="text-[#A855F7]" />
              <span>Invited Friends</span>
            </div>
            <span className="text-base font-black font-mono text-white block">
              3 Friends
            </span>
          </div>

          <div className="glass-card p-3 rounded-xl border border-white/5 text-left">
            <div className="flex items-center space-x-2 text-neutral-400 text-xs mb-1">
              <Award size={14} className="text-emerald-400" />
              <span>Global Rank</span>
            </div>
            <span className="text-base font-black font-mono text-white block">
              #{user?.rank || 142}
            </span>
          </div>
        </div>
      </div>

      {/* Settings & Feedback Preferences */}
      <div className="w-full glass-card p-3.5 rounded-2xl border border-white/5 mb-3">
        <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2.5">
          App Preferences
        </span>

        <div className="flex items-center justify-between py-1.5 border-b border-white/5">
          <div className="flex items-center space-x-2 text-xs text-neutral-300">
            <Volume2 size={15} className="text-[#00F0FF]" />
            <span>Haptic Feedback</span>
          </div>
          <button
            onClick={() => setHapticsEnabled(!hapticsEnabled)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
              hapticsEnabled
                ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/30'
                : 'bg-white/5 text-neutral-500 border-white/5'
            }`}
          >
            {hapticsEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div className="flex items-center justify-between py-1.5 pt-2">
          <div className="flex items-center space-x-2 text-xs text-neutral-300">
            <Cpu size={15} className="text-[#FFB800]" />
            <span>Sound Effects</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
              soundEnabled
                ? 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/30'
                : 'bg-white/5 text-neutral-500 border-white/5'
            }`}
          >
            {soundEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Telegram Mini App & Cloudflare Specs */}
      <div className="w-full glass-panel p-3.5 rounded-2xl border border-white/5 text-left">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
          <Smartphone size={14} className="text-[#00F0FF]" />
          <span>Telegram WebApp Runtime</span>
        </div>

        <div className="space-y-1 text-[11px] font-mono text-neutral-400">
          <div className="flex justify-between">
            <span>SDK Version:</span>
            <span className="text-white">{webApp?.version || '7.10 (Standard)'}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform:</span>
            <span className="text-white">{webApp?.platform || (tgData.isSimulated ? 'Browser (Preview)' : 'Mobile Client')}</span>
          </div>
          <div className="flex justify-between">
            <span>Theme Mode:</span>
            <span className="text-white">{webApp?.colorScheme || 'dark'}</span>
          </div>
          <div className="flex justify-between">
            <span>Target Backend:</span>
            <span className="text-[#00F0FF]">Cloudflare Worker + D1</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
