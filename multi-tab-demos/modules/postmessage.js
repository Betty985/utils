function getTabId() {
  if (!window._tabId) {
    window._tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  }
  return window._tabId;
}

export function init() {
  let child = null;
  const openBtn = document.getElementById('pm-open');
  const input = document.getElementById('pm-input');
  const sendBtn = document.getElementById('pm-send');
  const msgBox = document.getElementById('pm-msgs');

  function add(senderId, text, from = null) {
    const label = senderId === getTabId() ? '我' : senderId;
    const div = document.createElement('div');
    div.className = 'msg-item';
    div.innerHTML = `<span>[${label}] ${text}</span><span class="timestamp">${new Date().toLocaleTimeString()}</span>`;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  openBtn.onclick = () => {
    const url = window.location.href + '?child=true';
    child = window.open(url, '_blank', 'width=500,height=400');
    if (child) add('系统', '已打开子窗口', '系统');
    else alert('请允许弹出窗口');
  };

  function send(text) {
    if (!child || child.closed) { alert('子窗口已关闭'); return; }
    if (!text.trim()) return;
    const p = { senderId: getTabId(), text: text.trim() };
    child.postMessage(p, '*');
    add(p.senderId, p.text);
    input.value = '';
  }

  window.addEventListener('message', (e) => {
    const d = e.data;
    if (d?.senderId && d?.text) {
      add(d.senderId, d.text);
    }
  });

  sendBtn.onclick = () => send(input.value);
  input.onkeydown = (e) => { if (e.key === 'Enter') send(input.value); };

  // 子窗口逻辑
  if (window.location.search.includes('child=true')) {

    document.body.innerHTML = `
  <h2>子窗口</h2>
  <div>
    <label>发送给父窗口</label>
    <input type="text" id="child-input" placeholder="输入消息...">
    <button id="child-send">发送</button>
  </div>
  <div id="child-msgs" class="msg-box"></div>
  <button onclick="window.close()">关闭</button>
`;

    // 绑定发送事件
    const childInput = document.getElementById('child-input');
    const childSend = document.getElementById('child-send');
    childSend.onclick = () => {
      const text = childInput.value.trim();
      if (!text) return;
      const target = window.opener;
      if (target) {
        target.postMessage({ senderId: getTabId(), text }, '*');
        // 在子窗口也显示自己发的消息
        const div = document.createElement('div');
        div.className = 'msg-item';
        div.innerHTML = `[我] ${text} <span class="timestamp">${new Date().toLocaleTimeString()}</span>`;
        document.getElementById('child-msgs').appendChild(div);
        childInput.value = '';
      }
    };
    const box = document.getElementById('child-msgs');
    window.addEventListener('message', (e) => {
      const d = e.data;
      if (d?.senderId && d?.text) {
        const div = document.createElement('div');
        div.className = 'msg-item';
        const label = d.senderId === getTabId() ? '我' : d.senderId;
        div.innerHTML = `[${label}] ${d.text} <span class="timestamp">${new Date().toLocaleTimeString()}</span>`;
        box.appendChild(div);
        // 回复父窗口
        if (e.source) {
          e.source.postMessage({ senderId: getTabId(), text: '✅ 已收到: ' + d.text }, '*');
        }
      }
    });
  }
}