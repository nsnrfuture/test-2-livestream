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

    // 1) current room ka started_at nikaalo
    const { data: currentRoom, error: currentErr } = await supabaseAdmin
      .from("live_rooms")
      .select("started_at")
      .eq("channel", current)
      .single();

    if (currentErr) {
      console.warn("live/next currentRoom error:", currentErr);
    }

    const afterTs = currentRoom?.started_at || "1970-01-01T00:00:00Z";

    // 2) Next live room find karo (is_live = true + started_at > current)
    const { data: nextRows, error: nextErr } = await supabaseAdmin
      .from("live_rooms")
      .select("channel, started_at, host_id, host_name, host_email")
      .eq("is_live", true)
      .gt("started_at", afterTs)
      .order("started_at", { ascending: true })
      .limit(1);

    if (nextErr) {
      console.error("live/next nextRows error:", nextErr);
      return NextResponse.json(
        { error: "Could not load next live" },
        { status: 500 }
      );
    }

    const next = nextRows?.[0];

    // agar koi next nahi hai → null return
    if (!next) {
      return NextResponse.json({
        channel: null,
        host: null,
        started_at: null,
      });
    }

    return NextResponse.json({
      channel: next.channel,
      started_at: next.started_at,
      host: {
        id: next.host_id,
        name: next.host_name,
        email: next.host_email,
      },
    });
  } catch (e: any) {
    console.error("live/next error:", e);
    return NextResponse.json(
      { error: e?.message || "next error" },
      { status: 500 }
    );
  }
}
