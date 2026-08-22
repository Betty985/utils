## 一、Service Worker 的 Scope 路径限制

### 1. `ServiceWorkerContainer.register()` 方法

> **`scope`**：一个字符串，表示定义 service worker 注册范围的 URL；**即 service worker 可以控制的 URL 范围**。通常是相对 URL。默认值是基于当前 location 解析传入路径所得的路径。

> 请注意，**scope 指定的路径必须与 service worker 脚本处于同一目录或更深的子目录中**，即 scope 不能超出脚本自身的存放路径。

> 如果需要更宽泛的 scope（超出脚本所在目录），可通过 HTTP 响应头 **`Service-Worker-Allowed`** 来允许。

📎 链接：https://developer.mozilla.org/zh-CN/docs/Web/API/ServiceWorkerContainer/register

### 2. `Service-Worker-Allowed` 响应头

> **`Service-Worker-Allowed` 响应头用于放宽服务工作线程默认 scope 的路径限制。** 服务器可以通过此头**允许服务工作线程控制其自身目录之外的 URL**。

> 默认情况下，service worker 的 scope 是脚本所在的目录。例如，脚本位于 `/js/sw.js`，则默认只能控制 `/js/` 下的 URL。

> 如果服务器不设置该头，而 `scope` 选项请求的 scope 超出了脚本所在目录，**注册将失败**。

📎 链接：https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Service-Worker-Allowed

---

## 二、SharedWorker 仅受同源策略限制

### 1. `SharedWorker` 接口

> **SharedWorker** 接口代表一种特定类型的 worker，可以从多个浏览上下文（如多个窗口、iframe 或其他 worker）中访问。

> 如果 SharedWorker 可从多个浏览上下文访问，**所有这些浏览上下文必须共享完全相同的源（相同的协议、主机和端口）**。

> **一旦 shared worker 被创建，同一源中运行的任何脚本都可以获取对该 worker 的引用并与之通信**。

📎 链接：https://developer.mozilla.org/zh-CN/docs/Web/API/SharedWorker

### 2. `SharedWorker()` 构造函数

> **该 URL 必须与调用方文档同源**，或者是 `blob:` 或 `data:` URL。URL 相对于当前 HTML 页面的位置进行解析。

> 该脚本必须与关联文档同源，但其自身可以导入跨源的脚本或模块（若 CORS 及其他限制允许）。

📎 链接：https://developer.mozilla.org/zh-CN/docs/Web/API/SharedWorker/SharedWorker

---

## 三、总结对比

| 对比项 | Service Worker | SharedWorker |
|--------|---------------|--------------|
| **路径限制** | ✅ 有，默认 scope = 脚本所在目录 | ❌ 无 |
| **同源要求** | ✅ 需要 | ✅ 需要 |
| **能否超出脚本目录** | ❌ 默认不行，需 `Service-Worker-Allowed` 头 | ✅ 可以，只要同源 |

---

## 四、结论

**Service Worker 报错**：脚本在 `/workers/` 下，却想控制根目录 `/`，超出了默认允许的 scope 范围，浏览器拒绝。

**SharedWorker 正常**：它只校验同源，不校验路径，脚本放哪个子目录都可以正常连接。