// app/api/strangers/session-complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const {
      channel,
      startedAt,
      endedAt,
      userId,
      userName,
      userEmail,
      userGender,
      userCountry,
      userDevice,
      ratingGiven,
      notes,
    } = body || {};

    if (!channel || !startedAt || !endedAt || !userId) {
      return NextResponse.json(
        { error: "channel, startedAt, endedAt, userId required" },
        { status: 400 }
      );
    }

    const durationSeconds = Math.max(
      0,
      Math.floor(
        (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000
      )
    );

    const { error } = await supabaseAdmin
      .from("stranger_sessions")
      .insert({
        channel,
        started_at: startedAt,
        ended_at: endedAt,
        duration_seconds: durationSeconds, // agar generated column hai to ye line hata dena

        // 👇 abhi simple: jis user ne API hit kiya vo hi A hai
        user_a_id: userId,
        user_a_name: userName ?? "Unknown",
        user_a_email: userEmail ?? "unknown@example.com",
        user_a_gender: userGender ?? "unknown",
        user_a_country: userCountry ?? "IN",
        user_a_rating: ratingGiven ?? null,
        user_a_notes: notes ?? null,
        user_a_coins: 0,
        user_a_skipped: false,
        user_a_device: userDevice ?? "Unknown",

        // B side abhi fill nahi kar rahe (baad me pairing se fill kar sakte ho)
        user_b_id: null,
        user_b_name: null,
        user_b_email: null,
        user_b_gender: null,
        user_b_country: null,
        user_b_rating: null,
        user_b_notes: null,
        user_b_coins: null,
        user_b_skipped: null,
        user_b_device: null,
      });

    if (error) {
      console.error("[session-complete] insert error:", error);
      return NextResponse.json(
        { error: error.message ?? "Insert failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[session-complete] error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
