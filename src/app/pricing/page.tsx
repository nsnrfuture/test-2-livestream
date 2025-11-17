"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

type Plan = {
  id: string;
  title: string;
  price: number;
  notes?: string[];
  perks?: string[];
  best?: boolean;
};

const ACCENT = "bg-gradient-to-r from-[#fb5607] to-[#ff8a50]";
const CARD = "bg-white rounded-2xl shadow-md border p-5";

const PLANS: Plan[] = [
  {
    id: "basic",
    title: "Basic",
    price: 199,
    notes: ["First 15 days free (trial)"],
    perks: ["5 gender filters / day", "Cancel anytime", "UPI / Card auto-renew"],
  },
  {
    id: "plus",
    title: "Plus",
    price: 399,
    notes: ["First 15 days free (trial)", "Ad-free", "Change name"],
    perks: ["10 gender filters / day", "Better matching priority", "Cancel anytime"],
    best: true,
  },
  {
    id: "premium",
    title: "Premium",
    price: 599,
    notes: ["First 15 days free (trial)", "Ad-free", "Change name"],
    perks: ["15 gender filters / day", "15 domestic matches / day", "Highest priority & dedicated support"],
  },
];

const ADDON = {
  id: "addon-gender-25",
  title: "Gender Swipe Add-on",
  price: 199,
  detail: "25 extra gender swipes — enable on any plan instantly",
};

export default function PricingPage() {
  // Simulated: treat user as new to show 15-day trial option
  const [isNewUser] = useState(true);

  // Selections
  const [selectedPlanId, setSelectedPlanId] = useState<string>(PLANS[1].id); // default: Plus
  const [autoRenew, setAutoRenew] = useState<boolean>(true);
  const [useTrial, setUseTrial] = useState<boolean>(isNewUser); // default offer trial for new users
  const [addonQty, setAddonQty] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "wallet">("upi");
  const [country, setCountry] = useState<string>("India");
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female" | "other">("all");

  // calculate totals
  const order = useMemo(() => {
    const plan = PLANS.find((p) => p.id === selectedPlanId)!;
    const planPrice = plan.price;
    const addonTotal = addonQty * ADDON.price;
    const subtotal = planPrice + addonTotal;
    // If user chooses trial, show ₹0 due now for trial start (but note auto-renew)
    const dueNow = useTrial && isNewUser ? 0 : subtotal;
    return { plan, planPrice, addonTotal, subtotal, dueNow };
  }, [selectedPlanId, addonQty, useTrial, isNewUser]);

  function handleCheckout() {
    // Replace this with actual checkout integration (Razorpay / Stripe / Play Billing / App Store / Server)
    const items: Array<{ id: string; title: string; price: number; qty?: number }> = [];
    items.push({ id: order.plan.id, title: `${order.plan.title} Plan`, price: order.planPrice });
    if (addonQty > 0) items.push({ id: ADDON.id, title: ADDON.title, price: ADDON.price, qty: addonQty });

    // Simulated behaviour:
    const action = useTrial && isNewUser ? "Start 15-day free trial" : "Buy now";
    const renewText = autoRenew ? "Auto-renew enabled" : "Auto-renew disabled";
    alert(
      `${action} — ${order.dueNow === 0 ? "₹0 due now" : `₹${order.dueNow} due now`}.\n` +
        `${renewText} via ${paymentMethod.toUpperCase()}.\n\n` +
        `Order items:\n${items.map((it) => `• ${it.title} x${it.qty ?? 1} — ₹${it.price * (it.qty ?? 1)}`).join("\n")}\n\n` +
        `Implement actual payment flow in handleCheckout() with your chosen gateway.`
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pb-28 md:pb-12 px-4 sm:px-6 md:px-12 lg:px-28 pt-8">
      {/* Hero */}
      <header className="max-w-5xl mx-auto mb-6">
        <div className={`${ACCENT} text-white rounded-2xl p-6 sm:p-8 shadow-md`}>
          <h1 className="text-2xl sm:text-3xl font-extrabold">TEGO.Live — Subscription Plans</h1>
          <p className="mt-2 text-sm sm:text-base opacity-95">
            First 15 days free for new users. Auto-renew via UPI / Card / Wallet. Cancel anytime.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs sm:text-sm font-medium text-white/90">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="rounded-md px-3 py-2 text-sm w-full sm:w-auto"
                aria-label="Select country"
              >
                <option>India</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Canada</option>
                <option>Australia</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs sm:text-sm font-medium text-white/90">Gender filter</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as any)}
                className="rounded-md px-3 py-2 text-sm w-full sm:w-auto"
                aria-label="Select gender filter"
              >
                <option value="all">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="ml-auto text-sm text-white/90 hidden sm:flex">
              <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                <svg width="14" height="14" viewBox="0 0 24 24" className="inline-block">
                  <path fill="white" d="M12 2L2 7v6c0 5 4 9 10 9s10-4 10-9V7l-10-5z" />
                </svg>
                Secure · Auto-renew available
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plans */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Choose a Plan</h2>
            <p className="text-sm text-gray-600 hidden sm:block">You can enable the free 15-day trial (new users) or pay now.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((p) => {
              const active = p.id === selectedPlanId;
              return (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -4 }}
                  className={`${CARD} ${active ? "ring-2 ring-orange-300" : ""} flex flex-col`}
                >
                  <div className="flex items-start justify-between">
                    <div className="pr-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{p.title}</h3>
                        {p.best && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Best</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{p.notes?.join(" · ")}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-extrabold">₹{p.price}</div>
                      <div className="text-xs text-gray-500">/ month</div>
                    </div>
                  </div>

                  <ul className="mt-3 text-sm text-gray-700 list-disc ml-5 flex-1">
                    {p.perks?.map((perk) => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </ul>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPlanId(p.id);
                        // when user explicitly selects a plan, keep trial default for new users
                        if (isNewUser) setUseTrial(true);
                      }}
                      className="flex-1 rounded-full py-3 text-sm border hover:bg-gray-50 touch-manipulation"
                      aria-pressed={active}
                      aria-label={`Select ${p.title} plan`}
                    >
                      {active ? "Selected" : "Select"}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPlanId(p.id);
                        // quick checkout: start trial if available
                        handleQuickBuy(p.id, useTrial, autoRenew, paymentMethod, addonQty);
                      }}
                      className="rounded-full py-3 px-4 text-sm bg-linear-to-r from-[#fb5607] to-[#ff8a50] text-white w-36 sm:w-auto"
                      aria-label={`Buy ${p.title} plan`}
                    >
                      {isNewUser && useTrial ? "Start Trial" : `Buy ₹${p.price}`}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Add-on */}
          <section className="mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add-on: Gender Swipe</h3>
              <p className="text-sm text-gray-600">One-time top-up that works with any plan</p>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={CARD}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{ADDON.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{ADDON.detail}</p>
                    <p className="text-xs text-gray-500 mt-2">Stacks on your daily filters. Use instantly.</p>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold">₹{ADDON.price}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center border rounded-full">
                    <button
                      onClick={() => setAddonQty(Math.max(0, addonQty - 1))}
                      className="px-4 py-2 text-base touch-manipulation"
                      aria-label="Decrease add-on quantity"
                    >
                      −
                    </button>
                    <div className="px-5 text-base font-medium">{addonQty}</div>
                    <button
                      onClick={() => setAddonQty(addonQty + 1)}
                      className="px-4 py-2 text-base touch-manipulation"
                      aria-label="Increase add-on quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      addonQty <= 0
                        ? alert(`Buy single add-on: ₹${ADDON.price} — implement payment integration`)
                        : alert(`Buy add-ons x${addonQty}: ₹${addonQty * ADDON.price} — implement payment integration`)
                    }
                    className="ml-auto rounded-full py-3 px-4 bg-linear-to-r from-[#fb5607] to-[#ff8a50] text-white text-sm touch-manipulation"
                    aria-label="Buy add-on"
                  >
                    {addonQty > 0 ? `Buy ×${addonQty}` : "Buy"}
                  </button>
                </div>
              </div>

              {/* Quick explanation card */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border">
                <h5 className="font-semibold">How add-on works</h5>
                <ul className="text-sm text-gray-700 mt-2 list-disc ml-5">
                  <li>25 extra gender swipes credited instantly per add-on.</li>
                  <li>Works on top of your plan's daily filters.</li>
                  <li>Valid until used. Non-refundable.</li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">You can buy add-ons even while trial is active.</p>
              </div>
            </div>
          </section>

          {/* Billing & Trial Controls */}
          <section className="mt-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border">
              <h4 className="font-semibold">Billing & trial</h4>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={autoRenew} onChange={() => setAutoRenew(!autoRenew)} className="h-5 w-5" />
                    <span className="text-sm">Enable Auto-renew (UPI/Card/Wallet)</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    When auto-renew is enabled your subscription will renew automatically at the price shown. You can cancel anytime.
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={useTrial} disabled={!isNewUser} onChange={() => setUseTrial((s) => !s)} className="h-5 w-5" />
                    <span className="text-sm">{isNewUser ? "Use 15-day free trial (new users)" : "Trial not available"}</span>
                  </label>

                  <p className="text-xs text-gray-500 mt-2">
                    If trial is active: ₹0 due now. After 15 days, the plan auto-renews unless cancelled.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm block mb-2">Payment method</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setPaymentMethod("upi")}
                    className={`px-4 py-2 rounded-full text-sm border ${paymentMethod === "upi" ? "bg-gray-100" : ""}`}
                  >
                    UPI
                  </button>
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`px-4 py-2 rounded-full text-sm border ${paymentMethod === "card" ? "bg-gray-100" : ""}`}
                  >
                    Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod("wallet")}
                    className={`px-4 py-2 rounded-full text-sm border ${paymentMethod === "wallet" ? "bg-gray-100" : ""}`}
                  >
                    Wallet
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">UPI AutoPay recommended for seamless renewals in India.</p>
              </div>
            </div>
          </section>

          {/* On mobile: show legal and extra info after main content */}
          <div className="block lg:hidden mt-4">
            <div className="bg-white rounded-2xl shadow-sm border p-4">
              <h4 className="font-semibold">Quick Help</h4>
              <ul className="text-sm text-gray-700 mt-2 list-disc ml-5">
                <li>First 15 days free — try Plus features risk-free.</li>
                <li>Cancel auto-renew anytime in Settings → Subscriptions.</li>
                <li>UPI AutoPay lets renewals go through smoothly in India.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Order Summary (desktop sticky) */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <div className="bg-white p-5 rounded-2xl shadow-md border">
              <h3 className="font-semibold text-lg">Order Summary</h3>

              <div className="mt-3 text-sm text-gray-700 space-y-3">
                <div className="flex justify-between">
                  <span>Plan</span>
                  <span className="font-medium">{order.plan.title} • ₹{order.planPrice}</span>
                </div>

                <div className="flex justify-between">
                  <span>Add-on</span>
                  <span className="font-medium">₹{order.addonTotal} {addonQty > 0 ? `(${addonQty} × ${ADDON.price})` : ""}</span>
                </div>

                <div className="flex justify-between">
                  <span>Trial</span>
                  <span className="font-medium">{useTrial && isNewUser ? "15 days free" : "No trial"}</span>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Estimated Due Now</span>
                    <span className="text-2xl font-extrabold">₹{order.dueNow}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Taxes and fees may apply at checkout. After trial, auto-renew will be ₹{order.planPrice} / month unless cancelled.</p>
                </div>
              </div>

              <div className="mt-4">
                <button onClick={handleCheckout} className="w-full rounded-full py-3 bg-linear-to-r from-[#fb5607] to-[#ff8a50] text-white font-medium">
                  {useTrial && isNewUser ? "Start 15-day Free Trial" : `Pay ₹${order.dueNow} / Checkout`}
                </button>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                By proceeding you agree to the Terms & Conditions and authorize auto-renew if enabled.
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed left-4 right-4 bottom-4 z-50 lg:hidden">
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-md border flex items-center gap-3">
          <div className="flex-1">
            <div className="text-sm font-medium">{order.plan.title}</div>
            <div className="text-xs text-gray-600">Due Now: <span className="font-semibold">₹{order.dueNow}</span></div>
          </div>

          <button
            onClick={handleCheckout}
            className="rounded-full py-3 px-4 bg-linear-to-r from-[#fb5607] to-[#ff8a50] text-white text-sm font-medium touch-manipulation"
            aria-label="Proceed to checkout"
          >
            {useTrial && isNewUser ? "Start Free Trial" : `Pay ₹${order.dueNow}`}
          </button>
        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} TEGO.Live — Prices shown in INR. Implement server-side checkout & subscription management for production.
      </footer>
    </main>
  );
}

/**
 * Helper: quick buy behaviour used in plan card "Buy" button.
 * Kept outside component body to avoid inlining inside render loop.
 */
function handleQuickBuy(
  planId: string,
  useTrial: boolean,
  autoRenew: boolean,
  paymentMethod: string,
  addonQty: number
) {
  // This UI helper simulates flow — replace with real flow wired to backend/payment SDK.
  const plan = PLANS.find((p) => p.id === planId)!;
  const addonTotal = addonQty * ADDON.price;
  const dueNow = useTrial ? 0 : plan.price + addonTotal;
  alert(
    `Quick Buy: ${plan.title}\n` +
      `${useTrial ? "Starting free 15-day trial" : `₹${dueNow} due now`}\n` +
      `Auto-renew: ${autoRenew ? "Yes" : "No"} • Method: ${paymentMethod.toUpperCase()}`
  );
}
