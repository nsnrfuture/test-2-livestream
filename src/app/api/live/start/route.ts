// app/api/live/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { title, hostId } = await req.json();

    if (!hostId) {
      return NextResponse.json(
        { error: "hostId is required" },
        { status: 400 }
      );
    }

    // 👉 Channel generate
    const slug =
      title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 24) || "live";

    const channel = `${slug}_${Math.random().toString(36).slice(2, 8)}`;

    // 👉 host ka name + email profiles se nikaalo
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", hostId)
      .single();

    if (profileError) {
      console.warn("profile load error in /live/start:", profileError);
      // yaha hard fail nahi kar rahe, sirf log — insert fir bhi chalega
    }

    // 👉 DB me room insert
    const { data: inserted, error } = await supabaseAdmin
      .from("live_rooms")
      .insert({
        channel,
        title: title || null,
        host_id: hostId, // already tha
        host_name: profile?.full_name || null, // ✅ naya
        host_email: profile?.email || null, // ✅ naya
        is_live: true,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("live/start insert error:", error);
      return NextResponse.json(
        { error: "Could not create live room" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      channel,
      roomId: inserted.id,
      host: {
        id: hostId,
        name: profile?.full_name || null,
        email: profile?.email || null,
      },
    });
  } catch (e: any) {
    console.error("live/start error:", e);
    return NextResponse.json(
      { error: e?.message || "start error" },
      { status: 500 }
    );
  }
}
