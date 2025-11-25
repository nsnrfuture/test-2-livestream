// app/api/live/view/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { channel, viewerId } = await req.json();

    if (!channel) {
      return NextResponse.json(
        { error: "channel required" },
        { status: 400 }
      );
    }

    // room find karo
    const { data: room, error: roomErr } = await supabaseAdmin
      .from("live_rooms")
      .select("id")
      .eq("channel", channel)
      .single();

    if (roomErr || !room) {
      console.error("live/view room error:", roomErr);
      return NextResponse.json(
        { error: "live room not found" },
        { status: 404 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      null;

    // 1) log view
    const { error: viewErr } = await supabaseAdmin
      .from("live_views")
      .insert({
        room_id: room.id,
        viewer_id: viewerId || null,
        viewer_ip: ip,
      });

    if (viewErr) {
      console.error("live/view insert error:", viewErr);
    }

    // 2) increment views_count
    const { error: updateErr } = await supabaseAdmin.rpc(
      "increment_live_views",
      { p_room_id: room.id }
    );

    if (updateErr) {
      console.error("views_count update error:", updateErr);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("live/view error:", e);
    return NextResponse.json(
      { error: e?.message || "view error" },
      { status: 500 }
    );
  }
}
