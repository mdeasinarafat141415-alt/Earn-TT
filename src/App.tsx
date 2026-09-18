import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { Toast } from './components/common/Toast';
import { HomePage } from './pages/HomePage';
import { EarnPage } from './pages/EarnPage';
import { TasksPage } from './pages/TasksPage';
import { FriendsPage } from './pages/FriendsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { WalletPage } from './pages/WalletPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AnimatePresence } from 'motion/react';
import { TTLogo } from './components/common/TTLogo';
import { AlertCircle, RefreshCw } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, isLoading, error, refreshData } = useApp();

  // Initial loading screen
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center">
        <div className="relative mb-4">
          <TTLogo size="xl" />
          <div className="absolute inset-0 rounded-full border-2 border-[#00F0FF]/30 border-t-[#00F0FF] animate-spin" />
        </div>
        <h2 className="text-lg font-black tracking-tight text-white mb-1">
          TT BOT
        </h2>
        <p className="text-xs text-neutral-400 font-mono animate-pulse">
          Connecting to Cloudflare Worker API & D1...
        </p>
      </div>
    );
  }

  // Fatal initialization error screen with retry
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center max-w-sm mx-auto">
        <div className="p-3 rounded-2xl bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/30 mb-3">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-base font-bold text-white mb-1">
          Connection Interrupted
        </h3>
        <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
          {error}
        </p>
        <button
          onClick={() => refreshData()}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00F0FF] text-[#07090E] hover:opacity-90 flex items-center space-x-1.5 shadow-lg shadow-[#00F0FF]/20"
        >
          <RefreshCw size={13} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return (
    <main className="w-full flex-1 flex flex-col items-center">
      <AnimatePresence mode="wait">
        {activeTab === 'home' && <HomePage key="home" />}
        {activeTab === 'earn' && <EarnPage key="earn" />}
        {activeTab === 'tasks' && <TasksPage key="tasks" />}
        {activeTab === 'friends' && <FriendsPage key="friends" />}
        {activeTab === 'leaderboard' && <LeaderboardPage key="leaderboard" />}
        {activeTab === 'wallet' && <WalletPage key="wallet" />}
        {activeTab === 'profile' && <ProfilePage key="profile" />}
        {activeTab === 'admin' && <AdminPage key="admin" />}
      </AnimatePresence>
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#07090E] text-[#F3F4F6] flex flex-col justify-between selection:bg-[#00F0FF]/30 selection:text-white">
        {/* Top Header */}
        <Header />

        {/* Global Toast Message system */}
        <Toast />

        {/* Primary Views Area */}
        <div className="w-full flex-1 flex flex-col items-center relative overflow-x-hidden">
          <MainContent />
        </div>

        {/* Bottom Navigation */}
        <Navigation />
      </div>
    </AppProvider>
  );
}
