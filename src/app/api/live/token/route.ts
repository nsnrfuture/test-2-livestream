// app/api/live/token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const TOKEN_TTL = parseInt(process.env.AGORA_TOKEN_TTL || "3600", 10); // seconds

if (!APP_ID || !APP_CERTIFICATE) {
  throw new Error(
    "Agora env vars missing. Set NEXT_PUBLIC_AGORA_APP_ID and AGORA_APP_CERTIFICATE."
  );
}

export async function POST(req: NextRequest) {
  try {
    const { channel, uid, role } = await req.json();

    if (!channel || typeof channel !== "string") {
      return NextResponse.json(
        { error: "channel, uid, role required" },
        { status: 400 }
      );
    }
    if (typeof uid !== "number" || Number.isNaN(uid)) {
      return NextResponse.json(
        { error: "uid must be a number" },
        { status: 400 }
      );
    }
    if (role !== "host" && role !== "audience") {
      return NextResponse.json(
        { error: "role must be 'host' or 'audience'" },
        { status: 400 }
      );
    }

    const agoraRole = role === "host" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const privilegeExpireTs = Math.floor(Date.now() / 1000) + TOKEN_TTL;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID!,
      APP_CERTIFICATE!,
      channel,
      uid,
      agoraRole,
      privilegeExpireTs
    );

    return NextResponse.json({ token, appId: APP_ID });
  } catch (e: any) {
    console.error("live/token error:", e);
    return NextResponse.json(
      { error: e?.message || "token error" },
      { status: 500 }
    );
  }
}
