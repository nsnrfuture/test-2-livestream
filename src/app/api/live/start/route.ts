// app/api/live/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { title, hostId } = await req.json();

    // Channel generate
    const slug =
      title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 24) || "live";

    const channel = `${slug}_${Math.random().toString(36).slice(2, 8)}`;

    // DB me room insert
    const { error } = await supabaseAdmin.from("live_rooms").insert({
      channel,
      title: title || null,
      host_id: hostId || null, // TODO: isko auth se wire kar sakte ho
      is_live: true,
      started_at: new Date().toISOString(),
    });

    if (error) {
      console.error("live/start insert error:", error);
      return NextResponse.json(
        { error: "Could not create live room" },
        { status: 500 }
      );
    }

    return NextResponse.json({ channel });
  } catch (e: any) {
    console.error("live/start error:", e);
    return NextResponse.json(
      { error: e?.message || "start error" },
      { status: 500 }
    );
  }
}
