# Knowledge API 对接需求文档

> 创建日期：2026-05-27
> 对应后端服务：knowledge (端口 12303)
> 当前状态：SDK v0.8.0 已覆盖知识树/章节/小节接口，以下接口待补充

---

## 一、SDK 已覆盖接口（✅ 已实现）

| 方法 | 端点 | 说明 |
|------|------|------|
| `listKnowledgeSystems` | `GET /knowledge/systems` | 知识体系列表 |
| `getKnowledgeSystem` | `GET /knowledge/systems/:id` | 知识体系详情（含章节概览） |
| `listChapters` | `GET /knowledge/chapters` | 章节列表 |
| `getChapter` | `GET /knowledge/chapters/:chapterId` | 章节详情（含小节概览） |
| `listSections` | `GET /knowledge/sections` | 小节列表 |
| `getSection` | `GET /knowledge/sections/:sectionId` | 小节详情 |
| `listColorSchemes` | `GET /knowledge/color-schemes` | 配色方案列表 |
| `getDefaultColorScheme` | `GET /knowledge/color-schemes/default` | 默认配色方案 |
| `getColorScheme` | `GET /knowledge/color-schemes/:schemeId` | 单个配色方案 |

---

## 二、待补充接口（❌ 需要后端支持）

### 2.1 学习统计 `GET /knowledge/stats`

**使用页面**：首页（home.js）

**请求参数**：无

**响应格式**：
```json
{
  "code": 0,
  "data": {
    "toLearn": 8,
    "toReview": 5,
    "mastered": 42,
    "accuracy": 67
  }
}
```

| 字段 | 类型 | 说明 |
|------|:----:|------|
| toLearn | int | 待学习卡片数 |
| toReview | int | 待复习卡片数 |
| mastered | int | 已掌握卡片数 |
| accuracy | int | 答题正确率（百分比，0-100） |

---

### 2.2 学习进度 `GET /knowledge/progress`

**使用页面**：首页（home.js）

**请求参数**：无

**响应格式**：
```json
{
  "code": 0,
  "data": [
    { "name": "HTML", "percent": 85, "color": "purple" },
    { "name": "CSS", "percent": 60, "color": "cyan" },
    { "name": "JavaScript", "percent": 35, "color": "orange" },
    { "name": "框架", "percent": 20, "color": "red" }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|:----:|------|
| name | string | 知识体系/章节名称 |
| percent | int | 完成百分比（0-100） |
| color | string | 进度条颜色（purple/cyan/orange/red/green/blue） |

---

### 2.3 推荐内容 `GET /knowledge/recommendations`

**使用页面**：首页（home.js）

**请求参数**：无

**响应格式**：
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "icon": "📐",
        "title": "闭包详解",
        "desc": "JavaScript 核心概念",
        "gradient": "blue"
      },
      {
        "id": 2,
        "icon": "🎨",
        "title": "原型链",
        "desc": "面向对象编程基础",
        "gradient": "orange"
      }
    ]
  }
}
```

| 字段 | 类型 | 说明 |
|------|:----:|------|
| id | int | 推荐项ID |
| icon | string | 图标emoji |
| title | string | 标题 |
| desc | string | 描述 |
| gradient | string | 卡片颜色（purple/cyan/orange/blue/green/red） |

---

### 2.4 错题列表 `GET /knowledge/wrong-questions`

**使用页面**：错题本（wrong-questions.js）

**请求参数**：无

**响应格式**：
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "date": "5天前 16:20",
      "question": "Flexbox 中，align-items: center 的作用是什么？",
      "wrongAnswer": "主轴居中",
      "correctAnswer": "交叉轴居中",
      "knowledgeTags": ["CSS Flexbox", "布局"],
      "practiced": true,
      "retryCount": 2,
      "accuracy": 50,
      "category": "css"
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|:----:|------|
| id | int | 错题ID |
| date | string | 答题时间描述 |
| question | string | 题目内容 |
| wrongAnswer | string | 错误答案 |
| correctAnswer | string | 正确答案 |
| knowledgeTags | string[] | 关联知识点标签 |
| practiced | bool | 是否已重练 |
| retryCount | int | 重练次数 |
| accuracy | int | 正确率（百分比） |
| category | string | 分类（html/css/js/framework/other） |

---

## 三、前端已实现的 Mock 兜底机制

当以上接口不可达时，前端已有完整的 Mock 数据兜底，不会影响页面渲染：

```
services/knowledge-api.js
├── getStudyStats()        → catch → { toLearn: 8, toReview: 5, mastered: 42, accuracy: 67 }
├── getStudyProgress()     → catch → [{ name, percent, color }, ...]
├── getRecommendations()   → catch → [{ id, icon, title, desc, gradient }, ...]
└── getWrongQuestions()    → catch → [{ id, date, question, ... }, ...]
```

接口可用后 Mock 自动失效，无需额外代码调整。

---

## 四、建议优先级

| 优先级 | 接口 | 原因 |
|:------:|------|------|
| P0 | `GET /knowledge/stats` | 首页核心数据 |
| P0 | `GET /knowledge/progress` | 首页学习进度 |
| P1 | `GET /knowledge/recommendations` | 首页推荐内容 |
| P1 | `GET /knowledge/wrong-questions` | 错题本核心数据 |
| P2 | 排行榜接口 | rank.js 仍使用硬编码 |

---

## 五、前端调用位置对照

| 后端接口 | 前端文件 | 函数调用 |
|----------|----------|----------|
| `GET /knowledge/systems` → `listKnowledgeSystems()` | `knowledge-api.js` | `buildKnowledgeTree()` |
| `GET /knowledge/chapters` → `listChapters()` | `knowledge-api.js` | `buildKnowledgeTree()` |
| `GET /knowledge/stats` | `knowledge-api.js` | `getStudyStats()` |
| `GET /knowledge/progress` | `knowledge-api.js` | `getStudyProgress()` |
| `GET /knowledge/recommendations` | `knowledge-api.js` | `getRecommendations()` |
| `GET /knowledge/wrong-questions` | `knowledge-api.js` | `getWrongQuestions()` |
