import { useState } from 'react';
import { Download, RefreshCw, Share, Smartphone, WifiOff, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'card' | 'menu';
}

export function PWAInstallButton({ variant = 'compact' }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // Suppress install affordance when already running in standalone mode
  if (isInstalled) {
    if (variant === 'menu') {
      return (
        <div className="px-3 py-3 rounded-2xl bg-[#EAF7F0] text-xs font-semibold text-[#0D4A31] flex items-center gap-2.5">
          <Smartphone className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Running in Installed App Mode</span>
        </div>
      );
    }
    return null;
  }

  const handleTrigger = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  // In compact header mode, show when native prompt is ready or on iOS;
  // in sidebar/menu mode, always provide install/instructions access
  if (variant === 'compact' && !isInstallable && !isIOS) {
    return null;
  }

  const buttonLabel = isInstallable
    ? 'Install KuSOP App'
    : isIOS
      ? 'Add to iPhone Home Screen'
      : 'Install App Guide';

  return (
    <>
      {variant === 'compact' ? (
        <button
          type="button"
          onClick={handleTrigger}
          aria-label={buttonLabel}
          className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#0D4A31] hover:bg-[#115E3F] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{isIOS ? 'Add App' : 'Install'}</span>
        </button>
      ) : variant === 'menu' ? (
        <button
          type="button"
          onClick={handleTrigger}
          className="w-full min-h-[54px] px-3 rounded-2xl flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-3 text-sm font-medium text-gray-900">
            <Download className="w-4 h-4 text-[#0D4A31]" aria-hidden="true" />
            <span>{buttonLabel}</span>
          </span>
          <span className="text-xs font-semibold text-[#16A34A]">PWA</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleTrigger}
          className="w-full min-h-[44px] px-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-[#0D4A31] bg-[#EAF7F0] hover:bg-[#D5EFE0] transition-colors"
        >
          <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{buttonLabel}</span>
        </button>
      )}

      {showGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#16A34A]">KuSOP Mobile PWA</p>
                <h3 id="pwa-guide-title" className="font-display text-lg font-bold text-gray-950 mt-0.5">
                  Install KuSOP on Your Device
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close installation guide"
                className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-gray-200/80">
                <p className="font-bold text-gray-950 flex items-center gap-1.5">
                  <Share className="w-3.5 h-3.5 text-[#0D4A31]" aria-hidden="true" />
                  iPhone / iPad (Safari)
                </p>
                <p className="mt-1">
                  1. Tap the <strong>Share</strong> icon in the Safari toolbar.<br />
                  2. Scroll down and tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-gray-200/80">
                <p className="font-bold text-gray-950 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#0D4A31]" aria-hidden="true" />
                  Android / Desktop (Chrome or Edge)
                </p>
                <p className="mt-1">
                  Open the browser menu and tap <strong>Install app</strong> (or click the install icon in the address bar) to launch KuSOP Mobile in standalone mode.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full min-h-[46px] rounded-2xl bg-[#0D4A31] hover:bg-[#115E3F] text-white text-sm font-semibold transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function OfflineAndUpdateStatus() {
  const { isOnline, needsRefresh, applyUpdate } = usePWAInstall();

  if (isOnline && !needsRefresh) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 z-50 flex flex-col gap-2 max-w-xs">
      {!isOnline && (
        <div
          role="status"
          data-testid="offline-indicator"
          className="rounded-2xl bg-amber-600 text-white px-4 py-2.5 text-xs font-semibold shadow-lg flex items-center gap-2"
        >
          <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Offline Mode · Using cached KuSOP data</span>
        </div>
      )}
      {needsRefresh && (
        <div
          role="status"
          className="rounded-2xl bg-[#0D4A31] text-white px-4 py-2.5 text-xs font-semibold shadow-lg flex items-center justify-between gap-3"
        >
          <span>New KuSOP update ready</span>
          <button
            type="button"
            onClick={applyUpdate}
            className="min-h-[34px] px-3 rounded-xl bg-[#22C55E] text-gray-950 font-bold inline-flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reload</span>
          </button>
        </div>
      )}
    </div>
  );
}
