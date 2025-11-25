import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { channel, type, amount, from } = await req.json();

    if (!channel || typeof channel !== "string") {
      return NextResponse.json(
        { error: "channel required" },
        { status: 400 }
      );
    }

    if (!type || typeof type !== "string") {
      return NextResponse.json(
        { error: "type required" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive number" },
        { status: 400 }
      );
    }

    const payload = {
      channel,
      type,
      amount,
      from: from || null,
      at: new Date().toISOString(),
    };

    // TODO: Persist to DB (for analytics / history), e.g.:
    // await supabaseAdmin.from("live_gifts").insert(payload);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("live/gift error:", e);
    return NextResponse.json(
      { error: e?.message || "gift error" },
      { status: 500 }
    );
  }
}
