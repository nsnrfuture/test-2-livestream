"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const ACCENT = "bg-gradient-to-r from-[#fb5607]/90 to-[#ff8a50]/80"; // orange accent gradient
const ACCENT_TEXT = "text-[#fb5607]";

export default function PrivacyPolicyPage() {
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [tocOpen, setTocOpen] = useState(false); // mobile TOC toggle
  const contentRef = useRef<HTMLElement | null>(null);

  // Copy email to clipboard
  function copyEmail() {
    navigator.clipboard.writeText("support@tego.live").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  // Print / save as PDF
  function printPolicy() {
    window.print();
  }

  // Smooth scroll helper (prevents jumpy navigation on mobile)
  function scrollToId(id: string) {
    setTocOpen(false); // close mobile TOC after navigation
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // give some focus for accessibility
      (el as HTMLElement).focus({ preventScroll: true });
    }
  }

  useEffect(() => {
    // Close mobile TOC when window resizes to large screens
    function onResize() {
      if (window.innerWidth >= 1024) setTocOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const faqs = [
    {
      q: "Do you record or store live video/audio?",
      a: "No — TEGO.Live does not record or store live call audio/video. We do not retain messages exchanged inside a live call. We collect only the metadata necessary to operate the service (e.g., device type, IP, app usage).",
    },
    {
      q: "What should I do if I see a minor using the app?",
      a: "Report the profile immediately using the in-app report button. We will investigate and remove any underage accounts. Do not share personal information with that account.",
    },
    {
      q: "How do I request account deletion?",
      a: "Email support@tego.live with the subject 'Delete my account' and include your registered email. See the 'How to request deletion' template below.",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 py-8 px-4 sm:px-6 md:px-12 lg:px-28">
      {/* Hero */}
      <header className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-5xl mx-auto"
        >
          <div className={`rounded-2xl p-5 sm:p-6 ${ACCENT} text-white shadow-md`}>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
              Privacy Policy — <span className="opacity-95">TEGO.Live</span>
            </h1>

            <p className="mt-2 text-xs sm:text-sm md:text-base opacity-95">
              Last Updated: <strong>17 November 2025</strong> · Your privacy and safety are a priority. Read how we collect, use, and protect your information.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              {/* Email / copy */}
              <button
                onClick={copyEmail}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 sm:py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition text-sm font-medium touch-manipulation"
                aria-label="Copy support email"
              >
                📧 support@tego.live
              </button>

              {/* Print / download */}
              <button
                onClick={printPolicy}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 sm:py-2 bg-white/10 hover:bg-white/20 transition text-sm font-medium"
                aria-label="Print or download privacy policy"
              >
                🖨️ Download / Print
              </button>

              <span className="mt-2 sm:mt-0 ml-auto inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" className="inline-block">
                  <path fill="white" d="M12 2L2 7v6c0 5 4 9 10 9s10-4 10-9V7l-10-5z" />
                </svg>
                Secure • Non-recording
              </span>
            </div>

            {copied && (
              <div className="mt-3 text-sm bg-white/20 inline-block px-3 py-1 rounded-md">
                Email copied to clipboard ✔
              </div>
            )}
          </div>
        </motion.div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr_320px] gap-6 md:gap-8">
        {/* Mobile TOC (collapsible) */}
        <div className="lg:hidden">
          <div className="bg-white rounded-xl p-3 shadow-sm border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Contents</h3>
              <button
                onClick={() => setTocOpen((s) => !s)}
                className="text-sm px-2 py-1 rounded-md border hover:bg-gray-50"
                aria-expanded={tocOpen}
                aria-controls="mobile-toc"
              >
                {tocOpen ? "Close" : "Open"}
              </button>
            </div>

            {tocOpen && (
              <ol
                id="mobile-toc"
                className="mt-3 text-sm space-y-2"
                role="list"
              >
                <li>
                  <button
                    onClick={() => scrollToId("collect")}
                    className="w-full text-left px-2 py-2 rounded hover:bg-gray-50"
                  >
                    1. Information We Collect
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToId("responsibility")}
                    className="w-full text-left px-2 py-2 rounded hover:bg-gray-50"
                  >
                    2. User Responsibility
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToId("use")}
                    className="w-full text-left px-2 py-2 rounded hover:bg-gray-50"
                  >
                    3. How We Use Your Information
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToId("protect")}
                    className="w-full text-left px-2 py-2 rounded hover:bg-gray-50"
                  >
                    4. How We Protect Your Information
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToId("share")}
                    className="w-full text-left px-2 py-2 rounded hover:bg-gray-50"
                  >
                    5. Sharing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToId("rights")}
                    className="w-full text-left px-2 py-2 rounded hover:bg-gray-50"
                  >
                    6. Your Rights
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToId("faqs")}
                    className="w-full text-left px-2 py-2 rounded hover:bg-gray-50"
                  >
                    FAQs
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToId("contact")}
                    className="w-full text-left px-2 py-2 rounded hover:bg-gray-50"
                  >
                    Contact
                  </button>
                </li>
              </ol>
            )}
          </div>
        </div>

        {/* Left TOC for large screens */}
        <nav className="hidden lg:block sticky top-28 self-start">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h3 className="text-sm font-semibold mb-3">On this page</h3>
            <ol className="text-sm space-y-2">
              <li>
                <button onClick={() => scrollToId("collect")} className="hover:underline text-left w-full">1. Information We Collect</button>
              </li>
              <li>
                <button onClick={() => scrollToId("responsibility")} className="hover:underline text-left w-full">2. User Responsibility</button>
              </li>
              <li>
                <button onClick={() => scrollToId("use")} className="hover:underline text-left w-full">3. How We Use Your Information</button>
              </li>
              <li>
                <button onClick={() => scrollToId("protect")} className="hover:underline text-left w-full">4. How We Protect Your Information</button>
              </li>
              <li>
                <button onClick={() => scrollToId("share")} className="hover:underline text-left w-full">5. Sharing</button>
              </li>
              <li>
                <button onClick={() => scrollToId("rights")} className="hover:underline text-left w-full">6. Your Rights</button>
              </li>
              <li>
                <button onClick={() => scrollToId("faqs")} className="hover:underline text-left w-full">FAQs</button>
              </li>
              <li>
                <button onClick={() => scrollToId("contact")} className="hover:underline text-left w-full">Contact</button>
              </li>
            </ol>
          </div>
        </nav>

        {/* Main content */}
        <article ref={contentRef} className="prose prose-neutral max-w-none lg:prose-lg">
          {/* Section 1 */}
          <section id="collect" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">1. Information We Collect</h2>
            <p className="text-sm text-gray-700">We collect only what is necessary to provide and improve TEGO.Live.</p>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-semibold">1.1 Information You Provide</h3>
                <ul className="mt-3 list-disc ml-5 text-gray-700">
                  <li>Email address (for login & support)</li>
                  <li>Location (city / state) you enter during registration</li>
                  <li>Basic profile details (display name, bio)</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-semibold">1.2 We Do <em>NOT</em> Save</h3>
                <p className="text-gray-700 mt-2">To protect your privacy we do NOT save or persist any of the following:</p>
                <ul className="mt-3 list-disc ml-5 text-gray-700">
                  <li>Live conversation audio or video</li>
                  <li>Messages exchanged inside a live call</li>
                  <li>Location, phone number, or anything you show/say during live</li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border mt-4">
              <h3 className="font-semibold">1.3 Automatically Collected</h3>
              <p className="text-gray-700 mt-2">We may collect technical data to operate the service:</p>
              <ul className="mt-3 list-disc ml-5 text-gray-700">
                <li>Device type and operating system</li>
                <li>IP address and approximate location for safety</li>
                <li>App usage metadata (pages visited, feature usage)</li>
              </ul>
            </div>
          </section>

          {/* Section 2 - Important */}
          <section id="responsibility" tabIndex={-1} className="mb-8">
            <div className="rounded-xl p-4 border border-red-200 bg-red-50">
              <h2 className="text-2xl font-bold text-red-700">2. User Responsibility (VERY IMPORTANT)</h2>
              <p className="mt-2 text-red-700">
                🚨 You are fully responsible for any personal information you share with strangers on TEGO.Live.
              </p>

              <ul className="list-disc ml-6 mt-3 text-red-700">
                <li>Live location</li>
                <li>Phone number</li>
                <li>Contact details & address</li>
                <li>Financial information</li>
                <li>Any other sensitive personal data</li>
              </ul>

              <p className="mt-3 text-red-700 font-semibold">If you share personal information voluntarily, you do so at your own risk.</p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="use" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">3. How We Use Your Information</h2>
            <p className="text-gray-700 mt-2">We use data only to operate and improve the service:</p>
            <ul className="list-disc ml-6 mt-3 text-gray-700">
              <li>Improve app performance and features</li>
              <li>Provide customer support and account recovery</li>
              <li>Detect and prevent fraud, abuse, and illegal activity</li>
              <li>Personalize content and recommendations</li>
              <li>Enable login, billing, and push notifications</li>
            </ul>

            <div className="mt-4 bg-white p-3 rounded-lg border">
              <h4 className="font-semibold">Data Retention</h4>
              <p className="text-sm text-gray-700 mt-2">
                We retain account profile data until you delete your account. Automatically collected metadata is retained for limited periods for analytics and safety.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="protect" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">4. How We Protect Your Information</h2>
            <p className="text-gray-700 mt-2">We apply industry standard security practices:</p>

            <ul className="list-disc ml-6 mt-3 text-gray-700">
              <li>Encrypted database storage and transport (HTTPS/TLS)</li>
              <li>Authenticated & rate-limited APIs</li>
              <li>Minimal data collection for live features — no recordings</li>
              <li>Internal access controls and monitoring</li>
            </ul>

            <div className="mt-4 bg-gray-50 p-3 rounded-lg border">
              <strong>Third-party providers</strong>
              <p className="text-sm text-gray-700 mt-1">
                We use trusted service providers for hosting and analytics. We limit the data shared with them and require contractual commitments for data protection.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section id="share" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">5. Sharing of Information</h2>
            <p className="text-gray-700 mt-2">We will not sell or trade your personal data. We share limited information only when necessary:</p>
            <ul className="list-disc ml-6 mt-3 text-gray-700">
              <li>Law enforcement when required by valid legal process</li>
              <li>To prevent fraud, abuse, or security incidents</li>
              <li>Service providers that operate the platform (under contract)</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="rights" tabIndex={-1} className="mb-8">
            <h2 className="text-2xl font-bold">6. Your Rights</h2>
            <p className="text-gray-700 mt-2">You can exercise these rights at any time:</p>
            <ul className="list-disc ml-6 mt-3 text-gray-700">
              <li>Request deletion of your account and data</li>
              <li>Request removal of saved email or profile location</li>
              <li>Update profile information via the app</li>
              <li>Stop using TEGO.Live anytime — we provide account deletion</li>
            </ul>

            <div className="mt-4 bg-white p-3 rounded-lg border">
              <h4 className="font-semibold">How to request deletion</h4>
              <p className="text-sm text-gray-700 mt-2">
                Email <strong>support@tego.live</strong> with subject <em>"Delete my account"</em>. Include the registered email and a short reason. Below is a template you can copy:
              </p>
              <pre className="mt-3 bg-gray-100 p-3 rounded text-sm overflow-auto">
{`Subject: Delete my account

Hi TEGO.Live Team,

Please delete my account and all associated personal data.
Registered email: [your-email@example.com]
Reason (optional): [reason]

Thanks,
[your name]`}
              </pre>
            </div>
          </section>

          {/* FAQs */}
          <section id="faqs" tabIndex={-1} className="mb-12">
            <h2 className="text-2xl font-bold">FAQs</h2>
            <div className="mt-4 space-y-3">
              {faqs.map((f, idx) => (
                <div key={idx} className="bg-white border rounded-lg p-3">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 py-3 px-2 text-left touch-manipulation"
                    aria-expanded={openFaq === idx}
                    aria-controls={`faq-${idx}`}
                  >
                    <span className="text-left font-medium">{f.q}</span>
                    <span className="text-sm opacity-70">{openFaq === idx ? "−" : "+"}</span>
                  </button>

                  {openFaq === idx && (
                    <div id={`faq-${idx}`} className="mt-3 text-gray-700 px-2">
                      <p>{f.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Legal notes & Contact anchor */}
          <section id="contact" tabIndex={-1} className="mb-8">
            <h3 className="text-lg font-semibold">Legal & Compliance</h3>
            <p className="text-gray-700 mt-2">
              TEGO.Live is committed to applicable data protection laws. If you are in the EU, you may have rights under GDPR; California residents may have rights under CCPA. Contact support for requests specific to your jurisdiction.
            </p>
          </section>
        </article>

        {/* Right column: contact card & quick actions */}
        <aside className="sticky top-28 self-start hidden lg:block">
          <div className="bg-white p-5 rounded-xl shadow-sm border mb-6">
            <h4 className="text-lg font-semibold">Contact & Actions</h4>
            <p className="text-sm text-gray-700 mt-2">Questions about this policy or your data?</p>

            <div className="mt-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Support</p>
                  <p className="text-xs text-gray-600">support@tego.live</p>
                </div>
                <div>
                  <button
                    onClick={copyEmail}
                    className="text-sm px-3 py-1 rounded-full border hover:bg-gray-50"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => window.location.href = "mailto:support@tego.live?subject=Privacy%20Policy%20question"}
                  className="w-full rounded-full py-2 text-sm font-medium border bg-linear-to-r from-[#fb5607] to-[#ff8a50] text-white"
                >
                  Email Support
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <h5 className="font-semibold text-sm mb-2">Safety Tips</h5>
            <ul className="text-sm text-gray-700 list-disc ml-5">
              <li>Never share your phone number or address during live.</li>
              <li>Use in-app reporting for suspicious accounts.</li>
              <li>Keep your profile info minimal.</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Mobile bottom CTA bar */}
      <div className="fixed left-4 right-4 bottom-6 sm:left-6 sm:right-6 lg:hidden z-40">
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-md border flex gap-3 items-center">
          <button
            onClick={copyEmail}
            className="flex-1 text-sm font-medium px-4 py-2 rounded-full border hover:bg-gray-50"
          >
            {copied ? "Email Copied" : "Copy Support Email"}
          </button>
          <button
            onClick={() => scrollToId("faqs")}
            className="px-3 py-2 rounded-full border text-sm"
          >
            FAQs
          </button>
        </div>
      </div>

      <footer className="mt-12 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} TEGO.Live — All Rights Reserved • Built with privacy-first practices.
      </footer>
    </main>
  );
}
