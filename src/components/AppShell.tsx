import type { ReactNode } from 'react';
import {
  ArrowLeft,
  BatteryCharging,
  Bell,
  Car,
  Clock,
  Compass,
  Home,
  Leaf,
  Package,
  RotateCcw,
  User,
  Utensils,
  Wallet,
} from 'lucide-react';
import type { RouteId } from '../types/kusop';
import { formatNaira } from '../utils/kusopLogic';
import { PWAInstallButton } from './PWAControls';

interface AppShellProps {
  route: RouteId;
  pageTitle: string;
  canGoBack: boolean;
  walletBalance: number;
  unreadNotifications: number;
  cartCount: number;
  onNavigate: (route: RouteId) => void;
  onBack: () => void;
  onResetDemo: () => void;
  children: ReactNode;
}

const PRIMARY_TABS: { id: RouteId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'activity', label: 'Activity', icon: Clock },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User },
];

const SERVICE_SHORTCUTS: { id: RouteId; label: string; icon: typeof Package }[] = [
  { id: 'delivery', label: 'KuSOP Delivery', icon: Package },
  { id: 'food', label: 'KuSOP Food', icon: Utensils },
  { id: 'swap', label: 'Battery Swap', icon: BatteryCharging },
  { id: 'ev', label: 'EV Service', icon: Car },
];

function getActiveTab(route: RouteId): RouteId {
  if (route === 'discover') return 'discover';
  if (route === 'activity') return 'activity';
  if (route === 'wallet') return 'wallet';
  if (route === 'profile' || route === 'support' || route === 'about') return 'profile';
  return 'home';
}

export function AppShell({
  route,
  pageTitle,
  canGoBack,
  walletBalance,
  unreadNotifications,
  cartCount,
  onNavigate,
  onBack,
  onResetDemo,
  children,
}: AppShellProps) {
  const activeTab = getActiveTab(route);
  const isHome = route === 'home';

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-gray-900 flex flex-col lg:flex-row overflow-x-hidden">
      {/* Desktop Left Navigation Rail */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-gray-200/80 z-30">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-[#0D4A31] rounded-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0D4A31] text-white flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-gray-950 block leading-none">
                KuSOP
              </span>
              <span className="text-[11px] text-gray-500 block mt-0.5">
                Green Super-App
              </span>
            </div>
          </button>
        </div>

        <div className="px-4 py-4 border-b border-gray-100">
          <button
            type="button"
            onClick={() => onNavigate('wallet')}
            className="w-full text-left p-3.5 rounded-2xl bg-[#0D4A31] text-white hover:bg-[#115E3F] transition-colors"
          >
            <span className="text-[11px] text-emerald-200 block">Demo Wallet Balance</span>
            <span className="font-mono font-semibold text-lg tabular-nums block mt-0.5">
              {formatNaira(walletBalance)}
            </span>
          </button>
        </div>

        <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="px-3 text-xs font-medium text-gray-500 mb-2">Main Menu</p>
            <ul className="space-y-1">
              {PRIMARY_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id && (isHome || tab.id !== 'home');
                return (
                  <li key={tab.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate(tab.id)}
                      className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-[#E8F6EE] text-[#0D4A31] font-semibold'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="px-3 text-xs font-medium text-gray-500 mb-2">Core Services</p>
            <ul className="space-y-1">
              {SERVICE_SHORTCUTS.map((svc) => {
                const Icon = svc.icon;
                const active = route.startsWith(svc.id);
                return (
                  <li key={svc.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate(svc.id)}
                      className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl flex items-center justify-between text-sm font-medium transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-[#E8F6EE] text-[#0D4A31] font-semibold'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{svc.label}</span>
                      </span>
                      {svc.id === 'food' && cartCount > 0 && (
                        <span className="font-mono text-xs font-semibold text-[#16A34A] tabular-nums">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <PWAInstallButton variant="card" />

          <button
            type="button"
            onClick={() => onNavigate('notifications')}
            className="w-full min-h-[44px] px-3 rounded-xl flex items-center justify-between text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center gap-2.5 font-medium">
              <Bell className="w-4 h-4" aria-hidden="true" />
              <span>Notifications</span>
            </span>
            {unreadNotifications > 0 && (
              <span className="font-mono text-xs font-semibold text-[#0D4A31] tabular-nums">
                {unreadNotifications} new
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onResetDemo}
            className="w-full min-h-[44px] px-3 rounded-xl flex items-center gap-2.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        {/* Compact Sticky Top Bar with iPhone safe area */}
        <header className="sticky top-0 z-30 pt-safe bg-white/95 backdrop-blur-md border-b border-gray-200/80">
          <div className="h-14 px-4 lg:px-8 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {canGoBack && !isHome ? (
                <button
                  type="button"
                  onClick={onBack}
                  aria-label="Go back"
                  className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center rounded-xl text-gray-800 hover:bg-gray-100 transition-colors shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                </button>
              ) : (
                <div className="lg:hidden w-8 h-8 rounded-xl bg-[#0D4A31] text-white flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4" aria-hidden="true" />
                </div>
              )}

              <div className="min-w-0">
                <h1 className="font-display font-bold text-base lg:text-lg text-gray-950 truncate">
                  {isHome ? 'KuSOP Mobile' : pageTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <PWAInstallButton variant="compact" />

              {!isHome && (
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  aria-label="Return home"
                  className="min-h-[44px] px-3 rounded-xl text-xs font-semibold text-[#0D4A31] bg-[#E8F6EE] hover:bg-[#D5EFE0] transition-colors whitespace-nowrap"
                >
                  Home
                </button>
              )}

              <button
                type="button"
                onClick={() => onNavigate('notifications')}
                aria-label={`Notifications (${unreadNotifications} unread)`}
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-2 right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#16A34A] text-white text-[10px] font-mono font-bold flex items-center justify-center leading-none tabular-nums">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('profile')}
                aria-label="Open customer profile"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 transition-colors lg:hidden"
              >
                <User className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 pt-5 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar with iPhone Home Indicator safe area */}
      <nav
        aria-label="Bottom navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe bg-white/95 backdrop-blur-md border-t border-gray-200"
      >
        <div className="h-16 grid grid-cols-5 items-center px-1">
          {PRIMARY_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onNavigate(tab.id)}
                aria-current={active ? 'page' : undefined}
                className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-colors ${
                  active ? 'text-[#0D4A31]' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${active ? 'stroke-[2.4]' : 'stroke-[1.8]'}`}
                  aria-hidden="true"
                />
                <span className={`text-[11px] mt-0.5 leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
