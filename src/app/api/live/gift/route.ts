import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { channel, type, amount, from } = await req.json();
    if (!channel || !type || !amount)
      return NextResponse.json({ error: "channel, type, amount required" }, { status: 400 });

    // TODO: persist to DB if needed

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "gift error" }, { status: 500 });
  }
}
