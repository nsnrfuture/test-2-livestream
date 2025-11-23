"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const ACCENT = "#8B3DFF";

type BillingOption = {
  label: string;
  price: string;
  minutes: string;
  hours: string;
};

type Plan = {
  name: string;
  tag?: string;
  highlight?: boolean;
  description: string;
  matchInfo: string;
  genderInfo: string;
  billing: BillingOption[];
};

const PLANS: Plan[] = [
  {
    name: "Basic",
    description: "Perfect for casual users who want to try daily matches.",
    matchInfo: "Up to 3 matches per day with gender filter.",
    genderInfo: "Choose preferred gender once per day.",
    billing: [
      {
        label: "Monthly",
        price: "₹399",
        minutes: "600 min",
        hours: "10 hrs",
      },
      {
        label: "Quarterly",
        price: "₹999",
        minutes: "2000 min",
        hours: "33.3 hrs",
      },
      {
        label: "Yearly",
        price: "₹2,999",
        minutes: "5000 min",
        hours: "83.3 hrs",
      },
    ],
  },
  {
    name: "Pro",
    tag: "Most Popular",
    highlight: true,
    description: "For users who want more talk time and more daily matches.",
    matchInfo: "5–8 matches per day with gender filter.",
    genderInfo: "Choose preferred gender every day, any time.",
    billing: [
      {
        label: "Monthly",
        price: "₹799",
        minutes: "1200 min",
        hours: "20 hrs",
      },
      {
        label: "Quarterly",
        price: "₹1,999",
        minutes: "2999 min",
        hours: "50 hrs",
      },
      {
        label: "Yearly",
        price: "₹3,999",
        minutes: "7000 min",
        hours: "116.7 hrs",
      },
    ],
  },
  {
    name: "Premium",
    description: "For power users who want maximum control and priority matches.",
    matchInfo: "7–10 matches per day with priority matching.",
    genderInfo: "Select gender on every match with higher priority.",
    billing: [
      {
        label: "Monthly",
        price: "₹1,299",
        minutes: "2500 min",
        hours: "41.7 hrs",
      },
      {
        label: "Quarterly",
        price: "₹3,299",
        minutes: "6500 min",
        hours: "108.3 hrs",
      },
      {
        label: "Yearly",
        price: "₹9,400",
        minutes: "15000 min",
        hours: "250 hrs",
      },
    ],
  },
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Each plan can have its own selected billing label (Monthly / Quarterly / Yearly)
  const [selectedBilling, setSelectedBilling] = useState<Record<string, string>>(
    {}
  );

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
  };

  const handleSelectBilling = (planName: string, label: string) => {
    setSelectedPlan(planName); // also select this plan
    setSelectedBilling((prev) => ({
      ...prev,
      [planName]: label,
    }));
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-neutral-950 via-neutral-900 to-black text-white">
      <section className="mx-auto max-w-6xl px-4 py-20">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <p className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/60">
            Plans for Every Chatter
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Choose your{" "}
            <span className="text-[hsl(265,100%,70%)]">chat & match</span> plan
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/60">
            All plans include secure one-to-one chat and daily matches. Minutes
            = total talk time you can use; matches reset every day.
          </p>
        </div>

        {/* 15-day free trial strip */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(139,61,255,0.6)] bg-[rgba(139,61,255,0.12)] px-4 py-2 text-xs sm:text-sm text-white/80">
            <span className="inline-block h-2 w-2 rounded-full bg-[hsl(96,100%,70%)]" />
            <span>
              New users get{" "}
              <span className="font-semibold">15 days/15-min free trial</span>{" "}
              on any plan.
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.name;
            const selectedBillingLabel = selectedBilling[plan.name];

            return (
              <article
                key={plan.name}
                onClick={() => handleSelectPlan(plan.name)}
                className={`
                  relative flex flex-col rounded-3xl border bg-white/5 p-6 sm:p-7
                  backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.55)]
                  transition-transform cursor-pointer
                  ${
                    plan.highlight
                      ? "border-[rgba(139,61,255,0.9)]"
                      : "border-white/8"
                  }
                  ${
                    isSelected
                      ? "ring-4 ring-[rgba(139,61,255,0.8)] scale-[1.04] shadow-[0_0_25px_rgba(139,61,255,0.7)]"
                      : "hover:scale-[1.01]"
                  }
                `}
              >
                {/* Tag */}
                {plan.tag && (
                  <div className="absolute -top-3 left-6">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold text-neutral-900"
                      style={{ background: ACCENT }}
                    >
                      {plan.tag}
                    </span>
                  </div>
                )}

                {/* Title */}
                <div className="mb-5 mt-1">
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    {plan.name} Plan
                  </h2>
                  <p className="mt-2 text-sm text-white/60">
                    {plan.description}
                  </p>
                </div>

                {/* Billing table */}
                <div className="mb-6 space-y-3">
                  {plan.billing.map((b) => {
                    const isBillingSelected = selectedBillingLabel === b.label;

                    return (
                      <button
                        key={b.label}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectBilling(plan.name, b.label);
                        }}
                        className={`
                          w-full rounded-2xl border px-3 py-3 text-sm flex flex-col gap-2 text-left
                          transition
                          ${
                            isBillingSelected
                              ? "border-[rgba(139,61,255,0.9)] bg-[rgba(139,61,255,0.16)] shadow-[0_0_18px_rgba(139,61,255,0.6)]"
                              : "border-white/10 bg-black/30 hover:border-[rgba(139,61,255,0.7)] hover:bg-black/50"
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{b.label}</span>
                          <span className="text-base font-semibold">
                            {b.price}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span>{b.minutes}</span>
                          <span>{b.hours}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Features */}
                <ul className="space-y-2 text-sm text-white/75 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-[hsl(96,100%,70%)]" />
                    <span>1-to-1 private chat with video & audio.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-[hsl(96,100%,70%)]" />
                    <span>{plan.matchInfo}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-[hsl(96,100%,70%)]" />
                    <span>{plan.genderInfo}</span>
                  </li>
                </ul>

                {/* CTA */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan(plan.name);
                  }}
                  className={`mt-auto w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    plan.highlight
                      ? "bg-[hsl(265,100%,70%)] text-neutral-900 hover:bg-[hsl(265,100%,75%)]"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {isSelected
                    ? selectedBillingLabel
                      ? `Selected: ${selectedBillingLabel} ✓ – Start 15-day/15-min free trial`
                      : "Selected ✓ – Start 15-day/15-min free trial"
                    : "Start 15-day/15-min free trial"}
                </button>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-center text-[11px] text-white/40">
          * Cost & profit per user are calculated internally in your admin
          dashboard and are not shown on this pricing page.
        </p>
      </section>
    </main>
  );
}
