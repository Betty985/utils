

function getTabId() {
  if (!window._tabId) {
    window._tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  }
  return window._tabId;
}

export function init() {
  const ch = new BroadcastChannel('demo_bc');
  const input = document.getElementById('bc-input');
  const sendBtn = document.getElementById('bc-send');
  const msgBox = document.getElementById('bc-msgs');

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
    ch.postMessage(p);
    add(p.senderId, p.text);
    input.value = '';
  }

  ch.onmessage = (e) => {
    const p = e.data;
    add(p.senderId, p.text);
  };

  sendBtn.onclick = () => send(input.value);
  input.onkeydown = (e) => { if (e.key === 'Enter') send(input.value); };
}