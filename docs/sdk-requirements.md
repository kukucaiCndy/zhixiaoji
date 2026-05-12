## @zhixiaoji/api-sdk 小程序兼容性整改要求

### 问题描述

当前 `@zhixiaoji/api-sdk` v0.3.0 的 `dist/index.js` 使用多层 CommonJS `require()` 引用内部模块：

```js
// dist/index.js — 当前结构
const http_client_1 = require("./client/http-client");  // → 子文件引用
const auth_api_1    = require("./apis/auth-api");        // → 子文件引用
const storage_1     = require("./utils/storage");        // → 子文件引用
const wechat_request_1 = require("./adapters/wechat-request"); // → 子文件引用
```

微信小程序 DevTools 的 **"构建 npm"** 功能在追踪这些 `require()` 链时只生成顶层 `index.js`，不会自动将子模块文件复制到 `miniprogram_npm/` 目录中，导致运行时 `require('./client/http-client')` 报错：

```
Error: module 'miniprogram_npm/@zhixiaoji/api-sdk/client/http-client.js' is not defined
```

### 整改要求

SDK 需要为微信小程序平台提供一个 **扁平打包入口（flat/miniprogram entry）**：

#### 方案 A（推荐）：增加 `dist/index.miniprogram.js`

```json
// package.json
{
  "main": "dist/index.js",           // Node/Vue3 使用（保持不变）
  "miniprogram": "dist/index.miniprogram.js",  // 小程序专用入口
}
```

`dist/index.miniprogram.js` 是一个**单文件、零依赖**的产物：
- 所有子模块代码完整内联到同一个文件中
- 不包含任何 `require("./...")` 调用
- 所有 `class`、箭头函数、可选链等转为 ES5/小程序兼容语法
- 使用 `module.exports = {...}` 直接导出

#### 方案 B：改为扁平目录结构

```diff
- dist/index.js          → require("./client/http-client")
- dist/client/
-   http-client.js
-   index.js
- dist/apis/
-   auth-api.js
- dist/utils/
-   storage.js
- dist/adapters/
-   wechat-request.js

+ dist/index.js          → 所有代码都在此文件中，无 require()
+ dist/index.d.ts        → 类型声明（保持不变）
```

### 技术细节

1. **小程序不支持** `import`/`export` 语法（除非使用小程序框架），`dist/index.js` 必须使用 `module.exports` + 纯函数写法
2. **小程序不支持** `class` 语法糖（基础库 2.10.0 以下），建议编译为 `function` 原型写法
3. **不要使用** ES6+ `?.`（可选链）、`??`（空值合并）等语法
4. **不要使用** `Object.entries()`、`URL` 构造函数等不确定兼容性的 API

### 构建脚本建议

在 SDK 仓库的 `package.json` 中添加：

```json
{
  "scripts": {
    "build:miniprogram": "esbuild dist/index.ts --bundle --format=cjs --platform=node --target=es5 --outfile=dist/index.miniprogram.js"
  }
}
```

使用 esbuild 单次命令即可将所有子模块打包为单个文件，无需额外配置。

### 验收标准

1. 微信开发者工具中执行"工具 → 构建 npm"后，`miniprogram_npm/@zhixiaoji/api-sdk/` 下只有一个 `index.js` 文件
2. `const { createWechatApiClient } = require('@zhixiaoji/api-sdk')` 在小程序中可正常调用
3. 无需手动复制或修改任何文件

### 相关 Bug

- Bug#004: `require('./client/http-client')` 编译失败
- Bug#005: 同上（重复编译输出）

### 优先级

**高 — 阻塞当前 Phase 1 小程序登录接口对接。**
