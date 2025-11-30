// public/sw.js

const PROD_URL = "https://tego.live";
const LOCAL_URL = "http://localhost:3000";

// If running on localhost → LOCAL_URL, otherwise PROD_URL
const BASE_URL =
  self.location.hostname === "localhost" ? LOCAL_URL : PROD_URL;

console.log("🔗 Service Worker Base URL:", BASE_URL);

self.addEventListener("install", (event) => {
  console.log("✅ Service worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("✅ Service worker activated");
});

// Handle push notifications
self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error("❌ Push data parse error", e);
  }

  const title = data.title || "Notification";
  const body = data.body || "";
  const url = data.url || BASE_URL;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/logo.png",
      data: { url },
    })
  );
});

// Click on notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || BASE_URL;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(
      (clientList) => {
        for (const client of clientList) {
          if (client.url.startsWith(url) && "focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }
    )
  );
});
