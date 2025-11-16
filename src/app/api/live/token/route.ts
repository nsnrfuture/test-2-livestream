import { NextRequest, NextResponse } from "next/server";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;
const TOKEN_TTL = parseInt(process.env.AGORA_TOKEN_TTL || "3600", 10);

export async function POST(req: NextRequest) {
  try {
    const { channel, uid, role } = await req.json();
    if (!channel || typeof uid !== "number" || !role)
      return NextResponse.json({ error: "channel, uid, role required" }, { status: 400 });

    const agoraRole = role === "host" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const privilegeExpireTs = Math.floor(Date.now() / 1000) + TOKEN_TTL;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channel,
      uid,
      agoraRole,
      privilegeExpireTs
    );

    return NextResponse.json({ token, appId: APP_ID });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "token error" }, { status: 500 });
  }
}
