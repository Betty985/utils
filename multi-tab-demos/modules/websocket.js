

function getTabId() {
  if (!window._tabId) {
    window._tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  }
  return window._tabId;
}

export function init() {
  let ws = null;
  const connectBtn = document.getElementById('ws-connect');
  const disconnectBtn = document.getElementById('ws-disconnect');
  const statusEl = document.getElementById('ws-status');
  const input = document.getElementById('ws-input');
  const sendBtn = document.getElementById('ws-send');
  const msgBox = document.getElementById('ws-msgs');

  function add(senderId, text) {
    const isSelf = senderId === getTabId();
    const label = isSelf ? '我' : senderId;
    const div = document.createElement('div');
    div.className = 'msg-item';
    div.innerHTML = `<span>[${label}] ${text}</span><span class="timestamp">${new Date().toLocaleTimeString()}</span>`;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  function setStatus(text, color = 'black') {
    statusEl.textContent = text;
    statusEl.style.color = color;
  }

  connectBtn.onclick = () => {
    ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
      setStatus('已连接 ✅', 'green');
      connectBtn.disabled = true;
      disconnectBtn.disabled = false;
      input.disabled = false;
      sendBtn.disabled = false;
      add('系统', 'WebSocket 已连接');
    };
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.system) {
          add('系统', data.text);
        } else if (data.senderId && data.text) {
          add(data.senderId, data.text);
        } else {
          add('未知', e.data);
        }
      } catch (_) {
        add('未知', e.data);
      }
    };
    ws.onclose = () => {
      setStatus('已断开', 'red');
      connectBtn.disabled = false;
      disconnectBtn.disabled = true;
      input.disabled = true;
      sendBtn.disabled = true;
      add('系统', '连接已关闭');
      ws = null;
    };
    ws.onerror = () => setStatus('错误 ❌', 'red');
  };

  disconnectBtn.onclick = () => { if (ws) ws.close(); };

  function send(text) {
    if (!ws || ws.readyState !== WebSocket.OPEN) { alert('未连接'); return; }
    if (!text.trim()) return;
    const p = { senderId: getTabId(), text: text.trim() };
    ws.send(JSON.stringify(p));
    add(p.senderId, p.text);
    input.value = '';
  }

  sendBtn.onclick = () => send(input.value);
  input.onkeydown = (e) => { if (e.key === 'Enter') send(input.value); };
}