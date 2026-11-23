import { createSeedState } from '../data/seedData';
import type {
  BiometricMethod,
  BiometricSecurityState,
  CartItem,
  DeliveryDispute,
  DeliveryOrder,
  DeliveryStatus,
  EVEnquiry,
  FoodOrder,
  FoodOrderStatus,
  KuSOPState,
  MenuItem,
  PackageSize,
  SupportTicket,
  SwapRecord,
  Transaction,
  UserProfile,
} from '../types/kusop';

export const STORAGE_KEY = 'kusop_mobile_demo_state_v1';

export function formatNaira(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `₦${safe.toLocaleString('en-NG')}`;
}

export function nowLabel(): string {
  const now = new Date();
  const hours = now.getHours();
  const mins = String(now.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `Just now · ${h12}:${mins} ${period}`;
}

export function generateRef(prefix: string): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

export function validateFundingAmount(amount: number): string | null {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Enter a valid amount greater than ₦0.';
  }
  if (amount < 100) {
    return 'Minimum funding amount is ₦100.';
  }
  if (amount > 5_000_000) {
    return 'Maximum single demo top-up is ₦5,000,000.';
  }
  return null;
}

export function applyWalletFunding(
  state: KuSOPState,
  amount: number,
  method: 'Bank Transfer' | 'Debit Card' | 'USSD'
): { ok: true; state: KuSOPState; transaction: Transaction } | { ok: false; error: string } {
  if (state.biometricSecurity.requireForWalletActions && !state.biometricSecurity.isUnlocked) {
    return {
      ok: false,
      error: 'Biometric authentication required. Unlock access on Profile before funding your wallet.',
    };
  }

  const validationError = validateFundingAmount(amount);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const rounded = Math.round(amount);
  const ref = generateRef('KSP-WLT');
  const ts = nowLabel();

  const transaction: Transaction = {
    id: `txn-${Date.now()}`,
    type: 'credit',
    category: 'wallet',
    title: `Wallet Top-Up via ${method}`,
    subtitle: 'Simulated instant settlement',
    amount: rounded,
    timestamp: ts,
    status: 'Completed',
    reference: ref,
  };

  const nextState: KuSOPState = {
    ...state,
    walletBalance: state.walletBalance + rounded,
    transactions: [transaction, ...state.transactions],
    activities: [
      {
        id: `act-${Date.now()}`,
        category: 'wallet',
        title: `Added ${formatNaira(rounded)} via ${method}`,
        detail: `Reference ${ref} · New balance ${formatNaira(state.walletBalance + rounded)}`,
        amountText: `+${formatNaira(rounded)}`,
        timestamp: ts,
      },
      ...state.activities,
    ],
    notifications: [
      {
        id: `notif-${Date.now()}`,
        title: 'Wallet Funded',
        body: `${formatNaira(rounded)} was credited to your KuSOP Wallet via ${method}.`,
        category: 'wallet',
        timestamp: ts,
        read: false,
      },
      ...state.notifications,
    ],
  };

  return { ok: true, state: nextState, transaction };
}

export function calculateDeliveryFee(size: PackageSize, isScheduled: boolean): number {
  const base =
    size === 'Small Envelope' ? 1800 : size === 'Medium Box' ? 2400 : 3800;
  return isScheduled ? Math.max(1500, base - 200) : base;
}

export interface CreateDeliveryInput {
  mode: 'instant' | 'scheduled';
  pickup: string;
  dropoff: string;
  recipientName: string;
  recipientPhone: string;
  packageSize: PackageSize;
  scheduledDate?: string;
  scheduledWindow?: string;
  recurrence?: 'Once' | 'Weekly' | 'Bi-weekly';
}

export function createDeliveryOrder(
  state: KuSOPState,
  input: CreateDeliveryInput
): { ok: true; state: KuSOPState; order: DeliveryOrder } | { ok: false; error: string } {
  if (!input.pickup.trim() || !input.dropoff.trim()) {
    return { ok: false, error: 'Both pickup and dropoff addresses are required.' };
  }
  if (!input.recipientName.trim() || !input.recipientPhone.trim()) {
    return { ok: false, error: 'Recipient name and phone number are required.' };
  }
  if (input.mode === 'scheduled' && (!input.scheduledDate || !input.scheduledWindow)) {
    return { ok: false, error: 'Please select a date and time window for scheduled delivery.' };
  }

  const fee = calculateDeliveryFee(input.packageSize, input.mode === 'scheduled');
  if (state.walletBalance < fee) {
    return {
      ok: false,
      error: `Insufficient wallet balance (${formatNaira(state.walletBalance)}). Need ${formatNaira(fee)}.`,
    };
  }

  const trackingCode = generateRef('KSP-DLV');
  const ts = nowLabel();

  const order: DeliveryOrder = {
    id: `dlv-${Date.now()}`,
    trackingCode,
    mode: input.mode,
    pickup: input.pickup.trim(),
    dropoff: input.dropoff.trim(),
    recipientName: input.recipientName.trim(),
    recipientPhone: input.recipientPhone.trim(),
    packageSize: input.packageSize,
    fee,
    status: input.mode === 'scheduled' ? 'Scheduled' : 'Confirmed',
    scheduledDate: input.scheduledDate,
    scheduledWindow: input.scheduledWindow,
    recurrence: input.recurrence,
    riderName: input.mode === 'scheduled' ? 'Auto-assigned before window' : 'Musa Abdullahi (Volt E-Bike)',
    etaText:
      input.mode === 'scheduled'
        ? `${input.scheduledDate} · ${input.scheduledWindow}`
        : 'Rider dispatching (25 mins)',
    createdAt: ts,
  };

  const txn: Transaction = {
    id: `txn-${Date.now()}`,
    type: 'debit',
    category: 'delivery',
    title: input.mode === 'scheduled' ? 'KuSOP Scheduled Delivery' : 'KuSOP Express Delivery',
    subtitle: `${order.pickup} → ${order.dropoff}`,
    amount: fee,
    timestamp: ts,
    status: 'Completed',
    reference: trackingCode,
  };

  return {
    ok: true,
    order,
    state: {
      ...state,
      walletBalance: state.walletBalance - fee,
      deliveries: [order, ...state.deliveries],
      transactions: [txn, ...state.transactions],
      activities: [
        {
          id: `act-${Date.now()}`,
          category: 'delivery',
          title:
            input.mode === 'scheduled'
              ? `Scheduled delivery (${trackingCode})`
              : `Express delivery booked (${trackingCode})`,
          detail: `${order.pickup} → ${order.dropoff}`,
          amountText: `-${formatNaira(fee)}`,
          timestamp: ts,
        },
        ...state.activities,
      ],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: input.mode === 'scheduled' ? 'Delivery Scheduled' : 'Delivery Confirmed',
          body: `${trackingCode}: ${order.pickup} → ${order.dropoff}.`,
          category: 'delivery',
          timestamp: ts,
          read: false,
        },
        ...state.notifications,
      ],
    },
  };
}

const DELIVERY_FLOW: DeliveryStatus[] = [
  'Scheduled',
  'Confirmed',
  'Rider Assigned',
  'In Transit',
  'Delivered',
];

export function advanceDeliveryStatus(state: KuSOPState, trackingCode: string): KuSOPState {
  const deliveries = state.deliveries.map((d) => {
    if (d.trackingCode !== trackingCode) return d;
    const idx = DELIVERY_FLOW.indexOf(d.status);
    if (idx === -1 || idx >= DELIVERY_FLOW.length - 1) return d;
    const nextStatus = DELIVERY_FLOW[idx + 1];
    const etaText =
      nextStatus === 'Confirmed'
        ? 'Assigning nearest green rider'
        : nextStatus === 'Rider Assigned'
          ? 'Rider arriving at pickup in 6 mins'
          : nextStatus === 'In Transit'
            ? '12 mins to dropoff'
            : 'Delivered cleanly with zero emissions';
    return {
      ...d,
      status: nextStatus,
      riderName: d.riderName.startsWith('Auto-assigned') ? 'Chidi Eze (Volt E-Bike)' : d.riderName,
      etaText,
    };
  });

  return { ...state, deliveries };
}

export function fileDeliveryDispute(
  state: KuSOPState,
  trackingCode: string,
  reason: string,
  description: string
): { ok: true; state: KuSOPState; dispute: DeliveryDispute } | { ok: false; error: string } {
  if (!trackingCode.trim()) {
    return { ok: false, error: 'Select a delivery tracking code.' };
  }
  if (!reason.trim() || !description.trim()) {
    return { ok: false, error: 'Please select a reason and describe the issue.' };
  }

  const ts = nowLabel();
  const dispute: DeliveryDispute = {
    id: `dsp-${Date.now()}`,
    trackingCode,
    reason,
    description: description.trim(),
    status: 'Under Review',
    createdAt: ts,
  };

  return {
    ok: true,
    dispute,
    state: {
      ...state,
      disputes: [dispute, ...state.disputes],
      activities: [
        {
          id: `act-${Date.now()}`,
          category: 'delivery',
          title: `Dispute opened for ${trackingCode}`,
          detail: `${reason} · Status: Under Review`,
          timestamp: ts,
        },
        ...state.activities,
      ],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Delivery Dispute Submitted',
          body: `Ticket opened for ${trackingCode}. Demo resolution desk is reviewing.`,
          category: 'delivery',
          timestamp: ts,
          read: false,
        },
        ...state.notifications,
      ],
    },
  };
}

export function addToCart(
  cart: CartItem[],
  item: MenuItem,
  restaurantName: string
): CartItem[] {
  const existing = cart.find((c) => c.item.id === item.id);
  if (existing) {
    return cart.map((c) =>
      c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
    );
  }
  return [...cart, { item, restaurantName, quantity: 1 }];
}

export function updateCartQuantity(
  cart: CartItem[],
  itemId: string,
  delta: number
): CartItem[] {
  return cart
    .map((c) =>
      c.item.id === itemId ? { ...c, quantity: c.quantity + delta } : c
    )
    .filter((c) => c.quantity > 0);
}

export function calculateCartTotals(cart: CartItem[]): {
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
} {
  const itemCount = cart.reduce((acc, c) => acc + c.quantity, 0);
  const subtotal = cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
  const deliveryFee = itemCount > 0 ? 1000 : 0;
  return {
    itemCount,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  };
}

export function checkoutFoodOrder(
  state: KuSOPState,
  deliveryAddress: string,
  note?: string
): { ok: true; state: KuSOPState; order: FoodOrder } | { ok: false; error: string } {
  if (state.cart.length === 0) {
    return { ok: false, error: 'Your cart is empty. Add items before checking out.' };
  }
  if (!deliveryAddress.trim()) {
    return { ok: false, error: 'Enter a delivery address for your food order.' };
  }

  const { itemCount, subtotal, deliveryFee, total } = calculateCartTotals(state.cart);
  if (state.walletBalance < total) {
    return {
      ok: false,
      error: `Insufficient wallet balance (${formatNaira(state.walletBalance)}). Order total is ${formatNaira(total)}.`,
    };
  }

  const orderCode = generateRef('KSP-FD');
  const ts = nowLabel();
  const restaurantNames = Array.from(new Set(state.cart.map((c) => c.restaurantName)));
  const restaurantLabel =
    restaurantNames.length === 1 ? restaurantNames[0] : `${restaurantNames[0]} + ${restaurantNames.length - 1} more`;
  const itemsSummary = state.cart.map((c) => `${c.quantity}x ${c.item.name}`).join(', ');

  const order: FoodOrder = {
    id: `fd-${Date.now()}`,
    orderCode,
    restaurantName: restaurantLabel,
    itemsSummary,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    deliveryAddress: deliveryAddress.trim(),
    note: note?.trim(),
    status: 'Order Confirmed',
    riderName: 'Tobi Adeoye (Green E-Scooter)',
    etaText: '25–30 mins',
    createdAt: ts,
  };

  const txn: Transaction = {
    id: `txn-${Date.now()}`,
    type: 'debit',
    category: 'food',
    title: restaurantLabel,
    subtitle: itemsSummary,
    amount: total,
    timestamp: ts,
    status: 'Completed',
    reference: orderCode,
  };

  return {
    ok: true,
    order,
    state: {
      ...state,
      walletBalance: state.walletBalance - total,
      cart: [],
      foodOrders: [order, ...state.foodOrders],
      transactions: [txn, ...state.transactions],
      activities: [
        {
          id: `act-${Date.now()}`,
          category: 'food',
          title: `Food order placed (${orderCode})`,
          detail: `${restaurantLabel} · ${itemCount} item${itemCount > 1 ? 's' : ''}`,
          amountText: `-${formatNaira(total)}`,
          timestamp: ts,
        },
        ...state.activities,
      ],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Food Order Confirmed',
          body: `${orderCode} from ${restaurantLabel} is confirmed. Tap Track Food Order for progress.`,
          category: 'food',
          timestamp: ts,
          read: false,
        },
        ...state.notifications,
      ],
    },
  };
}

const FOOD_FLOW: FoodOrderStatus[] = [
  'Order Confirmed',
  'Kitchen Preparing',
  'E-Rider En Route',
  'Delivered',
];

export function advanceFoodOrderStatus(state: KuSOPState, orderCode: string): KuSOPState {
  const foodOrders = state.foodOrders.map((o) => {
    if (o.orderCode !== orderCode) return o;
    const idx = FOOD_FLOW.indexOf(o.status);
    if (idx === -1 || idx >= FOOD_FLOW.length - 1) return o;
    const next = FOOD_FLOW[idx + 1];
    const etaText =
      next === 'Kitchen Preparing'
        ? '18 mins remaining'
        : next === 'E-Rider En Route'
          ? '9 mins away'
          : 'Delivered hot & fresh';
    return { ...o, status: next, etaText };
  });

  return { ...state, foodOrders };
}

export function initiateBatterySwap(
  state: KuSOPState,
  stationId: string,
  bayNumber: number
): { ok: true; state: KuSOPState; swap: SwapRecord } | { ok: false; error: string } {
  const station = state.stations.find((s) => s.id === stationId);
  if (!station) {
    return { ok: false, error: 'Selected swap station was not found.' };
  }
  const bay = station.bays.find((b) => b.bayNumber === bayNumber);
  if (!bay) {
    return { ok: false, error: 'Selected battery bay was not found.' };
  }
  if (bay.status !== 'Ready') {
    return { ok: false, error: `Bay ${bayNumber} is currently ${bay.status}. Pick a Ready bay.` };
  }
  if (state.walletBalance < station.swapFee) {
    return {
      ok: false,
      error: `Insufficient wallet balance (${formatNaira(state.walletBalance)}). Swap fee is ${formatNaira(station.swapFee)}.`,
    };
  }

  const ts = nowLabel();
  const ref = generateRef('KSP-SWP');
  const oldPackId = `KSP-BAT-0${Math.floor(40 + Math.random() * 50)}`;

  const swap: SwapRecord = {
    id: `swp-${Date.now()}`,
    stationName: station.name,
    oldPackId,
    newPackId: bay.packId,
    newChargePercent: bay.chargePercent,
    energyKwh: 2.4,
    fee: station.swapFee,
    timestamp: ts,
  };

  const nextStations = state.stations.map((s) => {
    if (s.id !== stationId) return s;
    return {
      ...s,
      bays: s.bays.map((b) =>
        b.bayNumber === bayNumber
          ? {
              ...b,
              packId: oldPackId,
              chargePercent: 18,
              status: 'Charging' as const,
              rangeKm: 16,
            }
          : b
      ),
    };
  });

  const txn: Transaction = {
    id: `txn-${Date.now()}`,
    type: 'debit',
    category: 'swap',
    title: `Battery Swap · ${station.name}`,
    subtitle: `Bay 0${bayNumber} · Pack ${swap.newPackId} (${swap.newChargePercent}%)`,
    amount: station.swapFee,
    timestamp: ts,
    status: 'Completed',
    reference: ref,
  };

  return {
    ok: true,
    swap,
    state: {
      ...state,
      walletBalance: state.walletBalance - station.swapFee,
      stations: nextStations,
      swapHistory: [swap, ...state.swapHistory],
      transactions: [txn, ...state.transactions],
      activities: [
        {
          id: `act-${Date.now()}`,
          category: 'swap',
          title: `Battery swap at ${station.name}`,
          detail: `Collected ${swap.newPackId} (${swap.newChargePercent}% SOC) from Bay 0${bayNumber}`,
          amountText: `-${formatNaira(station.swapFee)}`,
          timestamp: ts,
        },
        ...state.activities,
      ],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Battery Swap Completed',
          body: `Pack ${swap.newPackId} (${swap.newChargePercent}%) unlocked at ${station.name}.`,
          category: 'swap',
          timestamp: ts,
          read: false,
        },
        ...state.notifications,
      ],
    },
  };
}

export function calculatePaySmallSmall(
  price: number,
  downPaymentPercent: number,
  months: number
): {
  downPayment: number;
  financedPrincipal: number;
  monthlyPayment: number;
  totalPayable: number;
  monthlyServiceFeeRate: number;
} {
  const clampedDown = Math.min(60, Math.max(15, downPaymentPercent));
  const clampedMonths = Math.min(36, Math.max(3, months));
  const downPayment = Math.round(price * (clampedDown / 100));
  const financedPrincipal = price - downPayment;
  const monthlyServiceFeeRate = 1.4; // illustrative 1.4% monthly flat service fee
  const totalFee = Math.round(financedPrincipal * (monthlyServiceFeeRate / 100) * clampedMonths);
  const totalFinanced = financedPrincipal + totalFee;
  const monthlyPayment = Math.round(totalFinanced / clampedMonths);
  return {
    downPayment,
    financedPrincipal,
    monthlyPayment,
    totalPayable: downPayment + totalFinanced,
    monthlyServiceFeeRate,
  };
}

export function calculateLeasePlan(
  monthlyLeaseBase: number,
  months: number,
  usageTier: 'Personal' | 'Commercial Fleet'
): {
  monthlyLease: number;
  securityDeposit: number;
  totalContract: number;
} {
  const tierMultiplier = usageTier === 'Commercial Fleet' ? 1.15 : 1.0;
  const tenureDiscount = months >= 12 ? 0.92 : months >= 6 ? 0.96 : 1.0;
  const monthlyLease = Math.round(monthlyLeaseBase * tierMultiplier * tenureDiscount);
  const securityDeposit = monthlyLease;
  return {
    monthlyLease,
    securityDeposit,
    totalContract: monthlyLease * months,
  };
}

export function submitEVEnquiry(
  state: KuSOPState,
  input: {
    planType: 'Buy EV' | 'Pay Small Small' | 'Lease EV';
    modelName: string;
    customerName: string;
    phone: string;
    summary: string;
    estimatedMonthly?: number;
  }
): { ok: true; state: KuSOPState; enquiry: EVEnquiry } | { ok: false; error: string } {
  if (!input.customerName.trim() || !input.phone.trim()) {
    return { ok: false, error: 'Please provide your name and phone number.' };
  }

  const ts = nowLabel();
  const enquiry: EVEnquiry = {
    id: `ev-${Date.now()}`,
    planType: input.planType,
    modelName: input.modelName,
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    summary: input.summary,
    estimatedMonthly: input.estimatedMonthly,
    status: 'Submitted - Advisor Assigned',
    createdAt: ts,
  };

  return {
    ok: true,
    enquiry,
    state: {
      ...state,
      evEnquiries: [enquiry, ...state.evEnquiries],
      activities: [
        {
          id: `act-${Date.now()}`,
          category: 'ev',
          title: `${input.planType} enquiry · ${input.modelName}`,
          detail: input.summary,
          timestamp: ts,
        },
        ...state.activities,
      ],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: `${input.planType} Request Received`,
          body: `Your ${input.modelName} enquiry has been logged in the KuSOP EV demo desk.`,
          category: 'ev',
          timestamp: ts,
          read: false,
        },
        ...state.notifications,
      ],
    },
  };
}

export function submitSupportTicket(
  state: KuSOPState,
  topic: string,
  message: string
): { ok: true; state: KuSOPState; ticket: SupportTicket } | { ok: false; error: string } {
  if (!topic.trim() || !message.trim()) {
    return { ok: false, error: 'Please select a topic and write your message.' };
  }

  const ts = nowLabel();
  const ticket: SupportTicket = {
    id: generateRef('SUP'),
    topic: topic.trim(),
    message: message.trim(),
    status: 'Open - Demo Desk',
    createdAt: ts,
  };

  return {
    ok: true,
    ticket,
    state: {
      ...state,
      supportTickets: [ticket, ...state.supportTickets],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Support Request Logged',
          body: `Ticket ${ticket.id} (${ticket.topic}) has been logged for review.`,
          category: 'system',
          timestamp: ts,
          read: false,
        },
        ...state.notifications,
      ],
    },
  };
}

export function updateProfileDetails(
  state: KuSOPState,
  updates: Partial<UserProfile>
): { ok: true; state: KuSOPState } | { ok: false; error: string } {
  if (!state.biometricSecurity.isUnlocked) {
    return {
      ok: false,
      error: 'Unlock biometric security on Profile before modifying account details.',
    };
  }

  const fullName = (updates.fullName ?? state.profile.fullName).trim();
  const email = (updates.email ?? state.profile.email).trim();
  const phone = (updates.phone ?? state.profile.phone).trim();
  const city = (updates.city ?? state.profile.city).trim();

  if (!fullName || !email || !phone) {
    return { ok: false, error: 'Full name, email, and phone number cannot be empty.' };
  }

  return {
    ok: true,
    state: {
      ...state,
      profile: {
        ...state.profile,
        ...updates,
        fullName,
        email,
        phone,
        city,
      },
    },
  };
}

export function maskSensitiveValue(value: string, visibleTail = 4): string {
  const compact = value.replace(/\s+/g, '');
  if (compact.length <= visibleTail) return '••••';
  return `•••• •••• ${compact.slice(-visibleTail)}`;
}

export function unlockBiometricSession(
  state: KuSOPState,
  method?: BiometricMethod
): KuSOPState {
  const activeMethod = method ?? state.biometricSecurity.method;
  const ts = nowLabel();
  return {
    ...state,
    biometricSecurity: {
      ...state.biometricSecurity,
      method: activeMethod,
      isUnlocked: true,
      lastVerifiedAt: ts,
      failedAttempts: 0,
    },
    activities: [
      {
        id: `act-${Date.now()}`,
        category: 'wallet',
        title: `Biometric vault unlocked (${activeMethod})`,
        detail: 'Access granted to sensitive account details and wallet funding',
        timestamp: ts,
      },
      ...state.activities,
    ],
    notifications: [
      {
        id: `notif-${Date.now()}`,
        title: 'Biometric Verification Succeeded',
        body: `Account vault and wallet funding unlocked via ${activeMethod}.`,
        category: 'system',
        timestamp: ts,
        read: false,
      },
      ...state.notifications,
    ],
  };
}

export function lockBiometricSession(state: KuSOPState): KuSOPState {
  return {
    ...state,
    biometricSecurity: {
      ...state.biometricSecurity,
      isUnlocked: false,
    },
  };
}

export function recordFailedBiometricAttempt(state: KuSOPState): KuSOPState {
  return {
    ...state,
    biometricSecurity: {
      ...state.biometricSecurity,
      isUnlocked: false,
      failedAttempts: state.biometricSecurity.failedAttempts + 1,
    },
  };
}

export function updateBiometricPreferences(
  state: KuSOPState,
  updates: Partial<Pick<BiometricSecurityState, 'method' | 'requireForWalletActions'>>
): KuSOPState {
  return {
    ...state,
    biometricSecurity: {
      ...state.biometricSecurity,
      ...updates,
    },
  };
}

export function loadStateFromStorage(): KuSOPState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createSeedState();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as Partial<KuSOPState>;
    const seed = createSeedState();
    return {
      ...seed,
      ...parsed,
      profile: { ...seed.profile, ...(parsed.profile ?? {}) },
      biometricSecurity: {
        ...seed.biometricSecurity,
        ...(parsed.biometricSecurity ?? {}),
      },
    };
  } catch {
    return createSeedState();
  }
}

export function saveStateToStorage(state: KuSOPState): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors in private mode
  }
}

export function resetDemoState(): KuSOPState {
  const seed = createSeedState();
  saveStateToStorage(seed);
  return seed;
}
