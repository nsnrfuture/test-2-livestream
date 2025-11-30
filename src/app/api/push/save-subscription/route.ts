import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { userId, endpoint, keys } = await req.json();

    console.log("📩 Incoming subscription:", { userId, endpoint, keys });

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Invalid subscription payload" },
        { status: 400 }
      );
    }

    // Same endpoint pe purana record ho to delete
    await supabaseAdmin
      .from("webpush_subscriptions")
      .delete()
      .eq("endpoint", endpoint);

    const { error } = await supabaseAdmin.from("webpush_subscriptions").insert({
      user_id: userId ?? null,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Subscription saved successfully");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("❌ save-subscription crash:", e);
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
