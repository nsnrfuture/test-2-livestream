// app/api/live/gift/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { channel, type, amount, fromUserId } = await req.json();

    if (!channel || !type || !amount || !fromUserId) {
      return NextResponse.json(
        { error: "channel, type, amount, fromUserId required" },
        { status: 400 }
      );
    }

    // 1) find room by channel + get host info
    const { data: room, error: roomErr } = await supabaseAdmin
      .from("live_rooms")
      .select("id, host_id, host_email")
      .eq("channel", channel)
      .single();

    if (roomErr || !room) {
      console.error("gift room fetch error:", roomErr);
      return NextResponse.json(
        { error: "live room not found" },
        { status: 404 }
      );
    }

    // 2) insert gift log with sender + host info
    const { error: insertErr } = await supabaseAdmin
      .from("live_gifts")
      .insert({
        room_id: room.id,
        channel,
        type,
        amount,
        from_user: fromUserId,      // purani field bhi fill rakh rahe hain
        sender_id: fromUserId,      // ✅ naya: sender id
        host_id: room.host_id,      // ✅ naya: host id
        host_email: room.host_email // ✅ naya: host email
      });

    if (insertErr) {
      console.error("gift insert error:", insertErr);
      return NextResponse.json(
        { error: "Could not insert gift" },
        { status: 500 }
      );
    }

    // 3) increment total_gifts
    const { error: updateErr } = await supabaseAdmin.rpc(
      "increment_live_gifts",
      { p_room_id: room.id, p_amount: amount }
    );

    if (updateErr) {
      console.error("gift total_gifts update error:", updateErr);
      // yahan hard fail nahi kar rahe — gift log already save ho chuka
    }

    return NextResponse.json({
      ok: true,
      room_id: room.id,
      host_id: room.host_id,
      host_email: room.host_email,
      sender_id: fromUserId,
    });
  } catch (e: any) {
    console.error("gift error:", e);
    return NextResponse.json(
      { error: e?.message || "gift error" },
      { status: 500 }
    );
  }
}
