

function getTabId() {
  if (!window._tabId) {
    window._tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  }
  return window._tabId;
}

export function init() {
  const KEY = 'demo_ls_msgs';
  const input = document.getElementById('ls-input');
  const sendBtn = document.getElementById('ls-send');
  const msgBox = document.getElementById('ls-msgs');

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
    const p = { senderId: getTabId(), text: text.trim(), time: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(p));
    add(p.senderId, p.text);
    input.value = '';
  }

  window.removeEventListener('storage', window._lsH);
  window._lsH = (e) => {
    if (e.key === KEY && e.newValue) {
      try {
        const p = JSON.parse(e.newValue);
        add(p.senderId, p.text);
      } catch (_) {}
    }
  };
  window.addEventListener('storage', window._lsH);

  sendBtn.onclick = () => send(input.value);
  input.onkeydown = (e) => { if (e.key === 'Enter') send(input.value); };
}