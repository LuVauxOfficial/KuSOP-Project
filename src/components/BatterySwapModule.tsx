import { useState } from 'react';
import {
  BatteryCharging,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  Zap,
} from 'lucide-react';
import type { KuSOPState, RouteId, SwapRecord } from '../types/kusop';
import { formatNaira } from '../utils/kusopLogic';

interface BatterySwapModuleProps {
  route: RouteId;
  state: KuSOPState;
  onNavigate: (route: RouteId) => void;
  onInitiateSwap: (stationId: string, bayNumber: number) => SwapRecord | null;
}

const SWAP_OPTIONS: {
  route: RouteId;
  title: string;
  description: string;
  icon: typeof MapPin;
}[] = [
  {
    route: 'swap-stations',
    title: 'Find Swap Stations',
    description: 'Browse nearby automated battery cabinets across Lagos corridors.',
    icon: MapPin,
  },
  {
    route: 'swap-availability',
    title: 'Check Battery Availability',
    description: 'Inspect live bay charge levels and ready 95%+ LFP packs.',
    icon: BatteryCharging,
  },
  {
    route: 'swap-initiate',
    title: 'Initiate Battery Swap',
    description: 'Simulate unlocking a bay, exchanging your depleted pack, and paying.',
    icon: Zap,
  },
  {
    route: 'swap-history',
    title: 'Swap History',
    description: 'Review past pack exchanges, energy delivered (kWh), and swap fees.',
    icon: Clock,
  },
];

export function BatterySwapModule({
  route,
  state,
  onNavigate,
  onInitiateSwap,
}: BatterySwapModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStationId, setSelectedStationId] = useState(
    state.stations[0]?.id ?? 'stn-lekki'
  );
  const [selectedBayNumber, setSelectedBayNumber] = useState<number>(1);
  const [swapReceipt, setSwapReceipt] = useState<SwapRecord | null>(null);

  const selectedStation =
    state.stations.find((s) => s.id === selectedStationId) ?? state.stations[0];

  // Sub-page: Find Swap Stations
  if (route === 'swap-stations') {
    const filtered = state.stations.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.area.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 sm:p-6">
          <p className="text-xs font-semibold text-[#0D4A31]">KuSOP Swap Network</p>
          <h2 className="font-display text-xl font-bold text-gray-950 mt-1">
            Find Swap Stations Near You
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            Automated solar-assisted cabinets positioned along high-density commuter and logistics routes.
          </p>
        </div>

        <div className="relative">
          <label htmlFor="station-search" className="sr-only">
            Search swap stations by area or hub name
          </label>
          <Search
            className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            id="station-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by area (Lekki, Victoria Island, Yaba)..."
            className="w-full min-h-[46px] pl-11 pr-4 rounded-2xl bg-white border border-gray-200 text-sm text-gray-950 focus:outline-2 focus:outline-[#0D4A31]"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 text-center">
            <p className="text-sm font-medium text-gray-600">
              No stations matched &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((stn) => {
              const readyCount = stn.bays.filter((b) => b.status === 'Ready').length;
              return (
                <div
                  key={stn.id}
                  className="bg-white rounded-3xl border border-gray-200/80 p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-semibold text-[#0D4A31]">{stn.area}</span>
                      <span className="font-mono tabular-nums">{stn.distanceKm} km away</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-gray-950 mt-1">
                      {stn.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">{stn.address}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {stn.hours} · Fee {formatNaira(stn.swapFee)}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#16A34A]">
                      {readyCount} of {stn.bays.length} packs ready
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStationId(stn.id);
                        onNavigate('swap-availability');
                      }}
                      className="min-h-[40px] px-3.5 rounded-xl bg-[#EAF7F0] hover:bg-[#D5EFE0] text-[#0D4A31] text-xs font-semibold transition-colors"
                    >
                      Inspect Bays
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Sub-page: Check Battery Availability
  if (route === 'swap-availability') {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 sm:p-6">
          <p className="text-xs font-semibold text-[#0D4A31]">Live Cabinet Telemetry</p>
          <h2 className="font-display text-xl font-bold text-gray-950 mt-1">
            Check Battery Availability
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            Select a swap station to inspect real-time State of Charge (SOC) across every cabinet slot.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {state.stations.map((stn) => (
            <button
              key={stn.id}
              type="button"
              onClick={() => setSelectedStationId(stn.id)}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                selectedStation.id === stn.id
                  ? 'bg-[#0D4A31] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {stn.name}
            </button>
          ))}
        </div>

        <section className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-gray-950">
                {selectedStation.name}
              </h3>
              <p className="text-xs text-gray-500">
                {selectedStation.address} · {selectedStation.hours}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('swap-initiate')}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0D4A31] text-white text-xs font-semibold hover:bg-[#115E3F] transition-colors"
            >
              Initiate Swap Here
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {selectedStation.bays.map((bay) => {
              const ready = bay.status === 'Ready';
              return (
                <div
                  key={bay.bayNumber}
                  className={`p-4 rounded-2xl border ${
                    ready
                      ? 'bg-[#EAF7F0] border-[#BDE4CD]'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-gray-950">
                      Bay 0{bay.bayNumber}
                    </span>
                    <span
                      className={`font-semibold ${
                        ready ? 'text-[#16A34A]' : 'text-amber-700'
                      }`}
                    >
                      {bay.status}
                    </span>
                  </div>
                  <p className="font-mono text-2xl font-bold text-gray-950 mt-2 tabular-nums">
                    {bay.chargePercent}%
                  </p>
                  <p className="text-[11px] text-gray-600 mt-1">
                    {bay.packId} · ~{bay.rangeKm} km range
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // Sub-page: Initiate Battery Swap
  if (route === 'swap-initiate') {
    const readyBays = selectedStation.bays.filter((b) => b.status === 'Ready');
    const chosenBay =
      readyBays.find((b) => b.bayNumber === selectedBayNumber) ?? readyBays[0];

    const handleSwapConfirm = () => {
      if (!chosenBay) return;
      const result = onInitiateSwap(selectedStation.id, chosenBay.bayNumber);
      if (result) {
        setSwapReceipt(result);
      }
    };

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 sm:p-6">
          <p className="text-xs font-semibold text-[#0D4A31]">45-Second Swap Workflow</p>
          <h2 className="font-display text-xl font-bold text-gray-950 mt-1">
            Initiate Battery Swap
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            Choose a station and a Ready bay, then simulate unlocking the cabinet to exchange your depleted battery pack.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-5">
            <div>
              <label htmlFor="swap-station-select" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Select Hub
              </label>
              <select
                id="swap-station-select"
                value={selectedStation.id}
                onChange={(e) => {
                  setSelectedStationId(e.target.value);
                  setSwapReceipt(null);
                }}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 bg-white"
              >
                {state.stations.map((stn) => (
                  <option key={stn.id} value={stn.id}>
                    {stn.name} ({stn.bays.filter((b) => b.status === 'Ready').length} packs ready)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Choose Charged Bay ({readyBays.length} Ready)
              </p>
              {readyBays.length === 0 ? (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  All bays at this station are currently charging. Select another hub above.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {readyBays.map((bay) => {
                    const active = chosenBay?.bayNumber === bay.bayNumber;
                    return (
                      <button
                        key={bay.bayNumber}
                        type="button"
                        onClick={() => setSelectedBayNumber(bay.bayNumber)}
                        className={`p-3 rounded-2xl border text-left transition-colors ${
                          active
                            ? 'bg-[#EAF7F0] border-[#0D4A31] text-[#0D4A31]'
                            : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-mono text-xs font-bold block">
                          Bay 0{bay.bayNumber}
                        </span>
                        <span className="font-mono text-lg font-bold block mt-0.5 tabular-nums">
                          {bay.chargePercent}%
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          {bay.packId}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!chosenBay}
              onClick={handleSwapConfirm}
              className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-[#0D4A31] hover:bg-[#115E3F] disabled:opacity-50 text-white font-semibold text-sm transition-colors"
            >
              {chosenBay
                ? `Unlock Bay 0${chosenBay.bayNumber} & Pay ${formatNaira(selectedStation.swapFee)}`
                : 'No Ready Bay Selected'}
            </button>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-200/80 p-5 text-sm space-y-2">
              <h3 className="font-display text-base font-bold text-gray-950">
                Swap Summary
              </h3>
              <div className="flex justify-between">
                <span className="text-gray-600">Station</span>
                <span className="font-semibold text-gray-950">{selectedStation.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Energy Pack</span>
                <span className="font-mono font-semibold">2.4 kWh LFP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Swap Fee</span>
                <span className="font-mono font-bold text-[#0D4A31] tabular-nums">
                  {formatNaira(selectedStation.swapFee)}
                </span>
              </div>
            </div>

            {swapReceipt && (
              <div
                data-testid="swap-confirmation"
                className="rounded-3xl bg-[#EAF7F0] border border-[#BDE4CD] p-5 space-y-2"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold text-[#0D4A31]">
                      Swap Completed · {swapReceipt.newPackId} ({swapReceipt.newChargePercent}%)
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      Returned {swapReceipt.oldPackId} · Charged {formatNaira(swapReceipt.fee)} from KuSOP Wallet.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('swap-history')}
                  className="w-full min-h-[42px] mt-2 rounded-xl bg-[#0D4A31] text-white text-xs font-semibold hover:bg-[#115E3F] transition-colors"
                >
                  View Swap History
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Sub-page: Swap History
  if (route === 'swap-history') {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 sm:p-6">
          <p className="text-xs font-semibold text-[#0D4A31]">Energy Log</p>
          <h2 className="font-display text-xl font-bold text-gray-950 mt-1">
            Battery Swap History
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            Complete record of swapped battery packs, energy received, and station fees.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6">
          {state.swapHistory.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No battery swaps recorded yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {state.swapHistory.map((swp) => (
                <li key={swp.id} className="py-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-950">
                      {swp.stationName}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Received <span className="font-mono font-semibold">{swp.newPackId}</span> ({swp.newChargePercent}%) · Returned {swp.oldPackId}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {swp.energyKwh} kWh · {swp.timestamp}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-gray-950 tabular-nums shrink-0">
                    -{formatNaira(swp.fee)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // Battery Swap Dashboard
  const totalReady = state.stations.reduce(
    (sum, s) => sum + s.bays.filter((b) => b.status === 'Ready').length,
    0
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#0D4A31] text-white p-6">
        <p className="text-xs font-medium text-emerald-200">
          KuSOP Battery Swap · {totalReady} Charged Packs Ready Across {state.stations.length} Hubs
        </p>
        <h2 className="font-display text-2xl font-bold mt-1">
          Swap Depleted Batteries in 45 Seconds
        </h2>
        <p className="text-sm text-emerald-100 mt-1.5 max-w-2xl">
          Skip long charging waits. Pull up to any KuSOP cabinet, check bay availability, and exchange your pack at a flat {formatNaira(1200)} fee.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SWAP_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.route}
              type="button"
              onClick={() => onNavigate(opt.route)}
              className="group text-left p-5 rounded-3xl bg-[#EAF7F0] hover:bg-[#DCF1E5] border border-[#CFEAD9] transition-colors flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0D4A31] text-white flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-base font-bold text-gray-950">
                    {opt.title}
                  </h3>
                  <ChevronRight
                    className="w-4 h-4 text-[#0D4A31]/70 group-hover:translate-x-0.5 transition-transform shrink-0"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
