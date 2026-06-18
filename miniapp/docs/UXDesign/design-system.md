# 知小记 · 设计系统 V2.1

> **版本**：V2.1  
> **日期**：2026-06-18  
> **风格**：手绘知性风（Hand-drawn Intellectual）  
> **定位**：AI 编程学习工具，温暖、专业、不冰冷  
> **主题**：支持 Light / Dark 双主题（Dark 采用「暖调手绘」方案——深褐暖底 + 提亮暖棕装饰）

---

## 一、设计原则

| 原则 | 说明 |
|------|------|
| **手绘温度** | 通过涂鸦装饰、手写体标题、有机圆角，消解编程学习的冰冷感 |
| **聚焦核心** | 每页只呈现 1 个核心行动点，避免信息堆砌 |
| **渐进呈现** | 信息分层展示，先给概览，再给细节 |
| **即时反馈** | 每个操作都有明确的视觉反馈（按钮按下、选中态、加载态） |
| **一致性** | 全局统一的颜色、间距、圆角、字体，确保跨页面体验一致 |

---

## 二、色彩系统

### 2.1 主色板

| 名称 | 色值 | 用途 |
|------|------|------|
| **Primary** | `#2D3E5F` | 主按钮、选中态、核心图标背景、Tab 选中 |
| **Primary Light** | `#384F84` | 渐变终止色、Hover 态 |
| **Accent** | `#C8B496` | 手绘装饰线、次要按钮、强调文字、Tag 背景 |
| **Accent Light** | `#FEF3C7` | 浅色标签背景、图标背景 |

### 2.2 中性色板

| 名称 | 色值 | 用途 |
|------|------|------|
| **Background** | `#F4F2EF` | 全局页面背景（水彩纸纹理） |
| **Card** | `#FFFFFF` | 卡片背景、弹窗背景 |
| **Text Primary** | `#1A1A1A` | 标题、正文、主按钮文字 |
| **Text Secondary** | `#777777` | 辅助文字、描述、占位符 |
| **Divider** | `#E7E5E4` | 分割线、边框 |
| **Surface** | `#E8EDF5` | 次级卡片背景、图标容器 |

### 2.3 功能色板

| 名称 | 色值 | 用途 |
|------|------|------|
| **Success** | `#22C55E` | 成功状态、通过标识、完成进度 |
| **Warning** | `#F59E0B` | 警告、待办、积分、稀有度（普通） |
| **Danger** | `#DC2626` | 错误、删除操作、危险按钮 |
| **Score** | `#F59E0B` | 大数字展示（积分、分数） |

### 2.4 渐变规范（Light）

> 双主题渐变对照见 [2.7 渐变规范（双主题）](#27-渐变规范双主题)

```css
/* 主渐变 - Hero 卡片、CTA 背景 */
linear-gradient(160deg, #2D3E5F 0%, #384F84 100%)

/* 背景渐变 - 页面底层（可选） */
linear-gradient(180deg, #F4F2EF 0%, #FEF3C7 100%)
```

### 2.5 手绘装饰色

| 名称 | 色值 | 用途 |
|------|------|------|
| **Doodle Sepia** | `#C8B496` | 波浪线、圆点、涂鸦线条 |
| **Doodle Gold** | `#F59E0B` | 星星、高亮标记 |
| **Doodle Shadow** | `#00000006~25` | 手绘阴影（极淡） |

### 2.6 Dark Mode 色板（Light / Dark 对照）

Dark 模式采用「暖调手绘」方案——深褐暖底 + 提亮暖棕装饰。色彩策略：背景层降暖深、文字层提亮、装饰色提亮、功能色提亮以保证暗环境对比度。字体、间距、圆角与 Light 完全一致，仅颜色变化。

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--color-primary` | `#2D3E5F` | `#2D3E5F` | 主按钮、选中态（保持品牌一致） |
| `--color-primary-light` | `#384F84` | `#4A6FA5` | 渐变终止色、强调数字（如进度百分比） |
| `--color-accent` | `#C8B496` | `#D4C2A8` | 手绘装饰线、次要按钮、Hero 强调线 |
| `--color-accent-light` | `#FEF3C7` | `#4A3D2A` | 暖色标签背景、待办图标容器 |
| `--color-bg` | `#F4F2EF` | `#1F1B16` | 页面背景（深褐暖底） |
| `--color-card` | `#FFFFFF` | `#2A241D` | 卡片背景、弹窗背景 |
| `--color-surface` | `#E8EDF5` | `#332B22` | 次级卡片、图标容器、头像底色 |
| `--color-text` | `#1A1A1A` | `#F4F2EF` | 标题、正文、主按钮文字 |
| `--color-text-secondary` | `#777777` | `#B5A99A` | 辅助文字、描述、占位符 |
| `--color-divider` | `#E7E5E4` | `#3D3528` | 分割线、边框、进度轨道 |
| `--color-success` | `#22C55E` | `#22C55E` | 成功状态（保持） |
| `--color-warning` | `#F59E0B` | `#FBBF24` | 警告、积分、稀有度（提亮） |
| `--color-danger` | `#DC2626` | `#F87171` | 错误、退出登录、危险操作（提亮） |
| `--color-score` | `#F59E0B` | `#FBBF24` | 大数字展示 |

Dark 装饰色：

| 名称 | Dark 色值 | 用途 |
|------|------|------|
| **Doodle Sepia** | `#D4C2A8` | 波浪线、圆点、圆圈、叉号（提亮暖棕） |
| **Doodle Gold** | `#FBBF24` | 星形、高亮标记 |
| **Doodle Shadow** | `#00000040~66` | 手绘阴影（暗色环境加深） |

### 2.7 渐变规范（双主题）

```css
/* Hero / CTA 主渐变 */
Light: linear-gradient(160deg, #2D3E5F 0%, #384F84 100%)
Dark : linear-gradient(160deg, #2D3E5F 0%, #4A6FA5 100%)

/* 页面背景渐变（可选） */
Light: linear-gradient(180deg, #F4F2EF 0%, #FEF3C7 100%)
Dark : linear-gradient(180deg, #1F1B16 0%, #2A241D 100%)
```

> Dark 的 Hero 仍使用品牌深蓝渐变（保持视觉锚点），仅终止色提亮；页面背景渐变改为深褐过渡。

---

## 三、字体系统

### 3.1 字体家族

| 角色 | 字体 | 备选 | 用途 |
|------|------|------|------|
| **Display** | Playfair Display | Georgia, serif | 页面大标题、品牌名（知小记） |
| **Body** | Inter | -apple-system, PingFang SC, sans-serif | 正文、按钮、标签、描述 |
| **Mono** | JetBrains Mono | Menlo, monospace | 代码片段、技术标签 |

### 3.2 字号规范

| 级别 | 字号 | 字重 | 行高 | 用途 |
|------|------|------|------|------|
| **H1** | 28px | 700 | 1.2 | 页面主标题（欢迎页、我的页） |
| **H2** | 22px | 700 | 1.3 | 卡片标题、模块标题 |
| **H3** | 18px | 600 | 1.4 | 小卡片标题、列表项标题 |
| **H4** | 16px | 600 | 1.4 | 按钮文字、Tab 文字、导航标题 |
| **Body** | 14px | 400 | 1.5 | 正文、描述 |
| **Caption** | 13px | 400 | 1.4 | 辅助说明、标签、时间 |
| **Small** | 12px | 400 | 1.4 | 次要信息、提示文字 |
| **Score** | 36px | 700 | 1.0 | 大数字展示（积分、分数） |

---

## 四、间距系统

### 4.1 基础间距

以 `4px` 为基准单位：

| Token | 值 | 用途 |
|-------|-----|------|
| **space-1** | 4px | 极小间距、图标与文字间距 |
| **space-2** | 8px | 紧凑元素间距、行内间距 |
| **space-3** | 12px | 卡片内部元素间距 |
| **space-4** | 16px | 标准间距、卡片内边距 |
| **space-5** | 20px | 中等间距 |
| **space-6** | 24px | 页面边距、模块间距 |
| **space-8** | 32px | 大模块间距 |
| **space-10** | 40px | 区块间距 |

### 4.2 页面布局

```
页面边距：24px（左右）
模块间距：24px（上下区块间距）
卡片间距：16px（卡片之间）
卡片内边距：16px ~ 20px
```

---

## 五、圆角与阴影

### 5.1 圆角规范

| Token | 值 | 用途 |
|-------|-----|------|
| **radius-sm** | 8px | 小按钮、标签、输入框 |
| **radius-md** | 10px | 图标容器、小卡片 |
| **radius-lg** | 14px | 偏好选择卡片、列表项 |
| **radius-xl** | 16px | 主卡片、弹窗、Hero 卡片 |
| **radius-full** | 999px | 圆形元素、头像、全圆角按钮 |

### 5.2 阴影规范

| 级别 | 参数 | 用途 |
|------|------|------|
| **shadow-sm** | `0 2px 8px rgba(0,0,0,0.06)` | 小卡片、标签、轻量浮层 |
| **shadow-md** | `0 4px 12px rgba(0,0,0,0.08)` | 标准卡片、列表项 |
| **shadow-lg** | `0 6px 20px rgba(45,62,95,0.15)` | Hero 卡片、CTA、重要模块 |
| **shadow-modal** | `0 8px 24px rgba(0,0,0,0.12)` | 弹窗、底部浮层 |

---

## 六、组件规范

### 6.1 按钮

#### 主按钮（Primary Button）

```
背景：#2D3E5F
文字：#FFFFFF
字号：16px / 字重 600
高度：52px
圆角：26px（全圆角）
阴影：无
内边距：0 32px
```

#### 次要按钮（Secondary Button）

```
背景：#C8B496
文字：#1A1A1A
字号：13px / 字重 600
高度：36px
圆角：18px（全圆角）
```

#### 幽灵按钮（Ghost Button）

```
背景：transparent
边框：1px solid #E7E5E4
文字：#1A1A1A
圆角：14px
```

### 6.2 卡片

#### 主卡片（Main Card）

```
背景：#FFFFFF
圆角：16px
内边距：20px
阴影：0 4px 12px rgba(0,0,0,0.08)
```

#### Hero 卡片

```
背景：linear-gradient(160deg, #2D3E5F 0%, #384F84 100%)
圆角：16px
内边距：20px
阴影：0 6px 20px rgba(45,62,95,0.25)
```

#### 偏好选择卡片（Onboarding Card）

```
背景：#FFFFFF
圆角：14px
尺寸：156 x 96px
内边距：16px
阴影：0 2px 8px rgba(0,0,0,0.06)
选中态：边框 2px solid #2D3E5F，右上角显示勾选图标
```

### 6.3 输入框

```
背景：#FFFFFF
边框：1px solid #E7E5E4
圆角：10px
高度：48px
内边距：0 16px
占位符：#777777 / 14px
聚焦态：边框色 #2D3E5F，阴影 0 0 0 3px rgba(45,62,95,0.1)
```

### 6.4 Tab Bar

```
背景：#FFFFFF
高度：64px + safe-area
阴影：0 -2px 10px rgba(0,0,0,0.05)

Tab 项：
  - 默认态：图标 #777777，文字 12px #777777
  - 选中态：图标 #2D3E5F，文字 12px #2D3E5F，字重 600
  - 图标尺寸：24px
```

### 6.5 进度条

```
背景轨道：#E7E5E4
填充色：#2D3E5F
高度：6px
圆角：3px
```

---

## 七、手绘风格规范

### 7.1 装饰元素

| 元素 | 实现方式 | 颜色 | 尺寸 |
|------|----------|------|------|
| **波浪线** | SVG Path / CSS | `#C8B496` | 60 x 12px |
| **星形** | SVG Path | `#F59E0B` | 12 x 12px |
| **圆点** | CSS 圆形 / SVG | `#C8B496` | 6 x 6px |
| **圆圈** | SVG Path（手绘感） | `#C8B496` | 16 x 16px |
| **叉号** | SVG Path | `#C8B496` | 12 x 12px |

### 7.2 手绘纹理

- **页面背景**：使用水彩纸纹理图（`bg_page.png`），底色 `#F4F2EF`
- **卡片背景**：纯白 `#FFFFFF`，不加纹理，保持内容清晰
- **装饰密度**：每屏 3-5 个涂鸦元素，分布在边角和标题旁

### 7.3 有机圆角

- 避免完美的几何圆角，使用 `border-radius: 16px` 但配合轻微不规则的 SVG 边框（可选）
- 重要卡片可添加 1px 的手绘风格边框（颜色 `#C8B496`，虚线或不规则实线）

---

## 八、图标规范

### 8.1 图标来源

- **Lucide 图标库**：作为主要图标源（代码相关图标）
- **手绘图标**：使用 AI 生成的手绘风格图标替换部分 Lucide 图标

### 8.2 图标尺寸

| 场景 | 尺寸 | 颜色 |
|------|------|------|
| Tab Bar | 24px | 默认 `#777777`，选中 `#2D3E5F` |
| 导航栏 | 24px | `#1A1A1A` |
| 卡片图标 | 20-24px | 根据卡片类型：`#FFFFFF` 或 `#2D3E5F` |
| 列表图标 | 16px | `#777777` |
| 按钮图标 | 16px | 跟随按钮文字色 |

### 8.3 图标容器

```
尺寸：36 x 36px 或 40 x 40px
圆角：10px
背景：根据场景（#2D3E5F 深色 / #E8EDF5 浅色 / #FEF3C7 暖色）
```

---

## 九、页面布局规范

### 9.1 页面结构

```
[Status Bar] - 系统状态栏
[Header]     - 页面标题 + 副标题 + 右侧操作（高度 ~96px）
[Content]    - 滚动内容区
  - Hero / CTA（首屏核心）
  - 快捷入口（2x2 或 4 列网格）
  - 列表 / 卡片流
[Tab Bar]    - 底部导航（高度 64px + safe-area）
```

### 9.2 网格系统

- **移动端**：375px 基准宽度
- **卡片宽度**：`375 - 24*2 = 327px`（满宽卡片）
- **双列卡片**：`(327 - 16) / 2 = 155.5px` → 取 156px
- **四列网格**：`(327 - 12*3) / 4 = 72.75px` → 取 72px，间距 12px

### 9.3 安全区域

```css
/* 顶部安全区 */
padding-top: constant(safe-area-inset-top);
padding-top: env(safe-area-inset-top);

/* 底部安全区 */
padding-bottom: constant(safe-area-inset-bottom);
padding-bottom: env(safe-area-inset-bottom);
```

---

## 十、动效规范

### 10.1 交互反馈

| 交互 | 动效 | 时长 |
|------|------|------|
| 按钮按下 | scale(0.96) + opacity 0.9 | 100ms |
| 卡片按下 | scale(0.98) | 150ms |
| 页面进入 | opacity 0→1 + translateY(20px→0) | 300ms |
| 弹窗进入 | opacity 0→1 + scale(0.95→1) | 250ms |
| Tab 切换 | 无动效或 opacity 快速过渡 | 150ms |
| 列表加载 | 骨架屏 → 内容淡入 | 200ms |

### 10.2 缓动函数

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## 十一、无障碍规范

### 11.1 对比度

- 文字与背景对比度 ≥ 4.5:1（正文）
- 大文字（≥18px bold / 24px normal）对比度 ≥ 3:1
- 当前所有色值均满足 WCAG AA 标准

### 11.2 触摸目标

- 按钮最小尺寸：48 x 48px
- Tab 项最小尺寸：56 x 48px
- 图标按钮最小尺寸：44 x 44px

### 11.3 语义化

- 使用语义化标签（`header`, `main`, `nav`, `article`, `footer`）
- 图标按钮添加 `aria-label`
- 弹窗使用 `role="dialog"` + `aria-modal="true"`

---

## 十二、变量命名（CSS Custom Properties）

```css
:root {
  /* 颜色 */
  --color-primary: #2D3E5F;
  --color-primary-light: #384F84;
  --color-accent: #C8B496;
  --color-accent-light: #FEF3C7;
  --color-bg: #F4F2EF;
  --color-card: #FFFFFF;
  --color-text: #1A1A1A;
  --color-text-secondary: #777777;
  --color-divider: #E7E5E4;
  --color-surface: #E8EDF5;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger: #DC2626;

  /* 字体 */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', -apple-system, 'PingFang SC', sans-serif;
  --font-mono: 'JetBrains Mono', Menlo, monospace;

  /* 间距 */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 16px;
  --radius-full: 999px;

  /* 阴影 */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 6px 20px rgba(45,62,95,0.15);
  --shadow-modal: 0 8px 24px rgba(0,0,0,0.12);

  /* 动效 */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
}

/* Dark 主题覆盖：仅覆盖与 Light 不同的变量，其余继承 :root */
page[data-theme="dark"],
[data-theme="dark"] {
  --color-primary-light: #4A6FA5;
  --color-accent: #D4C2A8;
  --color-accent-light: #4A3D2A;
  --color-bg: #1F1B16;
  --color-card: #2A241D;
  --color-surface: #332B22;
  --color-text: #F4F2EF;
  --color-text-secondary: #B5A99A;
  --color-divider: #3D3528;
  --color-warning: #FBBF24;
  --color-danger: #F87171;
  --color-score: #FBBF24;

  /* Dark 阴影加深 */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.40);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.50);
  --shadow-lg: 0 6px 20px rgba(0,0,0,0.55);
  --shadow-modal: 0 8px 24px rgba(0,0,0,0.66);
}
```

---

## 十三、页面级规范速查

### 13.1 主页 (Home)

| 元素 | 规范 |
|------|------|
| 标题 | H1 / Playfair Display / 28px / #1A1A1A |
| 副标题 | Body / Inter / 14px / #777777 |
| Hero 卡片 | 渐变背景 + 阴影-lg + 圆角-xl |
| 快捷入口 | 4 列网格，72px 图标 + 12px 标签 |
| 进度条 | 轨道 #E7E5E4，填充 #2D3E5F，高度 6px |

### 13.2 学习页 (Learn)

| 元素 | 规范 |
|------|------|
| 打卡网格 | 7 列，40px 圆形，间距 12px |
| 课程卡片 | 白色卡片 + 阴影-md + 圆角-xl |
| 浏览入口 | 白色卡片 + 左侧深色图标容器 + 右侧箭头 |

### 13.3 我的页 (Profile)

| 元素 | 规范 |
|------|------|
| 用户信息卡 | 渐变背景 + 头像 48px + 昵称 + 积分 |
| 功能菜单 | 列表项，左侧图标 + 文字 + 右侧箭头 |

### 13.4 欢迎页 (Onboarding)

| 元素 | 规范 |
|------|------|
| 标题 | H1 / Playfair Display / 28px |
| 偏好网格 | 2 列，156px 卡片，间距 16px |
| 跳过按钮 | 文字按钮，右对齐，13px #777777 |
| 主按钮 | 全宽，52px，圆角-full，#2D3E5F |

---

## 十四、资源清单

### 14.1 图片资源（双主题）

资源按主题存放于 `assets/images/${theme}/`，前端通过主题变量切换路径：`images/{{theme}}/bg/bg_page.png`。

#### 背景类（不透明 PNG）

| 文件名 | Light ✅ | Dark ✅ | 尺寸 | 用途 |
|--------|:---:|:---:|------|------|
| `bg_page.png` | ✓ | ✓ | 375x812 | 全局页面背景 |
| `bg_navbar.png` | ✓ | ✓ | 375x96 | 导航栏背景（Dark 含装饰+撕裂边） |
| `bg_hero_card.png` | ✓ | ✓ | 327x170 | Hero 卡片背景 |
| `bg_progress_card.png` | ✓ | ✓ | 327x140 | 进度卡、菜单项、课程卡背景 |
| `bg_rec_card.png` | ✓ | ✓ | 157x130 | 推荐卡、章节卡背景 |
| `bg_tabbar.png` | ✓ | ✓ | 375x84 | 底部 TabBar 背景 |
| `bg_user_card.png` | ✓ | ✓ | 327x160 | 用户信息卡、品牌卡背景 |
| `bg_modal_achievement.png` | — | ✓ | 280x200 | 成就弹窗背景（Dark 专属） |
| `bg_modal_warning.png` | — | ✓ | 280x160 | 警告弹窗背景（Dark 专属） |

#### 装饰类（透明 PNG）

| 文件名 | Light ✅ | Dark ✅ | 尺寸 | 用途 |
|--------|:---:|:---:|------|------|
| `deco_wave.png` | ✓ | ✓ | 60x12 | 波浪线装饰 |
| `deco_star.png` | ✓ | ✓ | 24x24 | 星形装饰 |
| `deco_circle.png` | ✓ | ✓ | 16x16 | 圆圈装饰 |
| `deco_dot.png` | ✓ | ✓ | 8x8 | 圆点装饰 |
| `deco_check.png` | ✓ | ✓ | 20x16 | 勾选标记 |
| `deco_spiral.png` | ✓ | ✓ | 20x20 | 螺旋装饰 |
| `deco_sparkle.png` | ✓ | ✓ | 20x20 | 闪光装饰 |
| `deco_back_arrow.png` | ✓ | ✓ | 24x24 | 返回箭头 |
| `deco_arrow.png` | — | ✓ | 24x16 | 列表箭头（Dark 专属） |
| `deco_cross.png` | — | ✓ | 14x14 | 叉号装饰（Dark 专属） |

> Dark 比 Light 多 2 个弹窗背景 + 2 个装饰元素。Light 弹窗暂用纯色/渐变实现，未导出独立背景图。

### 14.2 字体资源

| 字体 | 来源 | 用途 |
|------|------|------|
| Playfair Display | Google Fonts | 页面大标题 |
| Inter | Google Fonts | 正文、UI 文字 |
| JetBrains Mono | Google Fonts | 代码展示 |

---

## 十五、双主题切换机制

### 15.1 主题模式

| 模式 | 值 | 说明 |
|------|-----|------|
| 浅色 | `light` | 默认主题 |
| 深色 | `dark` | 暖调手绘深色 |
| 跟随系统 | `auto` | 根据系统深浅色偏好自动切换 |

### 15.2 实现方式

**CSS 变量 + `data-theme` 属性**：在 `page` 节点设置 `data-theme="light|dark"`，所有组件通过 `var(--color-xxx)` 引用，切换主题仅改变根属性，无需改动组件样式。

```html
<!-- 页面根 -->
<page data-theme="{{theme}}">
  <view class="card">正文使用 var(--color-text)</view>
</page>
```

**图片资源按主题切换**：背景/装饰图按主题分目录存放，通过变量插值：

```html
<image src="/assets/images/{{theme}}/bg/bg_page.png" />
```

### 15.3 状态管理

- **存储**：`wx.setStorageSync('theme', 'light|dark|auto')`
- **读取时机**：`app.js` `onLaunch` 读取并写入全局 `globalData.theme`
- **系统监听**：`auto` 模式下监听 `wx.onThemeChange`，系统切换时同步更新
- **页面同步**：每个页面 `onShow` 从 `app.globalData.theme` 取值写入 `data.theme`

### 15.4 切换入口

设置页 → 通用 → 深色模式（单选项：跟随系统 / 浅色 / 深色）。切换后立即生效并持久化。

### 15.5 适配要点

1. **禁止硬编码颜色**：所有颜色必须走 `var(--color-xxx)`，不得在 wxss 中写死 `#1A1A1A`
2. **图片随主题切换**：背景图、装饰图必须用 `{{theme}}` 路径，不得固定 `images/light/`
3. **图标颜色**：lucide 图标用 `currentColor`，随文字色继承；位图图标按主题提供两套
4. **阴影加深**：Dark 模式阴影透明度自动加深（见 2.6 / 十二章 `[data-theme="dark"]` 块）
5. **弹窗背景**：Dark 弹窗使用专属 `bg_modal_achievement.png` / `bg_modal_warning.png`；Light 弹窗用纯色/渐变
6. **Hero 渐变**：Dark 仍用品牌深蓝渐变保持视觉锚点，仅终止色提亮为 `#4A6FA5`

---

*本文档随设计演进持续更新。*
