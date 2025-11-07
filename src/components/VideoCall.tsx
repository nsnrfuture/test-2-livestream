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

  // Mount local video into a fresh container
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
    // After we’ve created any media track once, labels will be populated.
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
      // refresh device labels after permission
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

  /** ---------- Facing helpers ---------- */
  const guessDeviceForFacing = useCallback(
    (facing: Facing) => {
      // Try to find by label keywords (works on most phones after permission)
      const labelNeedles =
        facing === "user"
          ? ["front", "user", "facing front"]
          : ["back", "rear", "environment", "facing back"];
      const lowered = cameras.map((d) => ({
        ...d,
        _label: (d.label || "").toLowerCase(),
      }));
      const hit = lowered.find(
        (d) => d.kind === "videoinput" && labelNeedles.some((n) => d._label.includes(n))
      );
      return hit?.deviceId;
    },
    [cameras]
  );

  const switchToFacing = useCallback(
    async (facing: Facing) => {
      if (!localVideoTrack) return;

      setBusy(true);
      try {
        // 1) Prefer hot switch to an actual deviceId if we can guess it
        const devId = guessDeviceForFacing(facing);
        if (devId) {
          try {
            await localVideoTrack.setDevice(devId);
            playLocalInto(localVideoTrack);
            return;
          } catch {
            /* fall through to recreate */
          }
        }

        // 2) Fallback: recreate the track with facingMode
        try {
          await client.unpublish(localVideoTrack);
        } catch {}
        localVideoTrack.stop();
        localVideoTrack.close();

        const newCam = await AgoraRTC.createCameraVideoTrack({ facingMode: facing });
        await client.publish(newCam);
        setLocalVideoTrack(newCam);
        playLocalInto(newCam);
        await refreshDevices();
      } finally {
        setBusy(false);
      }
    },
    [client, guessDeviceForFacing, localVideoTrack, playLocalInto, refreshDevices]
  );

  /** ---------- Next Stranger (leave -> fetch -> join) ---------- */
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
    // default to "user" when rejoining; change if you prefer to remember last facing
    await joinChannel(newChannel, nextUid, "user");
  }, [getNextStranger, joinChannel, leaveChannel, onLeave, uid]);

  /** ---------- Initial boot ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Join initial channel with front camera by default
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

  /** ---------- Basic controls ---------- */
  const leave = async () => {
    await leaveChannel();
    onLeave?.();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full h-[70vh]">
      <div ref={remoteRef} className="bg-black rounded-xl overflow-hidden" />
      <div ref={containerRef} className="bg-black rounded-xl overflow-hidden" />

      <div className="md:col-span-2 flex flex-wrap justify-center gap-3">
        {/* Mic/Camera toggles */}
        <button
          onClick={() => localVideoTrack?.setEnabled(false)}
          className="px-4 py-2 bg-gray-200 rounded-md"
          disabled={busy}
        >
          Cam Off
        </button>
        <button
          onClick={() => localVideoTrack?.setEnabled(true)}
          className="px-4 py-2 bg-gray-200 rounded-md"
          disabled={busy}
        >
          Cam On
        </button>
        <button
          onClick={() => localAudioTrack?.setEnabled(false)}
          className="px-4 py-2 bg-gray-200 rounded-md"
          disabled={busy}
        >
          Mute
        </button>
        <button
          onClick={() => localAudioTrack?.setEnabled(true)}
          className="px-4 py-2 bg-gray-200 rounded-md"
          disabled={busy}
        >
          Unmute
        </button>

        {/* NEW: Explicit Front / Back */}
        <button
          onClick={() => switchToFacing("user")}
          className="px-4 py-2 bg-gray-200 rounded-md"
          disabled={busy}
          title="Use front/selfie camera"
        >
          Front Camera
        </button>
        <button
          onClick={() => switchToFacing("environment")}
          className="px-4 py-2 bg-gray-200 rounded-md"
          disabled={busy}
          title="Use back/rear camera"
        >
          Back Camera
        </button>

        {/* Optional: Next stranger */}
        <button
          onClick={nextStranger}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          disabled={busy}
        >
          Next (Change Stranger)
        </button>

        <button
          onClick={leave}
          className="px-4 py-2 bg-red-600 text-white rounded-md"
          disabled={busy}
        >
          Leave
        </button>
      </div>
    </div>
  );
}
