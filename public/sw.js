/* Malique Rider — web-push service worker.
 * Static file served by Next from /public so it registers at scope "/" and
 * survives the app being closed/backgrounded. On push we surface a system
 * notification; tapping it focuses an existing tab or opens the active queue.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {
    title: "Malique Rider",
    body: "New activity — open the app to see your deliveries.",
    url: "/dashboard/active",
  };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* payload wasn't JSON — keep the defaults */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/dashboard/active";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
