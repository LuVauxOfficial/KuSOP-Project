import { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Navigation,
  Package,
  Scale,
  Send,
  ShieldAlert,
} from 'lucide-react';
import type {
  DeliveryDispute,
  DeliveryOrder,
  KuSOPState,
  PackageSize,
  RouteId,
} from '../types/kusop';
import { calculateDeliveryFee, formatNaira } from '../utils/kusopLogic';
import type { CreateDeliveryInput } from '../utils/kusopLogic';

interface DeliveryModuleProps {
  route: RouteId;
  state: KuSOPState;
  onNavigate: (route: RouteId) => void;
  onCreateDelivery: (input: CreateDeliveryInput) => DeliveryOrder | null;
  onAdvanceDelivery: (trackingCode: string) => void;
  onFileDispute: (
    trackingCode: string,
    reason: string,
    description: string
  ) => DeliveryDispute | null;
}

const DELIVERY_OPTIONS: {
  route: RouteId;
  title: string;
  description: string;
  icon: typeof Package;
}[] = [
  {
    route: 'delivery-order',
    title: 'Order Delivery',
    description: 'Dispatch an electric courier immediately for same-hour city dropoffs.',
    icon: Send,
  },
  {
    route: 'delivery-track',
    title: 'Track Delivery',
    description: 'Follow live parcel milestones from rider assignment to confirmed handoff.',
    icon: Navigation,
  },
  {
    route: 'delivery-schedule',
    title: 'Schedule Delivery',
    description: 'Book pickup time windows in advance with optional recurring business runs.',
    icon: CalendarClock,
  },
  {
    route: 'delivery-disputes',
    title: 'Settle Disputes',
    description: 'Open an instant delivery review for delayed, damaged, or misrouted parcels.',
    icon: Scale,
  },
];

const PACKAGE_SIZES: { size: PackageSize; detail: string }[] = [
  { size: 'Small Envelope', detail: 'Up to 2 kg · Documents & gadgets' },
  { size: 'Medium Box', detail: 'Up to 10 kg · Retail & e-commerce parcels' },
  { size: 'Large Cargo', detail: 'Up to 35 kg · Bulk goods on cargo EV' },
];

const TRACK_STEPS = ['Confirmed', 'Rider Assigned', 'In Transit', 'Delivered'];

export function DeliveryModule({
  route,
  state,
  onNavigate,
  onCreateDelivery,
  onAdvanceDelivery,
  onFileDispute,
}: DeliveryModuleProps) {
  // Order Delivery state
  const [pickup, setPickup] = useState('14 Adeola Odeku, Victoria Island');
  const [dropoff, setDropoff] = useState('28 Admiralty Way, Lekki Phase 1');
  const [recipientName, setRecipientName] = useState('Funke Akindele');
  const [recipientPhone, setRecipientPhone] = useState('0803 771 4209');
  const [packageSize, setPackageSize] = useState<PackageSize>('Medium Box');
  const [orderConfirmation, setOrderConfirmation] = useState<DeliveryOrder | null>(null);

  // Schedule Delivery state
  const [schedPickup, setSchedPickup] = useState('312 Herbert Macaulay, Yaba');
  const [schedDropoff, setSchedDropoff] = useState('19 Isaac John St, Ikeja GRA');
  const [schedRecipient, setSchedRecipient] = useState('Damilola Osei');
  const [schedPhone, setSchedPhone] = useState('0808 220 9130');
  const [schedSize, setSchedSize] = useState<PackageSize>('Small Envelope');
  const [schedDate, setSchedDate] = useState('2026-11-25');
  const [schedWindow, setSchedWindow] = useState('10:00 AM – 12:00 PM');
  const [recurrence, setRecurrence] = useState<'Once' | 'Weekly' | 'Bi-weekly'>('Once');
  const [schedConfirmation, setSchedConfirmation] = useState<DeliveryOrder | null>(null);

  // Track Delivery state
  const [selectedTrackCode, setSelectedTrackCode] = useState<string>(
    state.deliveries[0]?.trackingCode ?? ''
  );

  // Dispute state
  const [disputeCode, setDisputeCode] = useState<string>(
    state.deliveries[0]?.trackingCode ?? ''
  );
  const [disputeReason, setDisputeReason] = useState('Delayed Arrival');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeConfirmation, setDisputeConfirmation] = useState<DeliveryDispute | null>(null);

  // Sub-page: Order Delivery
  if (route === 'delivery-order') {
    const fee = calculateDeliveryFee(packageSize, false);
    const handleOrderSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const created = onCreateDelivery({
        mode: 'instant',
        pickup,
        dropoff,
        recipientName,
        recipientPhone,
        packageSize,
      });
      if (created) {
        setOrderConfirmation(created);
        setSelectedTrackCode(created.trackingCode);
      }
    };

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 sm:p-6">
          <p className="text-xs font-semibold text-[#0D4A31]">How KuSOP Order Delivery Works</p>
          <h2 className="font-display text-xl font-bold text-gray-950 mt-1">
            Zero-Emission Instant Dispatch
          </h2>
          <p className="text-sm text-gray-700 mt-1.5 leading-relaxed max-w-2xl">
            Enter pickup and dropoff addresses, choose your parcel tier, and pay directly from your KuSOP Wallet. Our nearest electric bike rider picks up within minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleOrderSubmit}
            className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-4"
          >
            <h3 className="font-display text-base font-bold text-gray-950">
              Dispatch Details
            </h3>

            <div>
              <label htmlFor="dlv-pickup" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Pickup Address
              </label>
              <input
                id="dlv-pickup"
                type="text"
                required
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 focus:outline-2 focus:outline-[#0D4A31]"
              />
            </div>

            <div>
              <label htmlFor="dlv-dropoff" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Dropoff Address
              </label>
              <input
                id="dlv-dropoff"
                type="text"
                required
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 focus:outline-2 focus:outline-[#0D4A31]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="dlv-recipient" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Recipient Name
                </label>
                <input
                  id="dlv-recipient"
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 focus:outline-2 focus:outline-[#0D4A31]"
                />
              </div>
              <div>
                <label htmlFor="dlv-phone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Recipient Phone
                </label>
                <input
                  id="dlv-phone"
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 focus:outline-2 focus:outline-[#0D4A31]"
                />
              </div>
            </div>

            <div>
              <p className="block text-xs font-semibold text-gray-700 mb-2">
                Package Size
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PACKAGE_SIZES.map((p) => {
                  const active = packageSize === p.size;
                  return (
                    <button
                      key={p.size}
                      type="button"
                      onClick={() => setPackageSize(p.size)}
                      className={`p-3 rounded-2xl border text-left transition-colors ${
                        active
                          ? 'bg-[#EAF7F0] border-[#0D4A31] text-[#0D4A31]'
                          : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xs font-bold block">{p.size}</span>
                      <span className="text-[11px] text-gray-500 block mt-0.5">{p.detail}</span>
                      <span className="font-mono text-xs font-semibold block mt-1.5 tabular-nums">
                        {formatNaira(calculateDeliveryFee(p.size, false))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-[#0D4A31] hover:bg-[#115E3F] text-white font-semibold text-sm transition-colors"
            >
              Confirm & Pay {formatNaira(fee)} from Wallet
            </button>
          </form>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-200/80 p-5">
              <p className="text-xs font-medium text-gray-500">Demo Fare Summary</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tier</span>
                  <span className="font-semibold text-gray-950">{packageSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wallet Balance</span>
                  <span className="font-mono font-semibold tabular-nums">
                    {formatNaira(state.walletBalance)}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between text-base font-bold">
                  <span>Total Fare</span>
                  <span className="font-mono text-[#0D4A31] tabular-nums">{formatNaira(fee)}</span>
                </div>
              </div>
            </div>

            {orderConfirmation && (
              <div
                data-testid="delivery-order-confirmation"
                className="rounded-3xl bg-[#EAF7F0] border border-[#BDE4CD] p-5 space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold text-[#0D4A31]">
                      Delivery Confirmed · {orderConfirmation.trackingCode}
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      {orderConfirmation.pickup} → {orderConfirmation.dropoff}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Rider: {orderConfirmation.riderName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('delivery-track')}
                  className="w-full min-h-[44px] rounded-xl bg-[#0D4A31] text-white text-xs font-semibold hover:bg-[#115E3F] transition-colors"
                >
                  Track This Delivery
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Sub-page: Track Delivery
  if (route === 'delivery-track') {
    const activeOrder =
      state.deliveries.find((d) => d.trackingCode === selectedTrackCode) ??
      state.deliveries[0];

    const currentStepIdx = activeOrder
      ? activeOrder.status === 'Scheduled'
        ? 0
        : TRACK_STEPS.indexOf(activeOrder.status)
      : 0;

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 sm:p-6">
          <p className="text-xs font-semibold text-[#0D4A31]">How KuSOP Tracking Works</p>
          <h2 className="font-display text-xl font-bold text-gray-950 mt-1">
            Real-Time Parcel Telemetry
          </h2>
          <p className="text-sm text-gray-700 mt-1.5 leading-relaxed max-w-2xl">
            Every KuSOP dispatch carries an electric rider GPS beacon. Select any tracking ID below and simulate milestone progression across the delivery lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200/80 p-5">
            <h3 className="font-display text-base font-bold text-gray-950 mb-3">
              Select Delivery ({state.deliveries.length})
            </h3>
            {state.deliveries.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">
                No deliveries booked yet.
              </p>
            ) : (
              <div className="space-y-2">
                {state.deliveries.map((d) => {
                  const selected = activeOrder?.trackingCode === d.trackingCode;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedTrackCode(d.trackingCode)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-colors ${
                        selected
                          ? 'bg-[#EAF7F0] border-[#0D4A31]'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#0D4A31]">
                          {d.trackingCode}
                        </span>
                        <span className="text-xs font-semibold text-gray-700">
                          {d.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {d.pickup} → {d.dropoff}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6">
            {activeOrder ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <p className="font-mono text-xs font-semibold text-[#16A34A]">
                      {activeOrder.trackingCode} · {activeOrder.packageSize}
                    </p>
                    <h3 className="font-display text-lg font-bold text-gray-950 mt-0.5">
                      Status: {activeOrder.status}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {activeOrder.riderName} · {activeOrder.etaText}
                    </p>
                  </div>
                  {activeOrder.status !== 'Delivered' && (
                    <button
                      type="button"
                      onClick={() => onAdvanceDelivery(activeOrder.trackingCode)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0D4A31] hover:bg-[#115E3F] text-white text-xs font-semibold transition-colors"
                    >
                      Simulate Next Milestone
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F8FAF9] rounded-2xl p-4">
                  <div>
                    <span className="text-gray-500 block">Pickup</span>
                    <span className="font-semibold text-gray-950 mt-0.5 block">{activeOrder.pickup}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Dropoff</span>
                    <span className="font-semibold text-gray-950 mt-0.5 block">{activeOrder.dropoff}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Recipient</span>
                    <span className="font-semibold text-gray-950 mt-0.5 block">
                      {activeOrder.recipientName} ({activeOrder.recipientPhone})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Delivery Fee</span>
                    <span className="font-mono font-semibold text-gray-950 mt-0.5 block tabular-nums">
                      {formatNaira(activeOrder.fee)}
                    </span>
                  </div>
                </div>

                <ol className="space-y-3" aria-label="Delivery milestones">
                  {TRACK_STEPS.map((step, idx) => {
                    const completed = idx <= currentStepIdx;
                    return (
                      <li key={step} className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                            completed
                              ? 'bg-[#16A34A] text-white'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                          <span
                            className={`text-sm ${
                              completed ? 'font-semibold text-gray-950' : 'text-gray-400'
                            }`}
                          >
                            {step}
                          </span>
                          <span className="text-xs text-gray-500">
                            {completed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-8 text-center">
                Select or book a delivery to track it here.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Sub-page: Schedule Delivery
  if (route === 'delivery-schedule') {
    const schedFee = calculateDeliveryFee(schedSize, true);
    const handleSchedSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const created = onCreateDelivery({
        mode: 'scheduled',
        pickup: schedPickup,
        dropoff: schedDropoff,
        recipientName: schedRecipient,
        recipientPhone: schedPhone,
        packageSize: schedSize,
        scheduledDate: schedDate,
        scheduledWindow: schedWindow,
        recurrence,
      });
      if (created) {
        setSchedConfirmation(created);
        setSelectedTrackCode(created.trackingCode);
      }
    };

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 sm:p-6">
          <p className="text-xs font-semibold text-[#0D4A31]">How KuSOP Scheduled Delivery Works</p>
          <h2 className="font-display text-xl font-bold text-gray-950 mt-1">
            Planned Windows with ₦200 Eco-Batch Discount
          </h2>
          <p className="text-sm text-gray-700 mt-1.5 leading-relaxed max-w-2xl">
            Lock in a future pickup date and 2-hour delivery window. Batched EV routes cut urban congestion and lower your delivery fee automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleSchedSubmit}
            className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="sched-date" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Pickup Date
                </label>
                <input
                  id="sched-date"
                  type="date"
                  required
                  value={schedDate}
                  onChange={(e) => setSchedDate(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 focus:outline-2 focus:outline-[#0D4A31]"
                />
              </div>
              <div>
                <label htmlFor="sched-window" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Time Window
                </label>
                <select
                  id="sched-window"
                  value={schedWindow}
                  onChange={(e) => setSchedWindow(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 bg-white focus:outline-2 focus:outline-[#0D4A31]"
                >
                  <option value="08:00 AM – 10:00 AM">08:00 AM – 10:00 AM</option>
                  <option value="10:00 AM – 12:00 PM">10:00 AM – 12:00 PM</option>
                  <option value="02:00 PM – 04:00 PM">02:00 PM – 04:00 PM</option>
                  <option value="04:00 PM – 06:00 PM">04:00 PM – 06:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <p className="block text-xs font-semibold text-gray-700 mb-2">Recurrence</p>
              <div className="flex flex-wrap gap-2">
                {(['Once', 'Weekly', 'Bi-weekly'] as const).map((rec) => (
                  <button
                    key={rec}
                    type="button"
                    onClick={() => setRecurrence(rec)}
                    className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold border transition-colors ${
                      recurrence === rec
                        ? 'bg-[#EAF7F0] border-[#0D4A31] text-[#0D4A31]'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {rec}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="sched-pickup" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Pickup Address
              </label>
              <input
                id="sched-pickup"
                type="text"
                required
                value={schedPickup}
                onChange={(e) => setSchedPickup(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950"
              />
            </div>

            <div>
              <label htmlFor="sched-dropoff" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Dropoff Address
              </label>
              <input
                id="sched-dropoff"
                type="text"
                required
                value={schedDropoff}
                onChange={(e) => setSchedDropoff(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="sched-name" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Recipient Name
                </label>
                <input
                  id="sched-name"
                  type="text"
                  required
                  value={schedRecipient}
                  onChange={(e) => setSchedRecipient(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950"
                />
              </div>
              <div>
                <label htmlFor="sched-phone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Recipient Phone
                </label>
                <input
                  id="sched-phone"
                  type="tel"
                  required
                  value={schedPhone}
                  onChange={(e) => setSchedPhone(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sched-size" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Package Size
              </label>
              <select
                id="sched-size"
                value={schedSize}
                onChange={(e) => setSchedSize(e.target.value as PackageSize)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 bg-white"
              >
                {PACKAGE_SIZES.map((p) => (
                  <option key={p.size} value={p.size}>
                    {p.size} — {formatNaira(calculateDeliveryFee(p.size, true))}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-[#0D4A31] hover:bg-[#115E3F] text-white font-semibold text-sm transition-colors"
            >
              Schedule Delivery · {formatNaira(schedFee)}
            </button>
          </form>

          <div className="lg:col-span-5 space-y-4">
            {schedConfirmation && (
              <div className="rounded-3xl bg-[#EAF7F0] border border-[#BDE4CD] p-5 space-y-2">
                <p className="text-sm font-bold text-[#0D4A31]">
                  Scheduled Confirmed · {schedConfirmation.trackingCode}
                </p>
                <p className="text-xs text-gray-700">
                  {schedConfirmation.scheduledDate} · {schedConfirmation.scheduledWindow} ({schedConfirmation.recurrence})
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('delivery-track')}
                  className="w-full min-h-[44px] mt-2 rounded-xl bg-[#0D4A31] text-white text-xs font-semibold hover:bg-[#115E3F] transition-colors"
                >
                  View in Track Delivery
                </button>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-200/80 p-5">
              <h3 className="font-display text-sm font-bold text-gray-950">
                Scheduled Deliveries
              </h3>
              <div className="mt-3 space-y-2.5">
                {state.deliveries.filter((d) => d.mode === 'scheduled').length === 0 ? (
                  <p className="text-xs text-gray-500">
                    No scheduled deliveries yet. Submit the form to create one.
                  </p>
                ) : (
                  state.deliveries
                    .filter((d) => d.mode === 'scheduled')
                    .map((d) => (
                      <div key={d.id} className="p-3 rounded-2xl bg-[#F8FAF9] border border-gray-100 text-xs">
                        <p className="font-mono font-bold text-[#0D4A31]">{d.trackingCode}</p>
                        <p className="text-gray-700 mt-0.5">{d.pickup} → {d.dropoff}</p>
                        <p className="text-gray-500 mt-0.5">{d.etaText} · {d.recurrence}</p>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sub-page: Settle Disputes
  if (route === 'delivery-disputes') {
    const handleDisputeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const created = onFileDispute(disputeCode, disputeReason, disputeDesc);
      if (created) {
        setDisputeConfirmation(created);
        setDisputeDesc('');
      }
    };

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 sm:p-6">
          <p className="text-xs font-semibold text-[#0D4A31]">How KuSOP Dispute Resolution Works</p>
          <h2 className="font-display text-xl font-bold text-gray-950 mt-1">
            Transparent Parcel Protection & Claims
          </h2>
          <p className="text-sm text-gray-700 mt-1.5 leading-relaxed max-w-2xl">
            Every KuSOP parcel is logged with pickup verification and rider GPS timestamps. File a claim below to open an automated review with the demo resolution desk.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleDisputeSubmit}
            className="lg:col-span-6 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-4"
          >
            <h3 className="font-display text-base font-bold text-gray-950">
              File a Delivery Dispute
            </h3>

            <div>
              <label htmlFor="dsp-code" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Select Tracking Code
              </label>
              <select
                id="dsp-code"
                value={disputeCode}
                onChange={(e) => setDisputeCode(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 bg-white"
              >
                {state.deliveries.map((d) => (
                  <option key={d.id} value={d.trackingCode}>
                    {d.trackingCode} — {d.pickup} → {d.dropoff}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dsp-reason" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Dispute Reason
              </label>
              <select
                id="dsp-reason"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 bg-white"
              >
                <option value="Delayed Arrival">Delayed Arrival</option>
                <option value="Package Damage">Package Damage</option>
                <option value="Wrong Dropoff Location">Wrong Dropoff Location</option>
                <option value="Fare Discrepancy">Fare Discrepancy</option>
              </select>
            </div>

            <div>
              <label htmlFor="dsp-desc" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Describe What Happened
              </label>
              <textarea
                id="dsp-desc"
                rows={4}
                required
                value={disputeDesc}
                onChange={(e) => setDisputeDesc(e.target.value)}
                placeholder="Provide details so our resolution desk can review..."
                className="w-full p-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 focus:outline-2 focus:outline-[#0D4A31]"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-[#0D4A31] hover:bg-[#115E3F] text-white font-semibold text-sm transition-colors"
            >
              Submit Dispute Claim
            </button>

            {disputeConfirmation && (
              <div className="rounded-2xl bg-[#EAF7F0] border border-[#BDE4CD] p-4 text-xs">
                <p className="font-bold text-[#0D4A31]">
                  Dispute Ticket Created · {disputeConfirmation.trackingCode}
                </p>
                <p className="text-gray-700 mt-1">
                  Reason: {disputeConfirmation.reason} · Status: {disputeConfirmation.status}
                </p>
              </div>
            )}
          </form>

          <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6">
            <h3 className="font-display text-base font-bold text-gray-950 mb-3">
              Submitted Disputes ({state.disputes.length})
            </h3>
            {state.disputes.length === 0 ? (
              <div className="py-10 text-center">
                <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-600">No active disputes</p>
                <p className="text-xs text-gray-500 mt-1">
                  All recent parcels completed cleanly. Submit the form to test dispute tracking.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {state.disputes.map((dsp) => (
                  <li key={dsp.id} className="py-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#0D4A31]">
                        {dsp.trackingCode}
                      </span>
                      <span className="text-xs font-semibold text-amber-700">
                        {dsp.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-950 mt-1">{dsp.reason}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{dsp.description}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{dsp.createdAt}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Delivery Hub Dashboard
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#0D4A31] text-white p-6">
        <p className="text-xs font-medium text-emerald-200">KuSOP Delivery Network</p>
        <h2 className="font-display text-2xl font-bold mt-1">
          Clean, Trackable Urban Logistics
        </h2>
        <p className="text-sm text-emerald-100 mt-1.5 max-w-2xl">
          Every parcel moves on electric two-wheelers and cargo EVs powered by KuSOP Battery Swap hubs. Choose a delivery workflow below.
        </p>
      </section>

      <section aria-label="Delivery options">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DELIVERY_OPTIONS.map((opt) => {
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
      </section>

      <section className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-bold text-gray-950">
            Recent Deliveries
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('delivery-track')}
            className="min-h-[40px] px-3 rounded-xl text-xs font-semibold text-[#0D4A31] bg-[#E8F6EE] hover:bg-[#D5EFE0] transition-colors"
          >
            Track All
          </button>
        </div>

        <ul className="divide-y divide-gray-100">
          {state.deliveries.slice(0, 4).map((d) => (
            <li key={d.id} className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] text-[#0D4A31] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-950 truncate">
                    {d.trackingCode} · {d.status}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {d.pickup} → {d.dropoff}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTrackCode(d.trackingCode);
                  onNavigate('delivery-track');
                }}
                className="min-h-[40px] px-3 rounded-xl text-xs font-semibold text-[#0D4A31] hover:bg-[#EAF7F0] transition-colors shrink-0"
              >
                Inspect
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
