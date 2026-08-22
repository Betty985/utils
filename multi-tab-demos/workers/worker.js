
const ports = new Set();
self.onconnect = (e) => {
  const port = e.ports[0];
  ports.add(port);
  port.postMessage({ type: 'handshake' });
  port.onmessage = (event) => {
    const data = event.data;
    for (const p of ports) {
      if (p !== port) {
        try { p.postMessage(data); } catch (_) {}
      }
    }
  };
  port.onmessageerror = () => ports.delete(port);
};
