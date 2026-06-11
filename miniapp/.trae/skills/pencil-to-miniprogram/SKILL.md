---
name: "pencil-to-miniprogram"
description: "Converts Pencil MCP .pen design files to WeChat Mini Program code (WXML+WXSS+JS) with precise 1:1 visual replication. Invoke when user needs to implement a page from a Pencil design稿."
---

# Pencil → 微信小程序 标准工作流

## 前置条件

- Pencil MCP 已加载目标 `.pen` 文件
- 已通过 `mcp_Pencil_MCP_get_editor_state` 确认设计稿处于活动状态
- 已知目标页面的 frame 节点 ID（如 `RweGQ`）

## 核心工具

| 工具 | 调用方式 | 输出 | 用途 |
|------|---------|------|------|
| `get_editor_state` | `mcp_Pencil_MCP_get_editor_state()` | 顶层节点列表 + schema | **首选**：确认文件已加载，获取页面 ID |
| `batch_get` | `mcp_Pencil_MCP_batch_get()` | 节点属性树 | **核心**：读取尺寸、颜色、文本、层级 |
| `snapshot_layout` | `mcp_Pencil_MCP_snapshot_layout()` | 布局矩形 | **辅助**：获取精确 x/y/width/height |
| `get_screenshot` | `mcp_Pencil_MCP_get_screenshot()` | PNG 截图 | **验证**：开发完成后对照设计稿 |
| `get_variables` | `mcp_Pencil_MCP_get_variables()` | 设计变量 | **参考**：颜色、字体、间距 token |

## 流程总览

```
① 读取设计稿 → ② 提取信息 → ③ 编写 WXML → ④ 编写 WXSS → ⑤ 对接 JS → ⑥ 走查验证
   editor_state    batch_get      结构还原      像素级样式     交互/数据      截图对比
   +batch_get      +snapshot      +image标签     +rpx换算      +默认值       +坑点复查
   +screenshot     +variables     +层级关系      +阴影换算
```

---

## ① 读取设计稿数据

**同时调用以下工具：**

```javascript
// 1. 确认文件状态和获取顶层节点 ID
mcp_Pencil_MCP_get_editor_state({ include_schema: true })

// 2. 读取目标页面完整节点树（以主页 RweGQ 为例）
mcp_Pencil_MCP_batch_get({
  filePath: ".../new.pen",
  nodeIds: ["RweGQ"],
  readDepth: 3,
  resolveVariables: true
})

// 3. 获取精确布局
mcp_Pencil_MCP_snapshot_layout({
  filePath: ".../new.pen",
  parentId: "RweGQ",
  maxDepth: 3
})

// 4. 获取截图（用于最终对照）
mcp_Pencil_MCP_get_screenshot({
  filePath: ".../new.pen",
  nodeId: "RweGQ"
})

// 5. 获取设计变量
mcp_Pencil_MCP_get_variables({ filePath: ".../new.pen" })
```

**保存截图**：将 screenshot 保存到 `pages/{page}/design-screenshot.png` 用于走查对照。

---

## ② 提取关键信息（防止遗漏）

### 必须提取的六类信息

| 类别 | 提取内容 | 用途 |
|------|---------|------|
| **文本** | 所有 `text` 节点的 `content` | 确保 WXML 无遗漏 |
| **尺寸** | `width`, `height`, `x`, `y` | 换算 rpx，计算间距 |
| **颜色** | `fill`, `color`, `stroke` | WXSS 精确还原 |
| **字体** | `fontFamily`, `fontSize`, `fontWeight` | 字体栈 + rpx 换算 |
| **间距** | `padding`, `gap`, `layout` | flex 布局参数 |
| **效果** | `cornerRadius`, `effect`(shadow) | 圆角 + 阴影换算 |

### 尺寸换算规则（px → rpx）

微信小程序以 iPhone 6/7/8 的 375px 宽度为基准，换算关系：

```
1 px = 2 rpx
```

| px | rpx | 常见场景 |
|:--:|:---:|:---------|
| 8 | 16 | 进度条粗、缩略图圆角 |
| 10 | 20 | tab标签/状态标签字号、圆角 |
| 11 | 22 | 描述文字 |
| 12 | 24 | 间距/内边距/图标圆角 |
| 13 | 26 | 标签/按钮字号 |
| 14 | 28 | 导航/状态栏字号 |
| 15 | 30 | 条目标题字号 |
| 16 | 32 | 卡片圆角/section字号 |
| 18 | 36 | 应用名/导航标题 |
| 20 | 40 | tab图标/大标题/按钮圆角 |
| 24 | 48 | 头像圆角 |

### 阴影换算规则

```
设计稿: blur:20, color:#2D3E5F25, offset:{x:0, y:6}
→ WXSS: box-shadow: 0 12rpx 40rpx rgba(45, 62, 95, 0.15);

规则: offsetX×2, offsetY×2, blur×2, 颜色不变
```

---

## ③ 编写 WXML

### 核心原则

1. **`<image>` 标签代替 WXSS background-image**

   > ⚠️ **关键限制**：微信小程序 WXSS 中不能使用本地资源路径作为 `background-image`。必须改用 `<image>` 标签。

   ```xml
   <!-- ❌ 错误：WXSS 中不能使用 -->
   <!-- .card { background-image: url('/assets/images/bg.png'); } -->

   <!-- ✅ 正确：使用 <image> 标签绝对定位 -->
   <view class="card">
     <image class="bg-image" src="/assets/images/bg/bg_card.png" mode="aspectFill" />
     <view class="card-content">
       <!-- 内容 -->
     </view>
   </view>
   ```

   ```css
   .card {
     position: relative;
     overflow: hidden;
   }
   .bg-image {
     position: absolute;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     z-index: 0;
   }
   .card-content {
     position: relative;
     z-index: 1;
   }
   ```

2. **结构分层**：每个需要背景图的容器都使用 `position: relative` + `overflow: hidden`，内部用 `.bg-image` + `.card-content`

3. **装饰元素**：使用 `position: absolute` 精确定位，添加 `pointer-events: none` 和 `z-index: 2`

4. **scroll-view 注意事项**：
   - padding 放在 inner 容器上，不要直接放在 scroll-view 上
   - 如果装饰元素需要跟随滚动，放在 scroll-inner 内；如果固定，放在 scroll-view 外

---

## ④ 编写 WXSS

### 逐属性对照表

| 设计稿属性 | → WXSS | 换算规则 |
|:----------|:-------|:---------|
| `width/height` px | → rpx | `px × 2` |
| `font-size` px | → rpx | `px × 2` |
| `border-radius` px | → rpx | `px × 2` |
| `padding / margin` px | → rpx | `px × 2` |
| `box-shadow` | → rpx | `offset×2, blur×2`，颜色不变 |
| `background-color` / `color` | → 同 | `rgba(R,G,B,A) → #HEX`，透明度不变 |
| `position: absolute` + `top/left` | → 判断归属 | 用 top 归属图判断元素在哪个区域内 |

### 字体栈映射

| 设计稿字体 | 小程序替代方案 |
|:----------|:-------------|
| Playfair Display | `'Times New Roman', 'Georgia', serif` |
| Inter | `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` |

---

## ⑤ 对接 JS 和交互

### 必须处理的三个问题

1. **默认数据**：如果设计稿中某区域有静态内容（如推荐卡片），但 API 可能返回空，需要在 `data` 或 `catch` 中设置默认值

2. **事件绑定**：所有可点击元素必须绑定 `bindtap`，包括：
   - 按钮/标签（如"继续学习"、"详情 ›"）
   - 卡片（如 HeroCard、RecCard）
   - Tab 切换

3. **共享组件**：TabBar 等共享组件修改需谨慎，保持与项目现有路由一致

---

## ⑥ 走查验证（不可跳过）

### 三遍走查法

**第 1 遍：WXML 核对**
- 所有设计稿中的文本段落都在 WXML 中有对应
- 容器嵌套层次与设计稿一致
- `<image>` 标签已替代所有 WXSS background-image
- 条件渲染逻辑正确

**第 2 遍：WXSS 核对**
- 每个 `background-color` 都从设计稿精确提取
- `border-radius` 精确换算为 rpx
- `box-shadow` 按规则换算
- 所有 px 值都已换算为 rpx
- 没有遗漏的 `background-image` 在 WXSS 中

**第 3 遍：截图对照**
- 打开微信开发者工具预览
- 对照 `design-screenshot.png` 检查：
  - 背景图是否正确显示
  - 颜色氛围是否一致
  - 各区域间距是否合理
  - 字体大小层级是否正确
  - 装饰元素是否可见

---

## 常见坑点速查

| 坑点 | 现象 | 解决方案 |
|------|------|---------|
| WXSS background-image 本地资源 | 渲染层网络层错误，图片不显示 | 改用 `<image>` 标签绝对定位 |
| `wx:if` 导致区域不显示 | 截图中缺少某个 section | 添加默认数据或移除条件渲染 |
| scroll-view 直接设 padding | 子元素 `width:100%` 溢出 | padding 放在 inner 容器上 |
| emoji 图标颜色无法控制 | 图标显示为系统默认彩色 | 使用图片 + CSS filter，或替换为 iconfont |
| 共享组件样式不一致 | TabBar 等组件样式被覆盖 | 在组件内部修改，保持路由逻辑不变 |
| 装饰元素位置错乱 | 装饰元素不跟随滚动或位置偏移 | 确认 absolute 定位的父容器是 relative |

---

## 文件存放规范

```
pages/{page}/
├── {page}.wxml          # WXML 模板
├── {page}.wxss          # WXSS 样式
├── {page}.js            # JS 逻辑
├── {page}.json          # 页面配置
└── design-screenshot.png # 设计稿截图（用于走查）
```

---

## 示例：HeroCard 背景图改造

### 设计稿属性
- `type: frame`, `width: 327`, `height: 162`
- `fill: { mode:"fill", type:"image", url:"../../assets/images/bg/bg_hero_card.png" }`
- `cornerRadius: 16`

### 错误写法（WXSS background-image）
```css
.hero-card {
  background-image: url('/assets/images/bg/bg_hero_card.png');
  background-size: cover;
}
```

### 正确写法（<image> 标签）
```xml
<view class="hero-card">
  <image class="bg-image" src="/assets/images/bg/bg_hero_card.png" mode="aspectFill" />
  <view class="card-content">
    <text class="hero-title">Python 基础 · 第3章</text>
  </view>
</view>
```

```css
.hero-card {
  position: relative;
  width: calc(100% - 96rpx);
  height: 324rpx;
  border-radius: 32rpx;
  overflow: hidden;
}
.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
.card-content {
  position: relative;
  z-index: 1;
  padding: 40rpx;
}
```
