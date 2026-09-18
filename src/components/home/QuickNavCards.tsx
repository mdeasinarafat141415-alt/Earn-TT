import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckSquare, Users, Sparkles, Wallet, ChevronRight } from 'lucide-react';
import { NavTab } from '../../types';

interface QuickCardItem {
  id: NavTab;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ElementType;
  glowColor: string;
  iconBg: string;
}

const cards: QuickCardItem[] = [
  {
    id: 'tasks',
    title: 'Earn Tasks',
    subtitle: 'Telegram & Socials',
    badge: '+15,000 TAP',
    icon: CheckSquare,
    glowColor: 'hover:border-[#00F0FF]/40',
    iconBg: 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/30',
  },
  {
    id: 'friends',
    title: 'Invite Friends',
    subtitle: 'Multi-tier rewards',
    badge: '+2,500 TAP',
    icon: Users,
    glowColor: 'hover:border-[#7928CA]/40',
    iconBg: 'bg-[#7928CA]/20 text-[#A855F7] border-[#7928CA]/40',
  },
  {
    id: 'earn',
    title: 'Boosters',
    subtitle: 'Daily multipliers',
    badge: 'Up to 3x',
    icon: Sparkles,
    glowColor: 'hover:border-[#FFB800]/40',
    iconBg: 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/30',
  },
  {
    id: 'wallet',
    title: 'TAP Wallet',
    subtitle: 'TON & Solana payout',
    badge: 'Direct',
    icon: Wallet,
    glowColor: 'hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
];

export const QuickNavCards: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="w-full px-4 max-w-md mx-auto my-3 mb-6">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          Quick Hub
        </span>
        <span className="text-[11px] text-neutral-400">Tap to jump</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => setActiveTab(card.id)}
              className={`glass-card p-3 rounded-2xl text-left border border-white/[0.08] ${card.glowColor} transition-all duration-200 group active:scale-[0.98] relative overflow-hidden`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-xl border ${card.iconBg}`}>
                  <Icon size={16} />
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                  {card.badge}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight group-hover:text-[#00F0FF] transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5 truncate max-w-[110px]">
                    {card.subtitle}
                  </p>
                </div>
                <ChevronRight
                  size={14}
                  className="text-neutral-500 group-hover:text-white transition-colors"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
