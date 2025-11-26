// app/api/live/stop/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { channel, hostId, hostEmail, isAdmin } = await req.json();

    if (!channel) {
      return NextResponse.json(
        { error: "channel is required" },
        { status: 400 }
      );
    }

    // 🟣 ADMIN CASE: admin sabka live stop kar sakta hai sirf channel se
    if (isAdmin) {
      const { data, error } = await supabaseAdmin
        .from("live_rooms")
        .update({
          is_live: false,
          ended_at: new Date().toISOString(),
        })
        .eq("channel", channel)
        .eq("is_live", true) // extra safety
        .select("id");

      if (error) {
        console.error("live/stop admin update error:", error);
        return NextResponse.json(
          { error: "Admin could not stop live room" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        stopped_by: "admin",
        affected: data?.length ?? 0,
      });
    }

    // 🟣 NORMAL HOST CASE: hostId ya hostEmail mandatory
    if (!hostId && !hostEmail) {
      return NextResponse.json(
        { error: "hostId or hostEmail required for non-admin stop" },
        { status: 400 }
      );
    }

    // 1) host ka final id nikalna
    let finalHostId: string | null = hostId || null;

    // agar hostId nahi diya, lekin email diya hai → profiles se id nikaalo
    if (!finalHostId && hostEmail) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", hostEmail)
        .single();

      if (profileError || !profile) {
        console.error("host profile not found for email:", hostEmail, profileError);
        return NextResponse.json(
          { error: "Host not found for given email" },
          { status: 404 }
        );
      }

      finalHostId = profile.id;
    }

    if (!finalHostId) {
      return NextResponse.json(
        { error: "Could not resolve host id" },
        { status: 400 }
      );
    }

    // 2) live_rooms me channel + host_id ke basis pe stop
    const { data, error } = await supabaseAdmin
      .from("live_rooms")
      .update({
        is_live: false,
        ended_at: new Date().toISOString(),
      })
      .eq("channel", channel)
      .eq("host_id", finalHostId)
      .eq("is_live", true)
      .select("id, host_id, host_email");

    if (error) {
      console.error("live/stop host update error:", error);
      return NextResponse.json(
        { error: "Could not stop live room" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      // ya to channel galat, ya ye host is channel ka owner nahi
      return NextResponse.json(
        { error: "No active live room found for this host + channel" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      stopped_by: "host",
      affected: data.length,
      room: data[0],
    });
  } catch (e: any) {
    console.error("live/stop error:", e);
    return NextResponse.json(
      { error: e?.message || "stop error" },
      { status: 500 }
    );
  }
}
