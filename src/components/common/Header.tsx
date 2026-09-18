import React from 'react';
import { useApp } from '../../context/AppContext';
import { TTLogo } from './TTLogo';
import { Shield, RefreshCw, Volume2, VolumeX, Smartphone } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    user,
    isSyncing,
    refreshData,
    activeTab,
    setActiveTab,
    hapticsEnabled,
    setHapticsEnabled,
    soundEnabled,
    setSoundEnabled,
    isSimulatedUser,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 w-full px-4 py-3 bg-[#07090E]/90 backdrop-blur-md border-b border-white/[0.06]">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Left: Branding & User info */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-2.5 group focus:outline-none"
            aria-label="Home"
          >
            <TTLogo size="sm" />
            <div className="flex flex-col text-left">
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-bold tracking-tight text-white group-hover:text-[#00F0FF] transition-colors">
                  TT BOT
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                  TAP
                </span>
              </div>
              <span className="text-xs text-neutral-400 font-medium truncate max-w-[120px]">
                {user ? user.firstName : 'Connecting...'}
                {user?.isPremium && (
                  <span className="ml-1 text-[#FFB800] text-[10px]" title="Telegram Premium">
                    ★
                  </span>
                )}
              </span>
            </div>
          </button>
        </div>

        {/* Right: Actions, Sync, Audio & Admin */}
        <div className="flex items-center space-x-1.5">
          {/* Sync indicator */}
          <button
            onClick={() => refreshData()}
            disabled={isSyncing}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
            title="Sync with Cloudflare Worker"
            aria-label="Sync"
          >
            <RefreshCw
              size={16}
              className={`transition-transform duration-700 ${isSyncing ? 'animate-spin text-[#00F0FF]' : ''}`}
            />
          </button>

          {/* Sound / Haptic toggle */}
          <button
            onClick={() => {
              setHapticsEnabled(!hapticsEnabled);
              setSoundEnabled(!soundEnabled);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
            title={hapticsEnabled ? 'Haptics & Sound: On' : 'Haptics & Sound: Off'}
            aria-label="Toggle Haptics and Sound"
          >
            {hapticsEnabled ? (
              <Volume2 size={16} className="text-[#00F0FF]" />
            ) : (
              <VolumeX size={16} className="text-neutral-500" />
            )}
          </button>

          {/* Admin Panel Access Button */}
          <button
            onClick={() => setActiveTab(activeTab === 'admin' ? 'home' : 'admin')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === 'admin'
                ? 'bg-[#FF3366]/20 text-[#FF3366] border-[#FF3366]/40 shadow-[0_0_10px_rgba(255,51,102,0.2)]'
                : 'bg-white/5 text-neutral-300 hover:text-white border-white/10 hover:border-white/20'
            }`}
            title="Admin Console Preparation"
          >
            <Shield size={13} className={activeTab === 'admin' ? 'text-[#FF3366]' : 'text-neutral-400'} />
            <span className="hidden xs:inline">Admin</span>
          </button>
        </div>
      </div>

      {/* Telegram environment preview notice (visible if tested outside Telegram) */}
      {isSimulatedUser && (
        <div className="max-w-md mx-auto mt-1 flex items-center justify-between text-[11px] px-2.5 py-1 rounded bg-[#00F0FF]/8 border border-[#00F0FF]/20 text-[#00F0FF]">
          <span className="flex items-center space-x-1">
            <Smartphone size={12} />
            <span>Running in Web Preview Mode (Ready for Telegram Mini App)</span>
          </span>
          <span className="font-mono text-[9px] text-neutral-400">Worker: Standby</span>
        </div>
      )}
    </header>
  );
};
