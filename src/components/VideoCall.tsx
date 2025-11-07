"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
} from "lucide-react";

type Props = {
  channel: string;
  uid: number;
  getToken: (channel: string, uid: number) => Promise<string>;
  getNextStranger?: () => Promise<{ channel: string; uid?: number }>;
  onLeave?: () => void;
};

type Facing = "user" | "environment";

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
      "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-0";
    const intentClass =
      intent === "primary"
        ? "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-400"
        : intent === "danger"
        ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400"
        : "bg-white/90 hover:bg-white shadow-sm border border-gray-200";
    const stateClass = active ? "" : "opacity-60";
    return (
      <button
        type="button"
        title={title}
        disabled={disabled}
        onClick={onClick}
        className={`${base} ${intentClass} ${stateClass} disabled:opacity-50 disabled:pointer-events-none`}
      >
        {children}
      </button>
    );
  };

  const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-flex items-center gap-1 rounded-full bg-black/60 text-white text-xs font-medium px-2 py-1 backdrop-blur">
      {children}
    </span>
  );

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

  // ---------- Next stranger ----------
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
    await joinChannel(newChannel, nextUid, facing); // keep the last facing
  }, [getNextStranger, joinChannel, leaveChannel, onLeave, uid, facing]);

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
  return (
    <div className="w-full h-[78vh] md:h-[76vh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge>
            <Users className="h-3.5 w-3.5" />
            <span>{joinedChannel ? "Live" : "Ready"}</span>
          </Badge>
          <span className="text-xs text-gray-600">
            Channel: <b>{joinedChannel || channel}</b> · UID: <b>{uid}</b>
          </span>
        </div>
        {busy && (
          <div className="inline-flex items-center gap-2 text-xs text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Working…
          </div>
        )}
      </div>

      {/* Video stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100%-4.5rem)]">
        {/* Remote */}
        <div className="relative rounded-2xl overflow-hidden bg-black shadow-sm ring-1 ring-gray-200">
          <div ref={remoteRef} className="absolute inset-0" />
          {/* Overlay label */}
          <div className="pointer-events-none absolute left-3 top-3">
            <Badge>
              <User className="h-3.5 w-3.5" />
              Stranger
            </Badge>
          </div>
          {/* subtle gradient edge */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-black/10" />
        </div>

        {/* Local */}
        <div className="relative rounded-2xl overflow-hidden bg-black shadow-sm ring-1 ring-gray-200">
          <div ref={containerRef} className="absolute inset-0" />
          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
            <Badge>
              <User className="h-3.5 w-3.5" />
              You
            </Badge>
            <Badge>{facing === "user" ? "Front" : "Back"}</Badge>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-black/10" />
        </div>

        {/* Controls */}
        <div className="md:col-span-2">
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-white/70 backdrop-blur p-3 ring-1 ring-gray-200 shadow-sm">
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

            <ControlButton
              onClick={() => switchToFacing("user")}
              title="Use front/selfie camera"
            >
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
              <ControlButton intent="primary" onClick={nextStranger} title="Match next user">
                <Play className="h-4 w-4" />
                Next (Change Stranger)
              </ControlButton>
            )}

            <ControlButton intent="danger" onClick={leave} title="Leave call">
              <Square className="h-4 w-4" />
              Leave
            </ControlButton>
          </div>
        </div>
      </div>
    </div>
  );
}
