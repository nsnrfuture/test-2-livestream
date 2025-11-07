"use client";
import { useEffect, useRef, useState } from "react";
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteVideoTrack, IRemoteAudioTrack } from "agora-rtc-sdk-ng";
import { AGORA_APP_ID } from "@/lib/agora";

type Props = {
  channel: string;
  uid: number;
  getToken: (channel: string, uid: number) => Promise<string>;
  onLeave?: () => void;
};

export default function VideoCall({ channel, uid, getToken, onLeave }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);

  const [client] = useState<IAgoraRTCClient>(() => AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }));
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      const token = await getToken(channel, uid);
      await client.join(AGORA_APP_ID, channel, token, uid);

      const mic = await AgoraRTC.createMicrophoneAudioTrack();
      const cam = await AgoraRTC.createCameraVideoTrack();

      setLocalAudioTrack(mic);
      setLocalVideoTrack(cam);

      const localContainer = document.createElement("div");
      localContainer.style.width = "100%";
      localContainer.style.height = "100%";
      localContainer.style.objectFit = "cover";
      containerRef.current?.appendChild(localContainer);
      cam.play(localContainer);

      await client.publish([mic, cam]);

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          const remoteVideoTrack = user.videoTrack as IRemoteVideoTrack;
          const el = document.createElement("div");
          el.style.width = "100%";
          el.style.height = "100%";
          remoteRef.current?.replaceChildren(el);
          remoteVideoTrack.play(el);
        }
        if (mediaType === "audio") {
          const remoteAudioTrack = user.audioTrack as IRemoteAudioTrack;
          remoteAudioTrack.play();
        }
      });

      client.on("user-unpublished", () => {
        remoteRef.current?.replaceChildren();
      });
    };

    start();

    return () => {
      mounted = false;
      (async () => {
        try {
          if (localVideoTrack) localVideoTrack.stop();
          if (localAudioTrack) localAudioTrack.stop();
          await client.unpublish();
          await client.leave();
        } catch {}
      })();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leave = async () => {
    if (localVideoTrack) localVideoTrack.stop();
    if (localAudioTrack) localAudioTrack.stop();
    await client.unpublish();
    await client.leave();
    onLeave?.();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full h-[70vh]">
      <div ref={remoteRef} className="bg-black rounded-xl overflow-hidden" />
      <div ref={containerRef} className="bg-black rounded-xl overflow-hidden" />
      <div className="md:col-span-2 flex justify-center gap-3">
        <button
          onClick={() => localVideoTrack?.setEnabled(false)}
          className="px-4 py-2 bg-gray-200 rounded-md"
        >
          Cam Off
        </button>
        <button
          onClick={() => localVideoTrack?.setEnabled(true)}
          className="px-4 py-2 bg-gray-200 rounded-md"
        >
          Cam On
        </button>
        <button
          onClick={() => localAudioTrack?.setEnabled(false)}
          className="px-4 py-2 bg-gray-200 rounded-md"
        >
          Mute
        </button>
        <button
          onClick={() => localAudioTrack?.setEnabled(true)}
          className="px-4 py-2 bg-gray-200 rounded-md"
        >
          Unmute
        </button>
        <button
          onClick={leave}
          className="px-4 py-2 bg-red-600 text-white rounded-md"
        >
          Leave
        </button>
      </div>
    </div>
  );
}
