import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // service_role client

export async function POST(req: NextRequest) {
  try {
    const { userId, endpoint, keys } = await req.json();

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    await supabaseAdmin.from("webpush_subscriptions").delete().eq("endpoint", endpoint);

    const { error } = await supabaseAdmin.from("webpush_subscriptions").insert({
      user_id: userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
