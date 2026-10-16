// Web Push service worker (no Firebase). Registered by the app with scope
// "./push/" so it never clashes with Flutter's own service worker; it only
// shows notifications and opens the app when one is tapped.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// App root, e.g. https://host/lakshya-centre-dev/
const APP_URL = new URL('./', self.location).href;

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { body: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Lakshya Centre', {
      body: data.body || '',
      icon: APP_URL + 'icons/Icon-192.png',
      badge: APP_URL + 'icons/Icon-192.png',
      tag: data.tag || undefined,
      renotify: !!data.tag,
      data: { url: APP_URL },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || APP_URL;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // Dev and prod share the github.io origin: only reuse a window of this app.
    const open = windows.find((w) => w.url.startsWith(url));
    if (open) return open.focus();
    return self.clients.openWindow(url);
  })());
});
