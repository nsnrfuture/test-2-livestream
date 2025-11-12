"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  ILocalVideoTrack,
} from "agora-rtc-sdk-ng";
import { AGORA_APP_ID } from "@/lib/agora";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  RefreshCw,
  Play,
  Square,
  User,
  Loader2,
  Wifi,
  SkipForward,
  Dot,
} from "lucide-react";

type Props = {
  channel: string;
  uid: number;
  getToken: (channel: string, uid: number) => Promise<string>;
  getNextStranger?: () => Promise<{ channel: string; uid?: number }>;
  onLeave?: () => void;
};

type Facing = "user" | "environment";

const ACCENT = {
  primary: "#6C5CE7",
  primaryDark: "#5b4ed2",
  danger: "#EF4444",
  surface: "rgba(255,255,255,0.75)",
  surfaceHover: "rgba(255,255,255,0.9)",
};

export default function VideoCall({
  channel,
  uid: initialUid,
  getToken,
  getNextStranger,
  onLeave,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);

  const [client] = useState<IAgoraRTCClient>(() =>
    AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
  );

  const [uid, setUid] = useState<number>(initialUid);
  const [joinedChannel, setJoinedChannel] = useState<string | null>(null);

  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [busy, setBusy] = useState(false);

  // UI states
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [facing, setFacing] = useState<Facing>("user");

  // Guard for rapid skip
  const [isSwitching, setIsSwitching] = useState(false);

  // ---------- UI atoms ----------
  const Pill = ({
    children,
    bg = "bg-black/60",
  }: {
    children: React.ReactNode;
    bg?: string;
  }) => (
    <span className={`inline-flex items-center gap-1 rounded-full ${bg} text-white text-xs font-medium px-2 py-1 backdrop-blur`}>
      {children}
    </span>
  );

  // All buttons are DARK styled now
  const RoundBtn = ({
    onClick,
    title,
    intent = "neutral",
    disabled,
    children,
  }: {
    onClick?: () => void;
    title?: string;
    intent?: "neutral" | "primary" | "danger";
    disabled?: boolean;
    children: React.ReactNode;
  }) => {
    const base =
      "grid place-items-center rounded-full w-12 h-12 md:w-14 md:h-14 shadow-lg transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none ring-1";
    const styleClass =
      intent === "danger"
        ? "bg-[#2a0c0c] ring-red-900/40 text-white hover:bg-[#3a1212]"
        : "bg-[#111] ring-white/10 text-white hover:bg-[#1b1b1b]";
    return (
      <button type="button" title={title} onClick={onClick} disabled={disabled} className={`${base} ${styleClass}`}>
        {children}
      </button>
    );
  };

  // ---------- Core helpers ----------
  const playLocalInto = useCallback((track: ILocalVideoTrack) => {
    if (!containerRef.current) return;
    const el = document.createElement("div");
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.objectFit = "cover";
    containerRef.current.replaceChildren(el);
    track.play(el);
  }, []);

  const attachRemoteHandlers = useCallback(() => {
    client.removeAllListeners();

    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "video" && user.videoTrack) {
        const vt = user.videoTrack as IRemoteVideoTrack;
        const el = document.createElement("div");
        el.style.width = "100%";
        el.style.height = "100%";
        remoteRef.current?.replaceChildren(el);
        vt.play(el);
      }
      if (mediaType === "audio" && user.audioTrack) {
        (user.audioTrack as IRemoteAudioTrack).play();
      }
    });

    client.on("user-unpublished", () => {
      remoteRef.current?.replaceChildren();
    });

    client.on("user-left", () => {
      remoteRef.current?.replaceChildren();
    });
  }, [client]);

  const refreshDevices = useCallback(async () => {
    const devs = await AgoraRTC.getCameras();
    setCameras(devs);
    return devs;
  }, []);

  const createLocalTracks = useCallback(
    async (opts?: { cameraId?: string; facingMode?: Facing }) => {
      const mic = await AgoraRTC.createMicrophoneAudioTrack();
      const cam = await AgoraRTC.createCameraVideoTrack(
        opts?.cameraId
          ? { cameraId: opts.cameraId }
          : opts?.facingMode
          ? { facingMode: opts.facingMode }
          : undefined
      );
      setLocalAudioTrack(mic);
      setLocalVideoTrack(cam);
      playLocalInto(cam);
      await refreshDevices();
      return { mic, cam };
    },
    [playLocalInto, refreshDevices]
  );

  const destroyLocalTracks = useCallback(async () => {
    try {
      localVideoTrack?.stop();
      localVideoTrack?.close();
      localAudioTrack?.stop();
      localAudioTrack?.close();
    } catch {}
    setLocalVideoTrack(null);
    setLocalAudioTrack(null);
  }, [localVideoTrack, localAudioTrack]);

  const joinChannel = useCallback(
    async (ch: string, u: number, initialFacing: Facing = "user") => {
      setBusy(true);
      try {
        const token = await getToken(ch, u);
        await client.join(AGORA_APP_ID, ch, token, u);

        const { mic, cam } = await createLocalTracks({ facingMode: initialFacing });
        await client.publish([mic, cam]);
        attachRemoteHandlers();
        setJoinedChannel(ch);
        setFacing(initialFacing);
        setVideoEnabled(true);
        setAudioEnabled(true);
      } finally {
        setBusy(false);
      }
    },
    [attachRemoteHandlers, client, createLocalTracks, getToken]
  );

  const leaveChannel = useCallback(async () => {
    setBusy(true);
    try {
      await client.unpublish().catch(() => {});
      await destroyLocalTracks();
      await client.leave().catch(() => {});
      remoteRef.current?.replaceChildren();
      setJoinedChannel(null);
    } finally {
      setBusy(false);
    }
  }, [client, destroyLocalTracks]);

  // ---------- Facing ----------
  const guessDeviceForFacing = useCallback(
    (want: Facing) => {
      const needles =
        want === "user" ? ["front", "user", "facing front"] : ["back", "rear", "environment"];
      const lowered = cameras.map((d) => ({ ...d, _label: (d.label || "").toLowerCase() }));
      const hit = lowered.find(
        (d) => d.kind === "videoinput" && needles.some((n) => d._label.includes(n))
      );
      return hit?.deviceId;
    },
    [cameras]
  );

  const switchToFacing = useCallback(
    async (want: Facing) => {
      if (!localVideoTrack) return;
      setBusy(true);
      try {
        const devId = guessDeviceForFacing(want);
        if (devId) {
          try {
            await localVideoTrack.setDevice(devId);
            playLocalInto(localVideoTrack);
            setFacing(want);
            return;
          } catch {}
        }
        try {
          await client.unpublish(localVideoTrack);
        } catch {}
        localVideoTrack.stop();
        localVideoTrack.close();

        const newCam = await AgoraRTC.createCameraVideoTrack({ facingMode: want });
        await client.publish(newCam);
        setLocalVideoTrack(newCam);
        playLocalInto(newCam);
        setFacing(want);
        await refreshDevices();
      } finally {
        setBusy(false);
      }
    },
    [client, guessDeviceForFacing, localVideoTrack, playLocalInto, refreshDevices]
  );

  // NEW: single flip button handler (toggles front/back)
  const toggleFacing = useCallback(async () => {
    const next = facing === "user" ? "environment" : "user";
    await switchToFacing(next);
  }, [facing, switchToFacing]);

  // ---------- Next/Skip ----------
  const nextStranger = useCallback(async () => {
    if (!getNextStranger) {
      await leaveChannel();
      onLeave?.();
      return;
    }
    await leaveChannel();
    const { channel: newChannel, uid: maybeUid } = await getNextStranger();
    const nextUid = typeof maybeUid === "number" ? maybeUid : uid;
    setUid(nextUid);
    await joinChannel(newChannel, nextUid, facing);
  }, [getNextStranger, joinChannel, leaveChannel, onLeave, uid, facing]);

  const skipStranger = useCallback(async () => {
    if (!getNextStranger || isSwitching || busy) return;
    setIsSwitching(true);
    try {
      await nextStranger();
    } finally {
      setIsSwitching(false);
    }
  }, [getNextStranger, isSwitching, busy, nextStranger]);

  // Shortcuts: S or Shift+N
  useEffect(() => {
    if (!getNextStranger) return;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "s" || (e.shiftKey && key === "n")) {
        e.preventDefault();
        skipStranger();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [getNextStranger, skipStranger]);

  // ---------- Init ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await joinChannel(channel, uid, "user");
      if (!cancelled) await refreshDevices();
    })();
    return () => {
      cancelled = true;
      (async () => {
        await leaveChannel().catch(() => {});
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Toggles ----------
  const toggleVideo = async (enable: boolean) => {
    if (!localVideoTrack) return;
    await localVideoTrack.setEnabled(enable);
    setVideoEnabled(enable);
  };
  const toggleAudio = async (enable: boolean) => {
    if (!localAudioTrack) return;
    await localAudioTrack.setEnabled(enable);
    setAudioEnabled(enable);
  };

  const leave = async () => {
    await leaveChannel();
    onLeave?.();
  };

  const statusTone = joinedChannel ? "bg-green-600/80" : "bg-black/60";

  // ---------- RENDER ----------
  return (
    <div className="w-full grid place-items-center">
      <div
        className="
          relative overflow-hidden rounded-[28px]
          w-full max-w-[1100px]
          h-[86vh] md:h-[80vh]
          mx-auto
          bg-linear-to-br from-white/60 via-white/30 to-white/60
          ring-1 ring-white/50 backdrop-blur
          shadow-[0_20px_60px_-20px_rgba(108,92,231,0.35)]
        "
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 sm:px-4 py-2">
          <div className="flex items-center gap-2">
            <Pill bg={statusTone}>
              <Dot className="h-4 w-4" />
              {joinedChannel ? "Live" : "Ready"}
            </Pill>
            {!audioEnabled && (
              <Pill bg="bg-yellow-600/80">
                <MicOff className="h-3.5 w-3.5" />
                Muted
              </Pill>
            )}
            {!videoEnabled && (
              <Pill bg="bg-red-600/80">
                <CameraOff className="h-3.5 w-3.5" />
                Cam Off
              </Pill>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-gray-700">
            <Wifi className="h-4 w-4 opacity-80" />
            <span>RTC</span>
            {(busy || isSwitching) && (
              <>
                <span className="mx-1 text-gray-300">•</span>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isSwitching ? "Matching…" : "Working…"}</span>
              </>
            )}
          </div>
        </div>

        {/* Stage */}
        <div className="absolute inset-0 grid grid-rows-2 md:grid-rows-1 md:grid-cols-2">
          {/* Stranger */}
          <div className="relative">
            <div className="absolute inset-0 bg-black/95 ring-1 ring-white/10" />
            <div ref={remoteRef} className="absolute inset-0" />
            <div className="absolute left-3 top-3 z-10">
              <Pill>
                <User className="h-3.5 w-3.5" />
                Stranger
              </Pill>
            </div>
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-black/20" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-white/5" />
          </div>

          {/* You */}
          <div className="relative">
            <div className="absolute inset-0 bg-black/95 ring-1 ring-white/10" />
            <div ref={containerRef} className="absolute inset-0" />
            <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
              <Pill>
                <User className="h-3.5 w-3.5" />
                You
              </Pill>
              <Pill>{facing === "user" ? "Front" : "Back"}</Pill>
            </div>
            {!videoEnabled && (
              <div className="absolute inset-0 grid place-items-center bg-black/70 text-white z-10">
                <div className="flex flex-col items-center gap-2">
                  <CameraOff className="h-8 w-8 opacity-80" />
                  <span className="text-sm">Camera is turned off</span>
                </div>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-black/20" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-white/5" />
          </div>
        </div>

        {/* Right overlay actions */}
        <div className="absolute right-3 sm:right-4 bottom-28 md:bottom-8 z-30 flex flex-col items-center gap-3">
          {getNextStranger && (
            <>
              <RoundBtn
                onClick={skipStranger}
                title="Skip (S or Shift+N)"
                disabled={busy || isSwitching}
              >
                {isSwitching ? <Loader2 className="h-5 w-5 animate-spin" /> : <SkipForward className="h-5 w-5" />}
              </RoundBtn>
              <span className="text-[10px] text-white/90 drop-shadow">Skip</span>

              <RoundBtn
                onClick={nextStranger}
                title="Next"
                disabled={busy || isSwitching}
              >
                <Play className="h-5 w-5" />
              </RoundBtn>
              <span className="text-[10px] text-white/90 drop-shadow">Next</span>
            </>
          )}

          <RoundBtn
            onClick={() => toggleVideo(!videoEnabled)}
            title={videoEnabled ? "Turn camera off" : "Turn camera on"}
          >
            {videoEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
          </RoundBtn>
          <span className="text-[10px] text-white/90 drop-shadow">{videoEnabled ? "Cam On" : "Cam Off"}</span>

          <RoundBtn
            onClick={() => toggleAudio(!audioEnabled)}
            title={audioEnabled ? "Mute mic" : "Unmute mic"}
          >
            {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </RoundBtn>
          <span className="text-[10px] text-white/90 drop-shadow">{audioEnabled ? "Mic On" : "Muted"}</span>
        </div>

        {/* Bottom bar */}
        <div className="absolute left-0 right-0 bottom-0 z-20">
          <div
            className="mx-auto mb-3 w-[92%] md:w-[88%] rounded-2xl ring-1 ring-white/10 backdrop-blur shadow-lg px-3 py-2 bg-[#0f0f10]/85"
          >
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white">Channel:</span>
                <span>{joinedChannel || channel}</span>
                <span className="text-white/20">•</span>
                <span className="font-semibold text-white">UID:</span>
                <span>{uid}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* SINGLE flip camera button */}
                <RoundBtn onClick={toggleFacing} title="Flip camera (Front/Back)">
                  <RefreshCw className="h-4 w-4" />
                </RoundBtn>

                <RoundBtn intent="danger" onClick={leave} title="Leave">
                  <Square className="h-4 w-4" />
                </RoundBtn>
              </div>
            </div>
          </div>

          {getNextStranger && (
            <p className="pb-2 text-center text-[11px] text-gray-300">
              Tip: Press <b>S</b> or <b>Shift + N</b> to skip instantly.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
