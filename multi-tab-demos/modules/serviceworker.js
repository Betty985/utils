

function getTabId() {
  if (!window._tabId) {
    window._tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  }
  return window._tabId;
}

export function init() {
  let reg = null;
  const registerBtn = document.getElementById('svc-register');
  const statusEl = document.getElementById('svc-status');
  const input = document.getElementById('svc-input');
  const sendBtn = document.getElementById('svc-send');
  const msgBox = document.getElementById('svc-msgs');

  function add(senderId, text) {
    const isSelf = senderId === getTabId();
    const label = isSelf ? '我' : senderId;
    const div = document.createElement('div');
    div.className = 'msg-item';
    div.innerHTML = `<span>[${label}] ${text}</span><span class="timestamp">${new Date().toLocaleTimeString()}</span>`;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  registerBtn.onclick = async () => {
    try {
      const r = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      reg = r;
      statusEl.textContent = '已注册 ✅';
      statusEl.style.color = 'green';
      input.disabled = false;
      sendBtn.disabled = false;
      navigator.serviceWorker.addEventListener('message', (e) => {
        const d = e.data;
        if (d?.senderId && d?.text) add(d.senderId, d.text);
      });
    } catch (err) {
      statusEl.textContent = '注册失败 ❌';
      statusEl.style.color = 'red';
      alert('请确保在 localhost 或 HTTPS 环境下运行。');
    }
  };

  function send(text) {
    if (!text.trim()) return;
    if (reg?.active) {
      const p = { senderId: getTabId(), text: text.trim() };
      reg.active.postMessage(p);
      add(p.senderId, p.text);
      input.value = '';
    } else alert('请先注册 Service Worker');
  }

  sendBtn.onclick = () => send(input.value);
  input.onkeydown = (e) => { if (e.key === 'Enter') send(input.value); };
}