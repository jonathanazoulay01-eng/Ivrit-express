// Service worker : fonctionne hors connexion + rappel quotidien
const VERSION = "ivrit-v2";
const FILES = ["./", "index.html", "style.css", "data.js", "data2.js", "app.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== "ivrit-state").map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});

function today() { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

async function maybeRemind() {
  const c = await caches.open("ivrit-state");
  const r = await c.match("./__state");
  if (!r) return;
  const st = await r.json();
  if (!st.remindOn || st.lastDay === today()) return;
  if (new Date().getHours() < st.remindHour) return;
  const msgs = ["Ton défi d'hébreu t'attend ! 🎯", "יַאלְלָה ! 5 minutes d'hébreu ? 💪", "Ne perds pas ta série 🔥"];
  await self.registration.showNotification("Ivrit Express", {
    body: (st.name ? st.name + ", " : "") + msgs[Math.floor(Math.random() * msgs.length)] + (st.streak ? " (série : " + st.streak + ")" : ""),
    icon: "icon-192.png", badge: "icon-192.png", tag: "daily"
  });
}
self.addEventListener("periodicsync", (e) => { if (e.tag === "daily-reminder") e.waitUntil(maybeRemind()); });
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then((list) => list.length ? list[0].focus() : self.clients.openWindow("./")));
});
