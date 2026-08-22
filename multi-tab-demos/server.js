
const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket Server Running');
});

const wss = new WebSocket.Server({ server });
const clients = new Set();

wss.on('connection', (ws) => {
  const clientId = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  clients.add(ws);
  console.log(`🟢 客户端连接: ${clientId}，当前连接数: ${clients.size}`);
  broadcast({ system: true, text: `新用户加入 (${clients.size} 人在线)` }, ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`📨 收到消息: ${data.text || message}`);
      broadcast({ 
        senderId: data.senderId || 'anonymous',
        text: data.text || message.toString(),
        time: new Date().toLocaleTimeString(),
        server: true
      }, ws);
    } catch (e) {
      broadcast({ 
        text: message.toString(),
        time: new Date().toLocaleTimeString(),
        server: true
      }, ws);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`🔴 客户端断开，剩余: ${clients.size}`);
    broadcast({ system: true, text: `用户离开 (${clients.size} 人在线)` });
  });

  ws.on('error', (err) => {
    console.error('WebSocket 错误:', err);
    clients.delete(ws);
  });
});

function broadcast(data, exclude = null) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      try { client.send(payload); } catch (_) {}
    }
  }
}

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket 服务器已启动: ws://localhost:${PORT}`);
  console.log(`📡 请打开 index.html 并切换到 WebSocket 方案测试`);
});

process.on('SIGINT', () => {
  console.log('\n👋 服务器关闭');
  wss.close();
  server.close();
  process.exit(0);
});
