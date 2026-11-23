import { useEffect, useState } from 'react';
import { ActivityView } from './components/ActivityView';
import { AppShell } from './components/AppShell';
import { BatterySwapModule } from './components/BatterySwapModule';
import { DeliveryModule } from './components/DeliveryModule';
import { DiscoverView } from './components/DiscoverView';
import { EVServiceModule } from './components/EVServiceModule';
import { FoodModule } from './components/FoodModule';
import { HomeDashboard } from './components/HomeDashboard';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { OfflineAndUpdateStatus } from './components/PWAControls';
import { AboutView, SupportView } from './components/SupportAndAboutViews';
import { ToastBanner, type ToastMessage } from './components/ToastBanner';
import { WalletView } from './components/WalletView';
import { RESTAURANTS } from './data/seedData';
import type {
  BiometricMethod,
  BiometricSecurityState,
  KuSOPState,
  MenuItem,
  RouteId,
  UserProfile,
} from './types/kusop';
import {
  addToCart,
  advanceDeliveryStatus,
  advanceFoodOrderStatus,
  applyWalletFunding,
  checkoutFoodOrder,
  createDeliveryOrder,
  fileDeliveryDispute,
  formatNaira,
  initiateBatterySwap,
  loadStateFromStorage,
  lockBiometricSession,
  recordFailedBiometricAttempt,
  resetDemoState,
  saveStateToStorage,
  submitEVEnquiry,
  submitSupportTicket,
  unlockBiometricSession,
  updateBiometricPreferences,
  updateCartQuantity,
  updateProfileDetails,
  type CreateDeliveryInput,
} from './utils/kusopLogic';

const ROUTE_TITLES: Record<RouteId, string> = {
  home: 'KuSOP Mobile',
  discover: 'Discover KuSOP',
  activity: 'Activity',
  wallet: 'KuSOP Wallet',
  profile: 'Customer Profile',
  notifications: 'Notifications',
  support: 'Help & Support',
  about: 'About KuSOP',
  delivery: 'KuSOP Delivery',
  'delivery-order': 'Order Delivery',
  'delivery-track': 'Track Delivery',
  'delivery-schedule': 'Schedule Delivery',
  'delivery-disputes': 'Settle Disputes',
  food: 'KuSOP Food',
  'food-restaurant': 'Restaurant Menu',
  'food-cart': 'Cart & Checkout',
  'food-track': 'Track Food Order',
  swap: 'KuSOP Battery Swap',
  'swap-stations': 'Find Swap Stations',
  'swap-availability': 'Battery Availability',
  'swap-initiate': 'Initiate Battery Swap',
  'swap-history': 'Swap History',
  ev: 'KuSOP EV Service',
  'ev-buy': 'Buy EV',
  'ev-installment': 'Pay Small Small',
  'ev-lease': 'Lease EV',
};

export default function App() {
  const [state, setState] = useState<KuSOPState>(() => loadStateFromStorage());
  const [history, setHistory] = useState<RouteId[]>(['home']);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(RESTAURANTS[0].id);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const currentRoute = history[history.length - 1];

  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (type: 'success' | 'error', title: string, detail?: string) => {
    setToast({ id: Date.now(), type, title, detail });
  };

  const navigate = (route: RouteId) => {
    setHistory((prev) => {
      if (prev[prev.length - 1] === route) return prev;
      if (route === 'home') return ['home'];
      return [...prev, route];
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : ['home']));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetDemo = () => {
    const fresh = resetDemoState();
    setState(fresh);
    setHistory(['home']);
    showToast('success', 'Demo data reset', 'Wallet, orders, and swap hubs restored to initial demo state.');
  };

  const handleFundWallet = (
    amount: number,
    method: 'Bank Transfer' | 'Debit Card' | 'USSD'
  ) => {
    const res = applyWalletFunding(state, amount, method);
    if (!res.ok) {
      showToast('error', 'Funding failed', res.error);
      return null;
    }
    setState(res.state);
    showToast(
      'success',
      `Added ${formatNaira(res.transaction.amount)}`,
      `New balance: ${formatNaira(res.state.walletBalance)}`
    );
    return res.transaction;
  };

  const handleCreateDelivery = (input: CreateDeliveryInput) => {
    const res = createDeliveryOrder(state, input);
    if (!res.ok) {
      showToast('error', 'Could not place delivery', res.error);
      return null;
    }
    setState(res.state);
    showToast(
      'success',
      `Delivery ${res.order.trackingCode} confirmed`,
      `Deducted ${formatNaira(res.order.fee)} from KuSOP Wallet.`
    );
    return res.order;
  };

  const handleAdvanceDelivery = (trackingCode: string) => {
    setState((prev) => advanceDeliveryStatus(prev, trackingCode));
    showToast('success', 'Delivery milestone updated', `${trackingCode} progressed to next stage.`);
  };

  const handleFileDispute = (trackingCode: string, reason: string, description: string) => {
    const res = fileDeliveryDispute(state, trackingCode, reason, description);
    if (!res.ok) {
      showToast('error', 'Dispute not submitted', res.error);
      return null;
    }
    setState(res.state);
    showToast('success', 'Dispute ticket submitted', `${trackingCode} is now under review.`);
    return res.dispute;
  };

  const handleAddToCart = (item: MenuItem, restaurantName: string) => {
    setState((prev) => ({
      ...prev,
      cart: addToCart(prev.cart, item, restaurantName),
    }));
    showToast('success', `Added ${item.name}`, 'Updated your KuSOP Food cart.');
  };

  const handleUpdateCartQty = (itemId: string, delta: number) => {
    setState((prev) => ({
      ...prev,
      cart: updateCartQuantity(prev.cart, itemId, delta),
    }));
  };

  const handleFoodCheckout = (address: string, note: string) => {
    const res = checkoutFoodOrder(state, address, note);
    if (!res.ok) {
      showToast('error', 'Checkout failed', res.error);
      return null;
    }
    setState(res.state);
    showToast(
      'success',
      `Food order ${res.order.orderCode} placed`,
      `Paid ${formatNaira(res.order.total)} from KuSOP Wallet.`
    );
    return res.order;
  };

  const handleAdvanceFoodOrder = (orderCode: string) => {
    setState((prev) => advanceFoodOrderStatus(prev, orderCode));
    showToast('success', 'Food order updated', `${orderCode} moved to the next preparation stage.`);
  };

  const handleInitiateSwap = (stationId: string, bayNumber: number) => {
    const res = initiateBatterySwap(state, stationId, bayNumber);
    if (!res.ok) {
      showToast('error', 'Battery swap failed', res.error);
      return null;
    }
    setState(res.state);
    showToast(
      'success',
      `Bay 0${bayNumber} unlocked`,
      `Collected pack ${res.swap.newPackId} (${res.swap.newChargePercent}%).`
    );
    return res.swap;
  };

  const handleSubmitEVEnquiry = (input: {
    planType: 'Buy EV' | 'Pay Small Small' | 'Lease EV';
    modelName: string;
    customerName: string;
    phone: string;
    summary: string;
    estimatedMonthly?: number;
  }) => {
    const res = submitEVEnquiry(state, input);
    if (!res.ok) {
      showToast('error', 'Enquiry not submitted', res.error);
      return null;
    }
    setState(res.state);
    showToast('success', `${input.planType} enquiry submitted`, `Logged for ${input.modelName}.`);
    return res.enquiry;
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    const res = updateProfileDetails(state, updates);
    if (!res.ok) {
      showToast('error', 'Update failed', res.error);
      return false;
    }
    setState(res.state);
    showToast('success', 'Profile updated', 'Your customer details have been saved locally.');
    return true;
  };

  const handleSubmitTicket = (topic: string, message: string) => {
    const res = submitSupportTicket(state, topic, message);
    if (!res.ok) {
      showToast('error', 'Could not send ticket', res.error);
      return null;
    }
    setState(res.state);
    showToast('success', `Ticket ${res.ticket.id} submitted`, 'Logged with KuSOP demo support.');
    return res.ticket;
  };

  const unreadNotifications = state.notifications.filter((n) => !n.read).length;
  const cartCount = state.cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <>
      <ToastBanner toast={toast} onDismiss={() => setToast(null)} />
      <OfflineAndUpdateStatus />
      <AppShell
        route={currentRoute}
        pageTitle={ROUTE_TITLES[currentRoute]}
        canGoBack={history.length > 1}
        walletBalance={state.walletBalance}
        unreadNotifications={unreadNotifications}
        cartCount={cartCount}
        onNavigate={navigate}
        onBack={goBack}
        onResetDemo={handleResetDemo}
      >
        {currentRoute === 'home' && (
          <HomeDashboard state={state} onNavigate={navigate} />
        )}

        {currentRoute === 'wallet' && (
          <WalletView state={state} onNavigate={navigate} onFundWallet={handleFundWallet} />
        )}

        {currentRoute === 'discover' && (
          <DiscoverView state={state} onNavigate={navigate} />
        )}

        {currentRoute === 'activity' && (
          <ActivityView state={state} onNavigate={navigate} />
        )}

        {currentRoute === 'profile' && (
          <ProfileView
            state={state}
            onNavigate={navigate}
            onUpdateProfile={handleUpdateProfile}
            onResetDemo={handleResetDemo}
            onBiometricUnlock={(method: BiometricMethod) => {
              setState((prev) => unlockBiometricSession(prev, method));
              showToast('success', `${method} Verified`, 'Sensitive account info and wallet funding unlocked.');
            }}
            onBiometricLock={() => {
              setState((prev) => lockBiometricSession(prev));
              showToast('success', 'Vault Locked', 'Sensitive account details and wallet funding are now locked.');
            }}
            onBiometricFailed={() => {
              setState((prev) => recordFailedBiometricAttempt(prev));
              showToast('error', 'Biometric Match Failed', 'Please retry verification to unlock.');
            }}
            onUpdateBiometricPrefs={(
              updates: Partial<Pick<BiometricSecurityState, 'method' | 'requireForWalletActions'>>
            ) => {
              setState((prev) => updateBiometricPreferences(prev, updates));
            }}
          />
        )}

        {currentRoute === 'notifications' && (
          <NotificationsView
            state={state}
            onMarkRead={(id) =>
              setState((prev) => ({
                ...prev,
                notifications: prev.notifications.map((n) =>
                  n.id === id ? { ...n, read: true } : n
                ),
              }))
            }
            onMarkAllRead={() =>
              setState((prev) => ({
                ...prev,
                notifications: prev.notifications.map((n) => ({ ...n, read: true })),
              }))
            }
            onClearAll={() =>
              setState((prev) => ({
                ...prev,
                notifications: [],
              }))
            }
          />
        )}

        {currentRoute === 'support' && (
          <SupportView state={state} onSubmitTicket={handleSubmitTicket} />
        )}

        {currentRoute === 'about' && <AboutView onNavigate={navigate} />}

        {currentRoute.startsWith('delivery') && (
          <DeliveryModule
            route={currentRoute}
            state={state}
            onNavigate={navigate}
            onCreateDelivery={handleCreateDelivery}
            onAdvanceDelivery={handleAdvanceDelivery}
            onFileDispute={handleFileDispute}
          />
        )}

        {currentRoute.startsWith('food') && (
          <FoodModule
            route={currentRoute}
            state={state}
            selectedRestaurantId={selectedRestaurantId}
            onSelectRestaurant={setSelectedRestaurantId}
            onNavigate={navigate}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onCheckout={handleFoodCheckout}
            onAdvanceFoodOrder={handleAdvanceFoodOrder}
          />
        )}

        {currentRoute.startsWith('swap') && (
          <BatterySwapModule
            route={currentRoute}
            state={state}
            onNavigate={navigate}
            onInitiateSwap={handleInitiateSwap}
          />
        )}

        {currentRoute.startsWith('ev') && (
          <EVServiceModule
            route={currentRoute}
            state={state}
            onNavigate={navigate}
            onSubmitEnquiry={handleSubmitEVEnquiry}
          />
        )}
      </AppShell>
    </>
  );
}
