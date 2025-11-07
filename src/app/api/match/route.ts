import { NextRequest, NextResponse } from "next/server";
import { redis, QUEUE_KEY } from "@/lib/redis";

// Simple FIFO queue: first user waits, second user pairs & pops.
export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json();
    if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

    // try to pop someone waiting
    const waiting = await redis.lpop<string>(QUEUE_KEY);

    if (!waiting) {
      // nobody waiting → push yourself, tell client to wait/poll
      await redis.rpush(QUEUE_KEY, uid);
      return NextResponse.json({ status: "waiting" });
    }

    // got a partner → create a random channel
    const channel = `room_${Math.random().toString(36).slice(2, 10)}`;
    return NextResponse.json({ status: "paired", channel, partner: waiting });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "match error" }, { status: 500 });
  }
}

// optional: GET can show queue length for debugging
export async function GET() {
  const len = await redis.llen(QUEUE_KEY);
  return NextResponse.json({ queue: len });
}
