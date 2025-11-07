import { NextRequest, NextResponse } from "next/server";
import { redis, QUEUE_KEY } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json();
    if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

    const selfPair = process.env.NEXT_PUBLIC_SELF_PAIR === "1";

    // If self-pair is enabled (debug), instantly pair user with self
    if (selfPair) {
      const channel = `room_${Math.random().toString(36).slice(2, 10)}`;
      return NextResponse.json({ status: "paired", channel, partner: uid });
    }

    const waiting = await redis.lpop<string>(QUEUE_KEY);
    if (!waiting) {
      await redis.rpush(QUEUE_KEY, uid);
      return NextResponse.json({ status: "waiting" });
    }

    const channel = `room_${Math.random().toString(36).slice(2, 10)}`;
    return NextResponse.json({ status: "paired", channel, partner: waiting });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "match error" }, { status: 500 });
  }
}
