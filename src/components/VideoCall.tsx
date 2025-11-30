"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Type-only import is safe for SSR
import type {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  ILocalVideoTrack,
} from "agora-rtc-sdk-ng";

import { AGORA_APP_ID } from "@/lib/agora";
import { supabase } from "@/lib/supabaseClient";

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
  X,
  Flag,
} from "lucide-react";

type Facing = "user" | "environment";

type Props = {
  getToken: (channel: string, uid: number) => Promise<string>;
  onLeave?: () => void;
  userId: string; // Supabase auth user id
  uid?: number; // optional: if you want to pass a specific Agora UID
};

let AgoraRTC: any | null = null;

function randomAgoraUid() {
  return Math.floor(Math.random() * 2147483647) + 1;
}

/* ---------------------- Rating Popup Component ---------------------- */

type RatingPopupProps = {
  open: boolean;
  currentRating: number | null;
  onRate: (star: number) => void;
  onClose: () => void;
};

function RatingPopup({
  open,
  currentRating,
  onRate,
  onClose,
}: RatingPopupProps) {
  if (!open) return null;

  const handleRate = (star: number) => {
    onRate(star);
    onClose(); // after rating, close the popup
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-[90%] max-w-xs rounded-2xl bg-[#050816]/95 border border-white/10 px-4 py-5 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 p-1 rounded-full hover:bg-white/10 text-white/70"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center gap-3 mt-2">
          <span className="text-xs uppercase tracking-[0.18em] text-teal-300/80">
            Quick Feedback
          </span>
          <h3 className="text-sm font-semibold text-white text-center">
            Rate this chat experience
          </h3>
          <p className="text-[11px] text-white/60 text-center">
            This rating helps us improve your future match experience.
          </p>

          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = currentRating !== null && star <= currentRating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRate(star)}
                  className={`h-8 w-8 rounded-full text-sm flex items-center justify-center border transition-transform ${
                    active
                      ? "bg-yellow-400 text-black border-yellow-300 scale-105"
                      : "bg-black/60 text-white/70 border-white/20 hover:bg-white/10 hover:scale-105"
                  }`}
                >
                  ★
                </button>
              );
            })}
          </div>

          <span className="mt-1 text-[10px] text-white/50">
            Tap any star to submit
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Report Popup Component ---------------------- */

type ReportPopupProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string, note: string) => Promise<void> | void;
  submitting?: boolean;
};

const REPORT_REASONS = [
  "Nudity / sexual content",
  "Misbehave / harassment",
  "Under age",
  "Spam / promotion",
  "Fake user / catfish",
  "Fraud / scam",
];

function ReportPopup({
  open,
  onClose,
  onSubmit,
  submitting,
}: ReportPopupProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedReason(null);
      setNote("");
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError("Please select a reason to report this user.");
      return;
    }
    setError(null);
    await onSubmit(selectedReason, note.trim());
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-[92%] max-w-sm rounded-2xl bg-[#050816]/95 border border-white/10 px-4 py-5 shadow-2xl">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          disabled={!!submitting}
          className="absolute right-2 top-2 p-1 rounded-full hover:bg-white/10 text-white/70 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-3 mt-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <Flag className="h-3.5 w-3.5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Report this user
              </h3>
              <p className="text-[11px] text-white/60">
                If someone breaks the rules, you can report them here.
              </p>
            </div>
          </div>

          {/* Reasons */}
          <div className="mt-1 space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {REPORT_REASONS.map((reason) => {
              const active = selectedReason === reason;
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-[11px] text-left transition-all ${
                    active
                      ? "bg-red-500/15 border-red-400/70 text-red-100"
                      : "bg-white/5 border-white/15 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <span className="pr-4">{reason}</span>
                  <span
                    className={`h-4 w-4 rounded-full border flex items-center justify-center text-[9px] ${
                      active
                        ? "border-red-400 bg-red-500/80 text-black"
                        : "border-white/30 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </button>
              );
            })}
          </div>

          {/* Note */}
          <div className="mt-2">
            <label className="block text-[11px] text-white/60 mb-1">
              Additional details (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="You can describe what happened (language, behaviour, etc.)."
              className="w-full rounded-xl bg-black/40 border border-white/15 text-[11px] text-white px-3 py-2 outline-none focus:border-red-400/70 resize-none"
            />
          </div>

          {error && (
            <p className="text-[10px] text-red-400 mt-1">{error}</p>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={!!submitting}
              className="text-[11px] px-3 py-1.5 rounded-full border border-white/15 text-white/80 hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!!submitting}
              className="inline-flex items-center gap-1.5 text-[11px] px-3.5 py-1.5 rounded-full bg-red-500 text-black font-semibold hover:bg-red-400 disabled:opacity-60"
            >
              {submitting && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <span>Submit report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Main Component -------------------------- */

export default function VideoCall({
  getToken,
  onLeave,
  userId,
  uid: initialUid,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);

  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [uid, setUid] = useState<number>(initialUid ?? randomAgoraUid());
  const [channel, setChannel] = useState<string | null>(null);
  const [joinedChannel, setJoinedChannel] = useState<string | null>(null);

  const [localVideoTrack, setLocalVideoTrack] =
    useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<IMicrophoneAudioTrack | null>(null);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [busy, setBusy] = useState(false);

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [facing, setFacing] = useState<Facing>("user");

  const [isSwitching, setIsSwitching] = useState(false);

  const joinStateRef = useRef<"idle" | "joining" | "joined">("idle");

  const [matchCountdown, setMatchCountdown] = useState<number | null>(null);
  const pendingNextRef = useRef(false);

  // current DB session id (video_sessions)
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Persist latest cam/mic state across joins
  const videoEnabledRef = useRef(videoEnabled);
  const audioEnabledRef = useRef(audioEnabled);

  // Stranger session start time
  const sessionStartRef = useRef<string | null>(null);

  // Stranger rating + note
  const [strangerRating, setStrangerRating] = useState<number | null>(null);
  const [strangerNote, setStrangerNote] = useState<string>("");

  // Popup visibility
  const [showRatingPopup, setShowRatingPopup] = useState(false);

  // Report popup state
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  useEffect(() => {
    videoEnabledRef.current = videoEnabled;
  }, [videoEnabled]);

  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  // ---------- Load Agora SDK + create client ----------
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!AgoraRTC && typeof window !== "undefined") {
        const mod = await import("agora-rtc-sdk-ng");
        AgoraRTC = mod.default ?? mod;
        console.log("[Agora] SDK loaded");
      }
      if (mounted && AgoraRTC && !client) {
        const c = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        setClient(c);
        console.log("[Agora] client created");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [client]);

  /* ------------------------- UI tiny components ------------------------- */

  const Pill = ({
    children,
    bg = "bg-black/60",
  }: {
    children: React.ReactNode;
    bg?: string;
  }) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${bg} text-white text-xs font-medium px-2 py-1 backdrop-blur`}
    >
      {children}
    </span>
  );

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
      <button
        type="button"
        title={title}
        onClick={onClick}
        disabled={disabled}
        className={`${base} ${styleClass}`}
      >
        {children}
      </button>
    );
  };

  /* --------------------- Video track helpers ---------------------------- */

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
    if (!client) return;
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
    if (!AgoraRTC) return [];
    const devs = await AgoraRTC.getCameras();
    setCameras(devs);
    return devs;
  }, []);

  const createLocalTracks = useCallback(
    async (opts?: { cameraId?: string; facingMode?: Facing }) => {
      if (!AgoraRTC) throw new Error("Agora SDK not loaded");

      const mic = await AgoraRTC.createMicrophoneAudioTrack();
      const cam = await AgoraRTC.createCameraVideoTrack(
        opts?.cameraId
          ? { cameraId: opts.cameraId }
          : opts?.facingMode
          ? { facingMode: opts.facingMode }
          : undefined
      );

      // Respect current mic/cam toggles
      await mic.setEnabled(audioEnabledRef.current);
      await cam.setEnabled(videoEnabledRef.current);

      if (videoEnabledRef.current) {
        playLocalInto(cam);
      } else {
        containerRef.current?.replaceChildren();
      }

      setLocalAudioTrack(mic);
      setLocalVideoTrack(cam);
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

  /* ---------------------- Session logging (video_sessions) -------------- */

  const openSession = useCallback(
    async (params: {
      channel: string;
      agoraUid: number;
      startReason?: string;
    }) => {
      try {
        if (!userId) {
          console.warn("[Session] No userId, skipping openSession");
          return;
        }

        const { data, error } = await supabase
          .from("video_sessions")
          .insert({
            user_id: userId,
            channel: params.channel,
            agora_uid: params.agoraUid,
            status: "open",
            start_reason: params.startReason ?? "join",
          })
          .select("id")
          .single();

        if (error) {
          console.error("[Session] openSession error:", error);
          return;
        }

        setSessionId(data.id);
        console.log("[Session] opened", data.id);
      } catch (err) {
        console.error("[Session] openSession exception:", err);
      }
    },
    [userId]
  );

  const closeSession = useCallback(
    async (reason: "leave" | "next" | "disconnect" = "leave") => {
      if (!sessionId) return;
      try {
        const { error } = await supabase
          .from("video_sessions")
          .update({
            status: "closed",
            end_reason: reason,
            ended_at: new Date().toISOString(),
          })
          .eq("id", sessionId);

        if (error) {
          console.error("[Session] closeSession error:", error);
          return;
        }

        console.log("[Session] closed", sessionId, "reason:", reason);
        setSessionId(null);
      } catch (err) {
        console.error("[Session] closeSession exception:", err);
      }
    },
    [sessionId]
  );

  /* ----------------- Stranger session complete (stranger_sessions) ------ */

  const sendStrangerSession = useCallback(
    async (reason: "leave" | "next" | "disconnect") => {
      try {
        const startedAt = sessionStartRef.current;
        const ch = joinedChannel || channel;

        if (!startedAt || !ch) {
          console.warn("[SessionComplete] missing startedAt/channel", {
            startedAt,
            ch,
          });
          return;
        }

        const endedAt = new Date().toISOString();

        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;

        await fetch("/api/strangers/session-complete", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            channel: ch,
            startedAt,
            endedAt,
            userId,
            userName:
              (user?.user_metadata as any)?.full_name ||
              user?.email ||
              "Unknown",
            userEmail: user?.email || null,
            userGender: (user?.user_metadata as any)?.gender ?? "unknown",
            userCountry: (user?.user_metadata as any)?.country ?? "IN",
            userDevice: navigator.userAgent ?? "Unknown",
            ratingGiven: strangerRating,
            notes: strangerNote || null,
            sessionEndReason: reason,
          }),
        });
      } catch (err) {
        console.error("[SessionComplete] failed:", err);
      } finally {
        sessionStartRef.current = null;
        setStrangerRating(null);
        setStrangerNote("");
        setShowRatingPopup(false);
      }
    },
    [channel, joinedChannel, strangerRating, strangerNote, userId]
  );

  /* --------------------- Report submit handler -------------------------- */

  const submitReport = useCallback(
    async (reason: string, note: string) => {
      if (!userId) return;
      const ch = joinedChannel || channel;

      try {
        setReportSubmitting(true);

        await fetch("/api/strangers/report", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            channel: ch,
            userId,
            sessionId,
            reason,
            note: note || null,
          }),
        });

        console.log("[Report] submitted", {
          channel: ch,
          userId,
          reason,
        });
        setShowReportPopup(false);
      } catch (err) {
        console.error("[Report] failed:", err);
      } finally {
        setReportSubmitting(false);
      }
    },
    [channel, joinedChannel, sessionId, userId]
  );

  /* ----------------- Stranger matching (match_queue) -------------------- */

  const getNextStranger = useCallback(async (): Promise<{ channel: string }> => {
    if (!userId) {
      console.error("[match] No userId, cannot match");
      return {
        channel: `tego_fallback_${Math.random().toString(36).slice(2, 8)}`,
      };
    }

    // 1) Clean up this user's old queue rows
    await supabase.from("match_queue").delete().eq("user_id", userId);

    // 2) Remove old rows (older than 5 min)
    const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await supabase
      .from("match_queue")
      .delete()
      .lt("created_at", cutoff)
      .eq("user_id", userId);

    // 3) Try to find a waiting partner
    const { data: partner, error: partnerError } = await supabase
      .from("match_queue")
      .select("*")
      .eq("is_matched", false)
      .neq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (partnerError) {
      console.error("[match] partner find error:", partnerError);
    }

    let nextChannel: string;

    if (partner) {
      nextChannel = partner.channel;

      await supabase
        .from("match_queue")
        .update({
          is_matched: true,
          matched_with: userId,
        })
        .eq("id", partner.id);

      await supabase.from("match_queue").insert({
        user_id: userId,
        channel: nextChannel,
        is_matched: true,
        matched_with: partner.user_id,
      });

      console.log("[match] paired with", partner.user_id, "on", nextChannel);
    } else {
      nextChannel = `tego_${Math.random().toString(36).slice(2, 10)}`;

      await supabase.from("match_queue").insert({
        user_id: userId,
        channel: nextChannel,
        is_matched: false,
        matched_with: null,
      });

      console.log("[match] waiting alone on", nextChannel);
    }

    return { channel: nextChannel };
  }, [userId]);

  /* --------------------- Join / Leave channel --------------------------- */

  const joinChannel = useCallback(
    async (
      ch: string,
      u: number,
      initialFacing: Facing = "user",
      retryOnUidConflict = true
    ) => {
      if (!client || !AgoraRTC) {
        console.warn("[Agora] client/SDK not ready yet");
        return;
      }

      if (
        joinStateRef.current === "joining" ||
        joinStateRef.current === "joined"
      ) {
        console.log(
          "[Agora] joinChannel skipped – already",
          joinStateRef.current
        );
        return;
      }

      setBusy(true);
      joinStateRef.current = "joining";

      try {
        console.log("[Agora] joining", ch, "uid=", u);
        const token = await getToken(ch, u);
        await client.join(AGORA_APP_ID, ch, token, u);

        // Reuse existing tracks if present, else create new
        let mic = localAudioTrack;
        let cam = localVideoTrack;

        if (!mic || !cam) {
          const created = await createLocalTracks({ facingMode: initialFacing });
          mic = created.mic;
          cam = created.cam;
        }

        const tracksToPublish: any[] = [];
        if (audioEnabledRef.current && mic) {
          await mic.setEnabled(true);
          tracksToPublish.push(mic);
        } else if (mic) {
          await mic.setEnabled(false);
        }

        if (videoEnabledRef.current && cam) {
          await cam.setEnabled(true);
          tracksToPublish.push(cam);
        } else if (cam) {
          await cam.setEnabled(false);
        }

        if (tracksToPublish.length) {
          await client.publish(tracksToPublish);
        }

        attachRemoteHandlers();
        setJoinedChannel(ch);
        setFacing(initialFacing);
        joinStateRef.current = "joined";
        console.log("[Agora] joined", ch, "as", u);

        // Call start time
        sessionStartRef.current = new Date().toISOString();

        // New match starts -> reset rating and hide popups
        setStrangerRating(null);
        setShowRatingPopup(false);
        setShowReportPopup(false);

        await openSession({ channel: ch, agoraUid: u, startReason: "join" });
      } catch (err: any) {
        console.error("[Agora] joinChannel error:", err);

        const msg = String(err?.message || err);
        const code = (err && (err.code || err.name)) as string | undefined;

        if (
          retryOnUidConflict &&
          (code === "UID_CONFLICT" || msg.includes("UID_CONFLICT"))
        ) {
          const newUid = randomAgoraUid();
          console.warn("[Agora] UID_CONFLICT, retrying with new uid:", newUid);
          joinStateRef.current = "idle";
          setUid(newUid);
          return joinChannel(ch, newUid, initialFacing, false);
        }

        joinStateRef.current = "idle";
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [
      attachRemoteHandlers,
      client,
      createLocalTracks,
      getToken,
      openSession,
      localAudioTrack,
      localVideoTrack,
    ]
  );

  const leaveChannel = useCallback(
    async (
      reason: "leave" | "next" | "disconnect" = "leave",
      opts?: { destroyTracks?: boolean }
    ) => {
      const destroyTracks = opts?.destroyTracks ?? true;

      // First, send stranger_sessions log
      await sendStrangerSession(reason);

      if (joinStateRef.current === "idle" || !client) {
        await closeSession(reason);
        return;
      }

      setBusy(true);
      try {
        try {
          await client.unpublish();
        } catch {}

        if (destroyTracks) {
          await destroyLocalTracks();
        }

        try {
          await client.leave();
        } catch {}

        remoteRef.current?.replaceChildren();
        setJoinedChannel(null);
        joinStateRef.current = "idle";
        console.log("[Agora] left channel, destroyTracks=", destroyTracks);
      } finally {
        setBusy(false);
        await closeSession(reason);
      }
    },
    [client, destroyLocalTracks, closeSession, sendStrangerSession]
  );

  /* --------------------- Camera facing helpers -------------------------- */

  const guessDeviceForFacing = useCallback(
    (want: Facing) => {
      const needles =
        want === "user"
          ? ["front", "user", "facing front"]
          : ["back", "rear", "environment"];
      const lowered = cameras.map((d) => ({
        ...d,
        _label: (d.label || "").toLowerCase(),
      }));
      const hit = lowered.find(
        (d) =>
          d.kind === "videoinput" &&
          needles.some((n) => d._label.includes(n))
      );
      return hit?.deviceId;
    },
    [cameras]
  );

  const switchToFacing = useCallback(
    async (want: Facing) => {
      if (!localVideoTrack || !client) return;
      setBusy(true);
      try {
        const devId = guessDeviceForFacing(want);
        if (devId) {
          try {
            await localVideoTrack.setDevice(devId);
            if (videoEnabledRef.current) {
              playLocalInto(localVideoTrack);
            } else {
              containerRef.current?.replaceChildren();
            }
            setFacing(want);
            return;
          } catch {}
        }
        try {
          await client.unpublish(localVideoTrack);
        } catch {}

        localVideoTrack.stop();
        localVideoTrack.close();

        if (!AgoraRTC) return;
        const newCam = await AgoraRTC.createCameraVideoTrack({
          facingMode: want,
        });

        // Respect current cam toggle
        await newCam.setEnabled(videoEnabledRef.current);
        if (videoEnabledRef.current) {
          await client.publish(newCam);
          playLocalInto(newCam);
        } else {
          containerRef.current?.replaceChildren();
        }

        setLocalVideoTrack(newCam);
        setFacing(want);
        await refreshDevices();
      } finally {
        setBusy(false);
      }
    },
    [client, guessDeviceForFacing, localVideoTrack, playLocalInto, refreshDevices]
  );

  const toggleFacing = useCallback(async () => {
    const next = facing === "user" ? "environment" : "user";
    await switchToFacing(next);
  }, [facing, switchToFacing]);

  /* ----------------------- Next / Skip logic ---------------------------- */

  const nextStranger = useCallback(async () => {
    // Skip / Next: DO NOT destroy local tracks
    await leaveChannel("next", { destroyTracks: false });

    const { channel: newChannel } = await getNextStranger();
    setChannel(newChannel);

    const nextUid = randomAgoraUid();
    setUid(nextUid);

    await joinChannel(newChannel, nextUid, facing);
  }, [leaveChannel, getNextStranger, joinChannel, facing]);

  const queueNextMatch = useCallback(() => {
    if (matchCountdown !== null || pendingNextRef.current) return;
    pendingNextRef.current = true;
    setIsSwitching(true);
    setMatchCountdown(6);
  }, [matchCountdown]);

  const skipStranger = useCallback(() => {
    if (busy || isSwitching || matchCountdown !== null) return;
    queueNextMatch();
  }, [busy, isSwitching, matchCountdown, queueNextMatch]);

  useEffect(() => {
    if (matchCountdown === null) return;

    if (matchCountdown === 0) {
      setMatchCountdown(null);
      (async () => {
        try {
          await nextStranger();
        } finally {
          pendingNextRef.current = false;
          setIsSwitching(false);
        }
      })();
      return;
    }

    const id = setTimeout(() => {
      setMatchCountdown((c) => (c === null ? null : c - 1));
    }, 1000);

    return () => clearTimeout(id);
  }, [matchCountdown, nextStranger]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "s" || (e.shiftKey && key === "n")) {
        e.preventDefault();
        skipStranger();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skipStranger]);

  /* -------------------- Initial join + cleanup -------------------------- */

  useEffect(() => {
    // Do not match if there is no userId
    if (!client || !userId) return;
    let cancelled = false;

    (async () => {
      try {
        const { channel: ch } = await getNextStranger();
        if (cancelled) return;
        setChannel(ch);

        await joinChannel(ch, uid, "user");
        if (!cancelled) {
          await refreshDevices();
        }
      } catch (err) {
        console.error("[Agora] initial join error:", err);
      }
    })();

    return () => {
      cancelled = true;
      (async () => {
        try {
          // Final cleanup: destroyTracks = true
          await leaveChannel("disconnect", { destroyTracks: true });
        } catch (err) {
          console.warn("[Agora] leave on unmount error:", err);
        } finally {
          client?.removeAllListeners?.();
        }
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, userId]);

  /* --------- Mid-call rating popup trigger (e.g. 20s after join) -------- */

  useEffect(() => {
    // When a new channel is joined, show the rating popup after some time
    if (!joinedChannel) return;
    const timeout = setTimeout(() => {
      setShowRatingPopup(true);
    }, 20_000); // show after 20 seconds

    return () => clearTimeout(timeout);
  }, [joinedChannel]);

  /* ---------------------- Simple toggles + UI data ---------------------- */

  const toggleVideo = async (enable: boolean) => {
    if (!localVideoTrack) {
      setVideoEnabled(enable);
      videoEnabledRef.current = enable;
      return;
    }
    await localVideoTrack.setEnabled(enable);
    setVideoEnabled(enable);
    videoEnabledRef.current = enable;
  };

  const toggleAudio = async (enable: boolean) => {
    if (!localAudioTrack) {
      setAudioEnabled(enable);
      audioEnabledRef.current = enable;
      return;
    }
    await localAudioTrack.setEnabled(enable);
    setAudioEnabled(enable);
    audioEnabledRef.current = enable;
  };

  const leave = async () => {
    await leaveChannel("leave", { destroyTracks: true });
    onLeave?.();
  };

  const statusTone = joinedChannel ? "bg-green-600/80" : "bg-black/60";
  const visibleChannel = joinedChannel || channel || "…";

  /* ----------------------------- JSX ------------------------------------ */

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
        {/* Rating Popup */}
        <RatingPopup
          open={showRatingPopup}
          currentRating={strangerRating}
          onRate={(star) => setStrangerRating(star)}
          onClose={() => setShowRatingPopup(false)}
        />

        {/* Report Popup */}
        <ReportPopup
          open={showReportPopup}
          onClose={() => setShowReportPopup(false)}
          onSubmit={submitReport}
          submitting={reportSubmitting}
        />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 sm:px-4 py-2">
          <div className="flex flex-col items-start gap-1">
            <Pill>
              <User className="h-3.5 w-3.5" />
              Stranger
            </Pill>

            <div className="md:hidden">
              <Pill bg="bg-black/70">
                <span className="text-[10px]">{visibleChannel}</span>
                <span className="text-white/30 mx-1">•</span>
                <span className="text-[10px]">#{uid}</span>
              </Pill>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Pill bg={statusTone}>
              <Dot className="h-4 w-4" />
              {joinedChannel ? "Live" : "Ready"}
            </Pill>
            {!audioEnabled && (
              <Pill bg="bg-yellow-600/80">
                <MicOff className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Muted</span>
              </Pill>
            )}
            {!videoEnabled && (
              <Pill bg="bg-red-600/80">
                <CameraOff className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Camera Off</span>
              </Pill>
            )}
          </div>
        </div>

        {/* RTC mini status */}
        <div className="absolute top-12 right-3 sm:right-4 z-20">
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-200 bg-black/40 backdrop-blur rounded-full px-3 py-1.5">
            <Wifi className="h-4 w-4 opacity-80" />
            <span>RTC</span>
            {(busy || isSwitching || matchCountdown !== null) && (
              <>
                <span className="mx-1 text-gray-400">•</span>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-semibold">
                  {matchCountdown !== null
                    ? `Next in ${matchCountdown}s`
                    : "Working…"}
                </span>
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

            {/* Top-left controls for Stranger (label + report) */}
            <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
              <Pill>
                <User className="h-3.5 w-3.5" />
                Stranger
              </Pill>
              <button
                type="button"
                onClick={() => setShowReportPopup(true)}
                className="inline-flex items-center gap-1 rounded-full bg-red-500/90 text-black text-[11px] font-semibold px-2.5 py-1 shadow-lg hover:bg-red-400"
              >
                <Flag className="h-3.5 w-3.5" />
                <span>Report</span>
              </button>
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

        {/* Right side controls (Skip / Next / Mic / Cam) */}
        <div className="absolute right-3 sm:right-4 bottom-28 md:bottom-8 z-30 flex flex-col items-center gap-3">
          {/* Skip / Next buttons */}
          <>
            <RoundBtn
              onClick={skipStranger}
              title="Skip (S or Shift+N)"
              disabled={busy || isSwitching || matchCountdown !== null}
            >
              {isSwitching && matchCountdown !== null ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SkipForward className="h-5 w-5" />
              )}
            </RoundBtn>
            <span className="text-[10px] text-white/90 drop-shadow">
              Skip
            </span>

            <RoundBtn
              onClick={queueNextMatch}
              title="Next"
              disabled={busy || isSwitching || matchCountdown !== null}
            >
              <Play className="h-5 w-5" />
            </RoundBtn>
            <span className="text-[10px] text-white/90 drop-shadow">
              {matchCountdown !== null ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-white/20 bg-white/10">
                  Next in{" "}
                  <span className="ml-1 font-semibold">{matchCountdown}s</span>
                </span>
              ) : (
                "Next"
              )}
            </span>
          </>

          {/* Camera toggle */}
          <RoundBtn
            onClick={() => toggleVideo(!videoEnabled)}
            title={videoEnabled ? "Turn camera off" : "Turn camera on"}
          >
            {videoEnabled ? (
              <Camera className="h-5 w-5" />
            ) : (
              <CameraOff className="h-5 w-5" />
            )}
          </RoundBtn>
          <span className="text-[10px] text-white/90 drop-shadow">
            {videoEnabled ? "Camera On" : "Camera Off"}
          </span>

          {/* Mic toggle */}
          <RoundBtn
            onClick={() => toggleAudio(!audioEnabled)}
            title={audioEnabled ? "Mute microphone" : "Unmute microphone"}
          >
            {audioEnabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </RoundBtn>
          <span className="text-[10px] text-white/90 drop-shadow">
            {audioEnabled ? "Mic On" : "Muted"}
          </span>
        </div>

        {/* Bottom center controls */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-20 flex items-center gap-3">
          <RoundBtn onClick={toggleFacing} title="Flip camera (Front/Back)">
            <RefreshCw className="h-4 w-4" />
          </RoundBtn>

          <RoundBtn intent="danger" onClick={leave} title="Leave">
            <Square className="h-4 w-4" />
          </RoundBtn>
        </div>

        {/* Bottom left info */}
        <div className="absolute left-3 sm:left-4 bottom-4 z-20 hidden md:block">
          <div className="flex items-center gap-2 text-[11px] text-white/80 bg-black/40 backdrop-blur rounded-full px-3 py-1.5 ring-1 ring-white/10">
            <span className="font-medium">{visibleChannel}</span>
            <span className="text-white/30">•</span>
            <span>#{uid}</span>
          </div>
        </div>

        {/* Keyboard shortcut hint (desktop) */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-20 z-20 hidden md:block">
          <div className="text-[10px] text-white/70 bg-black/30 backdrop-blur rounded-full px-3 py-1 ring-1 ring-white/10">
            Press <span className="font-bold text-white">S</span> or{" "}
            <span className="font-bold text-white">Shift+N</span> to skip
          </div>
        </div>
      </div>
    </div>
  );
}
