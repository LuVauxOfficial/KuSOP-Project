import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Fingerprint,
  Lock,
  ScanFace,
  ShieldCheck,
  Unlock,
} from 'lucide-react';
import type { BiometricMethod, BiometricSecurityState } from '../types/kusop';

interface BiometricAuthCardProps {
  biometric: BiometricSecurityState;
  onUnlock: (method: BiometricMethod) => void;
  onLock: () => void;
  onFailedScan: () => void;
  onUpdatePrefs: (
    updates: Partial<Pick<BiometricSecurityState, 'method' | 'requireForWalletActions'>>
  ) => void;
}

export function BiometricAuthCard({
  biometric,
  onUnlock,
  onLock,
  onFailedScan,
  onUpdatePrefs,
}: BiometricAuthCardProps) {
  const [scanPhase, setScanPhase] = useState<'idle' | 'scanning' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (scanPhase !== 'scanning') return;
    setProgress(20);
    const t1 = window.setTimeout(() => setProgress(65), 180);
    const t2 = window.setTimeout(() => setProgress(100), 380);
    const t3 = window.setTimeout(() => {
      setScanPhase('idle');
      setProgress(0);
      onUnlock(biometric.method);
    }, 560);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [scanPhase, biometric.method, onUnlock]);

  const handleSimulateFail = () => {
    setScanPhase('failed');
    onFailedScan();
  };

  const Icon = biometric.method === 'Face ID' ? ScanFace : Fingerprint;

  return (
    <section
      aria-label="Biometric Security Simulation"
      data-testid="biometric-auth-card"
      className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              biometric.isUnlocked
                ? 'bg-[#EAF7F0] text-[#16A34A]'
                : 'bg-[#0D4A31] text-white'
            }`}
          >
            {biometric.isUnlocked ? (
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Lock className="w-5 h-5" aria-hidden="true" />
            )}
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-gray-950">
              Biometric Security Vault
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {biometric.isUnlocked
                ? `Unlocked via ${biometric.method} · ${biometric.lastVerifiedAt ?? 'Active session'}`
                : 'Locked · Verify your biometrics to view sensitive account IDs and unlock wallet actions'}
            </p>
          </div>
        </div>

        <span
          data-testid="biometric-status-label"
          className={`text-xs font-semibold inline-flex items-center gap-1.5 ${
            biometric.isUnlocked ? 'text-[#16A34A]' : 'text-amber-700'
          }`}
        >
          {biometric.isUnlocked ? (
            <>
              <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Unlocked</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Locked</span>
            </>
          )}
        </span>
      </div>

      {/* Method Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1.5">Biometric Method</p>
          <div className="inline-flex p-1 bg-gray-100 rounded-xl gap-1">
            {(['Fingerprint', 'Face ID'] as BiometricMethod[]).map((method) => {
              const active = biometric.method === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    setScanPhase('idle');
                    onUpdatePrefs({ method });
                  }}
                  className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                    active
                      ? 'bg-white text-[#0D4A31] shadow-xs'
                      : 'text-gray-600 hover:text-gray-950'
                  }`}
                >
                  {method === 'Fingerprint' ? (
                    <Fingerprint className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <ScanFace className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>{method}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={biometric.requireForWalletActions}
          onClick={() =>
            onUpdatePrefs({
              requireForWalletActions: !biometric.requireForWalletActions,
            })
          }
          className={`min-h-[44px] px-3.5 py-2 rounded-2xl border text-xs font-semibold transition-colors inline-flex items-center gap-2 ${
            biometric.requireForWalletActions
              ? 'bg-[#EAF7F0] border-[#0D4A31]/30 text-[#0D4A31]'
              : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}
        >
          <span>Protect Wallet Funding: {biometric.requireForWalletActions ? 'On' : 'Off'}</span>
        </button>
      </div>

      {/* Interactive Scanner Simulation */}
      {!biometric.isUnlocked ? (
        <div className="rounded-2xl bg-[#F8FAF9] border border-gray-200/80 p-5 flex flex-col items-center text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
              scanPhase === 'scanning'
                ? 'bg-[#EAF7F0] border-[#16A34A] text-[#0D4A31] scale-105'
                : scanPhase === 'failed'
                  ? 'bg-red-50 border-red-400 text-red-700'
                  : 'bg-white border-gray-200 text-[#0D4A31]'
            }`}
          >
            <Icon className="w-9 h-9" aria-hidden="true" />
          </div>

          <p className="text-sm font-semibold text-gray-950 mt-3">
            {scanPhase === 'scanning'
              ? `Verifying ${biometric.method} sensor...`
              : scanPhase === 'failed'
                ? `${biometric.method} match failed — try again`
                : `Touch or scan ${biometric.method} to unlock`}
          </p>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Simulates device-level biometric verification before exposing your Virtual Naira Account, BVN reference, or enabling wallet top-ups.
          </p>

          {scanPhase === 'scanning' && (
            <div
              className="w-full max-w-xs h-1.5 bg-gray-200 rounded-full overflow-hidden mt-3"
              aria-label="Biometric scan progress"
            >
              <div
                className="h-full bg-[#16A34A] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {scanPhase === 'failed' && (
            <p
              role="alert"
              className="mt-3 text-xs text-red-700 inline-flex items-center gap-1.5 font-medium"
            >
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                No match detected (Attempts: {biometric.failedAttempts}). Retry {biometric.method} verification.
              </span>
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 w-full">
            <button
              type="button"
              disabled={scanPhase === 'scanning'}
              onClick={() => setScanPhase('scanning')}
              className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-[#0D4A31] hover:bg-[#115E3F] disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>
                {scanPhase === 'scanning'
                  ? 'Scanning...'
                  : `Authenticate with ${biometric.method}`}
              </span>
            </button>

            <button
              type="button"
              disabled={scanPhase === 'scanning'}
              onClick={handleSimulateFail}
              className="min-h-[46px] px-4 py-2.5 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors"
            >
              Simulate Failed Scan
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#EAF7F0] border border-[#BDE4CD] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#0D4A31]">
              Sensitive Access Granted
            </p>
            <p className="text-xs text-gray-700 mt-0.5">
              Full account identifiers, profile editing, and KuSOP Wallet funding are currently unlocked.
            </p>
          </div>
          <button
            type="button"
            onClick={onLock}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-white border border-[#0D4A31]/25 text-[#0D4A31] text-xs font-semibold hover:bg-emerald-50 inline-flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Lock Vault</span>
          </button>
        </div>
      )}
    </section>
  );
}
