---
name: "pencil-design"
description: "Pencil MCP visual design tool for creating UI pages, components, and design systems in .pen files. Invoke when user needs to create visual designs, UI mockups, page layouts, or design systems."
---

# Pencil MCP Design Skill

This skill provides comprehensive guidance for using Pencil MCP to create visual designs in `.pen` files. It covers all operation types, best practices, common pitfalls, and patterns developed through extensive hands-on experience.

---

## 一、工具概述

### 1.1 Pencil MCP 工具列表

| 工具名称 | 用途 |
|----------|------|
| `mcp_Pencil_MCP_get_editor_state` | 获取当前画布编辑状态和用户选择 |
| `mcp_Pencil_MCP_get_guidelines` | 加载设计指南和样式规范 |
| `mcp_Pencil_MCP_open_document` | 打开 .pen 文件 |
| `mcp_Pencil_MCP_batch_design` | 批量执行设计操作（核心工具） |
| `mcp_Pencil_MCP_batch_get` | 批量读取节点信息 |
| `mcp_Pencil_MCP_find_empty_space_on_canvas` | 查找画布空白区域 |
| `mcp_Pencil_MCP_snapshot_layout` | 检查布局结构 |
| `mcp_Pencil_MCP_get_screenshot` | 获取节点截图 |
| `mcp_Pencil_MCP_get_variables` | 获取变量和主题定义 |
| `mcp_Pencil_MCP_set_variables` | 设置变量和主题 |
| `mcp_Pencil_MCP_search_all_unique_properties` | 搜索所有唯一属性值 |
| `mcp_Pencil_MCP_replace_all_matching_properties` | 批量替换属性值 |
| `mcp_Pencil_MCP_export_nodes` | 导出节点为图片 |

### 1.2 使用流程

1. **首次使用**：调用 `get_editor_state(include_schema=true)` 获取 .pen 文件 schema
2. **加载样式**：调用 `get_guidelines({category:"style",name:"Illustrated Ribbon Stack"})` 等加载设计风格
3. **创建节点**：使用 `batch_design` 执行批量操作
4. **验证结果**：使用 `get_screenshot` 截图检查视觉效果

---

## 二、batch_design 操作类型

### 2.1 Insert (I) - 插入节点

```
binding=I(parentId, {type:"frame", name:"MyFrame", ...})
```

- parent: 父节点 ID 或 binding 名称
- 新节点的 `id` 自动生成，不需要手动指定
- 不可在同一调用中为刚插入的节点添加子节点（需要用 binding 在后续操作中添加）

### 2.2 Copy (C) - 复制节点

```
binding=C(sourceId, parentId, {name:"CopyName", x:100, y:200})
```

- 复制 reusable 节点会创建 ref 实例
- `positionDirection` 和 `positionPadding` 可用于自动定位
- 复制后的节点获得新 ID，原 ID 引用失效

### 2.3 Replace (R) - 替换节点

```
binding=R(path, {type:"frame", name:"NewNode", ...})
```

- 用新节点替换 path 处的节点
- 对于组件实例中的子节点：`"instanceId/childId"`
- 替换后获得新 ID

### 2.4 Update (U) - 更新属性

```
U(nodeId, {fill:"#FFFFFF", cornerRadius:8})
```

- 更新现有节点的属性
- **不可**更改 `id`、`type` 或 `ref` 属性
- 组件实例中的子节点：`"instanceId/childId"`

### 2.5 Delete (D) - 删除节点

```
D(nodeId)
```

### 2.6 Generate Image (G) - 生成图片

```
G(nodeId, "ai", "prompt description")
G(nodeId, "stock", "keyword search")
```

---

## 三、核心设计模式

### 3.1 Copy+Replace 页面创建模式

这是创建多页面的最高效模式：

```
# 1. 复制 Shell 组件创建新页面
pageX=C("ShellComponentId", document, {name:"PageX-名称", x:NEW_X, y:Y})

# 2. 替换内容区域占位符
body=R(pageX+"/placeholderId", {type:"frame", name:"Body", layout:"vertical", gap:20, ...})

# 3. 在新 body 中插入页面内容
bc=I(body, {type:"text", content:"breadcrumb", ...})
```

### 3.2 模态框/弹窗模式

叠层和弹窗必须创建为 document 的直接子节点（同级），不能嵌套：

```
# 叠层背景（使用 rectangle，因为其不支持 layout，不会成为 flex 容器）
overlay=I(document, {type:"rectangle", name:"Overlay", x:X, y:Y, width:1440, height:900, fill:"#000000"})

# 弹窗（与叠层同级，通过 x/y 定位到叠层上方）
dialog=I(document, {type:"frame", name:"Dialog", layout:"vertical", gap:16, width:420, height:220, fill:"#FFFFFF", cornerRadius:12, padding:28, x:CENTER_X, y:CENTER_Y})
```

**关键原因**：当 frame 嵌套时，父 frame 默认变为 flexbox 布局，`x`/`y` 属性会被忽略。

### 3.3 布局计算

页面间距：`页面宽度 + 80px padding`
- 如 Shell 宽度 1440px，则每页间距 1520px（1440 + 80）

---

## 四、常见陷阱与解决方案

### 4.1 `fill:"transparent"` 不支持

**错误**：
```
I(parent, {type:"frame", fill:"transparent"})
```

**解决**：使用 `"#FFFFFF"` 替代，或直接不设置 fill 属性。

### 4.2 text 节点不支持 width + textGrowth:"fixed"

**错误**：
```
I(parent, {type:"text", content:"text", textGrowth:"fixed", width:200})
```

**解决**：移除 `width` 和 `textGrowth`，只使用 `textGrowth` 属性控制文本尺寸：
```
I(parent, {type:"text", content:"text", textGrowth:"fixed"})
```

### 4.3 循环布局依赖

**错误**：
```
parent=I(root, {type:"frame", layout:"vertical", width:"fit_content"})
child=I(parent, {type:"frame", width:"fill_container"})
```

`fit_content` 父容器 + `fill_container` 子元素 = 循环依赖

**解决**：为父容器设置显式高度：
```
parent=I(root, {type:"frame", layout:"vertical", width:500, height:300})
```

### 4.4 Binding 跨批次失效

`batch_design` 返回结果会提示：
> The bindings defined in this block are NO LONGER available to use.

**解决**：在后续批次中使用返回结果中的实际 node ID，而非 binding 名称：
```
# 上一批次返回了: pageX → aBc123
# 下一批次使用:
U("aBc123", {fill:"#FFFFFF"})
```

### 4.5 空响应 `[]`

空响应可能是因为：
1. 操作数量过多（建议每批 ≤30 个操作）
2. 某些属性值不被支持（如 `fill:"transparent"`）
3. stroke 语法问题

**策略**：遇到空响应时，拆分为更小的批次，逐步定位问题操作。

### 4.6 stroke 语法不兼容

某些 frame 节点（尤其是带有 `fill:"#FFFFFF"` 的）添加 stroke 会失败。

**解决**：创建时不设置 stroke，然后用 `U()` 单独添加：
```
U(nodeId, {stroke:{thickness:1, fill:"#E8DED0"}})
```

---

## 五、设计规范（本项目）

### 5.1 色彩系统 - Warm Linen

| 色值 | 用途 |
|------|------|
| `#F3EBE2` | 页面基底背景 |
| `#FAF7F2` | 内容区背景 |
| `#FFFFFF` | 卡片/表格背景 |
| `#1A1A1A` | 主标题文字 |
| `#3D3D3D` | 正文/次要文字 |
| `#D4916E` | 主操作色（按钮） |
| `#7BA87F` | 成功/启用状态 |
| `#C4726F` | 危险/删除操作 |
| `#4A90D9` | 链接/信息色 |
| `#8B7BA8` | 辅助色 |
| `#E8DED0` | 禁用/次要按钮 |
| `#F5F0EB` | 输入框背景 |
| `#F5EDE3` | 表格表头背景 |
| `#C4CFDE` | 辅助操作色 |
| `#999` | 占位符/提示文字 |

### 5.2 字体系统

| 字体 | 用途 | 常用字重 |
|------|------|----------|
| Inter | 标题 | Bold (24px), SemiBold (16-18px) |
| Geist | 正文/UI | Medium (13-14px), Regular (12-14px) |

### 5.3 圆角规范

| 圆角值 | 用途 |
|--------|------|
| `4px` | 小型标签 |
| `6px` | 输入框、小图标 |
| `8px` | 按钮 |
| `12px` | 卡片、表格、模态框 |
| `14px` | 状态标签 |
| `9999px` | 胶囊按钮 |

### 5.4 间距规范

| 间距值 | 用途 |
|--------|------|
| `gap:4` | 紧凑字段内间距 |
| `gap:6-8` | 字段间小间距 |
| `gap:12` | 按钮组间距 |
| `gap:16` | 卡片内标准间距 |
| `gap:20` | 页面区域间距 |
| `gap:24` | 大区块间距 |
| `padding:12-16` | 表格行 |
| `padding:24-28` | 卡片/页面区域 |
| `gap:60-80` | 表格列间距 |

---

## 六、效率建议

1. **预先设计 Shell 组件**：包含顶栏+侧边栏+内容占位区，后续所有页面通过 Copy+Replace 快速生成
2. **批量操作最大化**：每批尽量 20-30 个操作，减少工具调用次数
3. **使用 `find_empty_space_on_canvas` 避免重叠**：每创建一个页面后，用此工具找下一个空白位置
4. **先创建内部无 x/y 定位的子节点**：只有顶级节点需要 x/y，flexbox 子节点自动排列
5. **截图验证**：创建复杂页面后，用 `get_screenshot` 验证效果

---

## 七、操作速查表

| 需求 | 操作 |
|------|------|
| 创建页面 | `C(Shell, document, {name, x, y})` |
| 替换占位内容 | `R(page+"/placeId", {type:"frame", ...})` |
| 添加文本 | `I(parent, {type:"text", content, fontFamily, fontSize, fontWeight, fill})` |
| 添加卡片 | `I(parent, {type:"frame", layout:"vertical", gap, fill:"#FFF", cornerRadius:12, padding:24})` |
| 添加按钮 | `I(parent, {type:"frame", width, height, fill:"#D4916E", cornerRadius:8})` |
| 添加状态标签 | `I(parent, {type:"frame", width:48, height:28, fill:"#7BA87F", cornerRadius:14})` |
| 添加表格 | `I(parent, {type:"frame", layout:"vertical", gap:0, fill:"#FFF", cornerRadius:12})` |
| 添加模态框 | `I(document, {type:"frame", layout:"vertical", gap:16, width:420, fill:"#FFF", cornerRadius:12, padding:28, x:CX, y:CY})` |
| 添加 Toast | `I(document, {type:"frame", layout:"horizontal", gap:10, width:300, height:48, fill, cornerRadius:8, padding:14, x, y})` |
