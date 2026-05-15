## @zhixiaoji/api-sdk 小程序兼容性整改要求

> **状态：✅ 已彻底解决** — 最终方案：后端拆分为独立小程序专用包 `@zhixiaoji/api-sdk-wechat@0.1.0`。

---

### 最终方案

后端将 SDK 拆分为两个独立包：

| 包名 | 版本 | 用途 |
|---|---|---|
| `@zhixiaoji/api-sdk-wechat` | 0.1.0 | **微信小程序专用**（当前项目使用） |
| `@zhixiaoji/api-sdk` | 0.3.1 | Vue3/Node.js 通用（保留） |

`@zhixiaoji/api-sdk-wechat@0.1.0` 特性：
- `"main": "dist/index.js"` 直接指向 esbuild flat bundle
- `dist/index.js` 零内部 `require()`，单文件输出
- DevTools "构建 npm" 正确处理，无需任何桥接

### 问题解决时间线

| 版本 | 日期 | 状态 |
|---|---|---|
| v0.3.0 | - | ❌ `dist/index.js` 含 `require()` 链 |
| v0.3.1 | 2026-05-12 | ⚠️ 新增 `dist/index.miniprogram.js`，但 `"main"` 未改 |
| **v0.1.0 (wechat)** | **2026-05-12** | **✅ 独立小程序包，彻底解决** |

### 相关 Bug

- ~~Bug#004~~ ✅ 已解决
- ~~Bug#005~~ ✅ 已解决
