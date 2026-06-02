# Knowledge Card HTML 页面需求文档

> 创建日期：2026-05-27
> 方案：知识卡片页面改为纯 web-view，所有 UI/交互由后端返回的 HTML 页面完成

---

## 一、架构概览

```
小程序 learn 页面
  ↓ 点击章节
小程序 knowledge-card 页面 (纯 web-view)
  ↓ 加载
后端 HTML 页面 (http://192.168.16.129:12302/html-pages/{htmlId}.html)
  ├── 完整卡片UI（与设计稿一致）
  ├── 圆点指示器（可根据 URL 参数初始化）
  ├── 卡片翻转交互
  ├── 记笔记 → postMessage 通知小程序
  ├── 标记理解/困难 → postMessage 通知小程序
  └── 返回 → postMessage 通知小程序
```

---

## 二、URL 格式

```
GET http://192.168.16.129:12302/html-pages/{htmlId}.html?chapterId=xxx&currentSection=0&totalSections=5
```

| 参数 | 类型 | 说明 |
|------|:----:|------|
| htmlId | string | HTML 页面唯一标识（路径变量） |
| chapterId | string | 章节 ID |
| currentSection | int | 当前小节索引（从 0 开始） |
| totalSections | int | 本章总小节数 |

---

## 三、页面结构与视觉规格

HTML 页面必须 1:1 复刻小程序原生 knowledge-card 页面的视觉效果：

```
┌─ 状态栏安全区 ──────────────────────┐  (CSS padding-top: env(safe-area-inset-top))
├─ 导航栏 ────────────────────────────┤  height: 44px, white bg, #E2E8F0 bottom border
│  ‹        章节标题               ♥  │
├─ 圆点指示器 ────────────────────────┤  centered, gap: 6px
│  ○ ○ ▬ ● ●                        │  active: 24×8px #4F46E5, done: 8×8px #4F46E5
├─ 标签行 ────────────────────────────┤
│  [中等难度] [⏱ 5分钟] [CSS 布局]    │
├─ 📖 卡片内容区 ──────────────────────┤  white card, border-radius: 20px, box-shadow
│                                      │
│  📖 概念问题                          │
│  什么是 Flexbox？…                   │  font-size: 20px bold
│  [思考提示区]                         │  #F8FAFC bg, #64748B text
│  👆 点击翻转查看解释 →               │  #4F46E5
│                                      │
│  --- 翻转后 ---                       │
│  💡 概念解释 + 正文                   │
│  🌱 生活类比 + 正文                   │
│  💻 代码示例 (dark bg, mono font)     │
│  📌 要点总结 + 4条 ✦ 列表             │
│                                      │
├─ 操作栏 ────────────────────────────┤  height: 64px, gap: 10px, padding-bottom: 40px
│  ‹  [✅理解了] [🤔有点难] [📝记笔记]  › │
└─ 📚 延伸阅读 ────────────────────────┘  white card, 3 items
   ● Flexbox vs Grid 布局对比  [进阶]
   ● flex 属性详解            [必读]
   ● 常见 Flexbox 布局案例    [实战]
```

### 颜色规格

| 用途 | 色值 |
|------|------|
| 页面背景 | #F8FAFC |
| 卡片白 | #FFFFFF |
| 主题紫 | #4F46E5 |
| 主文字 | #1E293B |
| 次要文字 | #475569 |
| 辅助文字 | #64748B |
| 橙色 | #F59E0B (难度/有点难按钮) |
| 绿色 | #10B981 (时间标签) |
| 边框 | #E2E8F0 |
| 紫色浅底 | #EEF2FF |
| 代码区 bg | #1E293B |
| 代码区文字 | #94A3B8 |
| 卡片阴影 | 0 4px 20px rgba(0,0,0,0.08) |

### 字号规格

| 元素 | px |
|------|:--:|
| 导航标题 | 18 |
| 卡片问题 | 20 |
| 正文 | 14 |
| 标签文字 | 12 |
| 按钮文字 | 14 |
| 延伸阅读标题 | 14 |
| 延伸阅读项 | 13 |
| 延伸阅读标签 | 11 |

---

## 四、交互逻辑

### 4.1 圆点指示器

- 根据 URL 参数 `totalSections` 渲染圆点数量
- `currentSection` 对应的圆点为 **宽胶囊** (24×8px, #4F46E5)
- `< currentSection` 的圆点为 **已完成** (8×8px, #4F46E5)
- `> currentSection` 的圆点为 **未完成** (8×8px, #E2E8F0)

### 4.2 卡片翻转

- 初始显示**正面**（问题）
- 点击"👆 点击翻转查看解释"或卡片 → 翻转显示**背面**（解释）
- 翻转动画由 HTML/CSS 实现（3D transform）

### 4.3 记笔记

点击"📝 记笔记"按钮 → 调用小程序通信：

```javascript
wx.miniProgram.postMessage({
  data: { action: 'note', chapterId: chapterId, sectionIndex: currentSection }
});
wx.miniProgram.navigateBack();
```

### 4.4 标记"理解了"

点击"✅ 理解了" → 调用通信：

```javascript
wx.miniProgram.postMessage({
  data: { action: 'markUnderstood', chapterId: chapterId, sectionIndex: currentSection }
});
```

### 4.5 标记"有点难"

点击"🤔 有点难" → 调用通信：

```javascript
wx.miniProgram.postMessage({
  data: { action: 'markHard', chapterId: chapterId, sectionIndex: currentSection }
});
```

### 4.6 返回

点击导航栏"‹" → 调用通信：

```javascript
wx.miniProgram.postMessage({
  data: { action: 'back' }
});
wx.miniProgram.navigateBack();
```

### 4.7 前/后小节导航

点击"‹"（左侧导航）→ 上一节
点击"›"（右侧导航）→ 下一节

切换小节时：
1. 更新 `currentSection` 索引
2. 更新圆点指示器状态
3. 重新加载对应小节的 HTML 内容（或页面内切换数据）

---

## 五、依赖注入

HTML 页面的 `<head>` 中需引入微信 SDK：

```html
<script type="text/javascript" src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js"></script>
```

页面初始化时检测环境：

```javascript
function isMiniProgram() {
  return typeof wx !== 'undefined' && wx.miniProgram;
}
```

---

## 六、示例通信代码

```javascript
// 从 URL 获取参数
function getQueryParam(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return decodeURIComponent(r[2]);
  return null;
}

var chapterId = getQueryParam('chapterId') || '';
var currentSection = parseInt(getQueryParam('currentSection')) || 0;
var totalSections = parseInt(getQueryParam('totalSections')) || 0;

// 初始化页面
initPage(chapterId, currentSection, totalSections);

// 发送消息到小程序
function postToMiniProgram(action, extra) {
  if (!isMiniProgram()) return;
  wx.miniProgram.postMessage({
    data: Object.assign({ action: action }, extra || {})
  });
}
```

---

## 七、参考实现

完整的小程序原生页面实现（布局+样式）参见：
- `miniapp/pages/knowledge-card/knowledge-card.wxml` (commit e418c16 之前的版本)
- `miniapp/pages/knowledge-card/knowledge-card.wxss` (commit e418c16 之前的版本)
