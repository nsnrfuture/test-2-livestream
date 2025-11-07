"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import VideoCall from "@/components/VideoCall";

async function fetchToken(channel: string, uid: number) {
  const res = await fetch("/api/token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ channel, uid }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "token error");
  return data.token as string;
}

export default function CallPage() {
  const params = useParams<{ channel: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const uid = Number(sp.get("uid") || Math.floor(Math.random() * 1_000_000));

  return (
    <main className="min-h-screen p-4 md:p-10 bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Connected: {params.channel}</h2>
      <VideoCall
        channel={params.channel}
        uid={uid}
        getToken={fetchToken}
        onLeave={() => router.replace("/")}
      />
    </main>
  );
}
