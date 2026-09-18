import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  AdminStats,
  AdminUser,
  AdminWithdrawal,
  AdminTask,
  AdminActivityLog,
} from '../types';
import {
  Shield,
  Search,
  Users,
  Wallet,
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Server,
  DollarSign,
  Ban,
  UserCheck,
  RefreshCw,
  Power,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'motion/react';

type AdminTab = 'dashboard' | 'users' | 'withdrawals' | 'tasks' | 'logs';

export const AdminPage: React.FC = () => {
  const { showToast, setActiveTab } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // User detail modal state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [balanceAdjustment, setBalanceAdjustment] = useState<string>('1000');

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, withdrawalsRes, tasksRes, logsRes] = await Promise.all([
        api.admin.getDashboard(),
        api.admin.getUsers(searchQuery),
        api.admin.getWithdrawals(),
        api.admin.getTasks(),
        api.admin.getLogs(),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (usersRes.success && usersRes.data) setUsers(usersRes.data);
      if (withdrawalsRes.success && withdrawalsRes.data) setWithdrawals(withdrawalsRes.data);
      if (tasksRes.success && tasksRes.data) setTasks(tasksRes.data);
      if (logsRes.success && logsRes.data) setLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [searchQuery]);

  const handleReviewWithdrawal = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const res = await api.admin.reviewWithdrawal(id, action);
      if (res.success) {
        showToast(`Withdrawal ${id} marked as ${action}!`, 'success');
        fetchAdminData();
      } else {
        showToast(res.error || 'Failed to update withdrawal', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleToggleBan = async (user: AdminUser) => {
    const action = user.status === 'banned' ? 'unban' : 'ban';
    try {
      const res = await api.admin.updateUserStatus(user.id, action);
      if (res.success) {
        showToast(`User ${user.username} was ${action === 'ban' ? 'banned' : 'unbanned'}.`, 'success');
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser) return;
    const amount = parseInt(balanceAdjustment, 10);
    if (isNaN(amount)) return;

    try {
      const res = await api.admin.updateUserStatus(selectedUser.id, 'adjust_balance', amount);
      if (res.success) {
        showToast(`Balance adjusted by ${amount > 0 ? '+' : ''}${amount} TAP`, 'success');
        setSelectedUser(null);
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Balance adjustment failed', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center w-full px-4 pt-3 pb-24 max-w-md mx-auto"
    >
      {/* Top Banner */}
      <div className="w-full flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/30">
            <Shield size={18} />
          </div>
          <div className="text-left">
            <h2 className="text-base font-bold text-white tracking-tight">
              Admin Console Architecture
            </h2>
            <span className="text-[10px] text-neutral-400 font-mono">
              Prepared for Cloudflare Worker + D1
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('home')}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-neutral-300 hover:text-white"
        >
          Exit Admin
        </button>
      </div>

      {/* Cloudflare Worker Specs notice */}
      <div className="w-full p-2.5 rounded-xl bg-[#FF3366]/8 border border-[#FF3366]/20 mb-3 text-[11px] text-neutral-300 text-left">
        <span className="font-semibold text-white">Security Note:</span> In production, these calls require{' '}
        <code className="text-[#00F0FF] bg-black/40 px-1 rounded">Authorization: Bearer &lt;ADMIN_KEY&gt;</code>{' '}
        and route through the Cloudflare Worker API to protect user funds & D1 database rows.
      </div>

      {/* Admin Navigation Tabs */}
      <div className="w-full flex space-x-1 overflow-x-auto pb-1 mb-3 scrollbar-none">
        {(
          [
            { id: 'dashboard', label: 'Stats', icon: Activity },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'withdrawals', label: 'Withdrawals', icon: Wallet },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'logs', label: 'Audit Logs', icon: Server },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap border transition-all ${
                activeAdminTab === tab.id
                  ? 'bg-[#FF3366]/20 text-[#FF3366] border-[#FF3366]/40 shadow-[0_0_10px_rgba(255,51,102,0.2)]'
                  : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white'
              }`}
            >
              <Icon size={12} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeAdminTab === 'dashboard' && stats && (
        <div className="w-full space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="glass-card p-3 rounded-xl border border-white/5 text-left">
              <span className="text-[10px] text-neutral-400 uppercase font-medium">
                Total Registered Users
              </span>
              <span className="text-lg font-black font-mono text-white block mt-0.5">
                {stats.totalUsers.toLocaleString()}
              </span>
            </div>

            <div className="glass-card p-3 rounded-xl border border-white/5 text-left">
              <span className="text-[10px] text-neutral-400 uppercase font-medium">
                Active Today
              </span>
              <span className="text-lg font-black font-mono text-emerald-400 block mt-0.5">
                {stats.activeToday.toLocaleString()}
              </span>
            </div>

            <div className="glass-card p-3 rounded-xl border border-white/5 text-left">
              <span className="text-[10px] text-neutral-400 uppercase font-medium">
                Total TAP Minted
              </span>
              <span className="text-lg font-black font-mono text-[#00F0FF] block mt-0.5">
                {(stats.totalTapMinted / 1000000).toFixed(1)}M
              </span>
            </div>

            <div className="glass-card p-3 rounded-xl border border-white/5 text-left">
              <span className="text-[10px] text-neutral-400 uppercase font-medium">
                Pending Withdrawals
              </span>
              <span className="text-lg font-black font-mono text-[#FFB800] block mt-0.5">
                {stats.pendingWithdrawalsCount} Requests
              </span>
            </div>
          </div>

          {/* Maintenance Mode Toggle */}
          <div className="glass-card p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-left">
              <Power size={18} className={maintenanceMode ? 'text-[#FF3366]' : 'text-neutral-400'} />
              <div>
                <span className="text-xs font-bold text-white block">
                  Maintenance Mode
                </span>
                <span className="text-[10px] text-neutral-400">
                  {maintenanceMode ? 'App restricted to Admins' : 'Operational (All users active)'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setMaintenanceMode(!maintenanceMode);
                showToast(`Maintenance mode ${!maintenanceMode ? 'Enabled' : 'Disabled'}`, 'warning');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                maintenanceMode
                  ? 'bg-[#FF3366] text-white border-[#FF3366]'
                  : 'bg-white/5 text-neutral-400 border-white/10'
              }`}
            >
              {maintenanceMode ? 'Active' : 'Off'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeAdminTab === 'users' && (
        <div className="w-full space-y-3">
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username, first name or ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#070A11] border border-white/10 text-xs text-white font-mono placeholder:text-neutral-500 focus:outline-none focus:border-[#FF3366]/50"
            />
          </div>

          {/* Users List */}
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="glass-card p-3 rounded-xl border border-white/5 flex items-center justify-between"
              >
                <div className="text-left">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-white">{u.firstName}</span>
                    <span className="text-[10px] font-mono text-neutral-400">(@{u.username})</span>
                    <span
                      className={`text-[9px] font-bold px-1 rounded uppercase ${
                        u.status === 'banned'
                          ? 'bg-[#FF3366]/20 text-[#FF3366]'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                    ID: {u.telegramId} • Balance: {u.balance.toLocaleString()} TAP
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-[10px] font-semibold border border-white/10"
                    title="Adjust balance"
                  >
                    Adjust
                  </button>

                  <button
                    onClick={() => handleToggleBan(u)}
                    className={`p-1.5 rounded-lg border text-[10px] font-semibold ${
                      u.status === 'banned'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-[#FF3366]/15 text-[#FF3366] border-[#FF3366]/30'
                    }`}
                    title={u.status === 'banned' ? 'Unban User' : 'Ban User'}
                  >
                    {u.status === 'banned' ? <UserCheck size={13} /> : <Ban size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Balance adjustment inline modal */}
          {selectedUser && (
            <div className="glass-card p-3.5 rounded-xl border border-[#FF3366]/40 mt-3 text-left">
              <span className="text-xs font-bold text-white block mb-1">
                Adjust Balance for @{selectedUser.username}
              </span>
              <span className="text-[11px] text-neutral-400 block mb-2">
                Current: {selectedUser.balance.toLocaleString()} TAP
              </span>

              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={balanceAdjustment}
                  onChange={(e) => setBalanceAdjustment(e.target.value)}
                  placeholder="e.g. 5000 or -2000"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#070A11] border border-white/10 text-xs font-mono text-white"
                />
                <button
                  onClick={handleAdjustBalance}
                  className="px-3 py-1.5 rounded-lg bg-[#FF3366] text-white text-xs font-bold"
                >
                  Save
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-2 py-1.5 rounded-lg bg-white/5 text-neutral-400 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WITHDRAWALS */}
      {activeAdminTab === 'withdrawals' && (
        <div className="w-full space-y-2">
          {withdrawals.length === 0 ? (
            <div className="glass-card p-6 rounded-xl text-center text-xs text-neutral-400">
              No withdrawal requests pending.
            </div>
          ) : (
            withdrawals.map((w) => (
              <div
                key={w.id}
                className="glass-card p-3 rounded-xl border border-white/5 text-left space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">
                    {w.amount.toLocaleString()} TAP ({w.network})
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      w.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : w.status === 'rejected'
                        ? 'bg-[#FF3366]/20 text-[#FF3366]'
                        : 'bg-[#FFB800]/20 text-[#FFB800]'
                    }`}
                  >
                    {w.status}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-neutral-400 truncate">
                  To: {w.address}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                  <span className="text-neutral-500 font-mono">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </span>

                  {w.status === 'pending' && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleReviewWithdrawal(w.id, 'approved')}
                        className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReviewWithdrawal(w.id, 'rejected')}
                        className="px-2 py-0.5 rounded bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/30 font-bold"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: TASKS */}
      {activeAdminTab === 'tasks' && (
        <div className="w-full space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="glass-card p-3 rounded-xl border border-white/5 text-left flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-white block">
                  {task.title}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Reward: +{task.rewardAmount.toLocaleString()} TAP • Cat: {task.category}
                </span>
              </div>

              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                Active
              </span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeAdminTab === 'logs' && (
        <div className="w-full space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="glass-card p-2.5 rounded-xl border border-white/5 text-left font-mono text-[11px]"
            >
              <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-0.5">
                <span className="text-[#00F0FF] font-bold">{log.action}</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-neutral-300 text-xs">{log.details}</p>
              <span className="text-[9px] text-neutral-500 mt-0.5 block">
                Actor: {log.actor}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
