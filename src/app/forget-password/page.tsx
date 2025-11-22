// app/forget-password/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // ✅ ab yaha /update-password (auth ke bahar)
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/update-password`
            : undefined,
      });

      if (error) {
        console.error("RESET EMAIL ERROR:", error);
        setError(error.message || "Error sending recovery email.");
      } else {
        setMessage(
          "If this email exists, we’ve sent a password reset link. Please check your inbox/spam box."
        );
      }
    } catch (err: any) {
      console.error("RESET EMAIL CATCH:", err);
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900/70 border border-neutral-800 p-8 shadow-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">
            Forgot your password?
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm text-neutral-300">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {message && (
            <div className="text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 rounded-lg px-3 py-2">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 mt-2 transition-colors"
          >
            {loading ? "Sending link..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-4 text-xs text-neutral-400 text-center">
          Remembered it?{" "}
          <Link
            href="/login"  // 👈 agar tumhara login yahi hai
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
