import {
  BatteryCharging,
  Car,
  ChevronRight,
  Leaf,
  Package,
  Utensils,
} from 'lucide-react';
import { HERO_BANNER_IMAGE } from '../data/seedData';
import type { KuSOPState, RouteId } from '../types/kusop';
import { SafeImage } from './SafeImage';

interface DiscoverViewProps {
  state: KuSOPState;
  onNavigate: (route: RouteId) => void;
}

export function DiscoverView({ state, onNavigate }: DiscoverViewProps) {
  const greenTrips = state.deliveries.length + state.foodOrders.length + state.swapHistory.length;
  const co2SavedKg = (greenTrips * 1.8).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="relative rounded-3xl overflow-hidden bg-gray-900 min-h-[200px] flex items-end">
        <SafeImage
          src={HERO_BANNER_IMAGE}
          alt="KuSOP electric mobility fleet"
          className="absolute inset-0 w-full h-full object-cover"
          fallbackTitle="Discover KuSOP"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
        <div className="relative z-10 p-6">
          <p className="text-xs font-medium text-emerald-300">Discover KuSOP Ecosystem</p>
          <h2 className="font-display text-2xl font-bold text-white mt-1">
            Cleaner Cities, Everyday Convenience
          </h2>
          <p className="text-xs sm:text-sm text-gray-200 mt-1 max-w-xl">
            Every parcel, hot meal, and battery swap in KuSOP reduces urban emissions while keeping daily commerce fast.
          </p>
        </div>
      </div>

      {/* Sustainability Impact Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-gray-200/80 p-5">
          <p className="text-xs text-gray-500">Demo Green Trips</p>
          <p className="font-mono text-2xl font-bold text-[#0D4A31] mt-1 tabular-nums">
            {greenTrips}
          </p>
          <p className="text-xs text-gray-500 mt-1">Across Delivery, Food & Swaps</p>
        </div>
        <div className="bg-white rounded-3xl border border-gray-200/80 p-5">
          <p className="text-xs text-gray-500">Estimated CO₂ Offset</p>
          <p className="font-mono text-2xl font-bold text-[#16A34A] mt-1 tabular-nums">
            {co2SavedKg} kg
          </p>
          <p className="text-xs text-gray-500 mt-1">Compared to petrol motorbikes</p>
        </div>
        <div className="bg-white rounded-3xl border border-gray-200/80 p-5">
          <p className="text-xs text-gray-500">Active Swap Stations</p>
          <p className="font-mono text-2xl font-bold text-gray-950 mt-1 tabular-nums">
            {state.stations.length} Hubs
          </p>
          <p className="text-xs text-gray-500 mt-1">Lekki · Victoria Island · Yaba</p>
        </div>
      </section>

      {/* Featured Journeys */}
      <section>
        <h3 className="font-display text-lg font-bold text-gray-950 mb-3">
          Recommended Experiences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onNavigate('delivery-schedule')}
            className="text-left p-5 rounded-3xl bg-[#EAF7F0] hover:bg-[#DCF1E5] border border-[#CFEAD9] transition-colors flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#0D4A31] text-white flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm font-bold text-gray-950">
                  Eco-Batch Scheduled Delivery
                </h4>
                <ChevronRight className="w-4 h-4 text-[#0D4A31]" aria-hidden="true" />
              </div>
              <p className="text-xs text-gray-700 mt-1">
                Save ₦200 on every scheduled pickup window for recurring business deliveries.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('food')}
            className="text-left p-5 rounded-3xl bg-[#EAF7F0] hover:bg-[#DCF1E5] border border-[#CFEAD9] transition-colors flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#0D4A31] text-white flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm font-bold text-gray-950">
                  Zero-Emission Food Kitchens
                </h4>
                <ChevronRight className="w-4 h-4 text-[#0D4A31]" aria-hidden="true" />
              </div>
              <p className="text-xs text-gray-700 mt-1">
                Explore Jollof bowls, Suya platters, and fresh tilapia delivered by silent e-scooters.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('swap-availability')}
            className="text-left p-5 rounded-3xl bg-[#EAF7F0] hover:bg-[#DCF1E5] border border-[#CFEAD9] transition-colors flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#0D4A31] text-white flex items-center justify-center shrink-0">
              <BatteryCharging className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm font-bold text-gray-950">
                  Live Battery Cabinet Status
                </h4>
                <ChevronRight className="w-4 h-4 text-[#0D4A31]" aria-hidden="true" />
              </div>
              <p className="text-xs text-gray-700 mt-1">
                Check real-time State of Charge across Lekki, VI, and Yaba swap hubs before riding.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('ev-installment')}
            className="text-left p-5 rounded-3xl bg-[#EAF7F0] hover:bg-[#DCF1E5] border border-[#CFEAD9] transition-colors flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#0D4A31] text-white flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm font-bold text-gray-950">
                  Pay Small Small EV Ownership
                </h4>
                <ChevronRight className="w-4 h-4 text-[#0D4A31]" aria-hidden="true" />
              </div>
              <p className="text-xs text-gray-700 mt-1">
                Calculate monthly installments for a KuSOP Volt S1 or Emerald Urban E4.
              </p>
            </div>
          </button>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-gray-200/80 p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] text-[#0D4A31] flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-950">Learn more about KuSOP</p>
            <p className="text-xs text-gray-500">Read our platform mission and clean mobility architecture.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('about')}
          className="min-h-[42px] px-4 rounded-xl bg-[#0D4A31] text-white text-xs font-semibold hover:bg-[#115E3F] transition-colors shrink-0"
        >
          About KuSOP
        </button>
      </section>
    </div>
  );
}
