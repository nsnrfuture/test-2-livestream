"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import { AGORA_APP_ID, randomUid } from "@/lib/agora";

type Props = {
  channel: string;
};

export default function LivePlayer({ channel }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [client] = useState<IAgoraRTCClient>(() =>
    AgoraRTC.createClient({ mode: "live", codec: "vp8" })
  );
  const [joined, setJoined] = useState(false);
  const [uid] = useState<number>(() => randomUid());

  const getToken = useCallback(async () => {
    const res = await fetch("/api/live/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, uid, role: "audience" }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "token");
    return j.token as string;
  }, [channel, uid]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const token = await getToken();
        await client.setClientRole("audience");
        await client.join(AGORA_APP_ID, channel, token, uid);

        client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "video") {
            const remoteVideoTrack = user.videoTrack as IRemoteVideoTrack;
            if (containerRef.current) {
              remoteVideoTrack?.play(containerRef.current);
            }
          }
          if (mediaType === "audio") {
            const remoteAudioTrack = user.audioTrack as IRemoteAudioTrack;
            remoteAudioTrack?.play();
          }
        });

        client.on("user-unpublished", () => {
          // auto handled by play containers
        });

        setJoined(true);
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      mounted = false;
      (async () => {
        try {
          await client.leave();
        } catch {}
      })();
    };
  }, [client, channel, getToken, uid]);

  return (
    <div
      ref={containerRef}
      className="aspect-video w-full rounded-xl bg-black overflow-hidden"
    />
  );
}
