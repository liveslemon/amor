/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "Minglee";
    const options: NotificationOptions = {
      body: data.body || "You have a new update!",
      icon: data.icon || "/match-poster.png",
      badge: data.badge || "/match-poster.png",
      data: {
        url: data.url || "/date",
      },
      tag: data.tag || "minglee-push",
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (_e) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("Minglee", {
        body: text,
        icon: "/match-poster.png",
        data: { url: "/date" },
      })
    );
  }
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || "/date";

  event.waitUntil(
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
    })
  );
});

export {};
