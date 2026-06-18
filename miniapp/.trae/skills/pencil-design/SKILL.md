---
name: "pencil-design"
description: "Pencil MCP visual design tool for creating UI pages, components, and design systems in .pen files. Invoke when user needs to create visual designs, UI mockups, page layouts, or design systems."
---

# Pencil MCP Design Skill

This skill provides comprehensive guidance for using Pencil MCP to create and modify visual designs in `.pen` files. It covers all operation types, best practices, common pitfalls, and patterns developed through extensive hands-on experience.

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

> **关键参数**：所有工具（除 `get_editor_state` 外）都需要 `filePath` 参数指定 .pen 文件路径。始终使用绝对路径，如 `F:/work/.../docs/UXDesign/new.pen`。

---

## 二、使用流程

1. **获取上下文**：`get_editor_state(include_schema: true)` 获取当前 .pen schema 和画布状态
2. **加载设计变量**：`get_variables(filePath)` 获取已有设计 token（颜色、间距、字体等）
3. **读取节点**：`batch_get(filePath, {nodeIds, patterns, readDepth, searchDepth})` 理解现有结构
4. **执行修改**：`batch_design(filePath, {input: "..."})` 执行 JS 代码片段
5. **验证结果**：`batch_get` + `snapshot_layout` + `get_screenshot` 确认修改正确

---

## 三、batch_design API 详解

`batch_design` 是核心操作工具，接收一段 JS 代码片段在文档上执行修改。

### 3.1 可用函数

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

### 3.2 path 参数

`Copy`、`Update`、`Replace`、`Move`、`Delete` 的 `path` 参数：
- **普通节点**：直接使用节点 ID，如 `"abc123"`
- **组件实例内子节点**：使用斜杠路径，如 `"instanceId/childId"`
- **斜杠仅用于组件实例嵌套**，普通层级关系不可用斜杠

### 3.3 关键约束

- 每个 `batch_design` 调用在独立作用域执行，**local 变量不跨批次共享**
- 同一批次内用 `bindingName = Insert(...)` 创建的 binding 可在后续同批次操作中使用
- 批次返回后 binding 失效，后续批次须使用返回结果中的实际 node ID
- **绝对不可**在创建节点时手动设置 `id` 属性 — Pencil 自动生成唯一 ID
- 每个节点必须设置 `name` 属性（可读名称），返回结果会包含 name→id 映射
- 建议每批次不超过 25 个操作

---

## 四、batch_get 详解

用于读取节点信息，是理解现有设计结构的核心工具。

### 4.1 参数

| 参数 | 说明 |
|------|------|
| `filePath` | .pen 文件绝对路径 |
| `nodeIds` | 按 ID 读取的节点列表 |
| `patterns` | 搜索模式数组：`{name?, type?, reusable?}` |
| `readDepth` | 读取深度（默认 1，即只含直接子节点） |
| `searchDepth` | 搜索深度限制 |
| `resolveInstances` | 展开组件实例（默认 false） |
| `resolveVariables` | 显示变量计算值而���引用名（默认 false） |
| `includePathGeometry` | 包含 path 节点的完整几何数据（默认 false） |

### 4.2 常用模式

```js
// 读取特定节点及其直接子节点
batch_get({filePath, nodeIds: ["abc123"], readDepth: 2})

// 搜索 reusable 组件
batch_get({filePath, patterns: [{reusable: true}], readDepth: 2, searchDepth: 3})

// 搜索特定类型节点
batch_get({filePath, patterns: [{type: "frame", name: "Button"}], readDepth: 2})
```

---

## 五、核心设计模式

### 5.1 布局转换模式（absolute → flexbox）

将旧式 `layout: "none"` + 绝对定位的布局改为现代 flexbox 布局：

```
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

### 5.2 批量属性替换模式

适用场景：统一修改多个同级节点的颜色、字体等属性：

```js
// 批量修改图标颜色
Update("icon1Id", {fill: "#2D3E5F"})
Update("icon2Id", {fill: "#2D3E5F"})
Update("icon3Id", {fill: "#2D3E5F"})
Update("icon4Id", {fill: "#2D3E5F"})
```

### 5.3 组件实例模式（ref）

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

### 5.4 Copy+Replace 页面创建模式

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

### 5.5 模态框/弹窗模式

弹窗必须创建为 document 的直接子节点，不可嵌套在页面 frame 内：

```js
overlay = Insert(document, {type: "rectangle", name: "Overlay", x: pageX, y: 0, width: 375, height: 812, fill: "#000000", opacity: 0.5})
dialog = Insert(document, {type: "frame", name: "Dialog", layout: "vertical", gap: 16, width: 320, fill: "#FFFFFF", cornerRadius: 16, padding: 24, x: pageX + 27, y: 200})
```

---

## 六、图标使用规范

### 6.1 Lucide 图标

Pencil 支持 `lucide` 图标库。使用前须确认图标名在 lucide 中存在。

**已验证可用的图标**：
`trophy`, `rotate-ccw`, `star`, `house`, `book-open`, `user`, `chart-column`, `settings`, `search`, `plus`, `check`, `x`, `chevron-right`, `chevron-left`, `arrow-right`, `bell`, `calendar`, `clock`, `edit`, `trash`, `share`, `download`, `upload`, `heart`, `bookmark`, `flag`, `map-pin`, `phone`, `mail`, `lock`, `unlock`

**已验证不可用的图标**：
`bar-chart` → 改用 `chart-column`

**图标节点格式**：
```js
{type: "icon", name: "IconName", library: "lucide", icon: "trophy", width: 24, height: 24, fill: "#2D3E5F"}
```

### 6.2 图标最佳实践

- 图标应放在带背景色的圆角容器中（现代设计规范）
- 容器典型尺寸：44-48px，cornerRadius: 12-14
- 图标典型尺寸：22-24px（在容器中居中）
- 容器使用 flexbox：`justifyContent: "center", alignItems: "center"`

---

## 七、颜色与变量

### 7.1 设计变量

通过 `get_variables(filePath)` 获取。变量名带 `$` 前缀：

```json
{"$primary": {"type": "color", "value": "#2D3E5F"}, ...}
```

### 7.2 变量引用（谨慎使用）

在 `batch_design` 中可使用 `"$primary"` 引用变量，但**在新版本 MCP 中解析不稳定**。

**推荐做法**：直接从 `get_variables` 获取 hex 值，使用硬编码颜色：

```js
Update("nodeId", {fill: "#2D3E5F"})  // $primary
```

**原因**：变量引用可能不被正确解析，导致颜色回退为 `#000000`。

### 7.3 颜色约束

- `fill: "transparent"` 不支持 → 用 `"#00000000"`
- `fill: "none"` 不支持 → 用 `"#00000000"`
- 颜色格式：`#RGB`, `#RRGGBB`, `#RRGGBBAA`

---

## 八、常见陷阱

### 8.1 变量引用无声失败
**现象**：`fill: "$primary"` 在 `batch_get` 输出中显示为 `"#000000"`
**解决**：使用硬编码 hex 值 `fill: "#2D3E5F"`

### 8.2 fill 非法值
**错误**：`fill: "transparent"` 或 `fill: "none"`
**解决**：使用 `"#00000000"` 表示透明

### 8.3 图标不存在
**错误**：`Icon 'bar-chart' was not found in the 'lucide' icon set`
**解决**：参考 §6.1 已验证列表，或用 `batch_design` 试错后替换

### 8.4 循环布局依赖
**错误**：`fit_content` 父容器 + `fill_container` 子元素
**解决**：为父容器设置显式尺寸，或改用固定尺寸

### 8.5 batch_design 空响应
**原因**：操作过多（>25）、非法属性值、stroke 语法问题
**解决**：拆分为更小批次，逐步定位问题操作

### 8.6 节点 ID 失效
**错误**：`Node 'xxx' not found!`
**原因**：多轮修改后节点 ID 可能变化；Copy/Replace 会生成新 ID
**解决**：重新执行 `batch_get` 获取最新节点 ID

### 8.7 装饰元素替换
**问题**：原生 `path` / `ellipse` 节点不支持图片 fill
**解决**：用 `Replace` 改为 `frame` 类型后再应用图片 fill

### 8.8 padding 仅限 frame
`padding` 属性只在 `type: "frame"` 上有效。不能给 text、rectangle 等设置 padding。

### 8.9 x/y 在 flexbox 中被忽略
当父容器使用 `layout: "vertical"` 或 `"horizontal"` 时，子节点的 x/y 属性完全被忽略。不要同时设置。

### 8.10 文本尺寸
- `textGrowth: "auto"` (默认)：文本自适应，不换行，忽略 width/height
- `textGrowth: "fixed-width"`：需指定 width，高度自适应，支持换行
- `textGrowth: "fixed-width-height"`：需指定 width 和 height，支持换行

---

## 九、layout 检查清单

每轮设计修改后，用 `snapshot_layout` 验证：

1. **布局未坍塌**：所有节点都有合理的 width/height（非 0）
2. **内容未被裁剪**：无 `"problems": "clipped"` 标记
3. **间距合理**：相邻区块间距一致（通常 8-16px）
4. **无重叠**：同级节点位置无冲突
5. **页面高度匹配**：内容不超过页面 frame 高度（clip: true 时会被裁掉）

---

## 十、效率建议

1. **先读后写**：每次修改前用 `batch_get` 了解当前结构，避免盲操作
2. **批量操作**：每批 15-25 个操作，减少工具调用轮次
3. **先验证再继续**：每轮修改后用 `batch_get` 确认属性，必要时用 `get_screenshot` 看视觉效果
4. **设计 token 先获取**：`get_variables` 拿到颜色/间距值后直接硬编码，避免变量引用问题
5. **图标先验证**：不确定图标名是否存在时，先用单次 `Insert` 试错再批量操作
6. **布局转换一次性完成**：将 absolute → flexbox 的所有操作（Update 父容器 + Replace 子节点 + Update 文本）放在同一个 `batch_design` 中
7. **弹窗放 document 根**：弹窗/叠层必须是 document 直接子节点，不可嵌套在页面 frame 内
8. **素材复用**：同类卡片/背景共用同一张图片素材，避免风格不一致

---

## 十一、文件存放规范

```
miniapp/
├── docs/
│   └── UXDesign/
│       └── new.pen                  # 主设计稿
├── assets/
│   └── images/
│       ├── bg/                      # 背景图（不透明）
│       │   ├── bg_page.png
│       │   ├── bg_tabbar.png
│       │   ├── bg_hero_card.png
│       │   ├── bg_progress_card.png
│       │   └── bg_rec_card.png
│       └── deco/                    # 装饰元素（透明 PNG）
│           ├── deco_wave.png
│           ├── deco_star.png
│           ├── deco_circle.png
│           └── deco_dot.png
```

图片引用使用相对于 .pen 文件的路径：`../../assets/images/bg/bg_page.png`
