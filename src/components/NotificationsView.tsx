import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import type { KuSOPState } from '../types/kusop';

interface NotificationsViewProps {
  state: KuSOPState;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export function NotificationsView({
  state,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
}: NotificationsViewProps) {
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#0D4A31]">
            Alerts & Confirmations · {unreadCount} unread
          </p>
          <h2 className="font-display text-xl font-bold text-gray-950 mt-1">
            Notifications Center
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="min-h-[40px] px-3.5 rounded-xl bg-[#0D4A31] text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[#115E3F] transition-colors"
            >
              <CheckCheck className="w-4 h-4" aria-hidden="true" />
              <span>Mark All Read</span>
            </button>
          )}
          {state.notifications.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="min-h-[40px] px-3.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      <section className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6">
        {state.notifications.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Bell className="w-9 h-9 text-gray-300 mx-auto" aria-hidden="true" />
            <p className="text-sm font-semibold text-gray-700">You&apos;re all caught up</p>
            <p className="text-xs text-gray-500">
              New wallet credits, delivery dispatches, and battery swaps will notify you here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {state.notifications.map((n) => (
              <li key={n.id} className="py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-950">
                    {n.title}{' '}
                    {!n.read && (
                      <span className="text-xs font-semibold text-[#16A34A]">· Unread</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.body}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{n.timestamp}</p>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => onMarkRead(n.id)}
                    className="min-h-[38px] px-3 rounded-xl bg-[#EAF7F0] text-[#0D4A31] text-xs font-semibold hover:bg-[#D5EFE0] transition-colors shrink-0"
                  >
                    Mark Read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
