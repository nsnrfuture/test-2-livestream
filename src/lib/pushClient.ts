// lib/pushClient.ts
export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export async function subscribeUserToPush(userId: string) {
  if (!userId) return;

  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    console.log("Push not supported");
    return;
  }

  // Ask for permission
  const permission = await Notification.requestPermission();
  console.log("Permission:", permission);
  if (permission !== "granted") return;

  // Service worker ready
  const reg = await navigator.serviceWorker.ready;

  // Existing subscription
  const existing = await reg.pushManager.getSubscription();
  if (existing) {
    console.log("Already subscribed");
    return;
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    console.error("Missing VAPID PUBLIC KEY");
    return;
  }

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const json = sub.toJSON();

  // Save to Supabase DB
  const res = await fetch("/api/push/save-subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      endpoint: sub.endpoint,
      keys: json.keys,
    }),
  });

  console.log("Saved subscription:", await res.json());
}
