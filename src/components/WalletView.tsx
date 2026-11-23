import { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  CreditCard,
  Fingerprint,
  Hash,
  Lock,
  Plus,
} from 'lucide-react';
import type { KuSOPState, RouteId, Transaction, TransactionCategory } from '../types/kusop';
import { formatNaira } from '../utils/kusopLogic';

interface WalletViewProps {
  state: KuSOPState;
  onNavigate: (route: RouteId) => void;
  onFundWallet: (
    amount: number,
    method: 'Bank Transfer' | 'Debit Card' | 'USSD'
  ) => Transaction | null;
}

const PRESET_AMOUNTS = [5000, 10000, 25000, 50000];
const METHODS: {
  id: 'Bank Transfer' | 'Debit Card' | 'USSD';
  label: string;
  hint: string;
  icon: typeof Building2;
}[] = [
  { id: 'Bank Transfer', label: 'Bank Transfer', hint: 'Instant NIP virtual account', icon: Building2 },
  { id: 'Debit Card', label: 'Debit Card', hint: 'Verve, Visa & Mastercard', icon: CreditCard },
  { id: 'USSD', label: 'USSD Code', hint: '*737# / *901# / *894#', icon: Hash },
];

const FILTERS: { id: 'all' | TransactionCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'wallet', label: 'Funding' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'food', label: 'Food' },
  { id: 'swap', label: 'Battery Swap' },
];

export function WalletView({ state, onNavigate, onFundWallet }: WalletViewProps) {
  const walletLocked =
    state.biometricSecurity.requireForWalletActions &&
    !state.biometricSecurity.isUnlocked;
  const [amountInput, setAmountInput] = useState('15000');
  const [selectedMethod, setSelectedMethod] = useState<
    'Bank Transfer' | 'Debit Card' | 'USSD'
  >('Bank Transfer');
  const [filter, setFilter] = useState<'all' | TransactionCategory>('all');
  const [receipt, setReceipt] = useState<Transaction | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const parsedAmount = Number(amountInput.replace(/[^0-9.]/g, ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!Number.isFinite(parsedAmount) || parsedAmount < 100) {
      setErrorMsg('Please enter an amount of at least ₦100.');
      return;
    }
    const created = onFundWallet(parsedAmount, selectedMethod);
    if (created) {
      setReceipt(created);
    }
  };

  const filteredTxns =
    filter === 'all'
      ? state.transactions
      : state.transactions.filter((t) => t.category === filter);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Balance + Add Funds Form */}
        <div className="lg:col-span-5 space-y-5">
          <section className="rounded-3xl bg-[#0D4A31] text-white p-6">
            <p className="text-xs font-medium text-emerald-200">
              KuSOP Customer Wallet · Simulated NGN Account
            </p>
            <p
              data-testid="wallet-balance-display"
              className="font-mono text-3xl sm:text-4xl font-semibold tabular-nums mt-2"
            >
              {formatNaira(state.walletBalance)}
            </p>
            <p className="text-xs text-emerald-100/85 mt-2">
              Use your wallet balance across KuSOP Delivery, Food, Battery Swap, and EV bookings.
            </p>
          </section>

          <section className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-gray-950">
                  Add Funds (Demo)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select a preset or enter a custom Naira amount to simulate instant funding.
                </p>
              </div>
              {walletLocked && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 shrink-0">
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Locked</span>
                </span>
              )}
            </div>

            {walletLocked ? (
              <div
                data-testid="wallet-biometric-gate"
                className="mt-4 rounded-2xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0D4A31] text-white flex items-center justify-center shrink-0">
                    <Fingerprint className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-950">
                      Biometric Verification Required
                    </p>
                    <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                      Wallet funding actions are protected by your {state.biometricSecurity.method} security lock. Authenticate on your Profile to unlock deposits.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('profile')}
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-2xl bg-[#0D4A31] hover:bg-[#115E3F] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <Fingerprint className="w-4 h-4" aria-hidden="true" />
                  <span>Unlock on Profile</span>
                </button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="wallet-amount-input"
                  className="block text-xs font-semibold text-gray-700 mb-1.5"
                >
                  Amount (₦)
                </label>
                <input
                  id="wallet-amount-input"
                  type="number"
                  min={100}
                  max={5000000}
                  step={100}
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Enter amount e.g. 25000"
                  className="w-full min-h-[46px] px-4 rounded-2xl border border-gray-300 bg-white font-mono text-base font-semibold text-gray-950 focus:outline-2 focus:outline-[#0D4A31]"
                />
                <div className="grid grid-cols-4 gap-2 mt-2.5">
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setAmountInput(String(preset));
                        setErrorMsg('');
                      }}
                      className={`min-h-[40px] rounded-xl text-xs font-mono font-semibold border transition-colors tabular-nums ${
                        parsedAmount === preset
                          ? 'bg-[#E8F6EE] border-[#0D4A31] text-[#0D4A31]'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      +{formatNaira(preset)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="block text-xs font-semibold text-gray-700 mb-2">
                  Payment Method
                </p>
                <div className="space-y-2">
                  {METHODS.map((m) => {
                    const Icon = m.icon;
                    const active = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id)}
                        className={`w-full min-h-[54px] px-3.5 py-2.5 rounded-2xl border flex items-center gap-3 text-left transition-colors ${
                          active
                            ? 'bg-[#EAF7F0] border-[#0D4A31] text-[#0D4A31]'
                            : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            active ? 'bg-[#0D4A31] text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-semibold block">{m.label}</span>
                          <span className="text-xs text-gray-500 block">{m.hint}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {errorMsg && (
                <p role="alert" className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-[#0D4A31] hover:bg-[#115E3F] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Complete Demo Funding</span>
              </button>
            </form>
            )}

            {receipt && (
              <div
                data-testid="wallet-funding-receipt"
                className="mt-4 p-4 rounded-2xl bg-[#EAF7F0] border border-[#BDE4CD]"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold text-[#0D4A31]">
                      Simulated Top-Up Successful
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      Credited <span className="font-mono font-semibold">{formatNaira(receipt.amount)}</span> via {selectedMethod}.
                    </p>
                    <p className="text-[11px] font-mono text-gray-600 mt-1">
                      Ref: {receipt.reference} · {receipt.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Transaction Ledger */}
        <section className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-gray-950">
                Transaction Ledger
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {filteredTxns.length} record{filteredTxns.length === 1 ? '' : 's'} shown
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-100 rounded-xl">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    filter === f.id
                      ? 'bg-white text-[#0D4A31] font-semibold shadow-xs'
                      : 'text-gray-600 hover:text-gray-950'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredTxns.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-gray-600">
                No transactions in this category yet.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Try funding your wallet or booking a KuSOP service.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredTxns.map((txn) => {
                const isCredit = txn.type === 'credit';
                return (
                  <li key={txn.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isCredit
                            ? 'bg-[#E8F6EE] text-[#16A34A]'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-950 truncate">
                          {txn.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {txn.subtitle}
                        </p>
                        <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                          {txn.reference} · {txn.timestamp}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono text-sm font-semibold tabular-nums block ${
                          isCredit ? 'text-[#16A34A]' : 'text-gray-950'
                        }`}
                      >
                        {isCredit ? '+' : '-'}
                        {formatNaira(txn.amount)}
                      </span>
                      <span className="text-[11px] text-gray-500 block mt-0.5">
                        {txn.status}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
