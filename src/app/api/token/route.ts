import { NextRequest, NextResponse } from "next/server";
import { RtcRole, RtcTokenBuilder } from "agora-access-token";
import { AGORA_TOKEN_TTL } from "@/lib/agora";

export async function POST(req: NextRequest) {
  try {
    const { channel, uid } = await req.json();
    if (!channel || !uid) {
      return NextResponse.json({ error: "channel and uid required" }, { status: 400 });
    }

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE!;
    const role = RtcRole.PUBLISHER;
    const expireTimeInSeconds = AGORA_TOKEN_TTL;

    const privilegeExpireTs = Math.floor(Date.now() / 1000) + expireTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channel,
      Number(uid),
      role,
      privilegeExpireTs
    );

    return NextResponse.json({ token, expireIn: expireTimeInSeconds });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "token error" }, { status: 500 });
  }
}
