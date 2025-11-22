// app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Basic validations
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName, // 👈 store extra info in user metadata
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage(
          "Signup successful! If email confirmation is enabled, please check your inbox."
        );
        // Optionally clear form
        // setFullName("");
        // setEmail("");
        // setPassword("");
        // setConfirmPassword("");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900/70 border border-neutral-800 p-8 shadow-xl">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">
            Create Account
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            New to Tego Live? Sign up to get started.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-sm text-neutral-300">
              Full name
            </label>
            <input
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-sm text-neutral-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 pr-10 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="block text-sm text-neutral-300">
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 pr-10 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Use a strong password with at least 6 characters.
            </p>
          </div>

          {/* Messages */}
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

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 mt-2 transition-colors"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        {/* Footer link */}
        <p className="mt-4 text-xs text-neutral-400 text-center">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
