import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { channel } = await req.json();

    if (!channel || typeof channel !== "string") {
      return NextResponse.json(
        { error: "channel required" },
        { status: 400 }
      );
    }

    // TODO: Mark ended in DB if you store live sessions
    // await supabaseAdmin
    //   .from("live_rooms")
    //   .update({ is_live: false, ended_at: new Date().toISOString() })
    //   .eq("channel", channel);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("live/stop error:", e);
    return NextResponse.json(
      { error: e?.message || "stop error" },
      { status: 500 }
    );
  }
}
