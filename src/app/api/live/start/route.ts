import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();
    const channel = title
      ? `live_${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}_${Math.random()
          .toString(36)
          .slice(2, 6)}`
      : `live_${Math.random().toString(36).slice(2, 10)}`;

    // TODO: Insert into your DB if needed
    return NextResponse.json({ channel });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "start error" }, { status: 500 });
  }
}
