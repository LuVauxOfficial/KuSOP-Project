import { useState } from 'react';
import {
  BadgeCheck,
  CalendarRange,
  Car,
  CheckCircle2,
  ChevronRight,
  KeyRound,
  WalletCards,
} from 'lucide-react';
import { EV_MODELS } from '../data/seedData';
import type { EVEnquiry, KuSOPState, RouteId } from '../types/kusop';
import {
  calculateLeasePlan,
  calculatePaySmallSmall,
  formatNaira,
} from '../utils/kusopLogic';
import { SafeImage } from './SafeImage';

interface EVServiceModuleProps {
  route: RouteId;
  state: KuSOPState;
  onNavigate: (route: RouteId) => void;
  onSubmitEnquiry: (input: {
    planType: 'Buy EV' | 'Pay Small Small' | 'Lease EV';
    modelName: string;
    customerName: string;
    phone: string;
    summary: string;
    estimatedMonthly?: number;
  }) => EVEnquiry | null;
}

const EV_PILLARS: {
  route: RouteId;
  title: string;
  description: string;
  icon: typeof Car;
}[] = [
  {
    route: 'ev-buy',
    title: 'Buy EV',
    description: 'Outright ownership of electric scooters, cargo bikes, and urban compact cars.',
    icon: BadgeCheck,
  },
  {
    route: 'ev-installment',
    title: 'Pay Small Small',
    description: 'Flexible asset-backed monthly installments from 6 to 24 months.',
    icon: WalletCards,
  },
  {
    route: 'ev-lease',
    title: 'Lease EV',
    description: 'All-inclusive personal or fleet EV leasing with maintenance & swap access.',
    icon: KeyRound,
  },
];

export function EVServiceModule({
  route,
  state,
  onNavigate,
  onSubmitEnquiry,
}: EVServiceModuleProps) {
  const [selectedModelId, setSelectedModelId] = useState(EV_MODELS[0].id);
  const [downPct, setDownPct] = useState(25);
  const [installmentMonths, setInstallmentMonths] = useState(12);

  const [leaseMonths, setLeaseMonths] = useState(12);
  const [leaseUsage, setLeaseUsage] = useState<'Personal' | 'Commercial Fleet'>('Personal');

  const [customerName, setCustomerName] = useState(state.profile.fullName);
  const [phone, setPhone] = useState(state.profile.phone);
  const [buyNotes, setBuyNotes] = useState('Interested in test ride at Victoria Island Hub');
  const [submittedEnquiry, setSubmittedEnquiry] = useState<EVEnquiry | null>(null);

  const activeModel = EV_MODELS.find((m) => m.id === selectedModelId) ?? EV_MODELS[0];

  // Sub-page: Buy EV
  if (route === 'ev-buy') {
    const handleBuySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const created = onSubmitEnquiry({
        planType: 'Buy EV',
        modelName: activeModel.name,
        customerName,
        phone,
        summary: `Outright purchase inquiry (${formatNaira(activeModel.price)}) · ${buyNotes}`,
      });
      if (created) setSubmittedEnquiry(created);
    };

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 sm:p-6">
          <p className="text-xs font-semibold text-[#0D4A31]">Outright EV Ownership</p>
          <h2 className="font-display text-xl font-bold text-gray-950 mt-1">
            Buy EV — Direct Purchase & Test Ride
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            Compare electric vehicles engineered for African city roads, complete with KuSOP Battery Swap compatibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EV_MODELS.map((model) => {
            const selected = model.id === activeModel.id;
            return (
              <div
                key={model.id}
                className={`bg-white rounded-3xl border overflow-hidden flex flex-col justify-between transition-colors ${
                  selected ? 'border-[#0D4A31] ring-1 ring-[#0D4A31]' : 'border-gray-200/80'
                }`}
              >
                <div>
                  <div className="h-44 bg-[#F8FAF9]">
                    <SafeImage
                      src={model.image}
                      alt={model.name}
                      className="w-full h-full object-cover"
                      fallbackTitle={model.name}
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-medium text-[#16A34A]">{model.segment}</p>
                    <h3 className="font-display text-base font-bold text-gray-950 mt-0.5">
                      {model.name}
                    </h3>
                    <p className="font-mono text-lg font-bold text-[#0D4A31] mt-1.5 tabular-nums">
                      {formatNaira(model.price)}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      Range: {model.rangeKm} km · Top Speed: {model.topSpeedKmh} km/h
                    </p>
                    <ul className="mt-3 space-y-1 text-xs text-gray-600">
                      {model.highlights.map((h) => (
                        <li key={h}>· {h}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModelId(model.id);
                      setSubmittedEnquiry(null);
                    }}
                    className={`w-full min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                      selected
                        ? 'bg-[#0D4A31] text-white'
                        : 'bg-[#EAF7F0] text-[#0D4A31] hover:bg-[#D5EFE0]'
                    }`}
                  >
                    {selected ? 'Selected for Enquiry' : 'Select Model'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={handleBuySubmit}
          className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-4 max-w-2xl"
        >
          <h3 className="font-display text-base font-bold text-gray-950">
            Purchase Enquiry · {activeModel.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="ev-buy-name" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                id="ev-buy-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950"
              />
            </div>
            <div>
              <label htmlFor="ev-buy-phone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Phone Number
              </label>
              <input
                id="ev-buy-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950"
              />
            </div>
          </div>
          <div>
            <label htmlFor="ev-buy-notes" className="block text-xs font-semibold text-gray-700 mb-1.5">
              Preferred Hub / Notes
            </label>
            <input
              id="ev-buy-notes"
              type="text"
              value={buyNotes}
              onChange={(e) => setBuyNotes(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950"
            />
          </div>
          <button
            type="submit"
            className="min-h-[48px] px-6 py-3 rounded-2xl bg-[#0D4A31] hover:bg-[#115E3F] text-white font-semibold text-sm transition-colors"
          >
            Submit Purchase Enquiry
          </button>

          {submittedEnquiry && submittedEnquiry.planType === 'Buy EV' && (
            <div className="rounded-2xl bg-[#EAF7F0] border border-[#BDE4CD] p-4 flex items-start gap-2.5 text-xs">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" aria-hidden="true" />
              <div>
                <p className="font-bold text-[#0D4A31]">
                  Purchase Enquiry Logged · {submittedEnquiry.modelName}
                </p>
                <p className="text-gray-700 mt-0.5">{submittedEnquiry.status}</p>
              </div>
            </div>
          )}
        </form>
      </div>
    );
  }

  // Sub-page: Pay Small Small
  if (route === 'ev-installment') {
    const plan = calculatePaySmallSmall(activeModel.price, downPct, installmentMonths);
    const handleInstallmentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const created = onSubmitEnquiry({
        planType: 'Pay Small Small',
        modelName: activeModel.name,
        customerName,
        phone,
        summary: `${downPct}% down (${formatNaira(plan.downPayment)}) · ${installmentMonths} months at ${formatNaira(plan.monthlyPayment)}/mo`,
        estimatedMonthly: plan.monthlyPayment,
      });
      if (created) setSubmittedEnquiry(created);
    };

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 sm:p-6">
          <p className="text-xs font-semibold text-[#0D4A31]">KuSOP Pay Small Small</p>
          <h2 className="font-display text-xl font-bold text-gray-950 mt-1">
            Structured EV Installment Calculator
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            Start riding with a 15%–50% deposit and spread the balance over 6 to 24 predictable monthly payments. Illustrative demo terms shown below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-5">
            <div>
              <label htmlFor="pss-model" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Choose Electric Vehicle
              </label>
              <select
                id="pss-model"
                value={activeModel.id}
                onChange={(e) => {
                  setSelectedModelId(e.target.value);
                  setSubmittedEnquiry(null);
                }}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 bg-white"
              >
                {EV_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {formatNaira(m.price)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                <span>Down Payment Percentage</span>
                <span className="font-mono text-[#0D4A31] tabular-nums">{downPct}%</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[15, 25, 35, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDownPct(pct)}
                    className={`min-h-[42px] rounded-xl font-mono text-xs font-semibold border transition-colors ${
                      downPct === pct
                        ? 'bg-[#0D4A31] border-[#0D4A31] text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Repayment Tenor</p>
              <div className="grid grid-cols-3 gap-2">
                {[6, 12, 24].map((mo) => (
                  <button
                    key={mo}
                    type="button"
                    onClick={() => setInstallmentMonths(mo)}
                    className={`min-h-[42px] rounded-xl text-xs font-semibold border transition-colors ${
                      installmentMonths === mo
                        ? 'bg-[#0D4A31] border-[#0D4A31] text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {mo} Months
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#F8FAF9] border border-gray-200/80 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Initial Deposit ({downPct}%)</span>
                <span className="font-mono font-semibold tabular-nums">
                  {formatNaira(plan.downPayment)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Financed Principal</span>
                <span className="font-mono font-semibold tabular-nums">
                  {formatNaira(plan.financedPrincipal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Illustrative Service Fee</span>
                <span className="font-mono font-semibold tabular-nums">
                  {plan.monthlyServiceFeeRate}% / mo
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                <span className="font-bold text-gray-950">Estimated Monthly Payment</span>
                <span
                  data-testid="pss-monthly-estimate"
                  className="font-mono text-xl font-bold text-[#0D4A31] tabular-nums"
                >
                  {formatNaira(plan.monthlyPayment)}/mo
                </span>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleInstallmentSubmit}
            className="lg:col-span-5 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-4"
          >
            <h3 className="font-display text-base font-bold text-gray-950">
              Request Pay Small Small Plan
            </h3>

            <div>
              <label htmlFor="pss-name" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Applicant Name
              </label>
              <input
                id="pss-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950"
              />
            </div>

            <div>
              <label htmlFor="pss-phone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Phone Number
              </label>
              <input
                id="pss-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-[#0D4A31] hover:bg-[#115E3F] text-white font-semibold text-sm transition-colors"
            >
              Submit Installment Enquiry
            </button>

            {submittedEnquiry && submittedEnquiry.planType === 'Pay Small Small' && (
              <div
                data-testid="pss-enquiry-confirmation"
                className="rounded-2xl bg-[#EAF7F0] border border-[#BDE4CD] p-4 text-xs"
              >
                <p className="font-bold text-[#0D4A31]">
                  Plan Enquiry Submitted · {submittedEnquiry.modelName}
                </p>
                <p className="text-gray-700 mt-1">{submittedEnquiry.summary}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  // Sub-page: Lease EV
  if (route === 'ev-lease') {
    const lease = calculateLeasePlan(activeModel.monthlyLeaseBase, leaseMonths, leaseUsage);
    const handleLeaseSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const created = onSubmitEnquiry({
        planType: 'Lease EV',
        modelName: activeModel.name,
        customerName,
        phone,
        summary: `${leaseUsage} lease · ${leaseMonths} months at ${formatNaira(lease.monthlyLease)}/mo`,
        estimatedMonthly: lease.monthlyLease,
      });
      if (created) setSubmittedEnquiry(created);
    };

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 sm:p-6">
          <p className="text-xs font-semibold text-[#0D4A31]">Flexible EV Subscriptions</p>
          <h2 className="font-display text-xl font-bold text-gray-950 mt-1">
            Lease EV — Personal & Fleet Mobility
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            Predictable monthly leasing covering scheduled maintenance, telemetry, and priority battery swap network access.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-5">
            <div>
              <label htmlFor="lease-model" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Select EV Model
              </label>
              <select
                id="lease-model"
                value={activeModel.id}
                onChange={(e) => {
                  setSelectedModelId(e.target.value);
                  setSubmittedEnquiry(null);
                }}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 bg-white"
              >
                {EV_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — Base {formatNaira(m.monthlyLeaseBase)}/mo
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Usage Tier</p>
              <div className="grid grid-cols-2 gap-2.5">
                {(['Personal', 'Commercial Fleet'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setLeaseUsage(tier)}
                    className={`min-h-[44px] rounded-xl text-xs font-semibold border transition-colors ${
                      leaseUsage === tier
                        ? 'bg-[#0D4A31] border-[#0D4A31] text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Lease Duration</p>
              <div className="grid grid-cols-3 gap-2.5">
                {[3, 6, 12].map((mo) => (
                  <button
                    key={mo}
                    type="button"
                    onClick={() => setLeaseMonths(mo)}
                    className={`min-h-[44px] rounded-xl text-xs font-semibold border transition-colors ${
                      leaseMonths === mo
                        ? 'bg-[#0D4A31] border-[#0D4A31] text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {mo} Months
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#F8FAF9] border border-gray-200/80 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Refundable Security Deposit</span>
                <span className="font-mono font-semibold tabular-nums">
                  {formatNaira(lease.securityDeposit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total {leaseMonths}-Month Contract</span>
                <span className="font-mono font-semibold tabular-nums">
                  {formatNaira(lease.totalContract)}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                <span className="font-bold text-gray-950">Monthly Lease</span>
                <span className="font-mono text-xl font-bold text-[#0D4A31] tabular-nums">
                  {formatNaira(lease.monthlyLease)}/mo
                </span>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleLeaseSubmit}
            className="lg:col-span-5 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-4"
          >
            <h3 className="font-display text-base font-bold text-gray-950">
              Apply for EV Lease
            </h3>
            <div>
              <label htmlFor="lease-name" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Full Name or Business Name
              </label>
              <input
                id="lease-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950"
              />
            </div>
            <div>
              <label htmlFor="lease-phone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Phone Number
              </label>
              <input
                id="lease-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950"
              />
            </div>
            <button
              type="submit"
              className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-[#0D4A31] hover:bg-[#115E3F] text-white font-semibold text-sm transition-colors"
            >
              Submit Lease Application
            </button>

            {submittedEnquiry && submittedEnquiry.planType === 'Lease EV' && (
              <div className="rounded-2xl bg-[#EAF7F0] border border-[#BDE4CD] p-4 text-xs">
                <p className="font-bold text-[#0D4A31]">
                  Lease Application Received · {submittedEnquiry.modelName}
                </p>
                <p className="text-gray-700 mt-1">{submittedEnquiry.summary}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  // EV Service Dashboard
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#0D4A31] text-white p-6">
        <p className="text-xs font-medium text-emerald-200">KuSOP EV Service</p>
        <h2 className="font-display text-2xl font-bold mt-1">
          Electric Vehicles Built for Daily Access
        </h2>
        <p className="text-sm text-emerald-100 mt-1.5 max-w-2xl">
          Own outright, finance gradually with Pay Small Small, or lease an electric commuter with full battery swap support.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {EV_PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <button
              key={pillar.route}
              type="button"
              onClick={() => onNavigate(pillar.route)}
              className="group text-left p-5 rounded-3xl bg-[#EAF7F0] hover:bg-[#DCF1E5] border border-[#CFEAD9] transition-colors flex flex-col justify-between min-h-[160px]"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#0D4A31] text-white flex items-center justify-center">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <ChevronRight
                  className="w-4 h-4 text-[#0D4A31]/70 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-4">
                <h3 className="font-display text-base font-bold text-gray-950">
                  {pillar.title}
                </h3>
                <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Featured Fleet Preview + Submitted Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6">
          <h3 className="font-display text-base font-bold text-gray-950 mb-3">
            Featured EV Lineup
          </h3>
          <div className="space-y-3">
            {EV_MODELS.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-gray-100 flex items-center gap-4"
              >
                <div className="w-20 h-16 rounded-xl overflow-hidden bg-white shrink-0">
                  <SafeImage
                    src={m.image}
                    alt={m.name}
                    className="w-full h-full object-cover"
                    fallbackTitle={m.name}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-950 truncate">{m.name}</p>
                  <p className="text-xs text-gray-500">
                    {m.rangeKm} km range · {formatNaira(m.price)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModelId(m.id);
                    onNavigate('ev-installment');
                  }}
                  className="min-h-[40px] px-3 rounded-xl bg-[#EAF7F0] text-[#0D4A31] text-xs font-semibold hover:bg-[#D5EFE0] transition-colors shrink-0"
                >
                  Calculate
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6">
          <h3 className="font-display text-base font-bold text-gray-950 mb-3">
            Your EV Enquiries ({state.evEnquiries.length})
          </h3>
          {state.evEnquiries.length === 0 ? (
            <div className="py-8 text-center">
              <CalendarRange className="w-8 h-8 text-gray-300 mx-auto mb-2" aria-hidden="true" />
              <p className="text-xs text-gray-500">
                No enquiries submitted yet. Explore Buy EV, Pay Small Small, or Lease EV above.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {state.evEnquiries.map((enq) => (
                <li key={enq.id} className="py-3 text-xs">
                  <p className="font-semibold text-[#0D4A31]">
                    {enq.planType} · {enq.modelName}
                  </p>
                  <p className="text-gray-700 mt-0.5">{enq.summary}</p>
                  <p className="text-gray-400 mt-0.5">{enq.status} · {enq.createdAt}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
