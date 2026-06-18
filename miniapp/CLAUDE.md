# 智小记 · 微信小程序

## 项目身份

- **类型**：微信小程序
- **AppID**：`wxc97a281262554985`
- **设计稿**：`docs/UXDesign/new.pen`（Pencil MCP 管理）
- **当前阶段**：Phase 1 — L1 页面开发 + 设计稿迭代
- **Git 仓库**：`https://github.com/kukucaiCndy/zhixiaoji`（子目录 `miniapp/`）

## 技术栈

| 层 | 技术 |
|:---|------|
| 渲染 | WXML + WXSS（webview 模式，样式 v2） |
| 逻辑 | 原生小程序 JS |
| 组件 | 统一弹窗 `unified-modal`、Toast `toast-direct-unlock`、Slot `base-modal` |
| 设计 | Pencil MCP（`.pen` 文件）→ 小程序代码 |
| 后端 SDK | `@zhixiaoji/api-sdk-wechat`（Verdaccio 私有源） |

## 目录结构

```
miniapp/
├── pages/           # 页面（splash/home/learn/profile/knowledge-card/...）
├── components/      # 共享组件（tab-bar/unified-modal/toast-direct-unlock/base-modal）
├── services/        # 服务层（api-client/auth-service/monk-api）
├── utils/           # 工具（constants/storage）
├── assets/images/   # 图片素材（bg/背景  deco/装饰）
├── docs/            # PRD.md UI-Design.md UXDesign/new.pen
├── .trae/skills/    # 技能参考（pencil-design / pencil-to-miniprogram）
└── CLAUDE.md        # 本文件
```

## 核心规则

### 最高优先级

1. **禁止修改 `node_modules/` 和 `miniprogram_npm/`** — SDK 和后端交付物，不可碰
2. **后端问题记录根因 → 提交整改要求**，不通过前端 hack 绕过
3. **Git 从父目录操作**：`cd f:/work/software/zhixiaoji && git add miniapp/... && git commit`
4. **禁止擅自 push 远程**，用户未要求不推送

### 设计稿驱动

页面开发遵循 `pencil-to-miniprogram` 工作流：
```
读取设计稿 → 提取信息 → WXML结构 → WXSS像素级 → JS交互 → 走查验证
   batch_get   snapshot   层级还原    rpx换算    事件绑定   三步核对
```

### Pencil MCP 工具

| 工具 | 用途 |
|------|------|
| `mcp__pencil__get_editor_state` | 获取画布状态 + .pen schema |
| `mcp__pencil__batch_get` | 读取节点树（核心） |
| `mcp__pencil__batch_design` | JS 代码片段批量修改 |
| `mcp__pencil__snapshot_layout` | 布局结构 + 裁剪检测 |
| `mcp__pencil__get_screenshot` | 视觉验证 |
| `mcp__pencil__get_variables` | 设计 token（颜色/字体/间距） |

> 所有 MCP 工具需传 `filePath: "F:/work/software/zhixiaoji/miniapp/docs/UXDesign/new.pen"`

### Pencil 关键约束

- `fill: "transparent"` / `fill: "none"` 不支持 → 用 `"#00000000"`
- 变量引用 `"$primary"` 解析不稳定 → 直接硬编码 hex 值
- 图标容器用 flexbox 居中，避免 `layout: "none"` + 手动 x/y
- `Generate()` 生成的图片不透明，UI 图标用 lucide 矢量图标
- 已验证可用的 lucide 图标见 `.trae/skills/pencil-design/SKILL.md`

## 组件使用

### 弹窗决策树

```
需要弹窗
  ├── 轻量提示，自动消失 → toast-direct-unlock
  ├── 完全自定义布局 → base-modal (slot)
  └── 通用场景 → unified-modal (配置驱动)
```

### unified-modal 核心属性

`show` / `icon` / `title` / `desc` / `score` / `primaryText` / `secondaryText` / `singleBtn` / `primaryType` / `rarity` / `contentName` / `richText`

详见 `.trae/rules/component_usage.md`

## 设计系统 Token

| Token | 值 | 用途 |
|-------|-----|------|
| `$primary` | `#2D3E5F` | 主色、active 态 |
| `$primaryLight` | `#384F84` | 浅主色 |
| `$accent` | `#C8B496` | 强调金 |
| `$surface` | `#E8EDF5` | 表面蓝灰 |
| `$textPrimary` | `#1A1A1A` | 正文 |
| `$textSecondary` | `#777777` | 副文 |
| `$bgPage` | `#F4F2EF` | 页面底色 |
| `$fontBody` | `Inter` | 正文字体 |
| `$fontDisplay` | `Playfair Display` | 展示字体 |

## 尺寸换算

- **设计稿 375px 基准** → **小程序 750rpx**
- 换算：`px × 2 = rpx`
- 阴影：`offset×2, blur×2`，颜色/透明度不变

## 图片处理

- WXSS 不支持本地 `background-image` → 用 `<image>` 标签绝对定位
- 背景图 `mode="aspectFill"`，装饰图 `mode="aspectFit"`
- 图片路径：`/assets/images/bg/`（背景）、`/assets/images/deco/`（装饰）

## 字体栈

| 设计稿 | 小程序 fallback |
|--------|----------------|
| Playfair Display | `'Times New Roman', Georgia, serif` |
| Inter | `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` |
