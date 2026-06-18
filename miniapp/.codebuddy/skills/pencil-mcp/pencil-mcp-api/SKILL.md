---
name: "pencil-mcp-api"
description: "Pencil MCP API reference — tool list, batch_design/batch_get API, design patterns, icon specs, colors, common pitfalls. Referenced by pencil-design skill."
---

# Pencil MCP API Reference

> 本 Skill 为 `pencil-design` 的技术参考子模块，包含 MCP 工具列表、API 详解、设计模式、图标规范、颜色变量、常见陷阱等。**不需要直接调用**，由 `pencil-design` 按需引用。

---

## 一、MCP 工具列表

| 工具名称 | 用途 |
|----------|------|
| `mcp__pencil__get_editor_state` | 获取当前画布编辑状态、用户选择、.pen schema |
| `mcp__pencil__get_guidelines` | 加载设计指南 (guide) 和样式规范 (style) |
| `mcp__pencil__batch_get` | 批量读取节点信息（支持搜索模式和节点 ID 查询） |
| `mcp__pencil__batch_design` | 批量执行设计操作（核心工具，JS 代码片段） |
| `mcp__pencil__snapshot_layout` | 检查布局结构、定位重叠/裁剪问题 |
| `mcp__pencil__get_screenshot` | 获取节点截图（用于视觉验证） |
| `mcp__pencil__get_variables` | 获取 .pen 文件的设计变量和主题 |
| `mcp__pencil__set_variables` | 设置/更新 .pen 文件的设计变量 |
| `mcp__pencil__export_nodes` | 导出节点为 PNG/JPEG/WEBP/PDF |

> **关键参数**：所有工具（除 `get_editor_state` 外）都需要 `filePath` 参数指定 .pen 文件路径。始终使用绝对路径。

---

## 二、batch_design API 详解

`batch_design` 是核心操作工具，接收一段 JS 代码片段在文档上执行修改。

### 2.1 可用函数

```js
// 预定义变量
const document: string;  // 根节点 ID

// 插入节点（返回新节点 ID）
Insert(parent: string, nodeData: Schema.Child): string;

// 复制节点（返回新节点 ID），复制 reusable 节点会创建 ref 实例
Copy(path: string, parent: string, copyNodeData: Schema.Child): string;

// 更新节点属性（不可改变 id/type/ref）
Update(path: string, updateData: Schema.Child): void;

// 替换节点（返回新节点 ID）
Replace(path: string, nodeData: Schema.Child): string;

// 移动节点
Move(path: string, parent: string | undefined, index?: number): void;

// 删除节点
Delete(path: string): void;

// 生成图片并应用到节点 fill
Generate(nodeId: string, type: "ai" | "stock", prompt: string): void;

// 查找画布空白区域
FindEmptySpace(input: {
  width: number; height: number;
  direction?: "top" | "right" | "bottom" | "left";
  padding?: number;
  nodeId?: string;
}): { x: number; y: number; parentId?: string };
```

### 2.2 path 参数

`Copy`、`Update`、`Replace`、`Move`、`Delete` 的 `path` 参数：
- **普通节点**：直接使用节点 ID，如 `"abc123"`
- **组件实例内子节点**：使用斜杠路径，如 `"instanceId/childId"`
- **斜杠仅用于组件实例嵌套**，普通层级关系不可用斜杠

### 2.3 关键约束

- 每个 `batch_design` 调用在独立作用域执行，**local 变量不跨批次共享**
- 同一批次内用 `bindingName = Insert(...)` 创建的 binding 可在后续同批次操作中使用
- 批次返回后 binding 失效，后续批次须使用返回结果中的实际 node ID
- **绝对不可**在创建节点时手动设置 `id` 属性 — Pencil 自动生成唯一 ID
- 每个节点必须设置 `name` 属性（可读名称），返回结果会包含 name→id 映射
- 建议每批次不超过 **25 个操作**
- `padding` 属性只在 `type: "frame"` 上有效，不能给 text、rectangle 等设置 padding
- 当父容器使用 `layout: "vertical"` 或 `"horizontal"` 时，子节点的 x/y 属性完全被忽略

---

## 三、batch_get 详解

用于读取节点信息，是理解现有设计结构的核心工具。

### 3.1 参数

| 参数 | 说明 |
|------|------|
| `filePath` | .pen 文件绝对路径 |
| `nodeIds` | 按 ID 读取的节点列表 |
| `patterns` | 搜索模式数组：`{name?, type?, reusable?}` |
| `readDepth` | 读取深度（默认 1，即只含直接子节点） |
| `searchDepth` | 搜索深度限制 |
| `resolveInstances` | 展开组件实例（默认 false） |
| `resolveVariables` | 显示变量计算值而非引用名（默认 false） |
| `includePathGeometry` | 包含 path 节点的完整几何数据（默认 false） |

### 3.2 常用模式

```js
// 读取特定节点及其直接子节点
batch_get({filePath, nodeIds: ["abc123"], readDepth: 2})

// 搜索 reusable 组件
batch_get({filePath, patterns: [{reusable: true}], readDepth: 2, searchDepth: 3})

// 搜索特定类型节点
batch_get({filePath, patterns: [{type: "frame", name: "Button"}], readDepth: 2})
```

---

## 四、核心设计模式

### 4.1 布局转换模式（absolute → flexbox）

将旧式 `layout: "none"` + 绝对定位的布局改为现代 flexbox 布局：

```js
// 1. 先读取当前结构
batch_get({filePath, nodeIds: ["parentId"], readDepth: 3})

// 2. 更新父容器为 flexbox 布局
Update("parentId", {layout: "vertical", alignItems: "center", gap: 6, width: "fit_content", height: "fit_content"})

// 3. Replace 旧子节点 + Insert 新子节点（嵌套结构）
newBg = Replace("oldChildId", {type: "frame", name: "NewBg", width: 48, height: 48, cornerRadius: 14, fill: "#E8EDF5", justifyContent: "center", alignItems: "center"})
Insert(newBg, {type: "icon", name: "Icon", library: "lucide", icon: "star", width: 24, height: 24, fill: "#2D3E5F"})

// 4. Update 保留的旧节点（如文本标签）
Update("oldTextId", {fill: "#777777", textGrowth: "auto"})
```

**关键点**：
- 父容器从 `layout: "none"` 改为 `layout: "vertical"` 后，子节点的 x/y 自动被忽略
- 原来 `textGrowth: "fixed-width-height"` 的文本需改为 `textGrowth: "auto"` 以适应 flexbox
- 使用 `Replace` + `Insert` 两连击来创建嵌套结构（如带背景的图标）

### 4.2 批量属性替换模式

适用场景：统一修改多个同级节点的颜色、字体等属性：

```js
// 批量修改图标颜色
Update("icon1Id", {fill: "#2D3E5F"})
Update("icon2Id", {fill: "#2D3E5F"})
Update("icon3Id", {fill: "#2D3E5F"})
Update("icon4Id", {fill: "#2D3E5F"})
```

### 4.3 组件实例模式（ref）

创建可复用组件并用 ref 实例化：

```js
// 批次1：创建组件
card = Insert(document, {type: "frame", name: "Card", reusable: true, layout: "vertical", gap: 8, ...})
cardTitle = Insert(card, {type: "text", name: "Title", ...})
cardDesc = Insert(card, {type: "text", name: "Desc", ...})

// 批次2：实例化（使用返回的实际 ID）
Insert(row, {type: "ref", ref: "returnedCardId", name: "Card Instance", width: "fill_container",
  descendants: {
    "returnedTitleId": {content: "自定义标题"},
    "returnedDescId": {content: "自定义描述"}
  }
})
```

### 4.4 Copy+Replace 页面创建模式

快速基于已有页面创建新页面：

```js
pos = FindEmptySpace({width: 375, height: 812, padding: 80})
newPage = Copy("sourcePageId", document, {name: "新页面", x: pos.x, y: pos.y, placeholder: true,
  descendants: {
    "oldTitleId": {content: "新标题"},
    "oldIconId": {fill: "#2D3E5F"}
  }
})
Update(newPage, {placeholder: false})
```

### 4.5 模态框/弹窗模式

弹窗必须创建为 document 的直接子节点，不可嵌套在页面 frame 内：

```js
overlay = Insert(document, {type: "rectangle", name: "Overlay", x: pageX, y: 0, width: 375, height: 812, fill: "#000000", opacity: 0.5})
dialog = Insert(document, {type: "frame", name: "Dialog", layout: "vertical", gap: 16, width: 320, fill: "#FFFFFF", cornerRadius: 16, padding: 24, x: pageX + 27, y: 200})
```

---

## 五、图标使用规范

### 5.1 Lucide 图标

Pencil 支持 `lucide` 图标库。使用前须确认图标名在 lucide 中存在。

**已验证可用的图标**：
`trophy`, `rotate-ccw`, `star`, `house`, `book-open`, `user`, `chart-column`, `settings`, `search`, `plus`, `check`, `x`, `chevron-right`, `chevron-left`, `arrow-right`, `bell`, `calendar`, `clock`, `edit`, `trash`, `share`, `download`, `upload`, `heart`, `bookmark`, `flag`, `map-pin`, `phone`, `mail`, `lock`, `unlock`

**已验证不可用的图标**：
`bar-chart` → 改用 `chart-column`

**图标节点格式**：
```js
{type: "icon", name: "IconName", library: "lucide", icon: "trophy", width: 24, height: 24, fill: "#2D3E5F"}
```

### 5.2 图标最佳实践

- 图标应放在带背景色的圆角容器中（现代设计规范）
- 容器典型尺寸：44-48px，cornerRadius: 12-14
- 图标典型尺寸：22-24px（在容器中居中）
- 容器使用 flexbox：`justifyContent: "center", alignItems: "center"`

### 5.3 素材图片/ICON 生成流程（强制）

> **强制规则**：所有素材图片和 ICON **不得使用 emoji**，必须由 AI 生成后经去背景处理。emoji 在不同设备/系统上表现不一致，不可用于设计稿。

**完整流程**（三步）：

#### 步骤 1：AI 生图

使用 `Generate` 函数在 Pencil 中生成 icon 图片。背景色统一使用绿色（`#7FB77E`）或白色（`#FFFFFF`），色值固定：

```js
// 白色背景
Generate("targetNodeId", "ai", "a simple flat icon of [具体描述], on a pure #FFFFFF white background, centered, vector clipart style")
// 或绿色背景
Generate("targetNodeId", "ai", "a simple flat icon of [具体描述], on a pure #7FB77E green background, centered, vector clipart style")
```

**约束**：
- 统一使用 `#7FB77E`（绿色）或 `#FFFFFF`（白色）作为生图背景色，不可使用其他颜色
- 提示词中明确写死色值，不要写 "green" 或 "white" 这种模糊描述
- 不要尝试在 AI 生图阶段要求透明背景 — AI 生图工具不支持直接生成透明 PNG，棋盘格背景实质是白色填充

#### 步骤 2：导出 PNG 并去背景

1. 使用 `export_nodes` 将节点导出为 PNG 文件到 `doc/images/` 目录
2. 使用通用去背景脚本去除白色/绿色背景，生成带 alpha 通道的透明 PNG

**使用通用去背景脚本**（位于 `.trae/skills/pencil-mcp/pencil-mcp-api/remove_bg.py`）：

```bash
# 白色背景（默认，threshold 25）
python3 .trae/skills/pencil-mcp/pencil-mcp-api/remove_bg.py --dir ./doc/images

# 绿色背景（threshold 需更高）
python3 .trae/skills/pencil-mcp/pencil-mcp-api/remove_bg.py --dir ./doc/images --color green --threshold 40

# 指定文件名模式
python3 .trae/skills/pencil-mcp/pencil-mcp-api/remove_bg.py --dir ./doc/images --pattern "icon-*.png"

# 自定义容差
python3 .trae/skills/pencil-mcp/pencil-mcp-api/remove_bg.py --dir ./doc/images --threshold 15
```

**参数说明**：

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `--dir` | 是 | - | 图片目录路径 |
| `--pattern` | 否 | `*.png` | 文件名 glob 匹配模式 |
| `--color` | 否 | `white` | 要去除的背景色：`white` 或 `green` |
| `--threshold` | 否 | `25` | 颜色容差 0-255 |

**颜色对照表**：

| 目标背景色 | RGB 值 | threshold 建议 |
|-----------|--------|---------------|
| 白色 `#FFFFFF` | `(255, 255, 255)` | 10-30 |
| 绿色 `#7FB77E` | `(127, 183, 126)` | 40-60 |

**threshold 调优**：去背景后边缘有残留 → 降低 threshold；图标主体被误删 → 提高 threshold。

#### 步骤 3：重新应用到 .pen 文件

```js
Update("iconNodeId", {
  fill: { type: "image", enabled: true, url: "./images/icon-name-transparent.png", mode: "fill" }
})
```

**注意事项**：
- AI 生图是异步的，生成后需等待图片出现再导出
- 如果 AI 生图效果不理想，**应重新生成而非放弃**，调整提示词细化描述即可
- 同一组 icon 应在同一批次生成，确保风格一致
- 去背景后的透明 PNG 建议统一命名：`icon-{类型}-transparent.png`

---

## 六、颜色与变量

### 6.1 设计变量

通过 `get_variables(filePath)` 获取。变量名带 `$` 前缀：

```json
{"$primary": {"type": "color", "value": "#2D3E5F"}, ...}
```

### 6.2 变量引用（谨慎使用）

在 `batch_design` 中可使用 `"$primary"` 引用变量，但**在新版本 MCP 中解析不稳定**。

**推荐做法**：直接从 `get_variables` 获取 hex 值，使用硬编码颜色：

```js
Update("nodeId", {fill: "#2D3E5F"})  // $primary
```

### 6.3 颜色约束

- `fill: "transparent"` 不支持 → 用 `"#00000000"`
- `fill: "none"` 不支持 → 用 `"#00000000"`
- 颜色格式：`#RGB`, `#RRGGBB`, `#RRGGBBAA`

---

## 七、常见陷阱

| # | 现象 | 原因 | 解决 |
|---|------|------|------|
| 0 | **多个顶层 frame 堆叠重叠** | 新建 frame 默认坐标均为 `(0,0)`，未手动设置位置 | **分批**使用 `FindEmptySpace` → `Update`：每批只处理一个 frame，因为 `FindEmptySpace` 会考虑已放置的节点，分批执行才能确保每批找到不同位置。完成后用 `snapshot_layout({maxDepth: 0})` 验证坐标无重叠。 |
| 1 | `fill: "$primary"` 显示为 `"#000000"` | 变量引用无声失败 | 使用硬编码 hex 值 |
| 2 | `fill: "transparent"` 报错 | 非法 fill 值 | 使用 `"#00000000"` |
| 3 | 图标显示为方块/缺失 | lucide 图标名不存在 | 参考 §5.1 已验证列表 |
| 4 | 布局坍塌/元素消失 | `fit_content` + `fill_container` 循环依赖 | 父容器设置显式尺寸 |
| 5 | batch_design 返回空 | 操作 >25 个 / 非法属性值 | 拆分为更小批次 |
| 6 | `Node 'xxx' not found!` | 多轮修改后节点 ID 变化 | 重新 batch_get 获取最新 ID |
| 7 | path/ellipse 元素不能应用图片 fill | 装饰元素类型不支持 | 用 Replace 改为 frame 类型 |
| 8 | 文本不换行 / 溢出 | textGrowth 设置不当 | 换行用 `"fixed-width"` |
| 9 | x/y 设置无效 | 父容器是 flexbox 布局 | 不要同时设置 flexbox + x/y |
| 10 | padding 设置无效 | 节点类型非 frame | padding 仅 frame 可用 |

---

## 八、layout 检查清单

每轮设计修改后，用 `snapshot_layout` 验证：

1. **布局未坍塌**：所有节点都有合理的 width/height（非 0）
2. **内容未被裁剪**：无 `"problems": "clipped"` 标记
3. **间距合理**：相邻区块间距一致（通常 8-16px）
4. **无重叠**：同级节点位置无冲突
5. **页面高度匹配**：内容不超过页面 frame 高度（clip: true 时会被裁掉）

---

## 九、效率建议

1. **先读后写**：每次修改前用 `batch_get` 了解当前结构，避免盲操作
2. **批量操作**：每批 15-25 个操作，减少工具调用轮次
3. **先验证再继续**：每轮修改后用 `batch_get` 确认属性，必要时用 `get_screenshot` 看视觉效果
4. **设计 token 先获取**：`get_variables` 拿到颜色/间距值后直接硬编码，避免变量引用问题
5. **图标先验证**：不确定图标名是否存在时，先用单次 `Insert` 试错再批量操作
6. **布局转换一次性完成**：将 absolute → flexbox 的所有操作放在同一个 `batch_design` 中
7. **弹窗放 document 根**：弹窗/叠层必须是 document 直接子节点，不可嵌套在页面 frame 内
8. **素材复用**：同类卡片/背景共用同一张图片素材，避免风格不一致

---

## 十、文件存放规范

```
project/
├── doc/
│   ├── UXDesign/
│   │   ├── design.pen              # 主设计稿
│   │   ├── demo.pen                # 设计样图/试稿
│   │   └── images/                 # 图片素材目录
│   │       ├── icon-xxx.png
│   │       ├── icon-xxx-transparent.png
│   │       ├── bg_xxx.png
│   │       └── deco_xxx.png
│   └── interaction-design.md       # 交互设计文稿
```

图片引用使用相对于 .pen 文件的路径：`./images/icon-name-transparent.png`