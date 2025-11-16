import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { channel } = await req.json();
    if (!channel) return NextResponse.json({ error: "channel required" }, { status: 400 });

    // TODO: Mark ended in DB
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "stop error" }, { status: 500 });
  }
}
