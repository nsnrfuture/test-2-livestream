// app/api/live/stop/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { channel } = await req.json();

    if (!channel) {
      return NextResponse.json(
        { error: "channel required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("live_rooms")
      .update({
        ended_at: new Date().toISOString(),
        is_live: false,
      })
      .eq("channel", channel);

    if (error) {
      console.error("stop live update error:", error);
      return NextResponse.json(
        { error: error.message || "DB update error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("live/stop error:", e);
    return NextResponse.json(
      { error: e?.message || "stop error" },
      { status: 500 }
    );
  }
}
