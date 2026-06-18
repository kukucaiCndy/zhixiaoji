# 知小记 - 手绘风格 AI 生图提示词清单

> 使用 Midjourney / Stable Diffusion / 即梦 等工具生成。
> 建议统一导出为 **PNG 格式**，装饰元素需 **透明背景**。
>
> ⚠️ **Pencil MCP `Generate()` 不支持透明背景**，所有图标/装饰类素材必须通过外部工具生成。
> 透明背景生成方法：① SD 搭配透明背景插件/LoRA ② 生成后用 remove.bg 抠图 ③ 即梦选择"透明背景"模式。

---

## 一、全局背景

### 1. 页面底层背景
- **文件名**: `bg_page.png`
- **用途**: 所有页面的底层背景图
- **尺寸**: `375×812` (iPhone 标准屏) 或 `1:2` 比例
- **提示词**:
```
Warm cream watercolor paper texture, subtle grain, off-white #F4F2EF tone, hand-drawn pencil doodles scattered in corners, tiny stars and squiggly lines, soft graphite smudges, organic imperfection, top-down flat lay, high resolution, seamless texture, no text, no UI elements --ar 9:19 --v 6
```
- **导出要求**: 不透明，暖米色为主，无明显边缘

---

## 二、卡片背景

### 2. Hero 续学卡片背景
- **文件名**: `bg_hero_card.png`
- **用途**: 首页核心 CTA 卡片背景
- **尺寸**: `327×170` 或 `16:9` 比例
- **提示词**:
```
Dark navy blue gradient card background #2D3E5F to #384F84, hand-drawn white doodles scattered, stars swirls and sketch marks, warm gold brush stroke accents, subtle paper texture overlay, modern learning app aesthetic, professional yet playful, flat design with organic hand-drawn elements, no text, no buttons --ar 16:9 --v 6
```
- **导出要求**: 圆角自行处理（代码里用 `border-radius: 16px`），图片本身可为矩形

### 3. 进度卡片背景
- **文件名**: `bg_progress_card.png`
- **用途**: 学习进度区域卡片
- **尺寸**: `327×140` 或 `2.3:1` 比例
- **提示词**:
```
Soft white paper card texture #FFFFFF, very subtle warm beige watercolor wash edges, tiny hand-drawn pencil checkmarks and progress bar doodles in margins, minimal clean design, soft shadow, no text, organic paper texture, flat lay --ar 2.3:1 --v 6
```

### 4. 推荐内容卡片背景
- **文件名**: `bg_rec_card.png`
- **用途**: 推荐课程/知识点卡片
- **尺寸**: `157×130` 或 `1.2:1` 比例
- **提示词**:
```
Clean white card background with soft cream watercolor corner accents, hand-drawn tiny star doodle in top-right corner, subtle paper grain texture, minimalist, warm and inviting, no text, no labels --ar 1.2:1 --v 6
```

---

## 三、手绘装饰元素（透明背景 PNG）

### 5. 波浪线装饰
- **文件名**: `deco_wave.png`
- **用途**: 标题旁、卡片间的分隔装饰
- **尺寸**: `60×12`
- **提示词**:
```
Hand-drawn wavy line, pencil sketch style, warm sepia #C8B496 color, organic imperfect stroke, transparent background, minimalist decoration element, no shadow --ar 5:1 --v 6
```
- **导出要求**: 透明背景 PNG

### 6. 手绘星星
- **文件名**: `deco_star.png`
- **用途**: 点缀装饰，强调关键信息
- **尺寸**: `24×24`
- **提示词**:
```
Hand-drawn five-point star doodle, pencil sketch style, warm amber #F59E0B color, imperfect organic lines, transparent background, no shadow, flat design --ar 1:1 --v 6
```

### 7. 手绘圆圈
- **文件名**: `deco_circle.png`
- **用途**: 装饰性标记
- **尺寸**: `16×16`
- **提示词**:
```
Hand-drawn empty circle doodle, pencil sketch style, warm sepia #C8B496 color, imperfect organic stroke, transparent background, no fill, no shadow --ar 1:1 --v 6
```

### 8. 手绘对勾
- **文件名**: `deco_check.png`
- **用途**: 完成状态、正确提示
- **尺寸**: `20×16`
- **提示词**:
```
Hand-drawn checkmark doodle, pencil sketch style, fresh green #10B981 color, organic imperfect stroke, transparent background, no shadow --ar 5:4 --v 6
```

### 9. 手绘叉号
- **文件名**: `deco_cross.png`
- **用途**: 装饰性小标记
- **尺寸**: `14×14`
- **提示词**:
```
Hand-drawn X cross doodle, pencil sketch style, warm sepia #C8B496 color, organic imperfect lines, transparent background, no shadow --ar 1:1 --v 6
```

### 10. 手绘箭头
- **文件名**: `deco_arrow.png`
- **用途**: 引导视线、CTA 旁装饰
- **尺寸**: `24×16`
- **提示词**:
```
Hand-drawn arrow pointing right, pencil sketch style, warm sepia #C8B496 color, organic imperfect stroke, transparent background, no shadow --ar 3:2 --v 6
```

### 11. 小圆点装饰
- **文件名**: `deco_dot.png`
- **用途**: 散落的小点缀
- **尺寸**: `8×8`
- **提示词**:
```
Small hand-drawn dot, pencil sketch style, warm sepia #C8B496 color, slightly irregular circle, transparent background, no shadow --ar 1:1 --v 6
```

### 12. 手绘螺旋
- **文件名**: `deco_spiral.png`
- **用途**: 趣味装饰
- **尺寸**: `20×20`
- **提示词**:
```
Hand-drawn spiral swirl doodle, pencil sketch style, warm sepia #C8B496 color, organic imperfect stroke, transparent background, no shadow --ar 1:1 --v 6
```

### 13. 闪光/星芒
- **文件名**: `deco_sparkle.png`
- **用途**: 成就、解锁时的强调装饰
- **尺寸**: `20×20`
- **提示词**:
```
Hand-drawn sparkle starburst doodle, four-point star with lines, pencil sketch style, gold #F59E0B color, organic imperfect lines, transparent background, no shadow --ar 1:1 --v 6
```

---

## 四、Tab Bar 与导航

### 14. Tab Bar 背景
- **文件名**: `bg_tabbar.png`
- **用途**: 底部导航栏背景
- **尺寸**: `375×84` 或 `4.5:1` 比例（底部可拉伸）
- **提示词**:
```
Soft cream paper strip background #FDFBF7, gentle hand-drawn pencil sketch texture, torn paper rough edge effect on top edge only, subtle organic imperfections, scattered tiny hand-drawn stars and dots in corners, warm neutral paper palette, UI tab bar bottom navigation background, seamless horizontal strip, flat lay top-down, no text, no icons --ar 9:2 --v 6 --style raw
```
- **导出要求**: 不透明，顶部撕纸边缘效果，底部无缝

### 15. 手绘返回箭头
- **文件名**: `deco_back_arrow.png`
- **用途**: 导航栏返回按钮图标，替换 lucide chevron-left
- **尺寸**: `24×24`（实际显示约 20×20）
- **提示词**:
```
Hand-drawn left arrow icon, pencil sketch style, organic imperfect stroke, dark navy #2D3E5F color, simple clean back arrow pointing left, isolated on transparent background, minimalist navigation UI icon, no shadow, flat design, solid stroke only no fill --ar 1:1 --v 6 --no background
```
- **导出要求**: 透明背景 PNG，线条颜色 #2D3E5F

### 16. 导航栏背景
- **文件名**: `bg_navbar.png`
- **用途**: 所有子页面顶部导航栏统一背景
- **尺寸**: `375×96` 或 `4:1` 比例
- **提示词**:
```
Soft cream paper strip background #FDFBF7, gentle hand-drawn pencil sketch texture, torn paper rough edge effect on bottom edge only, subtle organic imperfections, scattered tiny hand-drawn dots, warm neutral paper palette, UI navigation bar top background, horizontal strip, no text, no icons --ar 4:1 --v 6 --style raw
```
- **导出要求**: 不透明，底部撕纸边缘效果，与 Tab Bar 成镜像呼应

---

## 五、特殊场景

### 15. 解锁/成就弹窗背景
- **文件名**: `bg_modal_achievement.png`
- **用途**: 成就达成、解锁成功的弹窗卡片背景
- **尺寸**: `280×200` 或 `1.4:1` 比例
- **提示词**:
```
Celebration card background, soft cream to light gold gradient, hand-drawn confetti doodles, stars and sparkles scattered, pencil sketch style, warm and joyful, no text, no buttons, organic paper texture --ar 1.4:1 --v 6
```

### 16. 警告/确认弹窗背景
- **文件名**: `bg_modal_warning.png`
- **用途**: 删除确认、网络异常等弹窗
- **尺寸**: `280×160` 或 `1.75:1` 比例
- **提示词**:
```
Soft warm white card background, subtle hand-drawn exclamation mark doodle and warning stripes in pencil sketch style, gentle red-orange watercolor wash accents, minimal clean design, no text, no buttons --ar 1.75:1 --v 6
```

---

## 六、文件存放规范

生成后请按以下目录存放：

```
miniapp/
├── assets/
│   ├── images/
│   │   ├── bg/              # 背景图
│   │   │   ├── bg_page.png
│   │   │   ├── bg_hero_card.png
│   │   │   ├── bg_progress_card.png
│   │   │   ├── bg_rec_card.png
│   │   │   ├── bg_tabbar.png
│   │   │   ├── bg_navbar.png
│   │   │   ├── bg_modal_achievement.png
│   │   │   └── bg_modal_warning.png
│   │   └── deco/            # 装饰元素（透明 PNG）
│   │       ├── deco_wave.png
│   │       ├── deco_star.png
│   │       ├── deco_circle.png
│   │       ├── deco_check.png
│   │       ├── deco_cross.png
│   │       ├── deco_arrow.png
│   │       ├── deco_dot.png
│   │       ├── deco_spiral.png
│   │       ├── deco_sparkle.png
│   │       └── deco_back_arrow.png
```

---

## 七、生成建议

| 工具 | 建议参数 |
|------|---------|
| **Midjourney** | `--v 6 --style raw`，装饰元素用 `--no background`；背景类加 `--tile` 做无缝 |
| **Stable Diffusion** | 模型：`Deliberate` 或 `DreamShaper`，CFG 7-8，Steps 25-30；透明背景需搭配专用 LoRA 或后期抠图 |
| **即梦/可灵** | 选择"插画"或"手绘"风格，关闭"自动优化文字"；装饰元素勾选"透明背景"输出 |
| **Remove.bg** | 装饰元素生成后可用此工具抠透明背景（推荐用于 MJ 出图） |
| **Pencil Generate** | ⚠️ 仅用于快速预览/占位，产出的图片**不透明**，不可直接用于生产 |

**重要提醒**：
- 所有 `deco_` 开头的文件必须导出为 **透明背景 PNG**（线条+透明底）
- 背景图（`bg_` 开头）不需要透明
- Pencil `Generate()` 仅作设计稿占位预览，最终素材须用外部工具生成
- 建议生成后适当压缩（TinyPNG），控制单张 < 100KB
