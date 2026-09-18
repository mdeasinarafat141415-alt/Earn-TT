import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { telegram } from '../services/telegram';
import { Task, TaskCategory, TaskStatus } from '../types';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Send,
  Twitter,
  Youtube,
  MessageCircle,
  Sparkles,
  Flame,
  Star,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'motion/react';

export const TasksPage: React.FC = () => {
  const { showToast, refreshData } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('all');
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.getTasks();
      if (res.success && res.data) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const getTaskIcon = (iconType: string) => {
    switch (iconType) {
      case 'telegram':
        return <Send size={18} className="text-[#38BDF8]" />;
      case 'chat':
        return <MessageCircle size={18} className="text-[#00F0FF]" />;
      case 'twitter':
        return <Twitter size={18} className="text-[#1DA1F2]" />;
      case 'youtube':
        return <Youtube size={18} className="text-[#FF0000]" />;
      case 'flame':
        return <Flame size={18} className="text-[#FF3366]" />;
      case 'star':
      default:
        return <Star size={18} className="text-[#FFB800]" />;
    }
  };

  const handleStartOrVerify = async (task: Task) => {
    if (task.status === 'completed') return;

    // If available, first open link and request backend to mark as pending verification
    if (task.status === 'available') {
      if (task.actionUrl && task.actionUrl !== '#') {
        telegram.openLink(task.actionUrl);
      }

      setVerifyingTaskId(task.id);
      try {
        const res = await api.verifyTask(task.id);
        if (res.success && res.data) {
          showToast('Task started! Verification request submitted to TT server.', 'info');
          // Update local state with authoritative server response
          setTasks((prev) =>
            prev.map((t) => (t.id === task.id ? res.data!.task : t))
          );
        } else {
          showToast(res.error || 'Failed to start task verification', 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'Error communicating with server', 'error');
      } finally {
        setVerifyingTaskId(null);
      }
      return;
    }

    // If pending, perform server-side check
    if (task.status === 'pending') {
      setVerifyingTaskId(task.id);
      try {
        const res = await api.verifyTask(task.id);
        if (res.success && res.data) {
          if (res.data.rewardClaimed) {
            showToast(`Task verified by server! +${task.rewardAmount.toLocaleString()} TAP added!`, 'success');
            setTasks((prev) =>
              prev.map((t) => (t.id === task.id ? res.data!.task : t))
            );
            await refreshData();
          } else {
            showToast('Server is still verifying your membership. Please wait a few seconds.', 'warning');
          }
        } else {
          showToast(res.error || 'Task verification not ready on server', 'warning');
        }
      } catch (err: any) {
        showToast(err.message || 'Verification failed on server', 'error');
      } finally {
        setVerifyingTaskId(null);
      }
    }
  };

  const filteredTasks =
    selectedCategory === 'all'
      ? tasks
      : tasks.filter((t) => t.category === selectedCategory);

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
          Quests & Tasks
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Complete verified missions to claim substantial TAP rewards.
        </p>
      </div>

      {/* Backend Anti-Cheat / Verification Protocol Notice */}
      <div className="w-full glass-panel p-3 rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/5 mb-3 flex items-start space-x-2.5">
        <ShieldAlert size={16} className="text-[#00F0FF] shrink-0 mt-0.5" />
        <div className="text-left">
          <span className="text-xs font-bold text-white block">
            Server-Authoritative Verification
          </span>
          <span className="text-[11px] text-neutral-300 leading-snug">
            All Telegram subscriptions and social actions are verified via backend API checks. Rewards are credited only after server confirmation.
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="w-full flex space-x-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none">
        {(['all', 'telegram', 'social', 'daily'] as TaskCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white'
            }`}
          >
            {cat === 'all'
              ? 'All Quests'
              : cat === 'telegram'
              ? 'Telegram'
              : cat === 'social'
              ? 'Social Media'
              : 'Daily Tasks'}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="w-full space-y-2.5">
        {loading ? (
          <div className="glass-card p-6 rounded-2xl text-center border border-white/5">
            <div className="w-5 h-5 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-neutral-400">Loading server tasks...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="glass-card p-6 rounded-2xl text-center border border-white/5">
            <CheckSquare size={28} className="text-neutral-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-neutral-300">
              No tasks available in this category
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isPending = task.status === 'pending';
            const isVerifying = verifyingTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`glass-card p-3.5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'border-white/5 opacity-75'
                    : isPending
                    ? 'border-[#FFB800]/30 shadow-[0_0_12px_rgba(255,184,0,0.1)]'
                    : 'border-white/[0.08] hover:border-[#00F0FF]/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                      {getTaskIcon(task.iconType)}
                    </div>

                    <div className="text-left">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-xs font-bold text-white tracking-tight">
                          {task.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Reward indicator */}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs font-black font-mono text-[#00F0FF]">
                          +{task.rewardAmount.toLocaleString()} TAP
                        </span>

                        {isCompleted && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                            <CheckCircle2 size={10} />
                            <span>Completed</span>
                          </span>
                        )}

                        {isPending && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30 flex items-center space-x-1">
                            <Clock size={10} />
                            <span>In Verification</span>
                          </span>
                        )}

                        {task.status === 'available' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-white/5 text-neutral-400 border border-white/10">
                            Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0 ml-2">
                    <button
                      onClick={() => handleStartOrVerify(task)}
                      disabled={isCompleted || isVerifying}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 active:scale-95 ${
                        isCompleted
                          ? 'bg-white/5 text-neutral-500 border border-white/5 cursor-not-allowed'
                          : isPending
                          ? 'bg-[#FFB800] text-[#07090E] hover:opacity-90 shadow-[0_2px_10px_rgba(255,184,0,0.3)]'
                          : 'bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#07090E] hover:opacity-90 shadow-[0_2px_10px_rgba(0,240,255,0.25)]'
                      }`}
                    >
                      {isVerifying ? (
                        <RefreshCw size={13} className="animate-spin text-current" />
                      ) : isCompleted ? (
                        <CheckCircle2 size={13} />
                      ) : isPending ? (
                        <>
                          <Clock size={12} />
                          <span>Verify</span>
                        </>
                      ) : (
                        <>
                          <span>Start</span>
                          <ExternalLink size={11} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
