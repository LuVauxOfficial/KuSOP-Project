export type RouteId =
  | 'home'
  | 'discover'
  | 'activity'
  | 'wallet'
  | 'profile'
  | 'notifications'
  | 'support'
  | 'about'
  | 'delivery'
  | 'delivery-order'
  | 'delivery-track'
  | 'delivery-schedule'
  | 'delivery-disputes'
  | 'food'
  | 'food-restaurant'
  | 'food-cart'
  | 'food-track'
  | 'swap'
  | 'swap-stations'
  | 'swap-availability'
  | 'swap-initiate'
  | 'swap-history'
  | 'ev'
  | 'ev-buy'
  | 'ev-installment'
  | 'ev-lease';

export type TransactionCategory = 'wallet' | 'delivery' | 'food' | 'swap' | 'ev';

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  category: TransactionCategory;
  title: string;
  subtitle: string;
  amount: number;
  timestamp: string;
  status: 'Completed' | 'Pending';
  reference: string;
}

export type DeliveryStatus =
  | 'Confirmed'
  | 'Rider Assigned'
  | 'In Transit'
  | 'Delivered'
  | 'Scheduled';

export type PackageSize = 'Small Envelope' | 'Medium Box' | 'Large Cargo';

export interface DeliveryOrder {
  id: string;
  trackingCode: string;
  mode: 'instant' | 'scheduled';
  pickup: string;
  dropoff: string;
  recipientName: string;
  recipientPhone: string;
  packageSize: PackageSize;
  fee: number;
  status: DeliveryStatus;
  scheduledDate?: string;
  scheduledWindow?: string;
  recurrence?: 'Once' | 'Weekly' | 'Bi-weekly';
  riderName: string;
  etaText: string;
  createdAt: string;
}

export interface DeliveryDispute {
  id: string;
  trackingCode: string;
  reason: string;
  description: string;
  status: 'Under Review' | 'Resolved - Credited';
  createdAt: string;
}

export type FoodCategory =
  | 'All'
  | 'Nigerian Classics'
  | 'Grills & Suya'
  | 'Healthy Bowls'
  | 'Drinks & Sides';

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: Exclude<FoodCategory, 'All'>;
  prepTime: string;
  image: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  category: Exclude<FoodCategory, 'All'>;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  area: string;
  heroImage: string;
}

export interface CartItem {
  item: MenuItem;
  restaurantName: string;
  quantity: number;
}

export type FoodOrderStatus =
  | 'Order Confirmed'
  | 'Kitchen Preparing'
  | 'E-Rider En Route'
  | 'Delivered';

export interface FoodOrder {
  id: string;
  orderCode: string;
  restaurantName: string;
  itemsSummary: string;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  note?: string;
  status: FoodOrderStatus;
  riderName: string;
  etaText: string;
  createdAt: string;
}

export interface BatteryBay {
  bayNumber: number;
  packId: string;
  chargePercent: number;
  status: 'Ready' | 'Charging' | 'Reserved';
  rangeKm: number;
}

export interface SwapStation {
  id: string;
  name: string;
  area: string;
  address: string;
  distanceKm: number;
  hours: string;
  swapFee: number;
  bays: BatteryBay[];
}

export interface SwapRecord {
  id: string;
  stationName: string;
  oldPackId: string;
  newPackId: string;
  newChargePercent: number;
  energyKwh: number;
  fee: number;
  timestamp: string;
}

export interface EVModel {
  id: string;
  name: string;
  segment: 'Two-Wheeler' | 'Cargo E-Bike' | 'Urban Compact EV';
  price: number;
  monthlyLeaseBase: number;
  rangeKm: number;
  topSpeedKmh: number;
  batteryType: string;
  chargeTime: string;
  image: string;
  highlights: string[];
}

export interface EVEnquiry {
  id: string;
  planType: 'Buy EV' | 'Pay Small Small' | 'Lease EV';
  modelName: string;
  customerName: string;
  phone: string;
  summary: string;
  estimatedMonthly?: number;
  status: 'Submitted - Advisor Assigned';
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  category: TransactionCategory;
  title: string;
  detail: string;
  amountText?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: TransactionCategory | 'system';
  timestamp: string;
  read: boolean;
}

export interface SupportTicket {
  id: string;
  topic: string;
  message: string;
  status: 'Open - Demo Desk' | 'Acknowledged';
  createdAt: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  tier: string;
  vehicleTag: string;
  virtualAccountNumber: string;
  virtualBankName: string;
  bvnNumber: string;
}

export type BiometricMethod = 'Fingerprint' | 'Face ID';

export interface BiometricSecurityState {
  method: BiometricMethod;
  requireForWalletActions: boolean;
  isUnlocked: boolean;
  lastVerifiedAt: string | null;
  failedAttempts: number;
}

export interface KuSOPState {
  walletBalance: number;
  transactions: Transaction[];
  deliveries: DeliveryOrder[];
  disputes: DeliveryDispute[];
  cart: CartItem[];
  foodOrders: FoodOrder[];
  stations: SwapStation[];
  swapHistory: SwapRecord[];
  evEnquiries: EVEnquiry[];
  activities: ActivityItem[];
  notifications: NotificationItem[];
  supportTickets: SupportTicket[];
  profile: UserProfile;
  biometricSecurity: BiometricSecurityState;
}
