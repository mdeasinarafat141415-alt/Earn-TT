import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { telegram } from '../services/telegram';
import { Referral, ReferralStats } from '../types';
import {
  Users,
  Copy,
  Share2,
  Check,
  Award,
  Sparkles,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { motion } from 'motion/react';

export const FriendsPage: React.FC = () => {
  const { user, showToast, refreshData } = useApp();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferrals = async () => {
      setLoading(true);
      try {
        const res = await api.getReferrals();
        if (res.success && res.data) {
          setStats(res.data.stats);
          setReferrals(res.data.list);
        }
      } catch (err) {
        console.error('Failed to load referrals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  const referralLink =
    stats?.referralLink ||
    `https://t.me/TTBot_official_bot?start=ref_${user?.referralCode || 'TT748291'}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      showToast('Referral link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Copied link: ' + referralLink, 'info');
    }
  };

  const handleShareTelegram = () => {
    const shareText = `🚀 Join TT BOT and start mining TAP tokens with me! Get a welcome bonus on your first tap:`;
    telegram.openTelegramShare(shareText, referralLink);
    showToast('Opening Telegram Share...', 'info');
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
          Invite Friends
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Grow the TT network and earn instant TAP rewards plus lifetime bonuses.
        </p>
      </div>

      {/* Referral Statistics Grid */}
      <div className="w-full grid grid-cols-3 gap-2 mb-3">
        <div className="glass-card p-3 rounded-2xl border border-white/5 text-center">
          <div className="w-7 h-7 mx-auto rounded-lg bg-[#00F0FF]/15 text-[#00F0FF] flex items-center justify-center mb-1">
            <Users size={14} />
          </div>
          <span className="text-base font-black font-mono text-white block">
            {stats?.totalInvited ?? 0}
          </span>
          <span className="text-[10px] text-neutral-400 font-medium">
            Total Invited
          </span>
        </div>

        <div className="glass-card p-3 rounded-2xl border border-white/5 text-center">
          <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-1">
            <UserCheck size={14} />
          </div>
          <span className="text-base font-black font-mono text-emerald-400 block">
            {stats?.successfulReferrals ?? 0}
          </span>
          <span className="text-[10px] text-neutral-400 font-medium">
            Active Tappers
          </span>
        </div>

        <div className="glass-card p-3 rounded-2xl border border-white/5 text-center">
          <div className="w-7 h-7 mx-auto rounded-lg bg-[#FFB800]/15 text-[#FFB800] flex items-center justify-center mb-1">
            <TrendingUp size={14} />
          </div>
          <span className="text-base font-black font-mono text-[#FFB800] block">
            {(stats?.referralEarnings ?? 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-neutral-400 font-medium">
            TAP Earned
          </span>
        </div>
      </div>

      {/* Bonus tiers banner */}
      <div className="w-full glass-panel rounded-2xl p-3 border border-white/5 mb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles size={16} className="text-[#FFB800]" />
          <div className="text-left">
            <span className="text-xs font-bold text-white block">
              Reward per Referral
            </span>
            <span className="text-[11px] text-neutral-400">
              Standard: <b className="text-white">+2,500</b> | Telegram Premium: <b className="text-[#FFB800]">+7,500 TAP</b>
            </span>
          </div>
        </div>
      </div>

      {/* Referral Link & Actions */}
      <div className="w-full glass-card p-4 rounded-2xl border border-[#00F0FF]/25 shadow-lg mb-4">
        <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 block mb-2">
          Your Personal Referral Link
        </span>

        <div className="flex items-center bg-[#070A11] border border-white/10 rounded-xl px-3 py-2 mb-3">
          <span className="text-xs font-mono text-neutral-300 truncate flex-1 select-all">
            {referralLink}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all flex items-center justify-center space-x-1.5 active:scale-95"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleShareTelegram}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#07090E] hover:opacity-90 transition-all flex items-center justify-center space-x-1.5 active:scale-95 shadow-[0_2px_10px_rgba(0,240,255,0.25)]"
          >
            <Share2 size={14} />
            <span>Share via Telegram</span>
          </button>
        </div>
      </div>

      {/* Referral History List */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Referral History ({referrals.length})
          </span>
          <span className="text-[11px] text-neutral-400">
            Auto-synced with server
          </span>
        </div>

        {loading ? (
          <div className="glass-card p-6 rounded-2xl text-center border border-white/5">
            <div className="w-5 h-5 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-neutral-400">Loading referral network...</span>
          </div>
        ) : referrals.length === 0 ? (
          <div className="glass-card p-6 rounded-2xl text-center border border-white/5">
            <Users size={28} className="text-neutral-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-neutral-300">
              No referrals yet
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Share your link with friends to start earning passive TAP!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {referrals.map((friend) => (
              <div
                key={friend.id}
                className="glass-card px-3.5 py-3 rounded-xl border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00F0FF]/20 to-[#7928CA]/20 border border-white/10 flex items-center justify-center text-xs font-bold text-white font-mono">
                    {friend.firstName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-white">
                        {friend.firstName}
                      </span>
                      {friend.isPremium && (
                        <span className="text-[10px] text-[#FFB800]" title="Telegram Premium">
                          ★ Premium
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      @{friend.username} • {new Date(friend.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-[#00F0FF] block">
                    +{friend.earnedFromUser.toLocaleString()} TAP
                  </span>
                  <span className="text-[9px] text-emerald-400 font-medium">
                    {friend.hasMadeTaps ? 'Active' : 'Joined'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
