// src/lib/supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Throwing here helps catch missing envs early during dev/build.
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment."
  );
}

/**
 * Export a single Supabase client for use in client-side components.
 * This client is safe to use in the browser (uses the anon key).
 */
export const supabase: SupabaseClient = createClient(url, anonKey, {
  // optional: tune realtime params
  realtime: {
    // If you want to receive presence events or listen across tabs,
    // add params here. Keep defaults for most cases.
  },
  // You can add global headers here if required:
  // global: { headers: { "x-my-app": "my-app" } }
});
