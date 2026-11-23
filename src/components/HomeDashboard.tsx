import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BatteryCharging,
  Car,
  ChevronRight,
  History,
  Package,
  Plus,
  Utensils,
} from 'lucide-react';
import { HERO_BANNER_IMAGE } from '../data/seedData';
import type { KuSOPState, RouteId } from '../types/kusop';
import { formatNaira } from '../utils/kusopLogic';
import { SafeImage } from './SafeImage';

interface HomeDashboardProps {
  state: KuSOPState;
  onNavigate: (route: RouteId) => void;
}

const CORE_SERVICES: {
  id: RouteId;
  title: string;
  subtitle: string;
  icon: typeof Package;
}[] = [
  {
    id: 'delivery',
    title: 'KuSOP Delivery',
    subtitle: 'Instant & scheduled EV dispatch',
    icon: Package,
  },
  {
    id: 'food',
    title: 'KuSOP Food',
    subtitle: 'Local kitchens delivered hot',
    icon: Utensils,
  },
  {
    id: 'swap',
    title: 'Battery Swap',
    subtitle: '45-second LFP pack exchange',
    icon: BatteryCharging,
  },
  {
    id: 'ev',
    title: 'EV Service',
    subtitle: 'Buy, Pay Small Small & Lease',
    icon: Car,
  },
];

export function HomeDashboard({ state, onNavigate }: HomeDashboardProps) {
  const firstName = state.profile.fullName.split(' ')[0] || 'Customer';
  const recentTxns = state.transactions.slice(0, 3);
  const readyPacksCount = state.stations.reduce(
    (sum, s) => sum + s.bays.filter((b) => b.status === 'Ready').length,
    0
  );

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* Greeting Header */}
      <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1.5">
        <div>
          <p className="text-xs font-medium text-gray-500">
            {state.profile.city} · {state.profile.tier}
          </p>
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-gray-950 tracking-tight mt-0.5">
            Good morning, {firstName}
          </h2>
        </div>
        <p className="text-xs text-gray-500">
          Interactive prototype · All balances and transactions are simulated
        </p>
      </section>

      {/* Top Grid: Wallet Card + Promotional Hero Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
        {/* Wallet Hero Card */}
        <section
          aria-label="KuSOP Wallet Summary"
          className="lg:col-span-5 rounded-3xl bg-[#0D4A31] text-white p-5 sm:p-6 flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-emerald-200">
                KuSOP Demo Wallet
              </span>
              <button
                type="button"
                onClick={() => onNavigate('wallet')}
                className="min-h-[36px] px-2.5 rounded-xl text-xs font-medium text-emerald-100 hover:bg-white/10 transition-colors inline-flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Transaction History</span>
              </button>
            </div>

            <div className="mt-3 sm:mt-4">
              <p className="text-xs text-emerald-200/90">Available Balance</p>
              <p
                data-testid="home-wallet-balance"
                className="font-mono text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums mt-1"
              >
                {formatNaira(state.walletBalance)}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/15 flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('wallet')}
              className="flex-1 min-h-[46px] px-4 py-2.5 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-gray-950 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              <span>Add Funds</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('activity')}
              className="min-h-[46px] px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span>Activity</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Promotional Green Mobility Banner */}
        <section
          aria-label="Featured green mobility highlight"
          className="lg:col-span-7 relative rounded-3xl overflow-hidden bg-[#06281A] min-h-[200px] sm:min-h-[220px] flex items-end"
        >
          <SafeImage
            src={HERO_BANNER_IMAGE}
            alt="KuSOP electric delivery motorbike in modern urban corridor"
            className="absolute inset-0 w-full h-full object-cover object-center"
            fallbackTitle="KuSOP Electric Mobility"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06281A]/95 via-[#06281A]/70 to-[#06281A]/35 lg:bg-gradient-to-r lg:from-[#06281A]/95 lg:via-[#06281A]/75 lg:to-black/25" />
          <div className="relative z-10 p-5 sm:p-6 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-3.5">
            <div className="max-w-md">
              <p className="text-xs font-semibold text-emerald-200">
                Zero-Emission Urban Fleet · {readyPacksCount} Charged Packs Ready
              </p>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-1 leading-snug text-balance">
                Own an Electric Bike with Pay Small Small
              </h3>
              <p className="text-xs sm:text-sm text-emerald-50/90 mt-1">
                Flexible 6 to 24 month plans with instant access to KuSOP battery swap hubs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('ev-installment')}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-white text-[#0D4A31] font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors shrink-0 whitespace-nowrap"
            >
              <span>Explore Plans</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>

      {/* 4 Core Services Grid (Light Green Service Cards) */}
      <section aria-label="Core Services">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-bold text-gray-950">
            KuSOP Services
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('discover')}
            className="min-h-[40px] px-2 text-xs font-semibold text-[#0D4A31] hover:underline inline-flex items-center gap-1"
          >
            <span>Explore ecosystem</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {CORE_SERVICES.map((svc) => {
            const Icon = svc.icon;
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => onNavigate(svc.id)}
                className="group text-left p-4 sm:p-5 rounded-2xl bg-[#EAF7F0] hover:bg-[#DCF1E5] border border-[#CFEAD9] transition-colors flex flex-col justify-between min-h-[132px]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-[#0D4A31] text-white flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <ChevronRight
                    className="w-4 h-4 text-[#0D4A31]/60 group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-4">
                  <span className="font-display font-bold text-sm sm:text-base text-gray-950 block">
                    {svc.title}
                  </span>
                  <span className="text-xs text-gray-600 mt-0.5 block leading-snug">
                    {svc.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Secondary Promo Strip + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Quick Shortcuts / Live Status */}
        <section className="lg:col-span-5 bg-white rounded-3xl border border-gray-200/80 p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-gray-950">
              Active Highlights
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Jump directly to your live demo orders & swap hubs
            </p>

            <div className="mt-4 divide-y divide-gray-100">
              <button
                type="button"
                onClick={() => onNavigate('delivery-track')}
                className="w-full min-h-[56px] py-3 flex items-center justify-between gap-3 text-left hover:bg-gray-50/80 rounded-xl px-2 -mx-2 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-950 truncate">
                    Track Delivery · {state.deliveries[0]?.trackingCode ?? 'None'}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {state.deliveries[0]?.status ?? 'No deliveries'} · {state.deliveries[0]?.etaText ?? ''}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('food-track')}
                className="w-full min-h-[56px] py-3 flex items-center justify-between gap-3 text-left hover:bg-gray-50/80 rounded-xl px-2 -mx-2 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-950 truncate">
                    Food Order · {state.foodOrders[0]?.orderCode ?? 'None'}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {state.foodOrders[0]?.restaurantName ?? 'Order a meal'} · {state.foodOrders[0]?.status ?? ''}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('swap-initiate')}
                className="w-full min-h-[56px] py-3 flex items-center justify-between gap-3 text-left hover:bg-gray-50/80 rounded-xl px-2 -mx-2 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-950 truncate">
                    Nearest Hub · {state.stations[0]?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {state.stations[0]?.distanceKm} km away · {state.stations[0]?.bays.filter((b) => b.status === 'Ready').length} packs ready
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {/* Recent Wallet Transactions */}
        <section className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-display text-base font-bold text-gray-950">
                Recent Transactions
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Latest activity across your KuSOP Wallet
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('wallet')}
              className="min-h-[40px] px-3 rounded-xl text-xs font-semibold text-[#0D4A31] bg-[#E8F6EE] hover:bg-[#D5EFE0] transition-colors"
            >
              View All
            </button>
          </div>

          {recentTxns.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              No transactions recorded yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentTxns.map((txn) => {
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
                          {txn.subtitle} · {txn.timestamp}
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
                      <span className="text-[11px] text-gray-500 block">
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
