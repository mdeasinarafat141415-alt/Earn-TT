import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { WithdrawalRequest } from '../types';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  TrendingDown,
  ExternalLink,
  ClipboardPaste,
} from 'lucide-react';
import { motion } from 'motion/react';

const MIN_WITHDRAWAL = 20000;

export const WalletPage: React.FC = () => {
  const { balance, totalEarned, totalWithdrawn, showToast, refreshData } = useApp();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState<string>('20000');
  const [network, setNetwork] = useState<'TON' | 'SOLANA' | 'BSC'>('TON');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await api.getWithdrawals();
      if (res.success && res.data) {
        setWithdrawals(res.data);
      }
    } catch (err) {
      console.error('Failed to load withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handlePasteAddress = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setAddress(text.trim());
        showToast('Address pasted from clipboard', 'info');
      }
    } catch {
      showToast('Please type or paste address manually', 'warning');
    }
  };

  const handleSetMax = () => {
    setAmount(balance.toString());
  };

  const handleOpenConfirm = () => {
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter a valid withdrawal amount.', 'warning');
      return;
    }

    if (numAmount < MIN_WITHDRAWAL) {
      showToast(`Minimum withdrawal is ${MIN_WITHDRAWAL.toLocaleString()} TAP.`, 'warning');
      return;
    }

    if (numAmount > balance) {
      showToast('Insufficient TAP balance for this withdrawal.', 'error');
      return;
    }

    if (!address.trim() || address.trim().length < 10) {
      showToast('Please enter a valid wallet address.', 'warning');
      return;
    }

    setIsModalOpen(true);
  };

  const handleConfirmWithdrawal = async () => {
    setIsSubmitting(true);
    try {
      const numAmount = parseInt(amount, 10);
      const res = await api.requestWithdrawal(numAmount, address, network);
      if (res.success && res.data) {
        showToast(`Withdrawal request for ${numAmount.toLocaleString()} TAP queued successfully!`, 'success');
        setIsModalOpen(false);
        setAddress('');
        await fetchWithdrawals();
        await refreshData();
      } else {
        showToast(res.error || 'Withdrawal request rejected by server', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error processing withdrawal', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: WithdrawalRequest['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
            <CheckCircle2 size={11} />
            <span>Approved</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/30 flex items-center space-x-1">
            <XCircle size={11} />
            <span>Rejected</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30 flex items-center space-x-1">
            <Clock size={11} />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center w-full px-4 pt-3 pb-24 max-w-md mx-auto"
    >
      {/* Page Title */}
      <div className="w-full text-center mb-3">
        <h2 className="text-xl font-black text-white tracking-tight">
          TAP Token Wallet
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Request secure withdrawals to your TON or multi-chain wallet.
        </p>
      </div>

      {/* Balance Summary Cards */}
      <div className="w-full glass-card p-4 rounded-2xl border border-white/[0.08] shadow-lg mb-3">
        <div className="text-center mb-3">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-0.5">
            Available for Withdrawal
          </span>
          <div className="flex items-baseline justify-center space-x-2">
            <span className="text-3xl font-black font-mono text-white tracking-tight">
              {balance.toLocaleString()}
            </span>
            <span className="text-base font-bold font-mono text-[#00F0FF]">
              TAP
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.06]">
          <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-neutral-400 block font-medium">
              Total Earned
            </span>
            <span className="text-xs font-bold font-mono text-emerald-400 mt-0.5 block">
              {totalEarned.toLocaleString()} TAP
            </span>
          </div>

          <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-neutral-400 block font-medium">
              Total Withdrawn
            </span>
            <span className="text-xs font-bold font-mono text-[#FFB800] mt-0.5 block">
              {totalWithdrawn.toLocaleString()} TAP
            </span>
          </div>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="w-full glass-card p-4 rounded-2xl border border-white/[0.08] shadow-md mb-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-1.5">
          <ArrowUpRight size={14} className="text-[#00F0FF]" />
          <span>New Withdrawal Request</span>
        </h3>

        {/* Network Selector */}
        <div className="mb-3">
          <label className="text-[11px] font-medium text-neutral-400 block mb-1">
            Blockchain Network
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['TON', 'SOLANA', 'BSC'] as const).map((net) => (
              <button
                key={net}
                type="button"
                onClick={() => setNetwork(net)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                  network === net
                    ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white'
                }`}
              >
                {net === 'TON' ? '💎 TON (Default)' : net}
              </button>
            ))}
          </div>
        </div>

        {/* Address Input */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-neutral-400">
              Recipient {network} Wallet Address
            </label>
            <button
              type="button"
              onClick={handlePasteAddress}
              className="text-[10px] text-[#00F0FF] hover:underline flex items-center space-x-1 font-semibold"
            >
              <ClipboardPaste size={11} />
              <span>Paste</span>
            </button>
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={`e.g. ${network === 'TON' ? 'EQD... or UQD...' : 'Wallet address...'}`}
            className="w-full px-3 py-2.5 rounded-xl bg-[#070A11] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]/60 transition-colors"
          />
        </div>

        {/* Amount Input */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-neutral-400">
              Amount to Withdraw (TAP)
            </label>
            <button
              type="button"
              onClick={handleSetMax}
              className="text-[10px] font-bold text-[#FFB800] hover:underline uppercase"
            >
              Max ({balance.toLocaleString()})
            </button>
          </div>
          <div className="relative flex items-center">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={MIN_WITHDRAWAL}
              max={balance}
              step="1000"
              className="w-full px-3 py-2.5 rounded-xl bg-[#070A11] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]/60 transition-colors pr-14"
            />
            <span className="absolute right-3 text-xs font-mono font-bold text-neutral-400">
              TAP
            </span>
          </div>
        </div>

        {/* Minimum Info Box */}
        <div className="p-2.5 rounded-xl bg-[#00F0FF]/5 border border-[#00F0FF]/15 mb-4 flex items-center space-x-2 text-[11px] text-neutral-300">
          <ShieldCheck size={14} className="text-[#00F0FF] shrink-0" />
          <span>
            Min: <b className="text-white">{MIN_WITHDRAWAL.toLocaleString()} TAP</b>. Server verified & zero gas fees.
          </span>
        </div>

        {/* Submit Request Button */}
        <button
          type="button"
          onClick={handleOpenConfirm}
          className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#07090E] hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_15px_rgba(0,240,255,0.25)] flex items-center justify-center space-x-1.5"
        >
          <ArrowUpRight size={15} />
          <span>Request Withdrawal</span>
        </button>
      </div>

      {/* Withdrawal History */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Withdrawal History ({withdrawals.length})
          </span>
          <span className="text-[10px] text-neutral-400">
            Cloudflare Worker Queued
          </span>
        </div>

        {loading ? (
          <div className="glass-card p-6 rounded-2xl text-center border border-white/5">
            <div className="w-5 h-5 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-neutral-400">Loading history...</span>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="glass-card p-6 rounded-2xl text-center border border-white/5">
            <Wallet size={28} className="text-neutral-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-neutral-300">
              No withdrawals requested yet
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Your payout requests and transactions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {withdrawals.map((req) => (
              <div
                key={req.id}
                className="glass-card p-3.5 rounded-xl border border-white/5"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold font-mono text-white">
                      -{req.amount.toLocaleString()} TAP
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-neutral-300 font-mono">
                      {req.network}
                    </span>
                  </div>
                  {getStatusBadge(req.status)}
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                  <span className="truncate max-w-[200px]" title={req.address}>
                    To: {req.address.slice(0, 8)}...{req.address.slice(-6)}
                  </span>
                  <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>

                {req.txHash && (
                  <div className="mt-1.5 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-neutral-500 font-mono">
                      Tx: {req.txHash}
                    </span>
                    <span className="text-[#00F0FF] flex items-center space-x-0.5">
                      <span>Confirmed</span>
                      <ExternalLink size={10} />
                    </span>
                  </div>
                )}

                {req.rejectionReason && (
                  <div className="mt-1 text-[10px] text-[#FF3366]">
                    Note: {req.rejectionReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmWithdrawal}
        isLoading={isSubmitting}
        title="Confirm TAP Withdrawal"
        description={`You are requesting a withdrawal of ${parseInt(amount, 10).toLocaleString()} TAP to ${network} address: ${address}. All withdrawals are checked by the backend Cloudflare Worker API before on-chain execution.`}
        confirmText="Confirm & Queue"
        cancelText="Cancel"
      />
    </motion.div>
  );
};
