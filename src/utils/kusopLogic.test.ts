import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeedState, MENU_ITEMS } from '../data/seedData';
import {
  addToCart,
  advanceDeliveryStatus,
  advanceFoodOrderStatus,
  applyWalletFunding,
  calculateCartTotals,
  calculateDeliveryFee,
  calculateLeasePlan,
  calculatePaySmallSmall,
  checkoutFoodOrder,
  createDeliveryOrder,
  fileDeliveryDispute,
  formatNaira,
  initiateBatterySwap,
  lockBiometricSession,
  maskSensitiveValue,
  recordFailedBiometricAttempt,
  submitEVEnquiry,
  unlockBiometricSession,
  updateCartQuantity,
  updateProfileDetails,
} from './kusopLogic';

test('formatNaira formats Nigerian Naira cleanly', () => {
  assert.equal(formatNaira(124500), '₦124,500');
  assert.equal(formatNaira(0), '₦0');
});

test('biometric lock gates wallet funding and profile edits until unlocked', () => {
  const seed = createSeedState();
  assert.equal(seed.biometricSecurity.isUnlocked, false);
  assert.equal(maskSensitiveValue(seed.profile.virtualAccountNumber), '•••• •••• 1240');

  const blockedFund = applyWalletFunding(seed, 25000, 'Bank Transfer');
  assert.equal(blockedFund.ok, false);

  const blockedProfile = updateProfileDetails(seed, { city: 'Abuja, Nigeria' });
  assert.equal(blockedProfile.ok, false);

  const failed = recordFailedBiometricAttempt(seed);
  assert.equal(failed.biometricSecurity.failedAttempts, 1);

  const unlocked = unlockBiometricSession(failed, 'Face ID');
  assert.equal(unlocked.biometricSecurity.isUnlocked, true);
  assert.equal(unlocked.biometricSecurity.method, 'Face ID');
  assert.equal(unlocked.biometricSecurity.failedAttempts, 0);

  const invalid = applyWalletFunding(unlocked, 50, 'Debit Card');
  assert.equal(invalid.ok, false);

  const res = applyWalletFunding(unlocked, 25000, 'Bank Transfer');
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.state.walletBalance, unlocked.walletBalance + 25000);
    assert.equal(res.state.transactions.length, unlocked.transactions.length + 1);
    assert.equal(res.state.transactions[0].amount, 25000);
    assert.equal(res.state.activities[0].category, 'wallet');
  }

  const relocked = lockBiometricSession(unlocked);
  assert.equal(relocked.biometricSecurity.isUnlocked, false);
});

test('createDeliveryOrder deducts wallet, creates order, and advances status', () => {
  const seed = createSeedState();
  const fee = calculateDeliveryFee('Medium Box', false);
  assert.equal(fee, 2400);

  const res = createDeliveryOrder(seed, {
    mode: 'instant',
    pickup: '12 Awolowo Road, Ikoyi',
    dropoff: '44 Bode Thomas, Surulere',
    recipientName: 'Sade Williams',
    recipientPhone: '0805 111 2233',
    packageSize: 'Medium Box',
  });

  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.state.walletBalance, seed.walletBalance - 2400);
    assert.equal(res.order.status, 'Confirmed');
    const advanced = advanceDeliveryStatus(res.state, res.order.trackingCode);
    const updated = advanced.deliveries.find((d) => d.trackingCode === res.order.trackingCode);
    assert.equal(updated?.status, 'Rider Assigned');
  }
});

test('fileDeliveryDispute records dispute ticket', () => {
  const seed = createSeedState();
  const res = fileDeliveryDispute(seed, 'KSP-DLV-8421', 'Delayed Arrival', 'Package delayed by 20 mins');
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.state.disputes.length, 1);
    assert.equal(res.state.disputes[0].status, 'Under Review');
  }
});

test('Food cart & checkout deducts wallet and creates trackable order', () => {
  let state = createSeedState();
  const jollof = MENU_ITEMS[0];
  let cart = addToCart(state.cart, jollof, 'Eko Smokehouse');
  cart = addToCart(cart, jollof, 'Eko Smokehouse');
  cart = updateCartQuantity(cart, jollof.id, -1);

  const totals = calculateCartTotals(cart);
  assert.equal(totals.itemCount, 1);
  assert.equal(totals.subtotal, jollof.price);
  assert.equal(totals.total, jollof.price + 1000);

  state = { ...state, cart };
  const checkout = checkoutFoodOrder(state, '18 Bourdillon Road, Ikoyi');
  assert.equal(checkout.ok, true);
  if (checkout.ok) {
    assert.equal(checkout.state.cart.length, 0);
    assert.equal(checkout.state.walletBalance, state.walletBalance - totals.total);
    assert.equal(checkout.order.status, 'Order Confirmed');
    const nextState = advanceFoodOrderStatus(checkout.state, checkout.order.orderCode);
    const tracked = nextState.foodOrders.find((o) => o.orderCode === checkout.order.orderCode);
    assert.equal(tracked?.status, 'Kitchen Preparing');
  }
});

test('initiateBatterySwap deducts swap fee and updates bay status & swap history', () => {
  const seed = createSeedState();
  const res = initiateBatterySwap(seed, 'stn-lekki', 1);
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.state.walletBalance, seed.walletBalance - 1200);
    assert.equal(res.state.swapHistory.length, seed.swapHistory.length + 1);
    const hub = res.state.stations.find((s) => s.id === 'stn-lekki');
    const bay1 = hub?.bays.find((b) => b.bayNumber === 1);
    assert.equal(bay1?.status, 'Charging');
  }

  const failCharging = initiateBatterySwap(seed, 'stn-lekki', 4);
  assert.equal(failCharging.ok, false);
});

test('EV Pay Small Small & Lease calculations and enquiry submission work accurately', () => {
  const calc = calculatePaySmallSmall(1_650_000, 20, 12);
  assert.equal(calc.downPayment, 330_000);
  assert.equal(calc.financedPrincipal, 1_320_000);
  assert.ok(calc.monthlyPayment > 110_000);

  const lease = calculateLeasePlan(78_000, 12, 'Personal');
  assert.equal(lease.monthlyLease, Math.round(78_000 * 0.92));

  const seed = createSeedState();
  const enq = submitEVEnquiry(seed, {
    planType: 'Pay Small Small',
    modelName: 'KuSOP Volt S1 Commuter',
    customerName: 'Chinedu Okafor',
    phone: '+234 803 555 0194',
    summary: '20% down · 12 months',
    estimatedMonthly: calc.monthlyPayment,
  });
  assert.equal(enq.ok, true);
  if (enq.ok) {
    assert.equal(enq.state.evEnquiries.length, 1);
  }
});
