// app/api/match/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only secret

// Server-side client (no session persistence)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const {
      uid,
      userId,
      preferredGender,
      selectedCountry,
    }: {
      uid?: number;
      userId?: string;
      preferredGender?: "male" | "female" | "any";
      selectedCountry?: string;
    } = body;

    if (!uid) {
      return NextResponse.json({ error: "uid required" }, { status: 400 });
    }

    const selfPair = process.env.NEXT_PUBLIC_SELF_PAIR === "1";
    if (selfPair) {
      const channel = `room_${Math.random().toString(36).slice(2, 10)}`;
      return NextResponse.json({ status: "paired", channel, partner: uid });
    }

    // 👇 Normalize filters
    const prefGender =
      preferredGender === "male" || preferredGender === "female"
        ? preferredGender
        : "any";

    // "world" ka matlab = koi country filter nahi
    const prefCountry =
      selectedCountry && selectedCountry !== "world"
        ? selectedCountry
        : null;

    /**
     * IMPORTANT:
     * - Agar userId present hai -> ye first request hai (queue + match with filters)
     * - Agar sirf uid hai (poll)      -> bas existing match_queue check karna hai
     *
     * Ye logic hum SQL function ke andar handle karenge.
     */

    const { data, error } = await supabase.rpc("pair_user_with_filters", {
      p_uid: uid,
      p_user_id: userId ?? null,
      p_preferred_gender: prefGender,
      p_preferred_country: prefCountry,
    });

    if (error) {
      console.error("[pair_user_with_filters] error:", error);
      return NextResponse.json({ error: "pairing failed" }, { status: 500 });
    }

    const row = Array.isArray(data) ? data[0] : data;

    if (!row || row.status === "waiting") {
      return NextResponse.json({ status: "waiting" });
    }

    // status: "paired"
    return NextResponse.json({
      status: "paired",
      channel: row.channel,
      partner: row.partner_uid,
    });
  } catch (e: any) {
    console.error("match error:", e);
    return NextResponse.json(
      { error: e?.message ?? "match error" },
      { status: 500 }
    );
  }
}
