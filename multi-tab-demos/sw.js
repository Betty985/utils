
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

self.addEventListener('message', (event) => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(event.data);
    });
  });
});
