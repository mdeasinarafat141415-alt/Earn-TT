import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, CheckCircle2, ChevronRight, Gift, Sparkles } from 'lucide-react';

export const DailyRewardCard: React.FC = () => {
  const { dailyReward, claimDailyReward, setActiveTab } = useApp();
  const [isClaiming, setIsClaiming] = useState(false);

  if (!dailyReward) return null;

  const currentDayInfo = dailyReward.days.find((d) => d.day === dailyReward.currentDay);
  const rewardAmount = currentDayInfo ? currentDayInfo.reward : 5000;
  const isClaimable = dailyReward.isClaimableToday;

  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isClaimable || isClaiming) return;
    setIsClaiming(true);
    await claimDailyReward();
    setIsClaiming(false);
  };

  return (
    <div className="w-full px-4 max-w-md mx-auto my-2">
      <div
        onClick={() => setActiveTab('earn')}
        className={`glass-card rounded-2xl p-4 transition-all duration-200 cursor-pointer border ${
          isClaimable
            ? 'border-[#00F0FF]/30 hover:border-[#00F0FF]/50 shadow-[0_0_20px_rgba(0,240,255,0.12)]'
            : 'border-white/[0.08] hover:border-white/15'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-center ${
                isClaimable
                  ? 'bg-gradient-to-br from-[#00F0FF]/20 to-[#7928CA]/20 border-[#00F0FF]/40 text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                  : 'bg-white/5 border-white/10 text-neutral-400'
              }`}
            >
              <Gift size={20} className={isClaimable ? 'animate-bounce' : ''} />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Daily Check-in
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30">
                  Day {dailyReward.currentDay}/7
                </span>
              </div>
              <span className="text-xs text-neutral-400 mt-0.5">
                {isClaimable ? (
                  <span className="text-[#00F0FF] font-semibold flex items-center space-x-1">
                    <Sparkles size={11} />
                    <span>+{rewardAmount.toLocaleString()} TAP Ready</span>
                  </span>
                ) : (
                  <span>Claimed for today. Streak: {dailyReward.consecutiveDays} days</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {isClaimable ? (
              <button
                onClick={handleClaim}
                disabled={isClaiming}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#07090E] hover:opacity-90 active:scale-95 transition-all shadow-[0_2px_10px_rgba(0,240,255,0.3)] flex items-center space-x-1"
              >
                {isClaiming ? (
                  <span className="w-3.5 h-3.5 border-2 border-[#07090E] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Claim</span>
                )}
              </button>
            ) : (
              <div className="flex items-center text-xs font-medium text-neutral-400 space-x-1">
                <CheckCircle2 size={15} className="text-[#00F0FF]" />
                <ChevronRight size={16} />
              </div>
            )}
          </div>
        </div>

        {/* 7 Days Preview dots */}
        <div className="grid grid-cols-7 gap-1.5 mt-3 pt-3 border-t border-white/[0.06]">
          {dailyReward.days.map((day) => {
            const isDone = day.status === 'claimed';
            const isToday = day.day === dailyReward.currentDay;

            return (
              <div
                key={day.day}
                className={`flex flex-col items-center py-1 px-0.5 rounded-lg border text-center transition-all ${
                  isToday
                    ? 'bg-[#00F0FF]/15 border-[#00F0FF]/40 text-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                    : isDone
                    ? 'bg-[#00F0FF]/5 border-[#00F0FF]/20 text-neutral-400'
                    : 'bg-white/[0.02] border-white/5 text-neutral-500'
                }`}
              >
                <span className="text-[9px] font-medium uppercase">D{day.day}</span>
                <span className="text-[10px] font-bold font-mono">
                  {day.reward >= 1000 ? `${day.reward / 1000}k` : day.reward}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
