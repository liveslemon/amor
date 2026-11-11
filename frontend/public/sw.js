// Minglee Progressive Web App Service Worker

const API_BASE =
  self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1"
    ? "http://localhost:4000"
    : "https://minglee-rvfi.onrender.com";

function reportNotificationClick(id) {
  if (!id) return Promise.resolve();
  return fetch(`${API_BASE}/notifications/${id}/click`, { method: "POST" }).catch(() => {});
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "Minglee";
    const options = {
      body: data.body || "You have a new update!",
      icon: data.icon || "/icon-192.png",
      badge: data.badge || "/icon-192.png",
      data: {
        url: data.url || "/date",
        id: data.id,
      },
      tag: data.tag || "minglee-push",
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (_e) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("Minglee", {
        body: text,
        icon: "/icon-192.png",
        data: { url: "/date" },
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || "/date";
  const notificationId = event.notification.data && event.notification.data.id;

  event.waitUntil(
    Promise.all([
      reportNotificationClick(notificationId),
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
        for (const client of windowClients) {
          if ("focus" in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      }),
    ])
  );
});
