import { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Trash2,
} from 'lucide-react';
import { MENU_ITEMS, RESTAURANTS } from '../data/seedData';
import type {
  FoodCategory,
  FoodOrder,
  KuSOPState,
  MenuItem,
  RouteId,
} from '../types/kusop';
import { calculateCartTotals, formatNaira } from '../utils/kusopLogic';
import { SafeImage } from './SafeImage';

interface FoodModuleProps {
  route: RouteId;
  state: KuSOPState;
  selectedRestaurantId: string;
  onSelectRestaurant: (restaurantId: string) => void;
  onNavigate: (route: RouteId) => void;
  onAddToCart: (item: MenuItem, restaurantName: string) => void;
  onUpdateCartQty: (itemId: string, delta: number) => void;
  onCheckout: (address: string, note: string) => FoodOrder | null;
  onAdvanceFoodOrder: (orderCode: string) => void;
}

const CATEGORIES: FoodCategory[] = [
  'All',
  'Nigerian Classics',
  'Grills & Suya',
  'Healthy Bowls',
  'Drinks & Sides',
];

const FOOD_STEPS = [
  'Order Confirmed',
  'Kitchen Preparing',
  'E-Rider En Route',
  'Delivered',
];

export function FoodModule({
  route,
  state,
  selectedRestaurantId,
  onSelectRestaurant,
  onNavigate,
  onAddToCart,
  onUpdateCartQty,
  onCheckout,
  onAdvanceFoodOrder,
}: FoodModuleProps) {
  const [activeCategory, setActiveCategory] = useState<FoodCategory>('All');
  const [address, setAddress] = useState('Plot 14, Admiralty Road, Lekki Phase 1');
  const [orderNote, setOrderNote] = useState('Call on arrival at the gate');
  const [confirmedOrder, setConfirmedOrder] = useState<FoodOrder | null>(null);
  const [selectedOrderCode, setSelectedOrderCode] = useState(
    state.foodOrders[0]?.orderCode ?? ''
  );

  const totals = calculateCartTotals(state.cart);
  const currentRestaurant =
    RESTAURANTS.find((r) => r.id === selectedRestaurantId) ?? RESTAURANTS[0];
  const restaurantMenu = MENU_ITEMS.filter(
    (m) => m.restaurantId === currentRestaurant.id
  );

  // Sub-page: Restaurant Menu
  if (route === 'food-restaurant') {
    return (
      <div className="space-y-6">
        <div className="relative rounded-3xl overflow-hidden bg-gray-900 min-h-[190px] flex items-end">
          <SafeImage
            src={currentRestaurant.heroImage}
            alt={currentRestaurant.name}
            className="absolute inset-0 w-full h-full object-cover"
            fallbackTitle={currentRestaurant.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
          <div className="relative z-10 p-6 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-emerald-300">
                {currentRestaurant.category} · {currentRestaurant.area}
              </p>
              <h2 className="font-display text-2xl font-bold text-white mt-0.5">
                {currentRestaurant.name}
              </h2>
              <p className="text-xs text-gray-200 mt-1">
                {currentRestaurant.cuisine} · {currentRestaurant.deliveryTime} · Rating {currentRestaurant.rating}
              </p>
            </div>

            {totals.itemCount > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('food-cart')}
                className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-gray-950 font-semibold text-sm inline-flex items-center gap-2 transition-colors shrink-0 whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>
                  View Cart ({totals.itemCount}) · {formatNaira(totals.subtotal)}
                </span>
              </button>
            )}
          </div>
        </div>

        <section aria-label="Restaurant Menu">
          <h3 className="font-display text-lg font-bold text-gray-950 mb-3">
            Menu Items
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurantMenu.map((item) => {
              const inCart = state.cart.find((c) => c.item.id === item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-gray-200/80 p-4 flex gap-4 items-center"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-gray-100">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      fallbackTitle={item.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm font-bold text-gray-950">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-3">
                      <span className="font-mono text-sm font-bold text-[#0D4A31] tabular-nums">
                        {formatNaira(item.price)}
                      </span>
                      {inCart ? (
                        <div className="inline-flex items-center gap-1 bg-[#EAF7F0] rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => onUpdateCartQty(item.id, -1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="w-8 h-8 rounded-lg bg-white text-[#0D4A31] flex items-center justify-center"
                          >
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <span className="font-mono text-xs font-bold px-2 tabular-nums">
                            {inCart.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateCartQty(item.id, 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="w-8 h-8 rounded-lg bg-[#0D4A31] text-white flex items-center justify-center"
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAddToCart(item, currentRestaurant.name)}
                          className="min-h-[40px] px-3.5 rounded-xl bg-[#0D4A31] hover:bg-[#115E3F] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // Sub-page: Shopping Cart & Checkout Demonstration
  if (route === 'food-cart') {
    const handleCheckoutSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const placed = onCheckout(address, orderNote);
      if (placed) {
        setConfirmedOrder(placed);
        setSelectedOrderCode(placed.orderCode);
      }
    };

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 sm:p-6">
          <p className="text-xs font-semibold text-[#0D4A31]">KuSOP Food Checkout</p>
          <h2 className="font-display text-xl font-bold text-gray-950 mt-1">
            Review Cart & Pay with KuSOP Wallet
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            Adjust item quantities, enter your dropoff address, and complete a simulated checkout.
          </p>
        </div>

        {confirmedOrder && (
          <div
            data-testid="food-checkout-confirmation"
            className="rounded-3xl bg-[#EAF7F0] border border-[#BDE4CD] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-[#0D4A31]">
                  Order Placed · {confirmedOrder.orderCode}
                </p>
                <p className="text-xs text-gray-700 mt-0.5">
                  {confirmedOrder.restaurantName} · Total {formatNaira(confirmedOrder.total)} · {confirmedOrder.etaText}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('food-track')}
              className="min-h-[44px] px-4 rounded-xl bg-[#0D4A31] text-white text-xs font-semibold hover:bg-[#115E3F] transition-colors shrink-0"
            >
              Track Food Order
            </button>
          </div>
        )}

        {state.cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-10 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-gray-950">
              Your food cart is empty
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Browse our partner kitchens and add Jollof, Suya, or fresh grain bowls to test checkout.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('food')}
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-[#0D4A31] text-white text-xs font-semibold hover:bg-[#115E3F] transition-colors"
            >
              Discover Restaurants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6">
              <h3 className="font-display text-base font-bold text-gray-950 mb-4">
                Cart Items ({totals.itemCount})
              </h3>
              <ul className="divide-y divide-gray-100">
                {state.cart.map((c) => (
                  <li key={c.item.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-950 truncate">{c.item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {c.restaurantName} · {formatNaira(c.item.price)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="inline-flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => onUpdateCartQty(c.item.id, -1)}
                          aria-label={`Remove one ${c.item.name}`}
                          className="w-8 h-8 rounded-lg bg-white text-gray-800 flex items-center justify-center"
                        >
                          {c.quantity === 1 ? (
                            <Trash2 className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                        </button>
                        <span className="font-mono text-xs font-bold px-2 tabular-nums">
                          {c.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateCartQty(c.item.id, 1)}
                          aria-label={`Add one ${c.item.name}`}
                          className="w-8 h-8 rounded-lg bg-[#0D4A31] text-white flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="font-mono text-sm font-bold text-gray-950 w-20 text-right tabular-nums">
                        {formatNaira(c.item.price * c.quantity)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <form
              onSubmit={handleCheckoutSubmit}
              className="lg:col-span-5 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-4"
            >
              <h3 className="font-display text-base font-bold text-gray-950">
                Checkout Summary
              </h3>

              <div>
                <label htmlFor="food-address" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Delivery Address
                </label>
                <input
                  id="food-address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950"
                />
              </div>

              <div>
                <label htmlFor="food-note" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Rider Instructions (Optional)
                </label>
                <input
                  id="food-note"
                  type="text"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 text-sm text-gray-950"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">{formatNaira(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>EV Rider Delivery</span>
                  <span className="font-mono tabular-nums">{formatNaira(totals.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-gray-950 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="font-mono text-[#0D4A31] tabular-nums">{formatNaira(totals.total)}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Available KuSOP Wallet: <span className="font-mono font-semibold">{formatNaira(state.walletBalance)}</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-[#0D4A31] hover:bg-[#115E3F] text-white font-semibold text-sm transition-colors"
              >
                Pay {formatNaira(totals.total)} & Place Order
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Sub-page: Track Food Order
  if (route === 'food-track') {
    const activeFoodOrder =
      state.foodOrders.find((o) => o.orderCode === selectedOrderCode) ??
      state.foodOrders[0];
    const stepIdx = activeFoodOrder ? FOOD_STEPS.indexOf(activeFoodOrder.status) : 0;

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[#EAF7F0] border border-[#CFEAD9] p-5 sm:p-6">
          <p className="text-xs font-semibold text-[#0D4A31]">How KuSOP Food Tracking Works</p>
          <h2 className="font-display text-xl font-bold text-gray-950 mt-1">
            Kitchen to Doorstep on Green E-Scooters
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            Follow kitchen prep and electric rider handoff in real time. Use the step button to simulate order progress.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200/80 p-5 space-y-2">
            <h3 className="font-display text-base font-bold text-gray-950 mb-2">
              Your Food Orders ({state.foodOrders.length})
            </h3>
            {state.foodOrders.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setSelectedOrderCode(o.orderCode)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-colors ${
                  activeFoodOrder?.orderCode === o.orderCode
                    ? 'bg-[#EAF7F0] border-[#0D4A31]'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between text-xs">
                  <span className="font-mono font-bold text-[#0D4A31]">{o.orderCode}</span>
                  <span className="font-semibold text-gray-700">{o.status}</span>
                </div>
                <p className="text-sm font-semibold text-gray-950 mt-1">{o.restaurantName}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{o.itemsSummary}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6">
            {activeFoodOrder ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <p className="font-mono text-xs font-semibold text-[#16A34A]">
                      {activeFoodOrder.orderCode} · {activeFoodOrder.restaurantName}
                    </p>
                    <h3 className="font-display text-lg font-bold text-gray-950 mt-0.5">
                      {activeFoodOrder.status}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {activeFoodOrder.riderName} · {activeFoodOrder.etaText}
                    </p>
                  </div>
                  {activeFoodOrder.status !== 'Delivered' && (
                    <button
                      type="button"
                      onClick={() => onAdvanceFoodOrder(activeFoodOrder.orderCode)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0D4A31] hover:bg-[#115E3F] text-white text-xs font-semibold transition-colors"
                    >
                      Simulate Next Step
                    </button>
                  )}
                </div>

                <div className="bg-[#F8FAF9] rounded-2xl p-4 text-xs space-y-1.5">
                  <p className="font-semibold text-gray-950">{activeFoodOrder.itemsSummary}</p>
                  <p className="text-gray-600">Delivering to: {activeFoodOrder.deliveryAddress}</p>
                  <p className="font-mono font-semibold text-[#0D4A31] tabular-nums">
                    Paid: {formatNaira(activeFoodOrder.total)}
                  </p>
                </div>

                <ol className="space-y-3">
                  {FOOD_STEPS.map((step, idx) => {
                    const done = idx <= stepIdx;
                    return (
                      <li key={step} className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                            done ? 'bg-[#16A34A] text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span className={`text-sm ${done ? 'font-semibold text-gray-950' : 'text-gray-400'}`}>
                          {step}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-8 text-center">No active food orders.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Food Hub: Discover Restaurants & Categories
  const filteredRestaurants =
    activeCategory === 'All'
      ? RESTAURANTS
      : RESTAURANTS.filter((r) => r.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="rounded-3xl bg-[#0D4A31] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-emerald-200">KuSOP Food</p>
          <h2 className="font-display text-2xl font-bold mt-1">
            Fresh Local Meals, Clean Delivery
          </h2>
          <p className="text-sm text-emerald-100 mt-1">
            Order from curated kitchens and pay seamlessly with your KuSOP Wallet.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('food-track')}
            className="min-h-[44px] px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>Track Food Order</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('food-cart')}
            className="min-h-[44px] px-4 py-2 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-gray-950 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            <span>Cart ({totals.itemCount})</span>
          </button>
        </div>
      </div>

      {/* Food Categories Filter */}
      <section aria-label="Food Categories">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-[#0D4A31] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Discover Restaurants */}
      <section aria-label="Discover Restaurants">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-bold text-gray-950">
            Discover Restaurants
          </h3>
          <span className="text-xs text-gray-500">
            {filteredRestaurants.length} kitchen{filteredRestaurants.length === 1 ? '' : 's'} available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredRestaurants.map((rest) => (
            <button
              key={rest.id}
              type="button"
              onClick={() => {
                onSelectRestaurant(rest.id);
                onNavigate('food-restaurant');
              }}
              className="group text-left bg-white rounded-3xl border border-gray-200/80 overflow-hidden hover:border-[#0D4A31]/40 transition-colors flex flex-col"
            >
              <div className="h-44 w-full overflow-hidden bg-gray-100">
                <SafeImage
                  src={rest.heroImage}
                  alt={rest.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  fallbackTitle={rest.name}
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#16A34A]">
                      {rest.category} · {rest.area}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                      {rest.rating}
                    </span>
                  </div>
                  <h4 className="font-display text-base font-bold text-gray-950 mt-1">
                    {rest.name}
                  </h4>
                  <p className="text-xs text-gray-600 mt-0.5">{rest.cuisine}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                  <span>
                    {rest.deliveryTime} · Fee <span className="font-mono font-semibold">{formatNaira(rest.deliveryFee)}</span>
                  </span>
                  <span className="font-semibold text-[#0D4A31] inline-flex items-center gap-1">
                    Open Menu
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
