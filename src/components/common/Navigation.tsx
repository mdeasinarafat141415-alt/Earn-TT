import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../types';
import {
  Flame,
  Sparkles,
  Users,
  CheckSquare,
  Trophy,
  Wallet,
  User,
} from 'lucide-react';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Tap', icon: Flame },
  { id: 'earn', label: 'Earn', icon: Sparkles },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: 'New' },
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'leaderboard', label: 'Ranks', icon: Trophy },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User },
];

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0D15]/95 backdrop-blur-xl border-t border-white/[0.08] safe-bottom">
      <div className="max-w-md mx-auto px-1.5 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all duration-200 group flex-1 max-w-[62px] ${
                isActive ? 'text-[#00F0FF]' : 'text-neutral-400 hover:text-neutral-200'
              }`}
              aria-label={item.label}
            >
              {/* Active ambient glow pill */}
              {isActive && (
                <div
                  className="absolute inset-0 bg-[#00F0FF]/10 rounded-xl border border-[#00F0FF]/25 shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                  aria-hidden="true"
                />
              )}

              {/* Badge for notifications */}
              {item.badge && !isActive && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#00F0FF] ring-2 ring-[#0A0D15]" />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <Icon
                  size={19}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]' : 'group-hover:scale-105'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium tracking-tight mt-1 truncate ${
                    isActive ? 'font-bold text-white' : 'text-neutral-400'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
