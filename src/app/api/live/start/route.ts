import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = typeof body?.title === "string" ? body.title : "";

    // Safe slug from title
    const slugBase =
      title.trim().length > 0
        ? title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
        : "";

    const randomSuffix = Math.random().toString(36).slice(2, 6);

    const channel =
      slugBase.length > 0
        ? `live_${slugBase.slice(0, 24)}_${randomSuffix}`
        : `live_${Math.random().toString(36).slice(2, 10)}`;

    // TODO: Insert into DB if needed, e.g.
    // await supabaseAdmin.from("live_rooms").insert({
    //   channel,
    //   title,
    //   is_live: true,
    //   started_at: new Date().toISOString(),
    // });

    return NextResponse.json({ channel });
  } catch (e: any) {
    console.error("live/start error:", e);
    return NextResponse.json(
      { error: e?.message || "start error" },
      { status: 500 }
    );
  }
}
