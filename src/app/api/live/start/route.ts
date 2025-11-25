// app/api/live/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { title, hostId } = await req.json();

    // Validate: hostId is required
    if (!hostId) {
      return NextResponse.json(
        { error: "hostId (user id) is required" },
        { status: 400 }
      );
    }

    // Clean + short slug
    const slug =
      title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 24) || "live";

    // Unique channel id
    const channel = `${slug}_${Math.random().toString(36).slice(2, 8)}`;

    // Insert into live_rooms
    const { data, error } = await supabaseAdmin
      .from("live_rooms")
      .insert({
        channel,
        title: title || null,
        host_id: hostId,          // ✅ Correct host ID
        started_at: new Date().toISOString(),
        ended_at: null,
        is_live: true,
        views_count: 0,
        total_gifts: 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error("start live insert error:", error);
      return NextResponse.json(
        { error: error.message || "DB insert error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      channel,
      roomId: data.id,
    });
  } catch (e: any) {
    console.error("live/start error:", e);
    return NextResponse.json(
      { error: e?.message || "start error" },
      { status: 500 }
    );
  }
}
