// app/api/live/next/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const current = searchParams.get("current");

    if (!current) {
      return NextResponse.json(
        { error: "current channel required" },
        { status: 400 }
      );
    }

    // current room
    const { data: currentRoom } = await supabaseAdmin
      .from("live_rooms")
      .select("started_at")
      .eq("channel", current)
      .single();

    const afterTs = currentRoom?.started_at || "1970-01-01";

    const { data: nextRows } = await supabaseAdmin
      .from("live_rooms")
      .select("channel, started_at")
      .eq("is_live", true)
      .gt("started_at", afterTs)
      .order("started_at", { ascending: true })
      .limit(1);

    const nextChannel = nextRows?.[0]?.channel ?? null;

    return NextResponse.json({ channel: nextChannel });
  } catch (e: any) {
    console.error("live/next error:", e);
    return NextResponse.json(
      { error: e?.message || "next error" },
      { status: 500 }
    );
  }
}
