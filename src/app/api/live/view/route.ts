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

    // 1) room find karo + host info
    const { data: room, error: roomErr } = await supabaseAdmin
      .from("live_rooms")
      .select("id, host_id, host_email")
      .eq("channel", channel)
      .single();

    if (roomErr || !room) {
      console.error("live/view room error:", roomErr);
      return NextResponse.json(
        { error: "live room not found" },
        { status: 404 }
      );
    }

    // 2) viewer email (agar viewerId diya hai to)
    let viewerEmail: string | null = null;

    if (viewerId) {
      const { data: viewerProfile, error: viewerErr } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("id", viewerId)
        .single();

      if (viewerErr) {
        console.warn("live/view viewer profile error:", viewerErr);
      } else {
        viewerEmail = viewerProfile?.email ?? null;
      }
    }

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      null;

    // 3) log view
    const { error: viewErr } = await supabaseAdmin
      .from("live_views")
      .insert({
        room_id: room.id,
        viewer_id: viewerId || null,
        viewer_ip: ip,
        host_id: room.host_id,       // ✅ host id
        host_email: room.host_email, // ✅ host email
        viewer_email: viewerEmail,   // ✅ viewer email (optional)
      });

    if (viewErr) {
      console.error("live/view insert error:", viewErr);
    }

    // 4) increment views_count
    const { error: updateErr } = await supabaseAdmin.rpc(
      "increment_live_views",
      { p_room_id: room.id }
    );

    if (updateErr) {
      console.error("views_count update error:", updateErr);
    }

    return NextResponse.json({
      ok: true,
      room_id: room.id,
      host_id: room.host_id,
      host_email: room.host_email,
      viewer_id: viewerId || null,
      viewer_email: viewerEmail,
    });
  } catch (e: any) {
    console.error("live/view error:", e);
    return NextResponse.json(
      { error: e?.message || "view error" },
      { status: 500 }
    );
  }
}
