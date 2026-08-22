

function getTabId() {
  if (!window._tabId) {
    window._tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  }
  return window._tabId;
}

export function init() {
  const worker = new SharedWorker('./workers/worker.js', { name: 'demo_sw' });
  const input = document.getElementById('sw-input');
  const sendBtn = document.getElementById('sw-send');
  const msgBox = document.getElementById('sw-msgs');

  function add(senderId, text) {
    const isSelf = senderId === getTabId();
    const label = isSelf ? '我' : senderId;
    const div = document.createElement('div');
    div.className = 'msg-item';
    div.innerHTML = `<span>[${label}] ${text}</span><span class="timestamp">${new Date().toLocaleTimeString()}</span>`;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  function send(text) {
    if (!text.trim()) return;
    const p = { senderId: getTabId(), text: text.trim() };
    worker.port.postMessage(p);
    add(p.senderId, p.text);
    input.value = '';
  }

  worker.port.onmessage = (e) => {
    const d = e.data;
    if (d.type === 'handshake') return;
    add(d.senderId, d.text);
  };
  worker.port.start();

  sendBtn.onclick = () => send(input.value);
  input.onkeydown = (e) => { if (e.key === 'Enter') send(input.value); };
}