// app/api/live/gift/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { channel, type, amount, from } = await req.json();

    if (!channel || !type || !amount) {
      return NextResponse.json(
        { error: "channel, type, amount required" },
        { status: 400 }
      );
    }

    // find room by channel
    const { data: room, error: roomErr } = await supabaseAdmin
      .from("live_rooms")
      .select("id")
      .eq("channel", channel)
      .single();

    if (roomErr || !room) {
      console.error("gift room fetch error:", roomErr);
      return NextResponse.json(
        { error: "live room not found" },
        { status: 404 }
      );
    }

    // 1) insert gift log
    const { error: insertErr } = await supabaseAdmin
      .from("live_gifts")
      .insert({
        room_id: room.id,
        channel,
        type,
        amount,
        from_user: from || null,
      });

    if (insertErr) {
      console.error("gift insert error:", insertErr);
    }

    // 2) increment total_gifts
    const { error: updateErr } = await supabaseAdmin.rpc(
      "increment_live_gifts",
      { p_room_id: room.id, p_amount: amount }
    );

    // Agar RPC nahi bana to simple update bhi use kar sakte:
    // await supabaseAdmin
    //   .from("live_rooms")
    //   .update({ total_gifts: (live_rooms.total_gifts ?? 0) + amount })
    //   .eq("id", room.id);

    if (updateErr) {
      console.error("gift total_gifts update error:", updateErr);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("gift error:", e);
    return NextResponse.json(
      { error: e?.message || "gift error" },
      { status: 500 }
    );
  }
}
