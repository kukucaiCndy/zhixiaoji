---
name: "pencil-to-miniprogram"
description: "Converts Pencil MCP .pen design files to WeChat Mini Program code (WXML+WXSS+JS) with precise 1:1 visual replication. Invoke when user needs to implement a page from a Pencil design稿."
---

# Pencil → 微信小程序 标准工作流

## 前置条件

- Pencil MCP 已加载目标 `.pen` 文件
- 已通过 `mcp__pencil__get_editor_state` 确认设计稿处于活动状态
- 已知目标页面的 frame 节点 ID（如 `RweGQ`）

## 核心工具

| 工具 | 调用方式 | 输出 | 用途 |
|------|---------|------|------|
| `get_editor_state` | `mcp__pencil__get_editor_state()` | 顶层节点列表 + schema | **首选**：确认文件已加载，获取页面 ID |
| `batch_get` | `mcp__pencil__batch_get()` | 节点属性树 | **核心**：读取尺寸、颜色、文本、层级 |
| `snapshot_layout` | `mcp__pencil__snapshot_layout()` | 布局矩形 | **辅助**：获取精确 x/y/width/height |
| `get_screenshot` | `mcp__pencil__get_screenshot()` | PNG 截图 | **验证**：开发完成后对照设计稿 |
| `get_variables` | `mcp__pencil__get_variables()` | 设计变量 | **参考**：颜色、字体、间距 token |

## 流程总览

```
① 读取设计稿 → ② 提取信息 → ③ 编写 WXML → ④ 编写 WXSS → ⑤ 对接 JS → ⑥ 走查验证
   editor_state    batch_get      结构还原      像素级样式     交互/数据      截图对比
   +batch_get      +snapshot      +image标签     +rpx换算      +默认值       +坑点复查
   +screenshot     +variables     +层级关系      +阴影换算
```

---

## ① 读取设计稿数据（不可缩减）

**以下 5 个调用缺一不可，必须并行调用：**

```javascript
// 1. 确认文件状态和获取顶层节点 ID
mcp__pencil__get_editor_state({ include_schema: true })

// 2. 读取目标页面完整节点树（⚠️ resolveVariables: true 必须开启）
mcp__pencil__batch_get({
  filePath: ".../new.pen",
  nodeIds: ["RweGQ"],
  readDepth: 6,          // 深入到叶子节点，避免漏读
  resolveVariables: true  // ⚠️ 必须：获取解析后的 hex 值，否则拿到的可能是 $primary 引用
})

// 3. 获取精确布局（用于间距计算）
mcp__pencil__snapshot_layout({
  filePath: ".../new.pen",
  parentId: "RweGQ",
  maxDepth: 4             // 足够看到所有区域层
})

// 4. 获取截图（⚠️ 第一步就获取，全程对照，不是最后才看）
mcp__pencil__get_screenshot({
  filePath: ".../new.pen",
  nodeId: "RweGQ"
})

// 5. 获取设计变量（确保 token 值一致）
mcp__pencil__get_variables({ filePath: ".../new.pen" })
```

**⚠️ 常见错误：**
- `resolveVariables: true` 忘了传 → 拿到 `"$primary"` 字符串而非 `"#2D3E5F"`
- `readDepth` 设太浅（3）→ 遗漏深层文本/图标节点
- 截图放在最后才获取 → 应该第一步获取，写入代码时随时对照

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
| **图标** | `icon`, `library`, `fill` | 导出 PNG 或映射替代方案 |

### 间距交叉计算表（⚠️ 必须执行）

提取所有 section 的 `y` 和 `height`，计算相邻 gap。不计算直接写 margin 必出错。

```
Section          y(px)  h(px)  bottom(px)  y(rpx)  h(rpx)  bottom(rpx)  gap(rpx)
Header            0      96      96          0      192      192          -
HeroCard         100    160     260        200     320      520          520-192=8
QuickActions     274     82     356        548     164      712          712-520=28  (用 snapshot_layout!)
ProgressSection  366    152     518        732     304     1036         1036-712=20
RecommendSection 524    182     706       1048     364     1412         1412-1036=12
TabBar           728     84     812       1456     168     1624         1624-1412=48
```

**⚠️ 关键**：`batch_get` 返回的 x/y 是设计值（可能有 0.5px 偏移），`snapshot_layout` 返回的才是实际渲染位置。间距大时优先用 snapshot_layout 数据。

### 阴影透明度换算表

Hex alpha 最后两位 → rgba 小数：

| Hex Alpha | rgba 小数 | 示例 |
|-----------|----------|------|
| FF | 1.0 | #FFFFFF |
| 80 | 0.502 | #FFFFFF80 |
| 25 | 0.145 | #2D3E5F25 |
| 20 | 0.125 | #FFFFFF20 |
| 10 | 0.0625 | #00000010 |
| 06 | 0.0235 | #00000006 |
| 0A | 0.0392 | #0000000A |
| 04 | 0.0156 | #00000004 |

### 图标处理决策树（⚠️ 高频出错点）

```
设计稿中的 icon 节点
  ├── library: "lucide" / "feather" 等矢量图标库
  │     └── ⚠️ 小程序无法直接使用！必须导出为 PNG
  │           1. mcp__pencil__export_nodes({ nodeIds: [iconFrameId], scale: 2 })
  │           2. 保存到 /assets/images/icons/
  │           3. 用 <image> 标签引用
  │           ❌ 禁止：用 deco 通用装饰图替代
  │           ❌ 禁止：用 emoji 替代（渲染不一致）
  │
  ├── type: "image" fill（已生成图片）
  │     └── 直接使用 url 指向的图片路径
  │
  └── 纯 CSS 可实现（简单几何形状）
        └── 用 WXSS 绘制
```

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
- [ ] 所有设计稿中的文本段落都在 WXML 中有对应
- [ ] 容器嵌套层次与设计稿一致
- [ ] `<image>` 标签已替代所有 WXSS background-image
- [ ] 所有图标节点已正确处理（lucide 导出 PNG / image fill 直接引用）
- [ ] 条件渲染逻辑正确

**第 2 遍：WXSS 核对**
- [ ] 每个 `background-color` 都从设计稿精确提取
- [ ] `border-radius` 精确换算为 rpx
- [ ] `box-shadow` 按规则换算（offset×2, blur×2, 颜色透明度查表）
- [ ] 所有 px 值都已换算为 rpx
- [ ] 没有遗漏的 `background-image` 在 WXSS 中
- [ ] **区域间距已与交叉计算表核对**（最容易出错）
- [ ] **装饰元素位置已与 snapshot_layout 坐标核对**

**第 3 遍：截图对照**
- [ ] 打开微信开发者工具预览
- [ ] 对照 `design-screenshot.png` 检查：
  - 背景图是否正确显示
  - 颜色氛围是否一致
  - 各区域间距是否合理
  - 字体大小层级是否正确
  - **图标是否与设计稿一致**（不是通用替代图）
  - 装饰元素是否可见

### 高频缺陷自查清单

| # | 缺陷 | 检查方法 |
|---|------|---------|
| 1 | lucide 图标被 deco 通用图替代 | 每个 icon 节点确认是否已导出 PNG |
| 2 | 区域间距使用估算值非精确计算 | 对照交叉计算表的 gap 列 |
| 3 | resolveVariables 未开启导致颜色偏差 | 确认 hex 值不是 $primary 引用 |
| 4 | 阴影透明度 hex→rgba 转换不精确 | 对照换算表 |
| 5 | snapshot_layout 数据未使用 | 间距以 batch_get 的 x/y 为准（可能有偏移）|
| 6 | TabBar 等共享组件未按设计更新 | 组件文件也需走读设计稿对应区域 |

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

---

## 复刻案例复盘：2026-06-12 主页 (RweGQ)

### 背景
对主页 (RweGQ) 进行 1:1 复刻，首轮完成后用户反馈两个问题：
1. QuickActions 图标未复刻
2. 整体并非完美 1:1

### 首轮缺陷清单

| # | 缺陷 | 严重度 | 根因 | 修正 |
|---|------|--------|------|------|
| 1 | **lucide 图标用 deco 图替代** | 🔴 高 | 未意识到需要从 Pencil 导出图标；用 deco_star/deco_spiral/deco_circle 充当 trophy/rotate-ccw/chart-column/star | `export_nodes` 导出 4 个 icon frame (2x) → 96×96px PNG |
| 2 | **区域间距全部算错** | 🔴 高 | 首轮没用 snapshot_layout；margin 值靠目测估算 | 逐区计算交叉表：8/28/20/12rpx |
| 3 | **HeroCard margin-top 写 16rpx** | 🟡 中 | 凭感觉填值 | 按 y:100→200rpx，Header bottom 192rpx，gap=200-192=**8rpx** |
| 4 | **QuickActions margin-top 写 18rpx** | 🟡 中 | 同上 | y:274→548rpx，HeroCard bottom 520rpx，gap=548-520=**28rpx** |
| 5 | **resolveVariables 首轮未开** | 🟡 中 | batch_get 未传 resolveVariables:true | 虽然有设计变量表，但 batch_get 直接返回解析值更可靠 |
| 6 | **阴影透明度换算不精确** | 🟢 低 | #00000010→0.06 应为 0.0625 | 对照换算表修正 |
| 7 | **readDepth 设 3 太浅** | 🟢 低 | 部分深层嵌套节点信息被 `"..."` 截断 | 设 readDepth:6 |

### 流程改进（已更新到上文各节）

1. **图标决策树**：新增加入 ② 提取阶段 → 图标处理决策树
2. **间距交叉计算表**：新增加入 ② 提取阶段 → 必须生成 gap 计算表
3. **阴影换算表**：新增加入 ② 提取阶段 → hex alpha→rgba 对照
4. **resolveVariables 强制**：在 ① 读取阶段标注 ⚠️ must
5. **readDepth 建议值**：3→6，避免节点信息截断
6. **自查清单**：在 ⑥ 走查阶段新增 checkbox 清单
7. **截图时机**：从"最终对照"改为"第一步获取，全程对照"

### 关键教训

> **不要用通用资源替代精确资源。** deco 图片只用于装饰元素（背景波浪/圆点/星星），功能图标必须从设计稿导出。每个 `type: "icon"` 节点都必须经过"判断→导出→引用"流程。

> **间距永远用计算值，不用估算值。** snapshot_layout 给出精确坐标，交叉计算表给出精确 gap，直接填入 margin。目测必出错。

> **5 个工具调用缺一不可。** editor_state + batch_get(resolveVariables=true) + snapshot_layout + screenshot + variables，并行调用不省任何一个。
