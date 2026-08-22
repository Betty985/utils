# 多标签页通信方案 

## 📁 目录结构

```
multi-tab-demos/
├── index.html          # 主入口页面
├── common.css          # 公用样式
├── package.json        # npm 依赖管理
├── README.md           # 本文档
├── server/             # 后端相关
│   └── server.js       # WebSocket 广播服务器
├── modules/            # 前端通信方案模块
│   ├── localstorage.js
│   ├── broadcast.js
│   ├── sharedworker.js
│   ├── serviceworker.js
│   ├── postmessage.js
│   └── websocket.js
└── workers/            # Worker 脚本
    ├── worker.js       # SharedWorker 脚本
    └── sw.js           # Service Worker 脚本
```

---

## 🧭 方案选型决策树

```mermaid
flowchart TD
    A[开始选型] --> B{所有标签页是否<br>完全同源？<br>（协议+域名+端口完全一致）}

    B -->|是| C{是否允许搭建服务器？}
    C -->|是| D{是否需要跨设备/跨域<br>或持久化消息？}
    D -->|是| E[🌐 WebSocket]
    D -->|否| F{是否需要节省服务器连接<br>（多个标签页共用1个WS）？}
    F -->|是| G[🧠 SharedWorker]
    F -->|否| H{是否需要离线广播？}
    H -->|是| I[⚙️ Service Worker]
    H -->|否| J{只需简单状态同步？<br>（登录态/主题/配置）}
    J -->|是| K[💾 LocalStorage]
    J -->|否| L[📶 Broadcast Channel]

    C -->|否| M{是否支持现代浏览器？<br>（Chrome 60+/Edge 79+/Safari 16+）}
    M -->|否（需兼容IE）| N[💾 LocalStorage<br>（唯一可靠方案）]
    M -->|是| O{只需简单状态同步？}
    O -->|是| P[💾 LocalStorage]
    O -->|否| Q[📶 Broadcast Channel]

    B -->|否| R{是否存在窗口引用关系？<br>（window.open / iframe）}
    R -->|是| S[📤 window.postMessage<br>（父子/嵌入场景）]
    R -->|否| T{是否允许搭建服务器？}
    
    T -->|是| U[🌐 WebSocket<br>（跨域广播）]

    T -->|否| V{是否能在目标域部署<br>一个代理页面？}
    V -->|是| W[🔄 postMessage + iframe 代理<br>（如 sysend.js）]
    
    V -->|否| Z{浏览器是否支持<br>跨域隔离 + SharedArrayBuffer？<br>（需配置 COOP/COEP 头）}
    Z -->|是| AA[⚡ SharedArrayBuffer + Atomics<br>（需窗口传递 buffer，配置复杂）]
    Z -->|否| AB[❌ 无通用纯前端方案<br>必须使用服务器中转]

    style E fill:#90EE90,stroke:#333,stroke-width:2px
    style U fill:#90EE90,stroke:#333,stroke-width:2px
    style G fill:#87CEEB,stroke:#333,stroke-width:2px
    style I fill:#FFB6C1,stroke:#333,stroke-width:2px
    style K fill:#D3D3D3,stroke:#333,stroke-width:2px
    style L fill:#98FB98,stroke:#333,stroke-width:2px
    style N fill:#FFD700,stroke:#333,stroke-width:2px
    style P fill:#D3D3D3,stroke:#333,stroke-width:2px
    style Q fill:#98FB98,stroke:#333,stroke-width:2px
    style S fill:#FFA07A,stroke:#333,stroke-width:2px
    style W fill:#DDA0DD,stroke:#333,stroke-width:2px
    style AA fill:#87CEEB,stroke:#333,stroke-width:2px
    style AB fill:#FF6B6B,stroke:#333,stroke-width:2px,color:#fff
```

### 决策依据速查表

| 决策节点 | 判断依据 | 选择结果 |
| :--- | :--- | :--- |
| **是否同源？** | 跨域时绝大多数本地API被阻断 | 同源→本地方案；跨域→判断窗口引用 |
| **是否有窗口引用？** | 能通过 `window.open` 或 `iframe` 获得目标窗口对象 | 有→`postMessage`；无→服务器中转 |
| **是否允许搭建服务器？** | 服务器方案可打破跨域限制，但增加运维成本 | 是→WebSocket；否→进入纯前端分支 |
| **是否支持现代浏览器？** | Broadcast/SharedWorker 不支持 IE 及 Safari 16 以下 | 不支持→LocalStorage；支持→继续 |
| **是否需维持 WebSocket 长连接？** | SharedWorker 可让所有标签页共用 1 个 WS 连接 | 是→SharedWorker；否→继续 |
| **是否需离线广播？** | Service Worker 在页面关闭后仍可存活 | 是→Service Worker；否→继续 |
| **是否只需简单状态同步？** | 传 Token、颜色值、配置项等低频数据 | 是→LocalStorage；否→继续 |
| **需要实时双向聊天/指令？** | Broadcast Channel 纯内存通信，比 LocalStorage 快 | 是→Broadcast Channel；否→LocalStorage |

---

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动全部服务（推荐）
```bash
npm start
```
同时启动 WebSocket 服务器 (`server/server.js`) 和静态文件服务。

### 3. 分开启动
- 启动 WebSocket 服务器: `npm run server`
- 启动静态服务: `npm run dev`

### 4. 打开浏览器
访问 `http://localhost:3000` 或 Live Server 提供的地址。

---

## 📋 方案列表

| 方案 | 模块文件 | 需要后端 | 同源 | 跨域 |
|------|---------|---------|------|------|
| LocalStorage | `modules/localstorage.js` | ❌ | ✅ | ❌ |
| Broadcast Channel | `modules/broadcast.js` | ❌ | ✅ | ❌ |
| SharedWorker | `modules/sharedworker.js` | ❌ | ✅ | ❌ |
| Service Worker | `modules/serviceworker.js` | ❌ | ✅ | ❌ |
| window.postMessage | `modules/postmessage.js` | ❌ | ✅ | ✅（需窗口引用） |
| WebSocket | `modules/websocket.js` | ✅（`server/server.js`） | ✅ | ✅ |

---

## 🧪 测试方法

1. 打开多个标签页，访问**完全相同的 URL**（包括端口）
2. 点击顶部按钮切换通信方案
3. 在输入框中发送消息，观察其他标签页是否收到
4. 每条消息都会显示发送者的**标签页 ID**，便于区分

---

## ⚠️ 注意事项

- **同源要求**: 除 WebSocket 和 postMessage（需窗口引用）外，所有方案均要求标签页同源
- **Service Worker**: 必须在 `localhost` 或 HTTPS 下才能注册
- **WebSocket 端口**: 默认 8080，如需修改请调整 `server/server.js` 中的 `PORT` 变量
- **跨域场景**: 不同源且无服务器的场景下，`postMessage + iframe 代理` 是唯一可行的纯前端变通方案
- **已废弃方案**: `document.domain` 降域方案已被主流浏览器禁用，**请勿使用**
