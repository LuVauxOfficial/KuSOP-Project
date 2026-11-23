import { useState } from 'react';
import {
  BatteryCharging,
  Car,
  Clock,
  Package,
  Utensils,
  Wallet,
} from 'lucide-react';
import type { KuSOPState, RouteId, TransactionCategory } from '../types/kusop';

interface ActivityViewProps {
  state: KuSOPState;
  onNavigate: (route: RouteId) => void;
}

const FILTERS: { id: 'all' | TransactionCategory; label: string }[] = [
  { id: 'all', label: 'All Activity' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'food', label: 'Food' },
  { id: 'swap', label: 'Battery Swap' },
  { id: 'ev', label: 'EV Service' },
];

function getIcon(category: TransactionCategory) {
  switch (category) {
    case 'wallet':
      return Wallet;
    case 'delivery':
      return Package;
    case 'food':
      return Utensils;
    case 'swap':
      return BatteryCharging;
    case 'ev':
      return Car;
  }
}

function getTargetRoute(category: TransactionCategory): RouteId {
  switch (category) {
    case 'wallet':
      return 'wallet';
    case 'delivery':
      return 'delivery-track';
    case 'food':
      return 'food-track';
    case 'swap':
      return 'swap-history';
    case 'ev':
      return 'ev';
  }
}

export function ActivityView({ state, onNavigate }: ActivityViewProps) {
  const [filter, setFilter] = useState<'all' | TransactionCategory>('all');

  const items =
    filter === 'all'
      ? state.activities
      : state.activities.filter((a) => a.category === filter);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 sm:p-6">
        <p className="text-xs font-semibold text-[#0D4A31]">Unified Platform Timeline</p>
        <h2 className="font-display text-xl font-bold text-gray-950 mt-1">
          Recent KuSOP Activity
        </h2>
        <p className="text-sm text-gray-700 mt-1">
          Every wallet top-up, delivery booking, food order, battery swap, and EV enquiry updates here automatically.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              filter === f.id
                ? 'bg-[#0D4A31] text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6">
        {items.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Clock className="w-9 h-9 text-gray-300 mx-auto" aria-hidden="true" />
            <p className="text-sm font-semibold text-gray-700">
              No activity in this category yet
            </p>
            <p className="text-xs text-gray-500">
              Try performing an action in {filter === 'all' ? 'any KuSOP service' : filter} to see it logged here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((act) => {
              const Icon = getIcon(act.category);
              const isCredit = act.amountText?.startsWith('+');
              return (
                <li key={act.id} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => onNavigate(getTargetRoute(act.category))}
                    className="w-full flex items-center justify-between gap-3 text-left hover:bg-gray-50/80 rounded-2xl p-2 -mx-2 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] text-[#0D4A31] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-950 truncate">
                          {act.title}
                        </p>
                        <p className="text-xs text-gray-600 truncate mt-0.5">
                          {act.detail}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {act.timestamp}
                        </p>
                      </div>
                    </div>
                    {act.amountText && (
                      <span
                        className={`font-mono text-sm font-bold tabular-nums shrink-0 ${
                          isCredit ? 'text-[#16A34A]' : 'text-gray-950'
                        }`}
                      >
                        {act.amountText}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
