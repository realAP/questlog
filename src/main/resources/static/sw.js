// Service Worker: macht die App installierbar und hält statische Dateien vor.
// Seiten kommen immer frisch vom Server, damit Anmeldung und Quest-Zustand stimmen.
const CACHE = "questlog-static-v2";
const STATIC = /^\/(css|js|icons)\//;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || !STATIC.test(url.pathname)) {
    return;
  }
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      const fresh = fetch(event.request).then((response) => {
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      });
      return cached || fresh;
    })
  );
});

// Web Push: jede Nachricht wird angezeigt, iOS verlangt das. Ton kommt vom System.
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Questlog", {
      body: data.body,
      icon: "/icons/icon-192.png",
      tag: data.tag,
      data: { url: data.url ?? "/" },
    })
  );
});

// Antippen öffnet die Quest, ein offenes Fenster wird wiederverwendet.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url ?? "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows[0];
      if (!open) return self.clients.openWindow(url);
      return open.focus().then((client) => client.navigate(url));
    })
  );
});
