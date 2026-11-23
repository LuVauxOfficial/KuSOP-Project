import { useState } from 'react';
import {
  BatteryCharging,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Leaf,
  Package,
  Utensils,
} from 'lucide-react';
import type { KuSOPState, RouteId, SupportTicket } from '../types/kusop';

interface SupportViewProps {
  state: KuSOPState;
  onSubmitTicket: (topic: string, message: string) => SupportTicket | null;
}

const FAQS = [
  {
    q: 'How does the KuSOP Demo Wallet work?',
    a: 'All funds, top-ups, and service deductions are simulated locally in your browser using localStorage so you can demonstrate end-to-end journeys safely without real payment processing.',
  },
  {
    q: 'How fast is a KuSOP Battery Swap?',
    a: 'Automated KuSOP Swap Cabinets release a 95%–100% charged 2.4 kWh LFP battery pack in under 45 seconds for a flat ₦1,200 demonstration fee.',
  },
  {
    q: 'What is Pay Small Small under EV Service?',
    a: 'Pay Small Small lets riders and commuters place a 15%–50% deposit on an electric scooter or compact EV and spread the remaining balance across 6 to 24 monthly installments.',
  },
  {
    q: 'How do I resolve a delayed or damaged delivery?',
    a: 'Open KuSOP Delivery, select Settle Disputes, pick the tracking code, and submit your claim. The ticket is immediately logged for review.',
  },
];

export function SupportView({ state, onSubmitTicket }: SupportViewProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [topic, setTopic] = useState('Wallet & Demo Funding');
  const [message, setMessage] = useState('');
  const [confirmation, setConfirmation] = useState<SupportTicket | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket = onSubmitTicket(topic, message);
    if (ticket) {
      setConfirmation(ticket);
      setMessage('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 sm:p-6">
        <p className="text-xs font-semibold text-[#0D4A31]">KuSOP Care</p>
        <h2 className="font-display text-xl font-bold text-gray-950 mt-1">
          Help and Support
        </h2>
        <p className="text-sm text-gray-700 mt-1">
          Browse common questions or send a message to the KuSOP demonstration support desk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-6 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6">
          <h3 className="font-display text-base font-bold text-gray-950 mb-3">
            Frequently Asked Questions
          </h3>
          <div className="divide-y divide-gray-100">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.q} className="py-3">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full min-h-[44px] flex items-center justify-between gap-3 text-left text-sm font-semibold text-gray-950"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed pr-6">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-6 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-4">
          <h3 className="font-display text-base font-bold text-gray-950">
            Send a Support Message
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="sup-topic" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Topic
              </label>
              <select
                id="sup-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950 bg-white"
              >
                <option value="Wallet & Demo Funding">Wallet & Demo Funding</option>
                <option value="KuSOP Delivery">KuSOP Delivery</option>
                <option value="KuSOP Food">KuSOP Food</option>
                <option value="Battery Swap Network">Battery Swap Network</option>
                <option value="EV Financing & Leasing">EV Financing & Leasing</option>
              </select>
            </div>
            <div>
              <label htmlFor="sup-message" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Message
              </label>
              <textarea
                id="sup-message"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can our team assist you?"
                className="w-full p-3.5 rounded-xl border border-gray-300 text-sm text-gray-950"
              />
            </div>
            <button
              type="submit"
              className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-[#0D4A31] hover:bg-[#115E3F] text-white font-semibold text-sm transition-colors"
            >
              Submit Support Ticket
            </button>
          </form>

          {confirmation && (
            <div className="rounded-2xl bg-[#EAF7F0] border border-[#BDE4CD] p-4 flex items-start gap-2.5 text-xs">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" aria-hidden="true" />
              <div>
                <p className="font-bold text-[#0D4A31]">
                  Ticket {confirmation.id} Logged
                </p>
                <p className="text-gray-700 mt-0.5">{confirmation.topic} · {confirmation.status}</p>
              </div>
            </div>
          )}

          {state.supportTickets.length > 0 && (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <p className="text-xs font-semibold text-gray-700">Recent Tickets</p>
              {state.supportTickets.map((t) => (
                <div key={t.id} className="p-3 rounded-2xl bg-[#F8FAF9] text-xs">
                  <span className="font-mono font-bold text-[#0D4A31]">{t.id}</span> · {t.topic}
                  <p className="text-gray-600 mt-0.5">{t.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

interface AboutViewProps {
  onNavigate: (route: RouteId) => void;
}

export function AboutView({ onNavigate }: AboutViewProps) {
  const pillars = [
    {
      route: 'delivery' as RouteId,
      title: 'KuSOP Delivery',
      body: 'Same-hour and scheduled urban logistics powered by zero-emission e-bikes.',
      icon: Package,
    },
    {
      route: 'food' as RouteId,
      title: 'KuSOP Food',
      body: 'Local kitchens connected directly to customers on quiet electric scooters.',
      icon: Utensils,
    },
    {
      route: 'swap' as RouteId,
      title: 'KuSOP Battery Swap',
      body: '45-second LFP battery exchange cabinets eliminating charging downtime.',
      icon: BatteryCharging,
    },
    {
      route: 'ev' as RouteId,
      title: 'KuSOP EV Service',
      body: 'Outright EV purchase, Pay Small Small financing, and flexible leasing.',
      icon: Car,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#0D4A31] text-white p-6 sm:p-8">
        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
          <Leaf className="w-6 h-6 text-[#4ADE80]" aria-hidden="true" />
        </div>
        <h2 className="font-display text-2xl font-bold">
          About KuSOP Mobile
        </h2>
        <p className="text-sm text-emerald-100 mt-2 max-w-2xl leading-relaxed">
          KuSOP unites clean electric mobility, daily commerce, and inclusive asset financing in one cohesive mobile experience. Built for West African urban corridors, this interactive prototype showcases how riders, merchants, and everyday customers interact with a unified green super-app.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.title}
              type="button"
              onClick={() => onNavigate(p.route)}
              className="text-left p-5 rounded-3xl bg-[#EAF7F0] hover:bg-[#DCF1E5] border border-[#CFEAD9] transition-colors flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#0D4A31] text-white flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-gray-950">{p.title}</h3>
                <p className="text-xs text-gray-700 mt-1 leading-relaxed">{p.body}</p>
              </div>
            </button>
          );
        })}
      </section>
    </div>
  );
}
