import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { LeaderboardEntry, LeaderboardResponse } from '../types';
import {
  Trophy,
  Medal,
  Award,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';

export const LeaderboardPage: React.FC = () => {
  const { user } = useApp();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | 'weekly'>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await api.getLeaderboard(period, page);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period, page]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FFD700] to-[#FFA500] text-[#07090E] flex items-center justify-center font-black text-xs shadow-[0_0_12px_rgba(255,215,0,0.5)]">
          1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#E0E0E0] to-[#BDBDBD] text-[#07090E] flex items-center justify-center font-black text-xs shadow-[0_0_10px_rgba(224,224,224,0.4)]">
          2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#CD7F32] to-[#8C5220] text-white flex items-center justify-center font-black text-xs shadow-[0_0_10px_rgba(205,127,50,0.4)]">
          3
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-neutral-400 flex items-center justify-center font-bold text-xs font-mono">
        {rank}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center w-full px-4 pt-3 pb-28 max-w-md mx-auto"
    >
      {/* Header */}
      <div className="w-full text-center mb-3">
        <h2 className="text-xl font-black text-white tracking-tight">
          Global Leaderboard
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Top miners across the global TT BOT network.
        </p>
      </div>

      {/* Period Selector */}
      <div className="w-full grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#0B0E17] border border-white/5 mb-3">
        <button
          onClick={() => {
            setPeriod('all');
            setPage(1);
          }}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            period === 'all'
              ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          All-Time Masters
        </button>

        <button
          onClick={() => {
            setPeriod('weekly');
            setPage(1);
          }}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            period === 'weekly'
              ? 'bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30 shadow-[0_0_10px_rgba(255,184,0,0.2)]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Weekly Sprint
        </button>
      </div>

      {/* Top 3 Podium Highlights */}
      {data && data.topUsers.length >= 3 && (
        <div className="w-full grid grid-cols-3 gap-2 mb-3">
          {/* Rank 2 */}
          <div className="glass-card p-3 rounded-2xl border border-white/5 flex flex-col items-center text-center pt-5 relative">
            <div className="absolute -top-3 w-6 h-6 rounded-full bg-[#C0C0C0] text-[#07090E] font-black text-xs flex items-center justify-center shadow-md">
              2
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[85px]">
              {data.topUsers[1].firstName}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[85px]">
              @{data.topUsers[1].username}
            </span>
            <span className="text-xs font-black font-mono text-[#00F0FF] mt-1">
              {(data.topUsers[1].tapEarned / 1000000).toFixed(1)}M
            </span>
          </div>

          {/* Rank 1 (Champion) */}
          <div className="glass-card p-3 rounded-2xl border border-[#FFD700]/30 bg-gradient-to-b from-[#FFD700]/10 to-transparent flex flex-col items-center text-center pt-5 relative shadow-[0_0_20px_rgba(255,215,0,0.15)]">
            <div className="absolute -top-3 w-7 h-7 rounded-full bg-gradient-to-tr from-[#FFD700] to-[#FFA500] text-[#07090E] font-black text-xs flex items-center justify-center shadow-lg">
              👑
            </div>
            <span className="text-xs font-black text-white truncate max-w-[90px]">
              {data.topUsers[0].firstName}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[90px]">
              @{data.topUsers[0].username}
            </span>
            <span className="text-xs font-black font-mono text-[#FFD700] mt-1">
              {(data.topUsers[0].tapEarned / 1000000).toFixed(2)}M
            </span>
          </div>

          {/* Rank 3 */}
          <div className="glass-card p-3 rounded-2xl border border-white/5 flex flex-col items-center text-center pt-5 relative">
            <div className="absolute -top-3 w-6 h-6 rounded-full bg-[#CD7F32] text-white font-black text-xs flex items-center justify-center shadow-md">
              3
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[85px]">
              {data.topUsers[2].firstName}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[85px]">
              @{data.topUsers[2].username}
            </span>
            <span className="text-xs font-black font-mono text-[#00F0FF] mt-1">
              {(data.topUsers[2].tapEarned / 1000000).toFixed(1)}M
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard Table List */}
      <div className="w-full space-y-2 mb-4">
        {loading ? (
          <div className="glass-card p-6 rounded-2xl text-center border border-white/5">
            <div className="w-5 h-5 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-neutral-400">Loading rankings...</span>
          </div>
        ) : !data || data.topUsers.length === 0 ? (
          <div className="glass-card p-6 rounded-2xl text-center border border-white/5">
            <Trophy size={28} className="text-neutral-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-neutral-300">
              No ranking data available
            </p>
          </div>
        ) : (
          data.topUsers.map((item: LeaderboardEntry) => (
            <div
              key={item.telegramId}
              className="glass-card px-3.5 py-2.5 rounded-xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getRankBadge(item.rank)}
                <div className="text-left">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-white">
                      {item.firstName}
                    </span>
                    {item.isPremium && (
                      <span className="text-[10px] text-[#FFB800]">★</span>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    @{item.username}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black font-mono text-[#00F0FF] block">
                  {item.tapEarned.toLocaleString()}
                </span>
                <span className="text-[9px] font-mono text-neutral-400 uppercase">
                  TAP
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="w-full flex items-center justify-between px-2 mb-12">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 flex items-center space-x-1 text-xs"
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>

        <span className="text-xs font-mono text-neutral-400">
          Page {page} of 10
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= 10 || loading}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 flex items-center space-x-1 text-xs"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Sticky Current User Highlight Bar */}
      {data?.currentUser && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4 max-w-md mx-auto pointer-events-none">
          <div className="pointer-events-auto glass-card-glow rounded-2xl p-3 border border-[#00F0FF]/40 shadow-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/20 text-[#00F0FF] font-black font-mono text-xs flex items-center justify-center border border-[#00F0FF]/40">
                #{data.currentUser.rank}
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white">
                    {data.currentUser.firstName}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30">
                    YOU
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400">
                  Global Rank #{data.currentUser.rank} of {data.totalParticipants.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-black font-mono text-[#00F0FF] block">
                {data.currentUser.tapEarned.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold font-mono text-[#FFB800]">
                TAP
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
