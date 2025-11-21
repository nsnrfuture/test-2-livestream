// app/auth/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 added
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
        } else {
          setMessage(
            "Signup successful! If email confirmation is enabled, please check your inbox."
          );
        }
      } else {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          setError(signInError.message);
        } else if (data.session) {
          setMessage("Login successful!");
          router.push("/");
        }
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
        
        {/* Heading + Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-white">
            {mode === "signin" ? "Login" : "Create Account"}
          </h1>

          <div className="inline-flex rounded-full bg-neutral-800 p-1 text-xs">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`px-3 py-1 rounded-full ${
                mode === "signin"
                  ? "bg-indigo-500 text-white"
                  : "text-neutral-400"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`px-3 py-1 rounded-full ${
                mode === "signup"
                  ? "bg-indigo-500 text-white"
                  : "text-neutral-400"
              }`}
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
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

          {/* Password + Icon */}
          <div className="space-y-1 relative">
            <label className="block text-sm text-neutral-300">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // 👈 toggling
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 pr-10 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />

              {/* Eye icon */}
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showPassword ? (
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

          {/* Status messages */}
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
            {loading
              ? mode === "signup"
                ? "Creating account..."
                : "Logging in..."
              : mode === "signup"
              ? "Sign up"
              : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
