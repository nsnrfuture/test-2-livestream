"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const ACCENT = "bg-gradient-to-r from-[#fb5607]/90 to-[#ff8a50]/80";

export default function TermsAndConditionsPage() {
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
    <main className="min-h-screen bg-gray-50 text-gray-900 py-8 px-4 sm:px-6 md:px-12 lg:px-28">
      {/* Hero */}
      <header className="mb-6">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-5xl mx-auto">
          <div className={`${ACCENT} text-white rounded-2xl p-5 sm:p-6 shadow-md`}>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">Terms & Conditions — <span className="opacity-95">TEGO.Live</span></h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base opacity-95">
              Effective Date: <strong>17 November 2025</strong> · Please read these Terms and Conditions carefully before using TEGO.Live.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button onClick={copyEmail} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 sm:py-2 bg-white/10 hover:bg-white/20 transition text-sm font-medium">
                📧 support@tego.live
              </button>

              <button onClick={printPage} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 sm:py-2 bg-white/10 hover:bg-white/20 transition text-sm font-medium">
                🖨️ Download / Print
              </button>

              <span className="mt-2 sm:mt-0 ml-auto inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" className="inline-block"><path fill="white" d="M12 2L2 7v6c0 5 4 9 10 9s10-4 10-9V7l-10-5z" /></svg>
                Legal • Read carefully
              </span>
            </div>

            {copied && <div className="mt-3 text-sm bg-white/20 inline-block px-3 py-1 rounded-md">Email copied ✔</div>}
          </div>
        </motion.div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr_320px] gap-6 md:gap-8">
        {/* Mobile TOC */}
        <div className="lg:hidden">
          <div className="bg-white rounded-xl p-3 shadow-sm border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Contents</h3>
              <button onClick={() => setTocOpen((s) => !s)} className="text-sm px-2 py-1 rounded-md border hover:bg-gray-50">
                {tocOpen ? "Close" : "Open"}
              </button>
            </div>

            {tocOpen && (
              <ol className="mt-3 text-sm space-y-2">
                <li><button onClick={() => scrollToId("acceptance")} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">Acceptance</button></li>
                <li><button onClick={() => scrollToId("eligibility")} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">Eligibility</button></li>
                <li><button onClick={() => scrollToId("user-obligations")} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">User Obligations</button></li>
                <li><button onClick={() => scrollToId("prohibited")} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">Prohibited Conduct</button></li>
                <li><button onClick={() => scrollToId("payments")} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">Payments & Gifts</button></li>
                <li><button onClick={() => scrollToId("ip")} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">Intellectual Property</button></li>
                <li><button onClick={() => scrollToId("disclaimer")} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">Disclaimers</button></li>
                <li><button onClick={() => scrollToId("liability")} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">Limitation of Liability</button></li>
                <li><button onClick={() => scrollToId("termination")} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">Termination</button></li>
                <li><button onClick={() => scrollToId("children")} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">Children</button></li>
                <li><button onClick={() => scrollToId("changes")} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">Changes</button></li>
                <li><button onClick={() => scrollToId("contact")} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">Contact</button></li>
              </ol>
            )}
          </div>
        </div>

        {/* Desktop TOC */}
        <nav className="hidden lg:block sticky top-28 self-start">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h3 className="text-sm font-semibold mb-3">On this page</h3>
            <ol className="text-sm space-y-2">
              <li><button onClick={() => scrollToId("acceptance")} className="hover:underline w-full text-left">Acceptance</button></li>
              <li><button onClick={() => scrollToId("eligibility")} className="hover:underline w-full text-left">Eligibility</button></li>
              <li><button onClick={() => scrollToId("user-obligations")} className="hover:underline w-full text-left">User Obligations</button></li>
              <li><button onClick={() => scrollToId("prohibited")} className="hover:underline w-full text-left">Prohibited Conduct</button></li>
              <li><button onClick={() => scrollToId("payments")} className="hover:underline w-full text-left">Payments & Gifts</button></li>
              <li><button onClick={() => scrollToId("ip")} className="hover:underline w-full text-left">Intellectual Property</button></li>
              <li><button onClick={() => scrollToId("disclaimer")} className="hover:underline w-full text-left">Disclaimers</button></li>
              <li><button onClick={() => scrollToId("liability")} className="hover:underline w-full text-left">Limitation of Liability</button></li>
              <li><button onClick={() => scrollToId("termination")} className="hover:underline w-full text-left">Termination</button></li>
              <li><button onClick={() => scrollToId("children")} className="hover:underline w-full text-left">Children</button></li>
              <li><button onClick={() => scrollToId("changes")} className="hover:underline w-full text-left">Changes</button></li>
              <li><button onClick={() => scrollToId("contact")} className="hover:underline w-full text-left">Contact</button></li>
            </ol>
          </div>
        </nav>

        {/* Main content */}
        <article ref={contentRef} className="prose prose-neutral max-w-none lg:prose-lg">
          <section id="acceptance" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
            <p>
              These Terms & Conditions ("Terms") govern your access to and use of the TEGO.Live mobile app and related services ("Service"). By using the Service you agree to be bound by these Terms. If you do not agree, do not use the Service.
            </p>
          </section>

          <section id="eligibility" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">2. Eligibility</h2>
            <p>
              You must be at least 18 years old to use TEGO.Live. By using the Service you represent and warrant that you are 18 or older and have the legal capacity to enter into these Terms.
            </p>
          </section>

          <section id="user-obligations" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">3. User Accounts & Obligations</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Immediately notify support if you suspect unauthorized use of your account.
            </p>

            <ul className="list-disc ml-6 mt-3">
              <li>Provide accurate information when creating your account.</li>
              <li>Keep your password secure and do not share your login.</li>
              <li>Comply with applicable laws and these Terms at all times.</li>
            </ul>
          </section>

          <section id="prohibited" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">4. Prohibited Conduct</h2>
            <p>While using TEGO.Live you must not:</p>
            <ul className="list-disc ml-6 mt-3">
              <li>Share illegal, pornographic, hateful, or harassing content.</li>
              <li>Attempt to record or harvest other users' private live content.</li>
              <li>Impersonate others or use false information.</li>
              <li>Use the Service for unlawful activities or to defraud users.</li>
            </ul>

            <p className="mt-3">
              Violation of these rules may result in suspension or termination of your account.
            </p>
          </section>

          <section id="payments" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">5. Payments, Gifts & Virtual Currency</h2>
            <p>
              Portions of TEGO.Live may allow purchases, tipping, gifting, or virtual currency. All purchases are final unless otherwise specified. Payment processing is handled by third-party payment providers — their terms may also apply.
            </p>

            <p className="mt-2">
              You are responsible for complying with local laws regarding purchases and taxes. TEGO.Live is not responsible for disputes between users over gifts or transfers.
            </p>
          </section>

          <section id="ip" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">6. Intellectual Property</h2>
            <p>
              All content, trademarks, logos, and software associated with TEGO.Live are the property of TEGO.Live or its licensors. You may not copy, modify, distribute, or create derivative works from our content without prior written permission.
            </p>
          </section>

          <section id="disclaimer" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">7. Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE." TEGO.Live MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
          </section>

          <section id="liability" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">8. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TEGO.Live SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section id="termination" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">9. Termination</h2>
            <p>
              We may suspend or terminate accounts that violate these Terms or for operational reasons. Upon termination, access to the Service will stop and we may delete or retain certain data as required by law or for safety reasons.
            </p>
          </section>

          <section id="children" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">10. Children</h2>
            <p>
              TEGO.Live is intended for users 18+. If we discover or are informed a user is under 18, we will terminate the account and remove their data as required.
            </p>
          </section>

          <section id="changes" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">11. Changes to Terms</h2>
            <p>
              We may update these Terms occasionally. When we do, we will post the updated Terms and update the Effective Date. Continued use after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section id="contact" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">12. Contact Us</h2>
            <p>If you have questions about these Terms, contact:</p>

            <div className="mt-3 bg-white p-3 rounded-lg border">
              <p className="font-medium">Support</p>
              <p className="text-sm text-gray-600">📧 support@tego.live</p>

              <div className="mt-3 flex gap-2">
                <button onClick={copyEmail} className="px-3 py-2 rounded-full border text-sm">Copy Email</button>
                <button onClick={() => (window.location.href = "mailto:support@tego.live?subject=Terms%20question")} className="px-3 py-2 rounded-full border text-sm bg-linear-to-r from-[#fb5607] to-[#ff8a50] text-white">Email Support</button>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold">Additional Guidance & Safety</h3>
            <ul className="list-disc ml-6 mt-3">
              <li>Do not share personal contact details on live streams.</li>
              <li>Report suspicious activity using in-app reporting tools.</li>
              <li>Follow local laws and platform rules when interacting with others.</li>
            </ul>
          </section>
        </article>

        {/* Right column: quick actions & tips (desktop only) */}
        <aside className="sticky top-28 self-start hidden lg:block">
          <div className="bg-white p-5 rounded-xl shadow-sm border mb-6">
            <h4 className="text-lg font-semibold">Quick Actions</h4>
            <p className="text-sm text-gray-700 mt-2">Need help or want to take action?</p>

            <div className="mt-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Support</p>
                  <p className="text-xs text-gray-600">support@tego.live</p>
                </div>
                <div>
                  <button onClick={copyEmail} className="text-sm px-3 py-1 rounded-full border hover:bg-gray-50">{copied ? "Copied" : "Copy"}</button>
                </div>
              </div>

              <div className="mt-4">
                <button onClick={() => (window.location.href = "mailto:support@tego.live?subject=Terms%20question")} className="w-full rounded-full py-2 text-sm font-medium border bg-linear-to-r from-[#fb5607] to-[#ff8a50] text-white">Email Support</button>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <h5 className="font-semibold text-sm mb-2">Safety Tips</h5>
            <ul className="text-sm text-gray-700 list-disc ml-5">
              <li>Do not exchange personal payment details in chats.</li>
              <li>Use in-app features for gifting and payments only.</li>
              <li>Immediately report threats, harassment or illegal activity.</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Mobile bottom CTA */}
      <div className="fixed left-4 right-4 bottom-6 sm:left-6 sm:right-6 lg:hidden z-40">
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-md border flex gap-3 items-center">
          <button onClick={copyEmail} className="flex-1 text-sm font-medium px-4 py-2 rounded-full border hover:bg-gray-50">{copied ? "Email Copied" : "Copy Support Email"}</button>
          <button onClick={() => scrollToId("contact")} className="px-3 py-2 rounded-full border text-sm">Contact</button>
        </div>
      </div>

      <footer className="mt-12 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} TEGO.Live — All Rights Reserved.
      </footer>
    </main>
  );
}
