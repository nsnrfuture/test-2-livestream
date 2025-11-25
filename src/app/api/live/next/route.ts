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

    // STEP 1: Fetch current live row
    const { data: currentRow } = await supabaseAdmin
      .from("live_rooms")
      .select("started_at")
      .eq("channel", current)
      .eq("is_live", true)
      .single();

    // STEP 2: Find the next live
    const { data: nextRows } = await supabaseAdmin
      .from("live_rooms")
      .select("channel, started_at")
      .eq("is_live", true)
      .gt("started_at", currentRow?.started_at || "1970-01-01")
      .order("started_at", { ascending: true })
      .limit(1);

    const nextChannel = nextRows?.[0]?.channel ?? null;

    return NextResponse.json({ channel: nextChannel });
  } catch (error: any) {
    console.error("live/next error:", error);
    return NextResponse.json(
      { error: error?.message ?? "next error" },
      { status: 500 }
    );
  }
}
