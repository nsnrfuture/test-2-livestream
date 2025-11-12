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
    const { uid } = await req.json();
    if (!uid) {
      return NextResponse.json({ error: "uid required" }, { status: 400 });
    }

    const selfPair = process.env.NEXT_PUBLIC_SELF_PAIR === "1";
    if (selfPair) {
      const channel = `room_${Math.random().toString(36).slice(2, 10)}`;
      return NextResponse.json({ status: "paired", channel, partner: uid });
    }

    // Call atomic pairing RPC
    const { data, error } = await supabase.rpc("pair_user", { p_uid: uid });

    if (error) {
      console.error("[pair_user] error:", error);
      return NextResponse.json({ error: "pairing failed" }, { status: 500 });
    }

    // data is an array with one row: { status, channel, partner }
    const row = Array.isArray(data) ? data[0] : data;

    if (!row || row.status === "waiting") {
      return NextResponse.json({ status: "waiting" });
    }

    // status: "paired"
    return NextResponse.json({
      status: "paired",
      channel: row.channel,
      partner: row.partner,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "match error" },
      { status: 500 }
    );
  }
}
