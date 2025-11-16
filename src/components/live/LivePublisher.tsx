"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { AGORA_APP_ID, randomUid } from "@/lib/agora";

type Props = {
  channel: string;
  onLeave?: () => void;
};

export default function LivePublisher({ channel, onLeave }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [joined, setJoined] = useState(false);
  const [token, setToken] = useState<string>("");
  const [uid] = useState<number>(() => randomUid());
  const [mic, setMic] = useState<IMicrophoneAudioTrack | null>(null);
  const [cam, setCam] = useState<ICameraVideoTrack | null>(null);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Load AgoraRTC only in the browser
  useEffect(() => {
    (async () => {
      if (typeof window === "undefined") return;
      const mod = await import("agora-rtc-sdk-ng");
      const AgoraRTC = mod.default;
      const newClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      setClient(newClient);
    })();
  }, []);

  const getToken = useCallback(async () => {
    const res = await fetch("/api/live/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, uid, role: "host" }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "token");
    return j.token as string;
  }, [channel, uid]);

  const join = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const t = await getToken();
      setToken(t);
      await client.setClientRole("host");
      await client.join(AGORA_APP_ID, channel, t, uid);

      const [m, c] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack(),
      ]);

      setMic(m);
      setCam(c);
      await client.publish([m, c]);
      if (containerRef.current) {
        c.play(containerRef.current);
      }
      setJoined(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [client, channel, uid, getToken]);

  const leave = useCallback(async () => {
    if (!client) return;
    try {
      if (mic) {
        mic.stop();
        mic.close();
      }
      if (cam) {
        cam.stop();
        cam.close();
      }
      await client.unpublish();
      await client.leave();
      setJoined(false);
      onLeave?.();
    } catch (e) {
      console.error(e);
    }
  }, [client, mic, cam, onLeave]);

  const toggleMic = async () => {
    if (!mic) return;
    await mic.setEnabled(muted);
    setMuted(!muted);
  };

  const toggleVideo = async () => {
    if (!cam) return;
    await cam.setEnabled(videoOff);
    setVideoOff(!videoOff);
  };

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="aspect-video w-full rounded-xl bg-black overflow-hidden"
      />
      <div className="mt-4 flex items-center gap-3">
        {!joined ? (
          <button
            onClick={join}
            disabled={loading || !client}
            className="px-4 py-2 rounded-lg bg-[#6C5CE7] text-white disabled:opacity-60"
          >
            {loading ? "Starting…" : "Go Live"}
          </button>
        ) : (
          <>
            <button
              onClick={toggleMic}
              className="px-3 py-2 rounded-lg bg-neutral-800 text-white"
            >
              {muted ? "Unmute" : "Mute"}
            </button>
            <button
              onClick={toggleVideo}
              className="px-3 py-2 rounded-lg bg-neutral-800 text-white"
            >
              {videoOff ? "Camera On" : "Camera Off"}
            </button>
            <button
              onClick={leave}
              className="px-4 py-2 rounded-lg bg-red-500 text-white"
            >
              End Live
            </button>
          </>
        )}
      </div>
      {token ? (
        <p className="mt-2 text-xs text-gray-400">uid: {uid}</p>
      ) : null}
    </div>
  );
}
