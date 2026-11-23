import { useState } from 'react';
import {
  Bell,
  ChevronRight,
  HelpCircle,
  Info,
  Lock,
  RotateCcw,
  ShieldCheck,
  User,
  Wallet,
} from 'lucide-react';
import type {
  BiometricMethod,
  BiometricSecurityState,
  KuSOPState,
  RouteId,
  UserProfile,
} from '../types/kusop';
import { formatNaira, maskSensitiveValue } from '../utils/kusopLogic';
import { BiometricAuthCard } from './BiometricAuthCard';
import { PWAInstallButton } from './PWAControls';

interface ProfileViewProps {
  state: KuSOPState;
  onNavigate: (route: RouteId) => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => boolean;
  onResetDemo: () => void;
  onBiometricUnlock: (method: BiometricMethod) => void;
  onBiometricLock: () => void;
  onBiometricFailed: () => void;
  onUpdateBiometricPrefs: (
    updates: Partial<Pick<BiometricSecurityState, 'method' | 'requireForWalletActions'>>
  ) => void;
}

export function ProfileView({
  state,
  onNavigate,
  onUpdateProfile,
  onResetDemo,
  onBiometricUnlock,
  onBiometricLock,
  onBiometricFailed,
  onUpdateBiometricPrefs,
}: ProfileViewProps) {
  const [fullName, setFullName] = useState(state.profile.fullName);
  const [email, setEmail] = useState(state.profile.email);
  const [phone, setPhone] = useState(state.profile.phone);
  const [city, setCity] = useState(state.profile.city);

  const isUnlocked = state.biometricSecurity.isUnlocked;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ fullName, email, phone, city });
  };

  return (
    <div className="space-y-6">
      {/* Customer Header Card */}
      <section className="rounded-3xl bg-[#0D4A31] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-emerald-200" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">{state.profile.fullName}</h2>
            <p className="text-xs text-emerald-200 mt-0.5">
              {state.profile.tier} · {state.profile.vehicleTag}
            </p>
            <p className="text-xs text-emerald-100/80 mt-0.5">{state.profile.city}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('wallet')}
          className="min-h-[44px] px-4 py-2 rounded-2xl bg-white/15 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors self-start sm:self-center"
        >
          <Wallet className="w-4 h-4" aria-hidden="true" />
          <span className="font-mono tabular-nums">{formatNaira(state.walletBalance)}</span>
        </button>
      </section>

      {/* Biometric Authentication Simulation */}
      <BiometricAuthCard
        biometric={state.biometricSecurity}
        onUnlock={onBiometricUnlock}
        onLock={onBiometricLock}
        onFailedScan={onBiometricFailed}
        onUpdatePrefs={onUpdateBiometricPrefs}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sensitive Account Info + Editable Details */}
        <div className="lg:col-span-7 space-y-5">
          <section
            aria-label="Sensitive Account Identifiers"
            data-testid="sensitive-account-panel"
            className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-bold text-gray-950">
                  Sensitive Account Credentials
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Protected banking and KYC identifiers
                </p>
              </div>
              <span
                className={`text-xs font-semibold inline-flex items-center gap-1 ${
                  isUnlocked ? 'text-[#16A34A]' : 'text-amber-700'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    <span>Revealed</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Masked</span>
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-gray-100">
                <span className="text-gray-500 block">Virtual Naira Account</span>
                <span
                  data-testid="sensitive-account-number"
                  className="font-mono text-sm font-bold text-gray-950 mt-1 block tabular-nums"
                >
                  {isUnlocked
                    ? state.profile.virtualAccountNumber
                    : maskSensitiveValue(state.profile.virtualAccountNumber)}
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5 block">
                  {state.profile.virtualBankName}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-gray-100">
                <span className="text-gray-500 block">BVN / KYC Reference</span>
                <span
                  data-testid="sensitive-bvn-number"
                  className="font-mono text-sm font-bold text-gray-950 mt-1 block tabular-nums"
                >
                  {isUnlocked
                    ? state.profile.bvnNumber
                    : maskSensitiveValue(state.profile.bvnNumber, 3)}
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5 block">
                  {state.profile.tier}
                </span>
              </div>
            </div>
          </section>

          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-gray-950">
                Account Details
              </h3>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                {state.profile.tier}
              </span>
            </div>

            {!isUnlocked && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
                Authenticate via the Biometric Security Vault above to edit your contact details.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="prof-name" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  id="prof-name"
                  type="text"
                  required
                  disabled={!isUnlocked}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
              <div>
                <label htmlFor="prof-phone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  id="prof-phone"
                  type="tel"
                  required
                  disabled={!isUnlocked}
                  value={isUnlocked ? phone : maskSensitiveValue(phone)}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="prof-email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="prof-email"
                  type="email"
                  required
                  disabled={!isUnlocked}
                  value={isUnlocked ? email : '••••••@kusop.demo'}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
              <div>
                <label htmlFor="prof-city" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Primary City
                </label>
                <input
                  id="prof-city"
                  type="text"
                  required
                  disabled={!isUnlocked}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isUnlocked}
              className="min-h-[46px] px-6 py-2.5 rounded-2xl bg-[#0D4A31] hover:bg-[#115E3F] disabled:opacity-50 text-white font-semibold text-sm transition-colors"
            >
              {isUnlocked ? 'Save Profile Changes' : 'Unlock Biometrics to Edit'}
            </button>
          </form>
        </div>

        {/* Quick Links: Notifications, Help & Support, About KuSOP, Reset */}
        <section className="lg:col-span-5 bg-white rounded-3xl border border-gray-200/80 p-5 space-y-1">
          <h3 className="font-display text-base font-bold text-gray-950 px-2 pb-2">
            Preferences & Information
          </h3>

          <button
            type="button"
            onClick={() => onNavigate('notifications')}
            className="w-full min-h-[54px] px-3 rounded-2xl flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-3 text-sm font-medium text-gray-900">
              <Bell className="w-4 h-4 text-[#0D4A31]" aria-hidden="true" />
              <span>Notifications</span>
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('support')}
            className="w-full min-h-[54px] px-3 rounded-2xl flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-3 text-sm font-medium text-gray-900">
              <HelpCircle className="w-4 h-4 text-[#0D4A31]" aria-hidden="true" />
              <span>Help and Support</span>
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('about')}
            className="w-full min-h-[54px] px-3 rounded-2xl flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-3 text-sm font-medium text-gray-900">
              <Info className="w-4 h-4 text-[#0D4A31]" aria-hidden="true" />
              <span>About KuSOP</span>
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
          </button>

          <PWAInstallButton variant="menu" />

          <div className="pt-3 mt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onResetDemo}
              className="w-full min-h-[48px] px-3 rounded-2xl flex items-center gap-3 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Reset All Demo Data</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
