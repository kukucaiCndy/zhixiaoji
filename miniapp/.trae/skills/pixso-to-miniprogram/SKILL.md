---
name: "pixso-to-miniprogram"
description: "Converts Pixso design稿 to WeChat Mini Program code (WXML+WXSS+JS). Invoke when user needs to implement a page from Pixso design稿 with precise 1:1 visual replication."
---

# Pixso → 微信小程序 标准工作流

## 前置条件

- Pixso 桌面端已打开目标设计稿
- 已选中需要转换的页面/组件（item-id 自动获取）

## 核心工具

| 工具 | 调用方式 | 输出 | 用途 |
|------|---------|------|------|
| `design_to_code` | `mcp_Pixso_MCP_design_to_code()` | HTML manifest (含临时 URL) | **首选**：阅读布局结构、提取文本内容、反查 CSS 样式 |
| `get_node_dsl` | `mcp_Pixso_MCP_get_node_dsl()` | JSON 图层树 | **辅助**：查精确色值、字号、阴影参数（DSL 层级混乱，不适合看布局） |
| `get_screenshot` | `mcp_Pixso_MCP_get_screenshot()` | PNG 预览 | **验证**：开发完成后对照设计稿确认视觉效果 |

## 流程总览

```
① 获取数据 → ② 提取信息 → ③ 一阶段WXML → ④ 二阶段WXSS → ⑤ 对接组件 → ⑥ 走查验证
   d2c+dsl      grep+top      对照body        从CSS反查      TabBar/交互    三步核对
   同时调用     归属关系图     只关心结构       精确还原属性    绑定事件      逐区域+逐样式
                                                                           +截图对照
```

---

## ① 获取设计稿数据

**同时调用两个工具，然后立即下载 HTML：**

```bash
# Step 1: 调用两个 MCP 工具
mcp_Pixso_MCP_design_to_code()  → 返回 manifest，提取 pageEntries[0].url
mcp_Pixso_MCP_get_node_dsl()     → 返回图层 JSON（参考用）

# Step 2: 立即下载 HTML（URL 是临时的，会随时失效）
# 方式A（推荐）: Playwright HTTP GET
mcp_Playwright_playwright_get(url="{manifest.pageEntries[0].url}")

# 方式B: PowerShell
powershell -Command "Invoke-WebRequest -Uri '{url}' -OutFile 'pages/{page}/design-code.html'"
```

**保存文件布局：**
```
pages/{page}/
├── design-code.html   # 完整 HTML（CSS在前，body在后）
├── design-dsl.json    # 精简的 DSL 数据摘要
├── {page}.wxml / .wxss / .js / .json
```

---

## ② 提取关键信息（防止遗漏）

### ⚠️ 必须执行的两步提取

> **经验教训**：不执行这两步是绝大多数遗漏和偏差的根源。

**第一步 — 提取所有文本（防止遗漏元素）：**
```bash
grep -n 'class="paragraph-\|class="text-' pages/{page}/design-code.html
```
建立清单逐项核对：`✅ 已实现 | ❌ 遗漏`

**第二步 — 提取每个区域的归属关系（防止放错位置）：**
```
用 top 值画归属图（HTML 中每个 position:absolute 的容器都有 top 值）：
  top:0~44   → 状态栏
  top:44~97  → 导航栏
  top:97+    → 页面内容区（注意：已超出 header）
```
**关键判断**：如果一个容器的 `top > header高度`，那它不在 header 里！

---

## ③ 一阶段：WXML 布局骨架

> **目标**：只确认"有哪些元素、在哪里、文字对不对"，不关心颜色/间距。

### 操作

1. 打开 `design-code.html` 的 `<body>…</body>` 部分，逐段对照编写 WXML
2. 按 `top` 值从小到大顺序处理每个 `frame-content-` 容器
3. 每个容器只关注：
   - 文本内容（第②步的 grep 清单）
   - 嵌套层次（外层 view 对应外层 div）
   - 是否有条件渲染（如"查看原因"仅在审核未通过时显示）
4. 完成后对照清单逐项确认，全部 ✅ 才进入下一阶段

### 常用结构速查

| HTML 标签 | → WXML | 注意 |
|-----------|--------|------|
| `<div>` | `<view>` | 容器 |
| `<p>` / `<span>`（纯文本） | `<text>` | emoji 直接放 text 内 |
| `<p>`（被用作布局容器） | `<view>` | 看语义角色，非标签名 |
| 水平滚动容器（有 overflow:hidden） | `<scroll-view scroll-x>` | 内部子元素不要设 wrap |
| 垂直滚动 | `<scroll-view scroll-y>` | padding 放在 scroll-inner 上 |

### 停止条件

- [ ] grep 出的每个文本段落都在 WXML 中有对应
- [ ] 每个区域的容器嵌套与 HTML body 结构一致
- [ ] 所有 click/interaction 绑在了正确的容器上
- [ ] 条件渲染逻辑正确（`wx:if`）

---

## ④ 二阶段：WXSS 像素级还原

> **目标**：从设计稿 CSS 反查每个属性，零直觉值。

### 操作

1. **为 WXML 中每个区域找到 CSS** — 在 `design-code.html` 的 `<style>` 中，用容器类名定位：
   ```bash
   grep -A 15 'frame-2_10827' design-code.html
   ```

2. **逐属性对照翻译成 WXSS**：

| 设计稿 CSS 属性 | → WXSS | 换算规则 |
|:----------------|:-------|:---------|
| `width/height` px | → rpx | `px × 2` |
| `font-size` px | → rpx | `px × 2` |
| `border-radius` px | → rpx | `px × 2` |
| `border` px | → rpx | `px × 2` |
| `padding / margin` px | → rpx | `px × 2` |
| `box-shadow` | → rpx | `offset×2, blur×2`，颜色不变 |
| `background-color` / `color` | → 同 | `rgba(R,G,B,A) → #HEX`，透明度不变 |
| `position: absolute` + `top` | → 判断归属 | 见第②步的归属关系图 |

3. **特别注意的视觉属性（最容易错）：**
   - `background-color` — 必须从 CSS 读，不能凭印象写
   - `border` — 看有没有 `border-width`/`border-color`
   - `overflow: hidden` → WXSS 用 `scroll-view scroll-x`（非 `flex-wrap`）

### 对照示例

```
设计稿CSS:                     →  WXSS:
.frame-2_10827 {                .search-box {
  width: 343px;                   width: 100%;
  height: 40px;                   height: 80rpx;
  border-radius: 10px;            border-radius: 20rpx;
  box-shadow: 0px 1px 3px         box-shadow: 0 2rpx 6rpx
              rgba(0,0,0,0.06);             rgba(0,0,0,0.06);
  background-color:               background: #FFFFFF;
    rgba(255,255,255,1);        }
}
```

### 停止条件

- [ ] 每个 WXSS 类名的 `background-color` 都从设计稿 CSS 中查过
- [ ] 每个类名的 `border` 属性与设计稿 CSS 一致
- [ ] 没有用 `flex-wrap: wrap` 替代 `overflow: hidden` 的 scroll 容器
- [ ] 所有数值都是从设计稿换算得来，没有凭直觉手写的

---

## ⑤ 对接组件和交互

### Tab Bar

```xml
<tab-bar activeIndex="0" bind:change="onTabChange"></tab-bar>
```

| 页面 | activeIndex |
|:-----|:-----------:|
| 首页 | 0 |
| 学习 | 1 |
| 笔记 | 2 |
| 我的 | 3 |

### 交互

根据 `get_node_dsl` 中的 `interactions` 字段绑定事件：
- `ON_CLICK` + `NAVIGATE` → `bindtap` + `wx.navigateTo`
- 状态变化 → `setData`

### scroll-view 注意事项

```xml
<!-- ✅ 正确：padding 放在 inner 上 -->
<scroll-view class="scroll-content" scroll-y>
  <view class="scroll-inner"> <!-- content --> </view>
</scroll-view>
```
`scroll-view` 直接设 `padding` 会导致子元素 `width:100%` 溢出右边界。

---

## ⑥ 走查验证（‼️ 必须执行，不可跳过）

> **这是完成开发前最后也是最关键的一步。** 必须从头到尾、逐一区域、逐一样式进行地毯式核对。

### 走查流程（按页面从上到下）

**第 1 遍：逐区域核对 WXML**

打开 `design-code.html` 的 `<body>` 部分和编写的 WXML，**并排对照**，按 `top` 值从小到大逐个区域检查：

```
核对清单（每个区域都要过）：
□ 该区域在 WXML 中是否存在
□ 文本内容是否与设计稿一致（一个字都不能差）
□ 容器嵌套层次是否正确
□ 条件渲染逻辑是否与设计稿状态一致
□ 列表中每一项的数据是否对应
□ 有交互的按钮/链接是否绑定了正确的事件
```

**第 2 遍：逐区域核对 WXSS**

打开 `design-code.html` 的 `<style>` 部分和编写的 WXSS，**并排对照每个区域**：

```
核对清单（每个区域样式都要过）：
□ background-color 是否从设计稿 CSS 精确提取（不是凭印象写的）
□ border 有无/粗细/颜色是否正确
□ border-radius 是否精确
□ box-shadow 是否精确
□ font-size 是否精确
□ color 是否精确
□ padding/margin 是否精确
□ overflow 处理是否正确（scroll-x vs flex-wrap）
□ 元素在哪个背景区域内（紫色 header 内 vs 浅色背景）
```

**第 3 遍：整体视觉走查**

用 `mcp_Pixso_MCP_get_screenshot()` 获取设计稿截图，与小程序渲染结果对照：

```
核对清单（全局视效）：
□ 页面整体颜色氛围是否与设计稿一致
□ 各区域间距留白是否合理
□ 字体大小层级是否正确（标题>描述>辅助文字）
□ 圆角体系是否统一
□ 按钮/标签等交互元素是否有正确的视觉状态
□ 列表项间距是否均匀
□ 底部 Tab Bar 是否正确展示
□ 页面是否有右侧溢出或内容被截断
```

### 走查停止条件

- [ ] 第 1 遍中每个区域的 WXML 都已核对，标记为 ✅
- [ ] 第 2 遍中每个区域的 WXSS 都已核对，标记为 ✅
- [ ] 第 3 遍中与截图对照无明显视觉差异
- [ ] 每项核对结果记录为清单（Markdown 表格），方便追溯

### 走查记录模板

```markdown
## 走查记录：{页面名}

### 第 1 遍：WXML 核对
| # | 区域 | top | 文本 | 容器 | 事件 | 状态 |
|---|------|:---:|:----:|:----:|:----:|:----:|
| 1 | 状态栏 | 0-44 | ✅ | ✅ | - | ✅ |
| 2 | 导航栏 | 44-97 | ✅ | ✅ | ✅ | ✅ |
| ... | ... | ... | ... | ... | ... | ... |

### 第 2 遍：WXSS 核对
| # | 区域 | bg-color | border | radius | shadow | font | 状态 |
|---|------|:--------:|:------:|:------:|:------:|:----:|:----:|
| 1 | 搜索框 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 2 | 筛选标签 | ✅ | ✅ | ✅ | - | ✅ | ✅ |
| ... | ... | ... | ... | ... | ... | ... | ... |

### 第 3 遍：截图对照
整体视觉效果：✅ 一致 / ⚠️ 有偏差（说明）
```

---

## 附录 A：常用换算速查

### px → rpx

| px | rpx | 常见场景 |
|:--:|:---:|:---------|
| 4 | 8 | 进度条细 |
| 6 | 12 | 进度条粗 |
| 8 | 16 | 缩略图圆角 |
| 10 | 20 | tab标签/状态标签字号、圆角 |
| 11 | 22 | 描述文字 |
| 12 | 24 | 间距/内边距/图标圆角 |
| 13 | 26 | 标签/按钮字号 |
| 14 | 28 | 导航/状态栏字号 |
| 15 | 30 | 条目标题字号 |
| 16 | 32 | 卡片圆角/section字号/用户名 |
| 17 | 34 | section标题 |
| 18 | 36 | 应用名/导航标题 |
| 20 | 40 | tab图标/emoji/大标题/按钮圆角 |
| 22 | 44 | 大数字 |
| 24 | 48 | 头像圆角 |
| 28 | 56 | FAB 按钮 |

### 颜色速查

```
#4F46E5 = rgba(79,70,229,1)      主题紫
#1E293B = rgba(30,41,59,1)       主文字
#64748B = rgba(100,116,139,1)    次要文字
#94A3B8 = rgba(148,163,184,1)    辅助文字
#F8FAFC = rgba(248,250,252,1)    页面背景
#FFFFFF = rgba(255,255,255,1)    卡片白
#E2E8F0 = rgba(226,232,240,1)    边框
#EEF2FF = rgba(238,242,255,1)    紫色浅底
#10B981 = rgba(16,185,129,1)     绿色（已完成）
#F59E0B = rgba(245,158,11,1)     橙色（高亮）
#06B6D4 = rgba(6,182,212,1)      青色
#EF4444 = rgba(239,68,68,1)      红色
```

### 阴影还原

`box-shadow: 0px 1px 3px 0px rgba(0,0,0,0.06)` → `box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.06)`

规则：`offsetX×2, offsetY×2, blur×2, spread忽略, 颜色不变`

---

## 附录 B：实战坑点

1. **grep + top 归属图**：下载 HTML 后第一件事就做，别跳过
2. **scroll-view padding**：只用 inner 做 padding，scroll-view 本身不设 padding
3. **emoji 直接用字符**：不需要图片，`<text>📖</text>` 即可
4. **渐变从 SVG data URI 提取**：看 HTML 中 `<stop stop-color='...'>`
5. **装饰圆**：`pos:absolute + border-radius:50% + rgba(255,255,255,0.06)`
6. **MINGW64 下 curl 常失败**：用 Playwright HTTP GET 或 PowerShell
7. **设计稿 HTML 文件名不要变**：一律命名为 `design-code.html`

---

## 相关文档

- [component_usage.md](file:///f:/work/software/zhixiaoji/miniapp/.trae/rules/component_usage.md)
- [project.md](file:///f:/work/software/zhixiaoji/miniapp/.trae/rules/project.md)
- 设计参考：`pages/home/design-code.html`, `pages/learn/design-code.html`, `pages/note/design-code.html`
