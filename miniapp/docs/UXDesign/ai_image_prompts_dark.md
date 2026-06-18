# 知小记 - 手绘风格 AI 生图提示词清单（暗色模式）

> 基于 [ai_image_prompts.md](./ai_image_prompts.md) 亮色版本，针对 **方案 B · 暖调手绘 Dark Mode** 重新生成。
> 核心调整：暖米白底 → 深褐暖底，手绘装饰色提亮，保留水彩纸纹理与手绘温度感。
> 新版风格：卡通简约手绘风，装饰点缀集中在图标/头像四周，背景为纸质纹理纯色。
>
> ⚠️ **Pencil MCP `Generate()` 不支持透明背景**，所有图标/装饰类素材必须通过外部工具生成。
> 透明背景生成方法：① SD 搭配透明背景插件/LoRA ② 生成后用 remove.bg 抠图 ③ 即梦选择"透明背景"模式。

---

## 色值映射对照表（亮色 → 暗色）

| 角色 | 亮色值 | 暗色值 | 调整理由 |
|------|--------|--------|----------|
| 页面底色 | `#F4F2EF` 暖米白 | `#1F1B16` 深褐暖底 | 深底保留暖调 |
| 卡片底色 | `#FFFFFF` 纯白 | `#2A241D` 深褐卡 | 比底亮一档 |
| 容器底色 | `#E8EDF5` 浅蓝灰 | `#332B22` 深暖褐 | 图标容器 |
| 主色 | `#2D3E5F` 深蓝 | `#2D3E5F` 不变 | 按钮填充保留 |
| 主色浅 | `#384F84` | `#4A6FA5` | 渐变提亮 |
| 暖棕装饰 | `#C8B496` | `#D4C2A8` | 暗底提亮保可见 |
| 暖标签底 | `#FEF3C7` 奶油 | `#4A3D2A` 深暖褐 | 标签深底 |
| 金色 | `#F59E0B` | `#FBBF24` | 提亮 |
| 成功绿 | `#22C55E` | `#4ADE80` | 提亮 |
| 危险红 | `#DC2626` | `#F87171` | 转浅红 |

---

## 一、全局背景

### 1. 页面底层背景
- **文件名**: `bg_page_dark.png`
- **用途**: 暗色模式所有页面的底层背景图
- **尺寸**: `375×812` (iPhone 标准屏) 或 `1:2` 比例
- **提示词**:
```
Minimal cartoon hand-drawn dark warm brown paper texture background #1F1B16, subtle paper grain, simple tiny hand-drawn doodles scattered lightly in corners: small stars, squiggles and dots in warm cream #D4C2A8 and soft gold #FBBF24, clean simple style, no text, no UI elements, top-down flat lay, seamless texture --ar 9:19 --v 6
```
- **导出要求**: 不透明，深暖褐为主，无明显边缘，保留水彩纸颗粒感

---

## 二、卡片背景

### 2. Hero 续学卡片背景（通用 2.05:1）
- **文件名**: `bg_hero_card_dark.png`
- **用途**: 暗色模式首页核心 CTA 卡片背景
- **尺寸**: `327×160` 或 `2.05:1` 比例
- **提示词**:
```
Minimal cartoon hand-drawn dark navy blue paper texture card background #2D3E5F, subtle paper grain, hand-drawn doodles and sparkles filling the full border frame: stars, swirls, dots, books, pencils in warm cream #D4C2A8 and bright gold #FBBF24, dense border decoration leaving center clean, no text, no UI elements --ar 2.05:1 --v 6
```
- **导出要求**: 圆角自行处理（代码里用 `border-radius: 16px`），图片本身可为矩形；边框装饰需占满四边，避免中心留白

### 2.1 首页 Hero 卡片背景
- **文件名**: `bg_hero_card_home_dark.png`
- **用途**: 暗色模式首页 Hero 卡片（同通用 2.05:1）
- **尺寸**: `327×160` 或 `2.05:1` 比例
- **提示词**: 同通用 Hero 卡片背景

### 2.2 知识章节 Hero 背景
- **文件名**: `bg_hero_card_chapter_dark.png`
- **用途**: 暗色模式知识章节页顶部 Hero 卡片
- **尺寸**: `327×136` 或 `2.4:1` 比例
- **提示词**:
```
Minimal cartoon hand-drawn dark navy blue paper texture card background #2D3E5F, subtle paper grain, hand-drawn doodles around border: stars, swirls, books, code brackets in warm cream #D4C2A8 and bright gold #FBBF24, decorative border fills all edges, no text, no UI elements --ar 2.4:1 --v 6
```

### 2.3 分类搜索 Hero 背景
- **文件名**: `bg_hero_card_search_dark.png`
- **用途**: 暗色模式分类浏览页顶部搜索 Hero 条
- **尺寸**: `327×88` 或 `3.7:1` 比例
- **提示词**:
```
Minimal cartoon hand-drawn dark navy blue paper texture horizontal strip background #2D3E5F, subtle paper grain, hand-drawn doodles along top and bottom borders: stars, search icons, books, magnifying glasses in warm cream #D4C2A8 and bright gold #FBBF24, decorative border fills all edges, no text, no UI elements --ar 3.7:1 --v 6
```

### 2.4 登录引导 Hero 背景
- **文件名**: `bg_hero_card_login_dark.png`
- **用途**: 暗色模式登录引导页顶部品牌 Hero 卡片
- **尺寸**: `327×240` 或 `1.36:1` 比例
- **提示词**:
```
Minimal cartoon hand-drawn dark navy blue paper texture vertical card background #2D3E5F, subtle paper grain, hand-drawn doodles around center icon area: stars, swirls, books, light bulbs in warm cream #D4C2A8 and bright gold #FBBF24, decorative border fills all edges, no text, no UI elements --ar 1.36:1 --v 6
```

### 2.5 错题本 Hero 背景
- **文件名**: `bg_hero_card_wrong_dark.png`
- **用途**: 暗色模式错题本页顶部统计 Hero 卡片
- **尺寸**: `327×112` 或 `2.9:1` 比例
- **提示词**:
```
Minimal cartoon hand-drawn dark navy blue paper texture card background #2D3E5F, subtle paper grain, simple hand-drawn study doodles around border: books, pencils, light bulbs, stars in warm cream #D4C2A8 and soft gold #FBBF24, decorative border fills all edges, clean simple style, no text, no UI elements --ar 2.9:1 --v 6
```

### 2.6 学习概览卡片背景
- **文件名**: `bg_study_overview_dark.png`
- **用途**: 暗色模式学习页本周学习概览卡片（独立背景，避免与进度卡片混用导致拉伸）
- **尺寸**: `327×160` 或 `2.05:1` 比例
- **提示词**:
```
Minimal cartoon hand-drawn dark warm brown paper texture card background #2A241D, subtle paper grain, tiny hand-drawn study calendar doodles around border: checkmarks, small books, stars, dots in warm cream #D4C2A8 and soft gold #FBBF24, simple sparse border decoration, no text, no UI elements --ar 2.05:1 --v 6
```

### 3. 进度卡片背景
- **文件名**: `bg_progress_card_dark.png`
- **用途**: 暗色模式学习进度、课程列表、功能菜单等卡片背景
- **尺寸**: `327×140` 或 `2.3:1` 比例（可拉伸适配不同高度）
- **提示词**:
```
Minimal cartoon hand-drawn dark warm brown paper texture card background #2A241D, subtle paper grain, tiny hand-drawn checkmarks and progress doodles in margins in warm cream #D4C2A8, simple sparse style, no text, no UI elements --ar 2.3:1 --v 6
```

### 4. 推荐内容卡片背景
- **文件名**: `bg_rec_card_dark.png`
- **用途**: 暗色模式推荐课程/知识点卡片、章节锁定卡片、分享海报卡片
- **尺寸**: `157×130` 或 `1.2:1` 比例
- **提示词**:
```
Minimal cartoon hand-drawn dark warm brown paper texture card background #2A241D, subtle paper grain, small hand-drawn star and corner doodles in warm cream #D4C2A8 and soft gold #FBBF24, simple sparse style, no text, no UI elements --ar 1.2:1 --v 6
```

### 5. 用户信息卡片背景
- **文件名**: `bg_user_card_dark.png`
- **用途**: 暗色模式个人中心用户资料卡、微信授权账户卡、关于我们品牌卡
- **尺寸**: `327×160` 或 `2.05:1` 比例
- **提示词**:
```
Minimal cartoon hand-drawn dark warm brown paper texture card background #2A241D, subtle paper grain, simple hand-drawn doodles around center avatar area: small stars, sparkles and dots in warm cream #D4C2A8 and soft gold #FBBF24, simple sparse style, no text, no UI elements --ar 2.05:1 --v 6
```

---

## 三、手绘装饰元素（透明背景 PNG）

### 12. 波浪线装饰
- **文件名**: `deco_wave_dark.png`
- **用途**: 标题旁、卡片间的分隔装饰
- **尺寸**: `60×12`
- **提示词**:
```
Hand-drawn wavy line, pencil sketch style, warm light sepia #D4C2A8 color, organic imperfect stroke, transparent background, minimalist decoration element, no shadow --ar 5:1 --v 6
```
- **导出要求**: 透明背景 PNG

### 13. 手绘星星
- **文件名**: `deco_star_dark.png`
- **用途**: 点缀装饰，强调关键信息
- **尺寸**: `24×24`
- **提示词**:
```
Hand-drawn five-point star doodle, pencil sketch style, warm amber gold #FBBF24 color, imperfect organic lines, transparent background, no shadow, flat design --ar 1:1 --v 6
```

### 14. 手绘圆圈
- **文件名**: `deco_circle_dark.png`
- **用途**: 装饰性标记
- **尺寸**: `16×16`
- **提示词**:
```
Hand-drawn empty circle doodle, pencil sketch style, warm light sepia #D4C2A8 color, imperfect organic stroke, transparent background, no fill, no shadow --ar 1:1 --v 6
```

### 15. 手绘对勾
- **文件名**: `deco_check_dark.png`
- **用途**: 完成状态、正确提示
- **尺寸**: `20×16`
- **提示词**:
```
Hand-drawn checkmark doodle, pencil sketch style, fresh bright green #4ADE80 color, organic imperfect stroke, transparent background, no shadow --ar 5:4 --v 6
```

### 16. 手绘叉号
- **文件名**: `deco_cross_dark.png`
- **用途**: 装饰性小标记
- **尺寸**: `14×14`
- **提示词**:
```
Hand-drawn X cross doodle, pencil sketch style, warm light sepia #D4C2A8 color, organic imperfect lines, transparent background, no shadow --ar 1:1 --v 6
```

### 17. 手绘箭头
- **文件名**: `deco_arrow_dark.png`
- **用途**: 引导视线、CTA 旁装饰
- **尺寸**: `24×16`
- **提示词**:
```
Hand-drawn arrow pointing right, pencil sketch style, warm light sepia #D4C2A8 color, organic imperfect stroke, transparent background, no shadow --ar 3:2 --v 6
```

### 18. 小圆点装饰
- **文件名**: `deco_dot_dark.png`
- **用途**: 散落的小点缀
- **尺寸**: `8×8`
- **提示词**:
```
Small hand-drawn dot, pencil sketch style, warm light sepia #D4C2A8 color, slightly irregular circle, transparent background, no shadow --ar 1:1 --v 6
```

### 19. 手绘螺旋
- **文件名**: `deco_spiral_dark.png`
- **用途**: 趣味装饰
- **尺寸**: `20×20`
- **提示词**:
```
Hand-drawn spiral swirl doodle, pencil sketch style, warm light sepia #D4C2A8 color, organic imperfect stroke, transparent background, no shadow --ar 1:1 --v 6
```

### 20. 闪光/星芒
- **文件名**: `deco_sparkle_dark.png`
- **用途**: 成就、解锁时的强调装饰
- **尺寸**: `20×20`
- **提示词**:
```
Hand-drawn sparkle starburst doodle, four-point star with lines, pencil sketch style, bright gold #FBBF24 color, organic imperfect lines, transparent background, no shadow --ar 1:1 --v 6
```

---

## 四、Tab Bar 与导航

### 6. Tab Bar 背景
- **文件名**: `bg_tabbar_dark.png`
- **用途**: 暗色模式底部导航栏背景
- **尺寸**: `375×84` 或 `4.5:1` 比例（底部可拉伸）
- **提示词**:
```
Minimal cartoon hand-drawn dark warm brown paper strip background #1F1B16, subtle paper grain, torn rough paper edge on top, tiny hand-drawn doodles in corners: small stars and dots in warm cream #D4C2A8, simple sparse style, no text, no UI elements --ar 9:2 --v 6
```
- **导出要求**: 不透明，顶部撕纸边缘效果，底部无缝

### 7. 手绘返回箭头
- **文件名**: `deco_back_arrow_dark.png`
- **用途**: 暗色模式导航栏返回按钮图标
- **尺寸**: `24×24`（实际显示约 20×20）
- **提示词**:
```
Hand-drawn left arrow icon, pencil sketch style, organic imperfect stroke, warm cream #F4F2EF color, simple clean back arrow pointing left, isolated on transparent background, minimalist navigation UI icon, no shadow, flat design, solid stroke only no fill --ar 1:1 --v 6 --no background
```
- **导出要求**: 透明背景 PNG，线条颜色改为暖白 `#F4F2EF`（暗底可见）

### 8. 导航栏背景
- **文件名**: `bg_navbar_dark.png`
- **用途**: 暗色模式所有子页面顶部导航栏统一背景，也用于首页/学习页顶部标题区
- **尺寸**: `375×96` 或 `4:1` 比例
- **提示词**:
```
Minimal cartoon hand-drawn dark warm brown paper strip background #1F1B16, subtle paper grain, torn rough paper edge on bottom, tiny hand-drawn doodles in corners: small stars and dots in warm cream #D4C2A8, simple sparse style, no text, no UI elements --ar 4:1 --v 6
```
- **导出要求**: 不透明，底部撕纸边缘效果，与 Tab Bar 成镜像呼应

---

## 五、特殊场景

### 9. 解锁/成就弹窗背景
- **文件名**: `bg_modal_achievement_dark.png`
- **用途**: 暗色模式成就达成、解锁成功的弹窗卡片背景
- **尺寸**: `280×200` 或 `1.4:1` 比例
- **提示词**:
```
Minimal cartoon hand-drawn celebration card background dark warm brown to deep gold, subtle paper grain, hand-drawn confetti, stars, sparkles and party doodles in warm cream #D4C2A8 and bright gold #FBBF24 around center, joyful simple style, no text, no UI elements --ar 1.4:1 --v 6
```

### 10. 警告/确认弹窗背景
- **文件名**: `bg_modal_warning_dark.png`
- **用途**: 暗色模式删除确认、网络异常等弹窗
- **尺寸**: `280×160` 或 `1.75:1` 比例
- **提示词**:
```
Minimal cartoon hand-drawn dark warm brown paper texture card background #2A241D, subtle paper grain, simple hand-drawn exclamation marks and warning stripe doodles in warm cream #D4C2A8 and soft coral #F87171, simple sparse style, no text, no UI elements --ar 1.75:1 --v 6
```

### 11. 排行榜 Top3 卡片背景
- **文件名**: `bg_rank_top1_dark.png` / `bg_rank_top2_dark.png` / `bg_rank_top3_dark.png`
- **用途**: 暗色模式排行榜冠/亚/季军卡片背景
- **尺寸**: 冠军 `100×150`、亚军 `100×130`、季军 `100×110`
- **提示词（冠军）**:
```
Minimal cartoon hand-drawn dark warm brown paper texture card background #2A241D, subtle paper grain, first place gold theme, hand-drawn crown, star and sparkle doodles around center icon area in bright gold #FBBF24 and warm cream #D4C2A8, simple sparse style, no text, no UI elements --ar 2:3 --v 6
```
- **提示词（亚军）**:
```
Minimal cartoon hand-drawn dark warm brown paper texture card background #2A241D, subtle paper grain, second place silver theme, hand-drawn star, medal and sparkle doodles around center icon area in silver #C0C0C0 and warm cream #D4C2A8, simple sparse style, no text, no UI elements --ar 10:13 --v 6
```
- **提示词（季军）**:
```
Minimal cartoon hand-drawn dark warm brown paper texture card background #2A241D, subtle paper grain, third place bronze theme, hand-drawn star, medal and sparkle doodles around center icon area in bronze #CD7F32 and warm cream #D4C2A8, simple sparse style, no text, no UI elements --ar 10:11 --v 6
```

---

## 六、文件存放规范

生成后请按以下目录存放（与亮色并列，后缀 `_dark` 区分）：

```
miniapp/
├── assets/
│   ├── images/
│   │   ├── bg/              # 背景图
│   │   │   ├── bg_page.png              # 亮色
│   │   │   ├── bg_page_dark.png         # 暗色
│   │   │   ├── bg_hero_card.png
│   │   │   ├── bg_hero_card_dark.png
│   │   │   ├── bg_hero_card_chapter_dark.png
│   │   │   ├── bg_hero_card_login_dark.png
│   │   │   ├── bg_hero_card_search_dark.png
│   │   │   ├── bg_hero_card_wrong_dark.png
│   │   │   ├── bg_study_overview_dark.png
│   │   │   ├── bg_progress_card.png
│   │   │   ├── bg_progress_card_dark.png
│   │   │   ├── bg_rec_card.png
│   │   │   ├── bg_rec_card_dark.png
│   │   │   ├── bg_user_card.png
│   │   │   ├── bg_user_card_dark.png
│   │   │   ├── bg_tabbar.png
│   │   │   ├── bg_tabbar_dark.png
│   │   │   ├── bg_navbar.png
│   │   │   ├── bg_navbar_dark.png
│   │   │   ├── bg_modal_achievement.png
│   │   │   ├── bg_modal_achievement_dark.png
│   │   │   ├── bg_modal_warning.png
│   │   │   ├── bg_modal_warning_dark.png
│   │   │   ├── bg_rank_top1_dark.png
│   │   │   ├── bg_rank_top2_dark.png
│   │   │   └── bg_rank_top3_dark.png
│   │   └── deco/            # 装饰元素（透明 PNG）
│   │       ├── deco_wave.png / deco_wave_dark.png
│   │       ├── deco_star.png / deco_star_dark.png
│   │       ├── deco_circle.png / deco_circle_dark.png
│   │       ├── deco_check.png / deco_check_dark.png
│   │       ├── deco_cross.png / deco_cross_dark.png
│   │       ├── deco_arrow.png / deco_arrow_dark.png
│   │       ├── deco_dot.png / deco_dot_dark.png
│   │       ├── deco_spiral.png / deco_spiral_dark.png
│   │       ├── deco_sparkle.png / deco_sparkle_dark.png
│   │       └── deco_back_arrow.png / deco_back_arrow_dark.png
```

---

## 七、暗色模式生成要点

| 要点 | 说明 |
|------|------|
| **底色调性** | 深褐暖底 `#1F1B16`，卡片底 `#2A241D`，避免纯黑 `#000000`，保留水彩纸的暖意 |
| **风格统一** | 卡通简约手绘风，线条 imperfect，避免复杂渐变和写实元素 |
| **装饰布局** | 装饰元素集中在图标/头像/中心内容四周，避免满屏随机散落 |
| **背景纯色** | 背景以纸质纹理纯色为主，Hero 卡片可用主色 `#2D3E5F` 纸质底，减少花哨渐变 |
| **装饰提亮** | 所有手绘线条色从 `#C8B496` 提亮至 `#D4C2A8`，金色从 `#F59E0B` 提亮至 `#FBBF24`，确保暗底可见 |
| **对比增强** | 功能图标容器使用 `#332B22`，在深底上保持清晰层次 |
| **返回箭头变色** | 导航返回箭头从深蓝 `#2D3E5F` 改为暖白 `#F4F2EF`，暗底才可见 |

**重要提醒**：
- 所有 `deco_` 开头的文件必须导出为 **透明背景 PNG**（线条+透明底）
- 背景图（`bg_` 开头）不需要透明
- Pencil `Generate()` 仅作设计稿占位预览，最终素材须用外部工具生成
- 建议生成后适当压缩（TinyPNG），控制单张 < 100KB

---

*本文档基于方案 B 暖调手绘 Dark Mode 配色，记录于 2026-06-18。*

---

## 附录：本次为 `new.pen` 生成的占位图映射

> 以下文件位于 `docs/UXDesign/images/`，当前作为设计稿占位引用，后续应导出并压缩为正式 `assets/images/bg/*.png`。

| 用途 | 占位图文件名 | 实际尺寸 | 目标比例 | 应用节点 |
|------|-------------|----------|----------|----------|
| 页面底层背景 | `generated-1781767997250.png` | 704×1504 | 9:19 | 所有 dark 页面背景 |
| Tab Bar 背景 | `generated-1781768062455.png` | 2192×480 | 4.5:1 | 所有 dark TabBar |
| 导航栏背景 | `generated-1781771086861.png` | 2064×512 | 4:1 | utNfq / Wl20t / h4JQ1z / OB3pR / EwkJJ / ImYBy / VB7pf / aLLbi / kKujc |
| 进度/课程/菜单卡片 | `generated-1781768062959.png` | 1568×672 | 2.3:1 | 学习页课程卡片、我的页菜单项等 |
| 推荐/章节卡片 | `generated-1781768062666.png` | 1136×944 | 1.2:1 | 推荐卡片、锁定章节卡片 |
| 用户资料卡 | `generated-1781768063007.png` | 1488×720 | 2.07:1 | Pg1Zr（我的页用户卡） |
| 首页 Hero | `generated-1781771345807.png` | 1488×720 | 2.07:1 | tyl1F |
| 知识章节 Hero | `generated-1781771349336.png` | 1600×656 | 2.44:1 | iGLb2 |
| 分类搜索 Hero | `generated-1781771345735.png` | 2000×528 | 3.79:1 | MCk5n |
| 登录引导 Hero | `generated-1781771345815.png` | 1200×880 | 1.36:1 | psELe |
| 错题本 Hero | `generated-1781771090458.png` | 1760×608 | 2.89:1 | oKBoG |
| 学习概览卡片 | `generated-1781771088362.png` | 1488×720 | 2.07:1 | wAetB |
| 排行榜 Top1 | `generated-1781768073662.png` | 848×1264 | 2:3 | b1OjE |
| 排行榜 Top2 | `generated-1781768074800.png` | 912×1184 | 10:13 | CYC5p |
| 排行榜 Top3 | `generated-1781768073797.png` | 976×1088 | 10:11 | AMoPC |
