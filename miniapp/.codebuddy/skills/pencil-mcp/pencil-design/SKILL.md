---
name: "pencil-design"
description: "Pencil MCP visual design tool for creating UI pages, components, and design systems in .pen files. Invoke when user needs to create visual designs, UI mockups, page layouts, or design systems."
---

# Pencil MCP Design Skill — SOP 总入口

## 引用 Skill

本 Skill 为设计流程的**总入口**，按需引用以下子 Skill：

| 子 Skill | 说明 |
|----------|------|
| [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | **设计灵感引擎** — 包含 67 种风格、96 套配色、57 套字体搭配、99 条 UX 准则。在生成样图前**必须**从官方仓库拉取最新版本获取设计模式推荐 |
| [pencil-mcp-api](../pencil-mcp-api/SKILL.md) | MCP 工具 API 参考、设计模式、图标规范、颜色变量、常见陷阱、layout 检查清单 |
| [pencil-to-miniprogram](../pencil-to-miniprogram/SKILL.md) | 设计稿转微信小程序代码 |

在执行过程中：
- **生成样图前**：**必须**先从官方仓库拉取最新 `ui-ux-pro-max` 获取 5 种设计模式，再基于模式生成样图
- **MCP 操作**（batch_design / batch_get / Generate 等）：参考 `pencil-mcp-api`
- **设计稿转小程序代码**：参考 `pencil-to-miniprogram`

---

## 标准设计 SOP（8 步）

### 第 1 步：检查 Pencil MCP 就绪状态

调用 `get_editor_state` 确认 Pencil MCP 可用：

```js
get_editor_state(include_schema: true)
```

- **成功** → 进入第 2 步
- **失败** → 告知用户：**"Pencil MCP 尚未配置，请先完成 Pencil MCP 的安装和配置后再开始设计流程。"** 并中止流程

同时确认标准目录结构是否已创建：

```
doc/
├── UXDesign/              # .pen 设计文件目录
│   ├── demo.pen            # 设计样图/试稿
│   ├── design.pen          # 主设计稿（最终定稿后创建）
│   └── images/             # 图片素材目录
│       ├── icon-xxx.png
│       ├── icon-xxx-transparent.png
│       ├── bg_xxx.png
│       └── deco_xxx.png
└── interaction-design.md   # 交互设计文稿
```

如目录缺失，先创建。

---

### 第 2 步：询问设计风格偏好

从以下维度与用户沟通，明确设计方向：

| 维度 | 问题示例 |
|------|----------|
| **色彩偏好** | 喜欢什么主色调？冷色/暖色？明亮/沉稳？有参考色值吗？ |
| **设计风格** | 极简/扁平/毛玻璃/新拟态/手绘风/插画风？ |
| **字体偏好** | 衬线/无衬线？字号层级偏好？ |
| **圆角风格** | 大圆角（可爱/亲和）/ 小圆角（专业/干练）/ 直角（硬朗）？ |
| **间距偏好** | 宽松留白 / 紧凑密集？ |
| **参考灵感** | 有参考 App 或设计稿链接吗？ |
| **品牌元素** | 有 Logo、品牌色、品牌字体吗？ |

将用户的偏好**整理为结构化摘要**，供后续设计使用。

---

### 第 3 步：拉取最新 UI UX PRO MAX + 生成样图

> **关键流程**：确认风格 → 拉取最新 UI UX PRO MAX → 获取 5 种设计模式 → 新建 demo.pen → 生成 5 套样图

#### 3.1 拉取最新版 UI UX PRO MAX 获取 5 种设计模式

**在用户确认风格偏好后，必须从官方仓库拉取最新版 `ui-ux-pro-max` 获取设计灵感**。不可跳过此步骤。

> **仓库地址**：https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git

首先确保拉取最新代码：

```bash
UIUX_DIR=".trae/skills/ui-ux-pro-max"
if [ -d "$UIUX_DIR" ]; then
  cd "$UIUX_DIR" && git pull origin main
else
  git clone https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git "$UIUX_DIR"
fi
```

**步骤 A：搜索 5 种风格模式**

使用 `--domain style` 搜索不同风格关键词，获取 5 种不同的设计方式：

```bash
python3 .trae/skills/ui-ux-pro-max/scripts/search.py "<项目描述>" --domain style -n 5
```

**步骤 B：为每种风格获取完整设计系统**

对于筛选出的 5 种风格，分别调用 `--design-system` 获取该风格下的完整设计规范（色彩、字体、布局建议等）：

```bash
python3 .trae/skills/ui-ux-pro-max/scripts/search.py "<产品类型> <风格关键词1>" --design-system
python3 .trae/skills/ui-ux-pro-max/scripts/search.py "<产品类型> <风格关键词2>" --design-system
# ... 共 5 次
```

**步骤 C：补充 UX 最佳实践**

```bash
python3 .trae/skills/ui-ux-pro-max/scripts/search.py "mobile form accessibility" --domain ux
```

#### 3.2 新建 demo.pen 并生成样图

> **关键**：样图必须创建在 **`doc/UXDesign/demo.pen`** 文件中，**绝不可**写入已存在的 `doc/design.pen`。

1. 调用 `batch_design` 新建 `doc/UXDesign/demo.pen`（确保指定正确的 `filePath`）
2. 在 demo.pen 中调用 `set_variables` 设置用户确认的配色变量
3. 基于 UI UX PRO MAX 返回的 **5 种不同设计模式**，在 demo.pen 中生成 5 套设计样图
4. **使用 `FindEmptySpace` 分散放置每套样图**（见下方详细说明）
5. 每套样图完成后，使用 `get_screenshot` 截取关键页面截图

#### 3.3 使用 FindEmptySpace 避免样图重叠

> **关键**：新建的 frame 默认坐标均为 `(0, 0)`，若不手动设置位置，所有样图会堆叠在一起。**必须**使用 `FindEmptySpace` 为每套样图找到独立位置。

**正确做法**（分批执行）：

```js
// 每批处理一个 frame：先找空位，再移动
// 批次 1
pos = FindEmptySpace({width: 375, height: 812, padding: 60})
Update("frame1Id", {x: pos.x, y: pos.y})

// 批次 2
pos = FindEmptySpace({width: 375, height: 812, padding: 60})
Update("frame2Id", {x: pos.x, y: pos.y})

// ... 共 5 批
```

**原因**：`FindEmptySpace` 会考虑当前画布上已放置的节点，因此每批之间画布状态会更新，确保后续批次找到的位置不会与已放置的 frame 重叠。

**错误做法**：在同一批次中多次调用 `FindEmptySpace` 而不立即使用结果 — 因为同一批次内画布状态不变，所有 `FindEmptySpace` 可能返回相同位置。

**验证**：放置完成后，使用 `snapshot_layout({maxDepth: 0})` 检查顶层 frame 的 x/y 坐标，确认无重叠。

**样图设计要点**：
- 覆盖 UI UX PRO MAX 推荐的主要颜色方案和布局风格
- 使用 Generate 生成占位图片，背景统一为 `#FFFFFF` 白色或 `#7FB77E` 绿色
- 不使用 emoji，所有素材图片用 AI 生成
- 每套样图完成后截图保存
- **确保 filePath 指向 `doc/UXDesign/demo.pen`**，不要写入当前打开的 `design.pen`

---

### 第 4 步：用户确认风格

将 5 套样图的截图展示给用户，进行详细确认：

- 询问用户对每套样图的评价（喜欢/不喜欢什么）
- 收集反馈点：颜色、布局、圆角、字体、图标风格等
- 根据反馈调整样图
- **循环直到用户明确满意**，确认最终选择的设计方向

---

### 第 5 步：生成本项目设计 Skill

基于最终敲定的设计风格，生成项目级 design skill 文件：

```markdown
.trae/skills/pencil-design-{project-name}.md
```

**该 Skill 必须包含以下内容**：

```
# {项目名} UX 设计规范

## 设计风格
- 风格类型：xxx
- 核心关键词：xxx

## 色彩系统
- 主色：`#xxxxxx`
- 辅色：`#xxxxxx`
- 背景色：`#xxxxxx`
- 文字色：`#xxxxxx`
- 其他：xxx

## 字体系统
- 中文字体：xxx
- 英文字体：xxx
- 字号层级：xxx

## 组件规范
- 圆角规范：xxx px
- 间距规范：xxx px
- 按钮规范：xxx
- 卡片规范：xxx
- TabBar 规范：xxx
- 导航栏规范：xxx

## 图标规范
- 图标风格：xxx
- 通用图标列表：xxx

## 页面清单
- L1 - 页面名
- L2 - 页面名
- L3 - 页面名
- L4 - 页面名
```

将此文件内容也追加到项目 `doc/` 目录下的设计规范文档中。

---

### 第 6 步：更新交互设计文稿

要求用户提供项目的交互设计文稿（`interaction-design.md` 等），并做以下处理：

1. 将敲定的**视觉风格**（颜色、字体、圆角、间距等）应用到交互文稿中
2. 更新文稿中的视觉描述，使其与最终设计规范一致
3. 检查交互流程是否完整，标记所有需要设计的页面和状态

---

### 第 7 步：开始设计

创建 `design.pen` 文件，按照交互文稿中的页面进行完整设计。

#### 7.1 规划阶段

先分析交互文稿，规划：

- **页面数量**：列出所有 L1-L4 页面
- **通用组件**：识别可复用的组件（按钮、卡片、弹窗、对话框、进度条、TabBar、导航栏、输入框、列表项等）
- **独立页面**：每个页面的独特元素
- **素材清单**：所有需要的图片/图标/背景
- **状态清单**：每个页面需要展示的不同状态（加载态、空态、错误态、正常态等）

#### 7.2 设计设计系统页面

先创建设计系统页面，包含：
- 色板（主色、辅色、背景、文字等 swatch）
- 字体层级展示
- 通用组件库（按钮、输入框、卡片、TabBar、导航栏等）

设计系统页面使用 `reusable` 属性标记组件，方便后续实例化。

#### 7.3 生成素材页面

创建素材页面，将所有需要的素材以**占位符**形式先整理出来：

- 使用 frame + Generate 生成占位图片
- 图片背景统一为 `#FFFFFF`（白色）或 `#7FB77E`（绿色）
- 明确标注每个素材的用途和命名
- 占位符统一放置，方便后续统一导出和去背景处理

#### 7.4 按 L1→L4 层级生成页面

按层级顺序生成页面，每页完成后立即验证：

1. L1 页面（首页/入口页）
2. L2 页面（列表/输入页）
3. L3 页面（详情/结果页）
4. L4 页面（弹窗/抽屉）

**每个页面需考虑**：
- 正常态展示
- 加载态（骨架屏/loading 指示器）
- 空态（无数据时的展示）
- 错误态（错误提示）
- 边缘态（长文本/长列表滚动效果）

**设计约束**（贯穿全程）：
- 不得使用 emoji — 所有图标/素材只能用 AI 生图 + 去背景
- 不得自行绘制 SVG — 全部通过 AI 文生图
- 所有图片统一白色或绿色背景，方便后续抠图
- 图片统一放在 `doc/images/` 目录

#### 7.5 过程中补充素材

在页面生成过程中，如果发现需要新的通用素材或图标：

1. 立即在素材页面中增加对应的占位符
2. 记录该素材的用途和所属页面
3. 暂不处理去背景，等全部页面完成后再统一处理

#### 7.6 统一处理 ICON 背景

所有页面生成完毕后，进入批量去背景流程：

1. **导出**：使用 `export_nodes` 将所有素材页面中的图片节点导出到 `doc/images/` 目录
2. **去背景**：使用 Python Pillow 脚本批量去除白色/绿色背景，生成透明 PNG
   - 白色背景：`target_color=(255, 255, 255)`, threshold=10-30
   - 绿色背景：`target_color=(127, 183, 126)`, threshold=40-60
3. **导入**：将所有透明 PNG 通过 `Update` 更新到对应的节点 fill 引用
4. **确认**：截图确认所有 icon 显示正常

> 具体操作参考 `pencil-mcp-api` 的「5.3 素材图片/ICON 生成流程」

---

### 第 7 步补充：图片资产管理与背景图流程

本次 dark 模式开发暴露出：图片不能统一按「ICON 去背景」处理，全幅背景图需要独立的生成、命名、替换流程。本节补充规范。

#### 7.7.1 图片类型与处理策略

| 类型 | 典型用途 | 是否去背景 | 处理方式 |
|------|----------|------------|----------|
| **ICON / 小图标** | 功能图标、徽章、Tab 图标 | 是 | AI 生成（白/绿背景）→ `export_nodes` → `remove_bg.py` → 重新导入为透明 PNG |
| **全幅背景图** | 页面底、卡片底、弹窗底、导航栏 | 否 | AI 生成纹理图 → 直接作为 `fill: {type: "image"}` 应用 |
| **装饰点缀** | 图标四周手绘装饰、角落花纹 | 否 / 可选 | AI 生成后可直接嵌入背景图，或单独生成透明 PNG |
| **头像 / 插画** | 用户头像、空状态、成就徽章 | 视情况 | 需要透明主体的去背景；作为卡片背景的不去 |
| **重复纹理** | 纸张纹理、布纹、网格 | 否 | 生成小尺寸图 → 使用 image fill 平铺模式 |

**核心原则**：只有最终需要**透明主体、叠加在不同背景上**的图片才需要去背景；全幅背景图必须保留自己的底色/纹理，不可去背景。

#### 7.7.2 背景图选型决策树

```text
需要为某个区域填充背景
│
├── 追求极简、性能优先、后续易改色
│   └── 使用纯色 fill（引用设计 token）
│
├── 需要轻微层次但不引入图片资源
│   └── 使用渐变 fill（线性/径向）
│
├── 需要品牌质感、手绘氛围、纸纹效果
│   └── AI 生成一张纹理背景图（stretch 模式）
│
├── 需要大面积重复图案（细纹理）
│   └── 生成小尺寸纹理 → image fill 平铺模式
│
└── 需要突出某个视觉中心（如徽章、图标）
    └── AI 生成带中心装饰的背景图
```

**选择建议**：同一类卡片/弹窗尽量共用同一张背景图，避免视觉碎片化；背景图颜色必须与当前主题 token 协调，不可出现浅色纹理出现在 dark 模式下的情况。

#### 7.7.3 AI 背景图生成 SOP

与 ICON 生成不同，背景图需要**风格统一、尺寸规范、一次性批量生成**。

**步骤 1：确定风格锁定词**

为整个项目固定一组关键词，所有背景图共用：

```text
cartoon simple hand-drawn style, paper texture background, solid color, sparse cute doodles around the main subject, warm tone, clean, no text, no UI elements
```

**步骤 2：列出背景图尺寸清单**

| 用途 | 建议尺寸 | 命名示例 |
|------|----------|----------|
| 页面底层背景 | 375 × 812 | `bg_page_dark.png` |
| Hero 卡片 / 大横幅 | 327 × 170 | `bg_hero_card_dark.png` |
| 进度 / 功能卡片 | 327 × 140 | `bg_progress_card_dark.png` |
| 推荐小卡片 | 157 × 130 | `bg_rec_card_dark.png` |
| 用户中心卡片 | 327 × 160 | `bg_user_card_dark.png` |
| 底部 TabBar | 375 × 84 | `bg_tabbar_dark.png` |
| 顶部导航栏 | 375 × 96 | `bg_navbar_dark.png` |
| 弹窗（成就/解锁） | 280 × 200 | `bg_modal_achievement_dark.png` |
| 弹窗（警告/确认） | 280 × 160 | `bg_modal_warning_dark.png` |
| 排行榜 Top1 | 100 × 150 | `bg_rank_top1_dark.png` |
| 排行榜 Top2 | 100 × 130 | `bg_rank_top2_dark.png` |
| 排行榜 Top3 | 100 × 110 | `bg_rank_top3_dark.png` |

**步骤 3：批量生成**

使用 `Generate` 按尺寸生成，提示词结构：

```js
Generate("frameId", "ai", "A cartoon simple hand-drawn [卡片/Hero/弹窗] background, [主题色如 deep brown #2A241D] paper texture, sparse cute doodles around the center, no text, clean, 375x812")
```

**步骤 4：应用为 image fill**

```js
Update("targetNodeId", {
  fill: {
    enabled: true,
    type: "image",
    mode: "stretch",
    url: "./images/bg_page_dark.png"
  }
})
```

**步骤 5：验证**

- `snapshot_layout` 检查节点未坍塌。
- `get_screenshot` 截取页面，确认背景与文字/图标对比度足够。
- 同主题所有页面截图走查，确保风格一致。

#### 7.7.4 批量替换背景图工作流

适用于已有设计稿需要统一替换背景（如风格升级、主题切换）。

```text
1. 梳理背景分类：用 batch_get 搜索所有用作背景的 frame/rectangle 节点
2. 建立映射表：按用途归类为页面底、Hero 卡片、进度卡片、弹窗、TabBar、导航栏...
3. 准备统一素材：每类生成/选择一张背景图，按命名规范存放
4. 批量 Update：用 batch_design 将同类节点统一替换为同一张图
5. 验证：snapshot_layout + get_screenshot 逐类确认
```

示例：将多个 Hero 卡片统一替换为同一张背景图

```js
Update("heroCard1", {fill: {enabled: true, type: "image", mode: "stretch", url: "./images/bg_hero_card_dark.png"}})
Update("heroCard2", {fill: {enabled: true, type: "image", mode: "stretch", url: "./images/bg_hero_card_dark.png"}})
Update("heroCard3", {fill: {enabled: true, type: "image", mode: "stretch", url: "./images/bg_hero_card_dark.png"}})
```

#### 7.7.5 图片资产命名规范

所有图片统一存放在 `.pen` 同级 `images/` 目录下，引用路径为 `./images/xxx.png`。

命名规则：

```text
{前缀}_{用途描述}_{主题/状态}.png
```

| 前缀 | 含义 | 示例 |
|------|------|------|
| `bg_` | 背景图（全幅、有底色纹理） | `bg_page_dark.png` |
| `icon_` | 图标（去背景后透明 PNG） | `icon_star_dark.png` |
| `deco_` | 装饰元素（可选透明） | `deco_doodle_corner_dark.png` |
| `avatar_` | 头像/角色插画 | `avatar_default.png` |
| `badge_` | 徽章/成就图标 | `badge_master.png` |
| `illust_` | 空状态/插画 | `illust_empty_note.png` |

#### 7.7.6 batch_design 调用格式提醒

`batch_design` 接收的是一段 **JS DSL 字符串**，通过 `input` 字段传入，**不是** `operations` JSON 数组。

**正确格式**：

```json
{
  "filePath": "f:/work/software/zhixiaoji/miniapp/docs/UXDesign/new.pen",
  "input": "Update('nodeId1', {fill: '#1F1B16'}); Update('nodeId2', {fill: {enabled: true, type: 'image', mode: 'stretch', url: './images/bg_page_dark.png'}});"
}
```

**关键约束**：

- 每批操作建议不超过 25 个。
- 同一批次内变量不跨批次共享。
- 创建节点后返回的 binding 只在当前批次有效，后续批次需使用返回结果中的实际 node ID。
- 图片 `url` 使用相对 `.pen` 文件的路径，如 `./images/bg_page_dark.png`。

---

### 第 8 步：调优与交付

与用户协作调优，直到用户满意：

1. 展示完整设计稿给用户
2. 根据反馈逐项调整（布局、颜色、间距、字体、图标等）
3. 每次调整后截图确认效果
4. 循环直到用户确认**终稿**
5. 输出标准设计稿，标记 `design.pen` 为最终版本
6. 确认后可交由 `pencil-to-miniprogram` skill 进行代码生成

---

## 注意事项（总纲）

1. **MCP 依赖**：所有设计操作依赖 Pencil MCP，确保 MCP 服务正常运行
2. **UI UX PRO MAX 强制拉取**：生成样图前**必须**先从官方仓库拉取最新版 `ui-ux-pro-max` 获取设计模式，不可跳过
3. **技能引用**：设计灵感参考 `ui-ux-pro-max`（从官方仓库拉取最新版），MCP 操作参考 `pencil-mcp-api`，代码生成参考 `pencil-to-miniprogram`
4. **demo.pen 独立文件**：样图必须放在 `doc/UXDesign/demo.pen`，**绝不可**写入 `doc/design.pen`。在 `batch_design` 时务必检查 `filePath` 参数
5. **FindEmptySpace 防重叠**：新建 frame 默认坐标均为 `(0,0)`，多个 frame 会堆叠。**必须**分批调用 `FindEmptySpace` + `Update` 为每个 frame 设置独立位置，完成后用 `snapshot_layout` 验证
6. **emoji 禁令**：任何场景下都不得使用 emoji 作为设计元素
7. **ICON/小素材必去背景，背景图保留纹理底色**：只有需要透明主体的 AI 生成图片（如图标、徽章）才必须走「导出 → 去背景 → 重新导入」流程；全幅背景图、纹理底图直接作为 image fill 应用，不可去背景
8. **先规划后动手**：每个阶段开始前先规划，避免返工
9. **每轮验证**：每步修改后用 `snapshot_layout` + `batch_get` + 截图验证效果
10. **渐进交付**：不要一次性完成所有设计再给用户看，分阶段逐步确认