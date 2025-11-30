"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react"; // <-- ICON

export default function PrivacyTermsConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // ✅ 3 SECOND DELAY BEFORE SHOWING POPUP
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
      setHydrated(true);
    }, 3000); // 3 sec delay

    return () => clearTimeout(timer);
  }, []);

  if (!hydrated || !isOpen) return null;

  const handleAccept = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-md animate-fadeIn">
      <div className="relative mx-6 w-full max-w-md rounded-3xl bg-linear-to-br from-slate-900/90 to-slate-800/80 border border-white/10 shadow-2xl p-7 animate-slideUp">

        {/* Glow effect */}
        <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-28 w-28 rounded-full bg-sky-500/20 blur-2xl" />

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-300 shadow-inner">
          <ShieldAlert className="h-8 w-8" strokeWidth={1.6} />
        </div>

        {/* Heading */}
        <h2 className="text-center text-xl font-semibold text-white">
          We Value Your Privacy
        </h2>

        {/* WARNING BOX */}
        <div className="mt-4 bg-red-500/10 border border-red-500/40 text-red-400 text-xs px-4 py-3 rounded-xl font-medium shadow-lg">
          ⚠️ <span className="font-semibold">Important:</span> Do NOT share any OTP, address, bank details, passwords, or other personal information with anyone.
        </div>

        {/* Description */}
        <p className="mt-4 text-center text-[15px] leading-relaxed text-slate-300">
          By using our website, you agree to our{" "}
          <Link href="/terms-and-conditions" className="text-sky-300 font-semibold hover:underline">
            Terms & Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="text-sky-300 font-semibold hover:underline">
            Privacy Policy
          </Link>.
        </p>

        <p className="mt-2 text-center text-xs text-slate-400">
          We use cookies only to improve your experience and security.
        </p>

        {/* Accept Button */}
        <button
          onClick={handleAccept}
          className="mt-6 w-full rounded-2xl bg-sky-500 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/40 hover:bg-sky-400 transition"
        >
          Accept & Continue
        </button>

        {/* More links */}
        <div className="mt-4 flex justify-between text-[11px] text-slate-400">
          <Link href="/privacy-policy" className="hover:text-sky-300 hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className="hover:text-sky-300 hover:underline">
            Terms & Conditions
          </Link>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.35s ease forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.35s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0 }
          to { transform: translateY(0); opacity: 1 }
        }
      `}</style>
    </div>
  );
}
