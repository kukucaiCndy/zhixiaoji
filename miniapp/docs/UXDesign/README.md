# UXDesign 工作流

> 基于 Pencil MCP 的完整视觉设计工作流，所有内容集中在 `docs/UXDesign/` 目录中。

---

## 目录结构

```
docs/UXDesign/
├── 01_visual_direction/          # 步骤1：视觉方向探索
│   ├── prompts.md               # 3套样图的文生图提示词
│   └── samples/                 # 生成的样图（由 pencil MCP 生成）
├── 02_design_system/            # 步骤2：设计系统
│   ├── design_system.md         # 用户确认后的设计系统规范
│   └── tokens/                  # 设计 token（颜色、字体、间距等）
├── 03_asset_library/            # 步骤3-4：可复用元素 + 素材库
│   ├── ai_image_prompts.md      # 所有素材的文生图提示词
│   ├── assets/                  # 生成的图片素材
│   │   ├── bg/
│   │   └── deco/
│   └── reusable_elements.md     # 可复用元素清单（图标、字体等）
├── 04_page_design/              # 步骤5：页面设计
│   ├── pages/
│   └── components/
└── README.md                    # 本文件
```

---

## 五步法

### 步骤1：视觉方向探索

**目标**：让用户确认整体视觉设计方向。

1. 分析产品定位、目标用户、品牌调性
2. 基于设计系统（色彩倾向、字体风格、情感关键词），撰写 **3套不同风格** 的一级核心页面（首页/学习页/我的页）文生图提示词
3. 调用 Pencil MCP `G()` 功能，在设计稿中生成 **3套样图**
4. 导出截图给用户确认，记录用户选取的方向和关键决策点

**输出物**：
- `01_visual_direction/prompts.md` — 3套提示词及风格说明
- `01_visual_direction/samples/` — 生成的样图文件

---

### 步骤2：创建设计系统

**目标**：将用户确认的视觉方向转化为可执行的设计系统。

1. 根据用户选取的方向，定义设计 token：
   - **Colors**：主色、辅色、中性色、功能色（附 HEX 值）
   - **Typography**：字体家族、字号阶梯、字重、行高
   - **Spacing**：间距基数（如 4px/8px 网格）、圆角规范
   - **Shadows**：阴影层级
   - **Effects**：模糊、透明度等
2. 在 Pencil 设计稿中创建设计系统页面（或变量），确保后续页面可复用

**输出物**：
- `02_design_system/design_system.md` — 完整设计系统文档
- `02_design_system/tokens/` — 按类别拆分的 token 文件

---

### 步骤3：整理可复用元素的提示词

**目标**：提前梳理设计中需要反复出现的元素，避免重复劳动。

1. 梳理设计风格中可复用的各类元素：
   - **背景类**：页面底层背景、TabBar 背景、卡片背景（Hero/进度/内容/弹窗）
   - **装饰类**：波浪线、星星、圆圈、圆点、对勾、叉号、箭头、螺旋、闪光
   - **图标类**：固定风格的 icon font 或自定义图标
   - **字体类**：标题字体、正文字体、数字字体
2. 为每类元素撰写 **文生图提示词**（AI 生成）或标注 **使用规范**（非 AI 生成）
3. 统一命名规范：`bg_xxx.png`、`deco_xxx.png`

**输出物**：
- `03_asset_library/ai_image_prompts.md` — 所有素材的提示词清单
- `03_asset_library/reusable_elements.md` — 非图片类可复用元素清单

---

### 步骤4：生成素材库

**目标**：调用 Pencil MCP 文生图功能，在设计稿中生成完整素材库。

1. 根据 `ai_image_prompts.md`，使用 `batch_design` 中的 `G()` 操作批量生成图片
2. 生成后确认图片风格一致性，必要时调整提示词重新生成
3. 导出图片到 `03_asset_library/assets/{bg,deco}/`
4. 在 Pencil 中建立素材索引页，方便后续页面设计时复用

**输出物**：
- `03_asset_library/assets/bg/` — 所有背景图
- `03_asset_library/assets/deco/` — 所有装饰元素（透明 PNG）

---

### 步骤5：页面设计

**目标**：基于已确认的设计系统和素材库，进行具体页面设计。

1. 按优先级设计页面（一级核心页面 → 二级子页面 → 弹窗/组件）
2. 严格遵守设计系统 token，保持全局一致性
3. 复用 `03_asset_library/assets/` 中的素材，避免重新生成
4. 每批设计后用 `get_screenshot` 验证效果

**输出物**：
- `04_page_design/pages/` — 各页面设计稿
- `04_page_design/components/` — 可复用组件

---

## 关键原则

1. **先方向，后系统，再素材，最后页面** — 不可跳步
2. **素材一次生成，全局复用** — 避免风格漂移
3. **用户确认是硬节点** — 步骤1和步骤2必须得到用户明确反馈
4. **所有内容集中在 UXDesign 目录** — 便于追溯和协作
