// app/api/strangers/report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // your admin client (SERVICE_ROLE)

export async function POST(req: NextRequest) {
  // 1) Parse body
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { channel, userId, sessionId, reason, note } = body || {};

  // 2) Basic validation
  if (!userId) {
    return NextResponse.json(
      { error: "userId (reporter) is required" },
      { status: 400 }
    );
  }

  if (!channel) {
    return NextResponse.json(
      { error: "channel is required" },
      { status: 400 }
    );
  }

  if (!reason) {
    return NextResponse.json(
      { error: "reason is required" },
      { status: 400 }
    );
  }

  try {
    // 3) Find reported user from match_queue (who was matched with this user on this channel)
    const { data: queueRow, error: queueError } = await supabaseAdmin
      .from("match_queue")
      .select("matched_with")
      .eq("user_id", userId)
      .eq("channel", channel)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (queueError) {
      console.error("[Report] match_queue error:", queueError);
    }

    const reportedUserId = queueRow?.matched_with ?? null;

    // 4) Insert into stranger_reports
    const { data, error } = await supabaseAdmin
      .from("stranger_reports")
      .insert({
        reporter_user_id: userId,
        reported_user_id: reportedUserId,
        channel,
        session_id: sessionId || null,
        reason,
        note: note || null,
        // status stays 'pending' by default
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("[Report] insert error:", error);
      return NextResponse.json(
        { error: "Failed to submit report" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        reportId: data.id,
        createdAt: data.created_at,
        reportedUserId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Report] unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}
