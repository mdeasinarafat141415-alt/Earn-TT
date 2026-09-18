import React from 'react';
import { useApp } from '../../context/AppContext';
import { Zap } from 'lucide-react';

export const EnergyBar: React.FC = () => {
  const { energy } = useApp();

  const percentage = Math.min(100, Math.max(0, (energy.current / energy.max) * 100));

  return (
    <div className="w-full px-4 max-w-md mx-auto">
      <div className="glass-panel rounded-2xl p-3.5 border border-white/[0.08] shadow-lg">
        {/* Header row: Icon, Label, Numbers */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30 shadow-[0_0_10px_rgba(255,184,0,0.2)]">
              <Zap size={15} className="fill-[#FFB800]" />
            </div>
            <span className="text-xs font-semibold text-neutral-300 tracking-wide uppercase">
              Energy
            </span>
          </div>

          <div className="flex items-baseline space-x-1">
            <span className="text-base font-black font-mono text-white tracking-tight">
              {Math.round(energy.current)}
            </span>
            <span className="text-xs font-mono text-neutral-400">
              / {energy.max}
            </span>
          </div>
        </div>

        {/* Energy Progress Bar */}
        <div className="relative w-full h-2.5 rounded-full bg-[#0E1422] border border-white/5 overflow-hidden p-[1px]">
          <div
            className="h-full rounded-full transition-all duration-300 relative overflow-hidden"
            style={{
              width: `${percentage}%`,
              background: 'linear-gradient(90deg, #00F0FF 0%, #00A3FF 60%, #FFB800 100%)',
              boxShadow: '0 0 12px rgba(0, 240, 255, 0.4)',
            }}
          >
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 bg-white/25 -skew-x-12 animate-[shimmer_2s_infinite]" />
          </div>
        </div>

        {/* Footer info: regen rate */}
        <div className="flex items-center justify-between mt-1.5 text-[10px] text-neutral-400">
          <span>Recharge Rate: +{energy.regenRatePerSec}/sec</span>
          <span>{Math.round(percentage)}% Ready</span>
        </div>
      </div>
    </div>
  );
};
