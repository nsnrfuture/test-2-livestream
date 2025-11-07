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
  Users,
  Loader2,
  Wifi,
  SkipForward, // ⬅️ NEW: icon for Skip button
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

  // NEW: prevent double-trigger while switching strangers
  const [isSwitching, setIsSwitching] = useState(false);

  // ---------- UI helpers ----------
  const ControlButton = ({
    active = true,
    intent = "neutral",
    disabled,
    onClick,
    title,
    children,
  }: {
    active?: boolean;
    intent?: "neutral" | "primary" | "danger";
    disabled?: boolean;
    onClick?: () => void;
    title?: string;
    children: React.ReactNode;
  }) => {
    const base =
      "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-0";
    const intentClass =
      intent === "primary"
        ? "text-white"
        : intent === "danger"
        ? "text-white"
        : "text-gray-800";
    const bg =
      intent === "primary"
        ? ""
        : intent === "danger"
        ? ""
        : "bg-white/80 hover:bg-white/95 border border-white/60 shadow-sm";
    const stateClass = active ? "" : "opacity-60";
    return (
      <button
        type="button"
        title={title}
        disabled={disabled}
        onClick={onClick}
        className={`${base} ${bg} ${intentClass} ${stateClass} disabled:opacity-50 disabled:pointer-events-none`}
        style={
          intent === "primary"
            ? {
                background: `linear-gradient(135deg, ${ACCENT.primary} 0%, ${ACCENT.primaryDark} 100%)`,
                boxShadow: "0 8px 22px rgba(108,92,231,0.35)",
              }
            : intent === "danger"
            ? {
                background: `linear-gradient(135deg, ${ACCENT.danger} 0%, #b91c1c 100%)`,
                boxShadow: "0 8px 22px rgba(239,68,68,0.35)",
              }
            : {}
        }
      >
        {children}
      </button>
    );
  };

  const Badge = ({
    children,
    tone = "neutral" as "neutral" | "live" | "muted" | "camoff",
  }: {
    children: React.ReactNode;
    tone?: "neutral" | "live" | "muted" | "camoff";
  }) => {
    const tones: Record<typeof tone, string> = {
      neutral: "bg-black/60",
      live: "bg-green-600/80",
      muted: "bg-yellow-600/80",
      camoff: "bg-red-600/80",
    } as any;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full text-white text-xs font-medium px-2 py-1 backdrop-blur ${tones[tone]}`}
      >
        {children}
      </span>
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

  // ---------- Facing helpers ----------
  const guessDeviceForFacing = useCallback(
    (want: Facing) => {
      const needles =
        want === "user" ? ["front", "user", "facing front"] : ["back", "rear", "environment"];
      const lowered = cameras.map((d) => ({
        ...d,
        _label: (d.label || "").toLowerCase(),
      }));
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
          } catch {
            /* fallback below */
          }
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

  // ---------- Next/Skip stranger ----------
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
    await joinChannel(newChannel, nextUid, facing); // keep last facing
  }, [getNextStranger, joinChannel, leaveChannel, onLeave, uid, facing]);

  // NEW: dedicated “Skip Stranger” that guards against rapid re-clicks
  const skipStranger = useCallback(async () => {
    if (!getNextStranger || isSwitching || busy) return;
    setIsSwitching(true);
    try {
      await nextStranger();
    } finally {
      setIsSwitching(false);
    }
  }, [getNextStranger, isSwitching, busy, nextStranger]);

  // Keyboard shortcuts: S or Shift+N to skip
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

  // ---------- Toggles with UI sync ----------
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

  // ---------- Render ----------
  const statusTone = joinedChannel ? "live" : "neutral";

  return (
    <div
      className="w-full h-[78vh] md:h-[76vh] rounded-3xl p-4 md:p-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(108,92,231,0.10) 0%, rgba(255,255,255,0.45) 35%, rgba(108,92,231,0.10) 100%)",
        border: "1px solid rgba(255,255,255,0.5)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 md:gap-3">
          <Badge tone={statusTone as any}>
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{joinedChannel ? "Live" : "Ready"}</span>
          </Badge>
          {!audioEnabled && (
            <Badge tone="muted">
              <MicOff className="h-3.5 w-3.5" />
              Muted
            </Badge>
          )}
          {!videoEnabled && (
            <Badge tone="camoff">
              <CameraOff className="h-3.5 w-3.5" />
              Camera Off
            </Badge>
          )}
          <span className="text-xs md:text-sm text-gray-700/90">
            <b className="text-gray-900">Channel:</b> {joinedChannel || channel}
            <span className="mx-2 text-gray-400">•</span>
            <b className="text-gray-900">UID:</b> {uid}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-gray-600">
          <Wifi className="h-4 w-4 opacity-80" />
          <span>RTC Connected</span>
          {(busy || isSwitching) && (
            <>
              <span className="mx-1 text-gray-300">•</span>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{isSwitching ? "Matching…" : "Working…"}</span>
            </>
          )}
        </div>
      </div>

      {/* Video stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100%-5.25rem)]">
        {/* Remote */}
        <div className="relative rounded-2xl p-0.5 bg-linear-to-br from-white/70 via-white/30 to-white/70 shadow-[0_10px_40px_-12px_rgba(108,92,231,0.35)]">
          <div className="relative rounded-2xl overflow-hidden bg-black/95 ring-1 ring-white/10 h-full">
            <div ref={remoteRef} className="absolute inset-0" />
            <div className="pointer-events-none absolute left-3 top-3">
              <Badge>
                <User className="h-3.5 w-3.5" />
                Stranger
              </Badge>
            </div>
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-black/25" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-white/5 rounded-2xl" />
          </div>
        </div>

        {/* Local */}
        <div className="relative rounded-2xl p-0.5 bg-linear-to-br from-white/70 via-white/30 to-white/70 shadow-[0_10px_40px_-12px_rgba(108,92,231,0.35)]">
          <div className="relative rounded-2xl overflow-hidden bg-black/95 ring-1 ring-white/10 h-full">
            <div ref={containerRef} className="absolute inset-0" />
            <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
              <Badge>
                <User className="h-3.5 w-3.5" />
                You
              </Badge>
              <Badge>{facing === "user" ? "Front" : "Back"}</Badge>
            </div>
            {!videoEnabled && (
              <div className="absolute inset-0 grid place-items-center bg-black/70 text-white">
                <div className="flex flex-col items-center gap-2">
                  <CameraOff className="h-8 w-8 opacity-80" />
                  <span className="text-sm">Camera is turned off</span>
                </div>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-black/25" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-white/5 rounded-2xl" />
          </div>
        </div>

        {/* Controls */}
        <div className="md:col-span-2">
          <div
            className="flex flex-wrap items-center justify-center gap-3 rounded-2xl p-3 ring-1 ring-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            style={{
              background: `linear-gradient(180deg, ${ACCENT.surface} 0%, ${ACCENT.surfaceHover} 100%)`,
              backdropFilter: "blur(10px)",
            }}
          >
            <ControlButton
              active={videoEnabled}
              onClick={() => toggleVideo(!videoEnabled)}
              title={videoEnabled ? "Turn camera off" : "Turn camera on"}
            >
              {videoEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
              {videoEnabled ? "Cam On" : "Cam Off"}
            </ControlButton>

            <ControlButton
              active={audioEnabled}
              onClick={() => toggleAudio(!audioEnabled)}
              title={audioEnabled ? "Mute mic" : "Unmute mic"}
            >
              {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              {audioEnabled ? "Mic On" : "Muted"}
            </ControlButton>

            <ControlButton onClick={() => switchToFacing("user")} title="Use front/selfie camera">
              <RefreshCw className="h-4 w-4" />
              Front
            </ControlButton>

            <ControlButton
              onClick={() => switchToFacing("environment")}
              title="Use back/rear camera"
            >
              <RefreshCw className="h-4 w-4" />
              Back
            </ControlButton>

            {getNextStranger && (
              <>
                {/* Existing Next button retained */}
                <ControlButton
                  intent="primary"
                  onClick={nextStranger}
                  title="Match next user"
                  disabled={busy || isSwitching}
                >
                  <Play className="h-4 w-4" />
                  Next (Change Stranger)
                </ControlButton>

                {/* NEW: Skip Stranger (auto-leave & auto-join) */}
                <ControlButton
                  intent="primary"
                  onClick={skipStranger}
                  title="Skip & auto-join new stranger (S or Shift+N)"
                  disabled={busy || isSwitching}
                >
                  {isSwitching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SkipForward className="h-4 w-4" />
                  )}
                  {isSwitching ? "Matching…" : "Skip Stranger"}
                </ControlButton>
              </>
            )}

            <ControlButton intent="danger" onClick={leave} title="Leave call">
              <Square className="h-4 w-4" />
              Leave
            </ControlButton>
          </div>
          {getNextStranger && (
            <p className="mt-2 text-center text-xs text-gray-600">
              Tip: Press <b>S</b> or <b>Shift + N</b> to skip instantly.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
