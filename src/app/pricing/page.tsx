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

const ACCENT_GRADIENT =
  "bg-gradient-to-r from-[#8B3DFF] via-[#4F46E5] to-[#22C55E]";
const CARD =
  "bg-[#020617] rounded-2xl border border-white/10 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.55)]";

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
    perks: [
      "15 gender filters / day",
      "15 domestic matches / day",
      "Highest priority & dedicated support",
    ],
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
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "wallet">(
    "upi"
  );
  const [country, setCountry] = useState<string>("India");
  const [genderFilter, setGenderFilter] = useState<
    "all" | "male" | "female" | "other"
  >("all");

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
    const items: Array<{ id: string; title: string; price: number; qty?: number }> =
      [];
    items.push({
      id: order.plan.id,
      title: `${order.plan.title} Plan`,
      price: order.planPrice,
    });
    if (addonQty > 0)
      items.push({
        id: ADDON.id,
        title: ADDON.title,
        price: ADDON.price,
        qty: addonQty,
      });

    // Simulated behaviour:
    const action =
      useTrial && isNewUser ? "Start 15-day free trial" : "Buy now";
    const renewText = autoRenew ? "Auto-renew enabled" : "Auto-renew disabled";
    alert(
      `${action} — ${
        order.dueNow === 0 ? "₹0 due now" : `₹${order.dueNow} due now`
      }.\n` +
        `${renewText} via ${paymentMethod.toUpperCase()}.\n\n` +
        `Order items:\n${items
          .map(
            (it) =>
              `• ${it.title} x${it.qty ?? 1} — ₹${it.price * (it.qty ?? 1)}`
          )
          .join("\n")}\n\n` +
        `Implement actual payment flow in handleCheckout() with your chosen gateway.`
    );
  }

  return (
    <main className="min-h-screen bg-[#050814] text-white pb-28 md:pb-12 px-4 sm:px-6 md:px-12 lg:px-28 pt-8 relative overflow-x-hidden">
      {/* Ambient glows to match TEGO theme */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-[#8B3DFF33] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#22C55E33] blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Hero */}
        <header className="max-w-5xl mx-auto mb-6">
          <div
            className={`${ACCENT_GRADIENT} rounded-2xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.65)] border border-white/15`}
          >
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              TEGO.Live — Subscription Plans
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/90">
              First 15 days free for new users. Auto-renew via UPI / Card /
              Wallet. Cancel anytime.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {/* Country */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs sm:text-sm font-medium text-white/90">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="rounded-md px-3 py-2 text-sm w-full sm:w-auto bg-black/30 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]"
                  aria-label="Select country"
                >
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
              </div>

              {/* Gender filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs sm:text-sm font-medium text-white/90">
                  Gender filter
                </label>
                <select
                  value={genderFilter}
                  onChange={(e) =>
                    setGenderFilter(e.target.value as any)
                  }
                  className="rounded-md px-3 py-2 text-sm w-full sm:w-auto bg-black/30 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  aria-label="Select gender filter"
                >
                  <option value="all">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="ml-auto text-sm text-white/90 hidden sm:flex">
                <span className="inline-flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-white/30">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    className="inline-block"
                  >
                    <path
                      fill="white"
                      d="M12 2L2 7v6c0 5 4 9 10 9s10-4 10-9V7l-10-5z"
                    />
                  </svg>
                  Secure · Auto-renew available
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Layout */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plans + add-ons + billing */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plans */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Choose a Plan
              </h2>
              <p className="text-sm text-white/60 hidden sm:block">
                You can enable the free 15-day trial (new users) or pay now.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((p) => {
                const active = p.id === selectedPlanId;
                return (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -4 }}
                    className={`${CARD} ${
                      active ? "ring-2 ring-[#8B3DFF]/70" : ""
                    } flex flex-col`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="pr-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">
                            {p.title}
                          </h3>
                          {p.best && (
                            <span className="text-xs bg-[#8B3DFF22] text-[#E0E7FF] px-2 py-0.5 rounded-full border border-[#8B3DFF66]">
                              Best
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/60 mt-1">
                          {p.notes?.join(" · ")}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-extrabold text-white">
                          ₹{p.price}
                        </div>
                        <div className="text-xs text-white/45">/ month</div>
                      </div>
                    </div>

                    <ul className="mt-3 text-sm text-white/80 list-disc ml-5 flex-1">
                      {p.perks?.map((perk) => (
                        <li key={perk}>{perk}</li>
                      ))}
                    </ul>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPlanId(p.id);
                          if (isNewUser) setUseTrial(true);
                        }}
                        className={`flex-1 rounded-full py-3 text-sm border border-white/20 bg-black/40 hover:bg-black/60 transition-colors touch-manipulation ${
                          active ? "text-white" : "text-white/80"
                        }`}
                        aria-pressed={active}
                        aria-label={`Select ${p.title} plan`}
                      >
                        {active ? "Selected" : "Select"}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPlanId(p.id);
                          handleQuickBuy(
                            p.id,
                            useTrial,
                            autoRenew,
                            paymentMethod,
                            addonQty
                          );
                        }}
                        className="rounded-full py-3 px-4 text-sm bg-linear-to-r from-[#8B3DFF] via-[#4F46E5] to-[#22C55E] text-white w-36 sm:w-auto shadow-lg shadow-[#4F46E5]/60 hover:shadow-[#4F46E5]/90 transition-shadow"
                        aria-label={`Buy ${p.title} plan`}
                      >
                        {isNewUser && useTrial
                          ? "Start Trial"
                          : `Buy ₹${p.price}`}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Add-on */}
            <section className="mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Add-on: Gender Swipe
                </h3>
                <p className="text-sm text-white/65">
                  One-time top-up that works with any plan
                </p>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={CARD}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white">
                        {ADDON.title}
                      </h4>
                      <p className="text-sm text-white/70 mt-1">
                        {ADDON.detail}
                      </p>
                      <p className="text-xs text-white/50 mt-2">
                        Stacks on your daily filters. Use instantly.
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        ₹{ADDON.price}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center border border-white/20 rounded-full bg-black/40">
                      <button
                        onClick={() =>
                          setAddonQty(Math.max(0, addonQty - 1))
                        }
                        className="px-4 py-2 text-base touch-manipulation text-white"
                        aria-label="Decrease add-on quantity"
                      >
                        −
                      </button>
                      <div className="px-5 text-base font-medium text-white">
                        {addonQty}
                      </div>
                      <button
                        onClick={() => setAddonQty(addonQty + 1)}
                        className="px-4 py-2 text-base touch-manipulation text-white"
                        aria-label="Increase add-on quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        addonQty <= 0
                          ? alert(
                              `Buy single add-on: ₹${ADDON.price} — implement payment integration`
                            )
                          : alert(
                              `Buy add-ons x${addonQty}: ₹${
                                addonQty * ADDON.price
                              } — implement payment integration`
                            )
                      }
                      className="ml-auto rounded-full py-3 px-4 bg-linear-to-r from-[#8B3DFF] via-[#4F46E5] to-[#22C55E] text-white text-sm touch-manipulation shadow-md shadow-[#4F46E5]/60"
                      aria-label="Buy add-on"
                    >
                      {addonQty > 0 ? `Buy ×${addonQty}` : "Buy"}
                    </button>
                  </div>
                </div>

                {/* Quick explanation card */}
                <div className="bg-[#020617] p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-white/10">
                  <h5 className="font-semibold text-white">
                    How add-on works
                  </h5>
                  <ul className="text-sm text-white/80 mt-2 list-disc ml-5 space-y-1">
                    <li>25 extra gender swipes credited instantly per add-on.</li>
                    <li>Works on top of your plan&apos;s daily filters.</li>
                    <li>Valid until used. Non-refundable.</li>
                  </ul>
                  <p className="text-xs text-white/50 mt-3">
                    You can buy add-ons even while trial is active.
                  </p>
                </div>
              </div>
            </section>

            {/* Billing & Trial Controls */}
            <section className="mt-6">
              <div className="bg-[#020617] p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-white/10">
                <h4 className="font-semibold text-white">
                  Billing & trial
                </h4>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={autoRenew}
                        onChange={() => setAutoRenew(!autoRenew)}
                        className="h-5 w-5 rounded border-white/30 bg-black/60"
                      />
                      <span className="text-sm text-white/90">
                        Enable Auto-renew (UPI/Card/Wallet)
                      </span>
                    </label>
                    <p className="text-xs text-white/60 mt-2">
                      When auto-renew is enabled your subscription will renew
                      automatically at the price shown. You can cancel anytime.
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={useTrial}
                        disabled={!isNewUser}
                        onChange={() => setUseTrial((s) => !s)}
                        className="h-5 w-5 rounded border-white/30 bg-black/60 disabled:opacity-50"
                      />
                      <span className="text-sm text-white/90">
                        {isNewUser
                          ? "Use 15-day free trial (new users)"
                          : "Trial not available"}
                      </span>
                    </label>

                    <p className="text-xs text-white/60 mt-2">
                      If trial is active: ₹0 due now. After 15 days, the plan
                      auto-renews unless cancelled.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm block mb-2 text-white/90">
                    Payment method
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setPaymentMethod("upi")}
                      className={`px-4 py-2 rounded-full text-sm border border-white/25 ${
                        paymentMethod === "upi"
                          ? "bg-white/10 text-white"
                          : "bg-black/40 text-white/75"
                      }`}
                    >
                      UPI
                    </button>
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`px-4 py-2 rounded-full text-sm border border-white/25 ${
                        paymentMethod === "card"
                          ? "bg:white/10 text-white"
                          : "bg-black/40 text-white/75"
                      }`}
                    >
                      Card
                    </button>
                    <button
                      onClick={() => setPaymentMethod("wallet")}
                      className={`px-4 py-2 rounded-full text-sm border border-white/25 ${
                        paymentMethod === "wallet"
                          ? "bg-white/10 text-white"
                          : "bg-black/40 text-white/75"
                      }`}
                    >
                      Wallet
                    </button>
                  </div>
                  <p className="text-xs text-white/60 mt-2">
                    UPI AutoPay recommended for seamless renewals in India.
                  </p>
                </div>
              </div>
            </section>

            {/* On mobile: help card */}
            <div className="block lg:hidden mt-4">
              <div className="bg-[#020617] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-white/10 p-4">
                <h4 className="font-semibold text-white">Quick Help</h4>
                <ul className="text-sm text-white/80 mt-2 list-disc ml-5 space-y-1">
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
              <div className="bg-[#020617] p-5 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.7)] border border-white/10">
                <h3 className="font-semibold text-lg text-white">
                  Order Summary
                </h3>

                <div className="mt-3 text-sm text-white/85 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Plan</span>
                    <span className="font-medium">
                      {order.plan.title} • ₹{order.planPrice}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-white/70">Add-on</span>
                    <span className="font-medium">
                      ₹{order.addonTotal}{" "}
                      {addonQty > 0
                        ? `(${addonQty} × ${ADDON.price})`
                        : ""}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-white/70">Trial</span>
                    <span className="font-medium">
                      {useTrial && isNewUser ? "15 days free" : "No trial"}
                    </span>
                  </div>

                  <div className="border-t border-white/10 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">
                        Estimated Due Now
                      </span>
                      <span className="text-2xl font-extrabold text-white">
                        ₹{order.dueNow}
                      </span>
                    </div>
                    <p className="text-xs text-white/55 mt-2">
                      Taxes and fees may apply at checkout. After trial,
                      auto-renew will be ₹{order.planPrice} / month unless
                      cancelled.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleCheckout}
                    className="w-full rounded-full py-3 bg-linear-to-r from-[#8B3DFF] via-[#4F46E5] to-[#22C55E] text-white font-medium shadow-lg shadow-[#4F46E5]/70 hover:shadow-[#4F46E5]/90 transition-shadow"
                  >
                    {useTrial && isNewUser
                      ? "Start 15-day Free Trial"
                      : `Pay ₹${order.dueNow} / Checkout`}
                  </button>
                </div>

                <div className="mt-3 text-xs text-white/55">
                  By proceeding you agree to the Terms & Conditions and
                  authorize auto-renew if enabled.
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile sticky bottom bar */}
        <div className="fixed left-4 right-4 bottom-4 z-50 lg:hidden">
          <div className="bg-[#020617]/95 backdrop-blur-sm p-3 rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.8)] border border-white/15 flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                {order.plan.title}
              </div>
              <div className="text-xs text-white/70">
                Due Now:{" "}
                <span className="font-semibold text-white">
                  ₹{order.dueNow}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="rounded-full py-3 px-4 bg-linear-to-r from-[#8B3DFF] via-[#4F46E5] to-[#22C55E] text-white text-sm font-medium touch-manipulation shadow-md shadow-[#4F46E5]/70"
              aria-label="Proceed to checkout"
            >
              {useTrial && isNewUser
                ? "Start Free Trial"
                : `Pay ₹${order.dueNow}`}
            </button>
          </div>
        </div>

      </div>
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
  const plan = PLANS.find((p) => p.id === planId)!;
  const addonTotal = addonQty * ADDON.price;
  const dueNow = useTrial ? 0 : plan.price + addonTotal;
  alert(
    `Quick Buy: ${plan.title}\n` +
      `${useTrial ? "Starting free 15-day trial" : `₹${dueNow} due now`}\n` +
      `Auto-renew: ${autoRenew ? "Yes" : "No"} • Method: ${paymentMethod.toUpperCase()}`
  );
}
