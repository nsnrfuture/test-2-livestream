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
        is_live: false,
        ended_at: new Date().toISOString(),
      })
      .eq("channel", channel);

    if (error) {
      console.error("live/stop update error:", error);
      return NextResponse.json(
        { error: "Could not stop live room" },
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
