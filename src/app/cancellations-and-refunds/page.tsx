"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const ACCENT_GRADIENT =
  "bg-gradient-to-r from-[#8B3DFF]/90 via-[#4F46E5]/85 to-[#22C55E]/80";

const COMPANY_NAME = "NSNR23 Future Technology PVT LTD";
const PRODUCT_NAME = "TEGO.Live";

export default function CancellationsRefundsPage() {
  const [copied, setCopied] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const contentRef = useRef<HTMLElement | null>(null);

  function copyEmail() {
    navigator.clipboard.writeText("support@tego.live").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  function printPage() {
    window.print();
  }

  function scrollToId(id: string) {
    setTocOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      (el as HTMLElement).focus({ preventScroll: true });
    }
  }

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024) setTocOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <main className="min-h-screen bg-[#111] text-white pt-8 pb-0 px-4 sm:px-6 md:px-12 lg:px-28">
      {/* HERO */}
      <header className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          <div
            className={`${ACCENT_GRADIENT} text-white rounded-2xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10`}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Cancellations &amp; Refunds —{" "}
              <span className="opacity-95">{PRODUCT_NAME}</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base opacity-95">
              Effective Date: <strong>17 November 2025</strong> · Please read
              this policy carefully before purchasing any subscription, coins,
              or add-ons on {PRODUCT_NAME}.
            </p>

            <p className="mt-2 text-xs sm:text-sm md:text-base opacity-95">
              {PRODUCT_NAME} is operated by{" "}
              <span className="font-semibold">
                {COMPANY_NAME}
              </span>{" "}
              and uses{" "}
              <span className="font-semibold">Razorpay</span> as a primary
              payment gateway for processing online payments in India.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <button
                onClick={copyEmail}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 sm:py-2 bg-white/10 hover:bg-white/20 transition text-sm font-medium border border-white/20"
              >
                📧 support@tego.live
              </button>

              <button
                onClick={printPage}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 sm:py-2 bg-white/10 hover:bg-white/20 transition text-sm font-medium border border-white/20"
              >
                🖨️ Download / Print
              </button>

              <span className="mt-2 sm:mt-0 sm:ml-auto inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-[11px] font-medium border border-white/20">
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
                No Refunds • 15-Day Free Trial
              </span>
            </div>

            {copied && (
              <div className="mt-3 text-sm bg-black/25 border border-white/30 inline-block px-3 py-1 rounded-md">
                Email copied ✔
              </div>
            )}
          </div>
        </motion.div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-6 md:gap-8">
        {/* MOBILE TOC */}
        <div className="lg:hidden">
          <div className="bg-neutral-900/80 rounded-xl p-3 shadow-lg border border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/90">Contents</h3>
              <button
                onClick={() => setTocOpen((s) => !s)}
                className="text-xs px-2 py-1 rounded-md border border-white/20 hover:bg-white/5 text-white/80"
              >
                {tocOpen ? "Close" : "Open"}
              </button>
            </div>

            {tocOpen && (
              <ol className="mt-3 text-xs sm:text-sm space-y-2 text-white/80">
                <li>
                  <button
                    onClick={() => scrollToId("no-refunds")}
                    className="w-full text-left px-2 py-2 rounded hover:bg-white/5"
                  >
                    No Refund &amp; No Return
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToId("trial")}
                    className="w-full text-left px-2 py-2 rounded hover:bg-white/5"
                  >
                    15-Day Free Trial
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToId("renewals")}
                    className="w-full text-left px-2 py-2 rounded hover:bg-white/5"
                  >
                    Cancellations &amp; Renewals
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToId("razorpay")}
                    className="w-full text-left px-2 py-2 rounded hover:bg-white/5"
                  >
                    Payments via Razorpay
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToId("exceptions")}
                    className="w-full text-left px-2 py-2 rounded hover:bg-white/5"
                  >
                    Legal Exceptions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToId("contact")}
                    className="w-full text-left px-2 py-2 rounded hover:bg-white/5"
                  >
                    Contact &amp; Support
                  </button>
                </li>
              </ol>
            )}
          </div>
        </div>

        {/* DESKTOP TOC */}
        <nav className="hidden lg:block sticky top-28 self-start">
          <div className="bg-neutral-900/80 rounded-xl p-4 shadow-lg border border-white/10">
            <h3 className="text-sm font-semibold mb-3 text-white/90">
              On this page
            </h3>
            <ol className="text-sm space-y-2 text-white/75">
              <li>
                <button
                  onClick={() => scrollToId("no-refunds")}
                  className="hover:underline w-full text-left"
                >
                  No Refund &amp; No Return
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToId("trial")}
                  className="hover:underline w-full text-left"
                >
                  15-Day Free Trial
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToId("renewals")}
                  className="hover:underline w-full text-left"
                >
                  Cancellations &amp; Renewals
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToId("razorpay")}
                  className="hover:underline w-full text-left"
                >
                  Payments via Razorpay
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToId("exceptions")}
                  className="hover:underline w-full text-left"
                >
                  Legal Exceptions
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToId("contact")}
                  className="hover:underline w-full text-left"
                >
                  Contact &amp; Support
                </button>
              </li>
            </ol>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <article
          ref={contentRef}
          className="prose prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-white prose-p:text-white/80 prose-li:text-white/80 prose-strong:text-white"
        >
          {/* 1. No Refunds */}
          <section id="no-refunds" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">1. No Refund &amp; No Return Policy</h2>
            <p>
              All purchases made on {PRODUCT_NAME} — including subscriptions,
              coins, gifts, and add-ons — are{" "}
              <strong>non-refundable and non-returnable</strong>.
            </p>
            <ul className="list-disc ml-6 mt-3">
              <li>No refunds will be provided once a payment is successfully processed.</li>
              <li>
                Digital items (such as coins, in-app gifts, and add-ons) cannot be
                returned, exchanged, or transferred to another account.
              </li>
              <li>
                Upgrading or downgrading plans does not entitle you to a refund for
                the previous plan period already paid.
              </li>
            </ul>
          </section>

          {/* 2. Free Trial */}
          <section id="trial" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">2. 15-Day Free Trial</h2>
            <p>
              New eligible users may be offered a{" "}
              <strong>15-day free trial</strong> on selected plans (such as Plus or
              Premium) as displayed in the app at the time of subscription.
            </p>
            <ul className="list-disc ml-6 mt-3">
              <li>During the 15-day free trial, you are not charged for the plan.</li>
              <li>
                To avoid being charged after the trial ends, you must{" "}
                <strong>cancel the subscription before the trial period ends</strong>{" "}
                from your subscriptions or billing section.
              </li>
              <li>
                If you do not cancel during the trial, the selected subscription
                will automatically convert into a paid plan and the charge will be
                processed via your chosen payment method (for example, Razorpay, card,
                wallet, etc.).
              </li>
              <li>No refunds will be issued once the first paid charge is processed after the trial.</li>
            </ul>
          </section>

          {/* 3. Cancellations & Renewals */}
          <section id="renewals" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">3. Cancellations &amp; Auto-Renewals</h2>
            <p>
              Subscriptions on {PRODUCT_NAME} may be set to{" "}
              <strong>auto-renew</strong> based on your selection at checkout.
            </p>
            <ul className="list-disc ml-6 mt-3">
              <li>
                You can cancel auto-renew at any time from your in-app subscription
                settings (or relevant app store billing settings, where applicable).
              </li>
              <li>
                Cancellation stops future renewals only.{" "}
                <strong>
                  It does not provide a refund for the current active billing period.
                </strong>
              </li>
              <li>
                After cancellation, you will continue to have access to paid features
                until the end of the current billing cycle, but no further charges
                will be attempted.
              </li>
            </ul>
          </section>

          {/* 4. Razorpay section */}
          <section id="razorpay" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">4. Payments via Razorpay</h2>
            <p>
              {COMPANY_NAME} uses{" "}
              <strong>Razorpay (India)</strong> as a primary payment gateway for
              processing online payments for {PRODUCT_NAME} in supported regions.
            </p>
            <ul className="list-disc ml-6 mt-3">
              <li>
                When you complete a payment, the charge will appear in your statement
                as per Razorpay and your bank&apos;s naming conventions.
              </li>
              <li>
                In rare cases where a refund or reversal is required (for example,
                duplicate charge by technical error), any such refund, if approved,
                will be processed <strong>only via Razorpay</strong> back to the
                original payment method, subject to Razorpay and bank processing
                timelines.
              </li>
              <li>
                For any payment-related concerns, you may be asked to share the{" "}
                <strong>Razorpay payment ID / order ID</strong> for faster
                resolution.
              </li>
            </ul>
            <p className="mt-3 text-sm text-white/70">
              Note: Using Razorpay does not change the core{" "}
              <strong>no-refund and no-return policy</strong> described above.
            </p>
          </section>

          {/* 5. Legal Exceptions */}
          <section id="exceptions" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">5. Legal &amp; Special Exceptions</h2>
            <p>
              While our standard policy is <strong>no refund and no return</strong>,
              {` `}{COMPANY_NAME} will comply with any{" "}
              <strong>mandatory consumer protection laws</strong> that apply in your
              region.
            </p>
            <ul className="list-disc ml-6 mt-3">
              <li>
                If local law requires a refund in specific scenarios (for example,
                certain failed transactions), we will review the case accordingly.
              </li>
              <li>
                Any decision to issue a refund as an exception will be at the sole
                discretion of {COMPANY_NAME} and, if approved, processed via Razorpay
                or the original payment method where possible.
              </li>
            </ul>
            <p className="mt-3 text-xs text-white/60">
              This page is a general policy overview and{" "}
              <strong>does not constitute legal advice</strong>. You should refer to
              the full Terms &amp; Conditions and local laws applicable to you.
            </p>
          </section>

          {/* 6. Contact */}
          <section id="contact" tabIndex={-1} className="mb-6">
            <h2 className="text-2xl font-bold">6. Contact &amp; Support</h2>
            <p>
              If you believe you have been incorrectly charged or have a billing
              question, please contact our support team:
            </p>

            <div className="mt-3 bg-neutral-900/90 p-4 rounded-lg border border-white/15">
              <p className="font-medium text-white">Billing &amp; Refund Support</p>
              <p className="text-sm text-white/70">📧 support@tego.live</p>
              <p className="text-xs text-white/60 mt-2">
                Include your registered email, mobile number (if used for login),
                payment date, and Razorpay payment ID / order ID (if available) for
                faster investigation.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={copyEmail}
                  className="px-3 py-2 rounded-full border border-white/30 text-sm text-white/90 hover:bg-white/5"
                >
                  {copied ? "Email Copied" : "Copy Email"}
                </button>
                <button
                  onClick={() =>
                    (window.location.href =
                      "mailto:support@tego.live?subject=Billing%20%2F%20Refund%20query")
                  }
                  className={`px-3 py-2 rounded-full text-sm font-medium text-white ${ACCENT_GRADIENT} border border-white/20`}
                >
                  Email Support
                </button>
              </div>
            </div>
          </section>
        </article>

        {/* RIGHT SIDEBAR (Desktop) */}
        <aside className="sticky top-28 self-start hidden lg:block">
          <div className="bg-neutral-900/80 p-5 rounded-xl shadow-lg border border-white/10 mb-6">
            <h4 className="text-lg font-semibold text-white/90">
              Quick Summary
            </h4>
            <ul className="text-sm text-white/75 mt-3 space-y-2 list-disc ml-4">
              <li>All payments are non-refundable &amp; non-returnable.</li>
              <li>New users may get a 15-day free trial on eligible plans.</li>
              <li>
                Cancel before trial end to avoid first automatic charge via Razorpay.
              </li>
              <li>
                No refunds for current billing period after subscription renews.
              </li>
            </ul>
          </div>

          <div className="bg-neutral-900/80 p-4 rounded-xl shadow-lg border border-white/10">
            <h5 className="font-semibold text-sm mb-2 text-white/90">
              Payment Gateway
            </h5>
            <p className="text-sm text-white/75">
              {COMPANY_NAME} partners with{" "}
              <span className="font-semibold">Razorpay</span> for secure
              transactions in India. Keep your Razorpay receipt and payment ID for
              any billing queries.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
