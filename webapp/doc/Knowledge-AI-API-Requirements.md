# 知识体系 AI 生成 API 需求

## 背景

当前 AI 生成大纲和小节内容通过 `sdk.workflow.executeWorkflow()` 流式接口完成。为了增加可靠性，建议后端提供直接的 REST API 端点作为备用。

---

## 1. AI 生成章节大纲

### 端点

```
POST /api/v1/knowledge/systems/{knowledgeSystemId}/generate-outline
```

或在知识体系创建前：
```
POST /api/v1/knowledge/generate-outline
```

### 请求体

```json
{
  "topic": "Python入门",
  "level": "beginner"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `topic` | string | 知识体系名称 |
| `level` | string | 难度: `beginner` / `intermediate` / `advanced` |

### 响应

```json
{
  "code": 0,
  "data": {
    "topic": "Python入门",
    "chapters": [
      {
        "chapter": "Python初识与环境搭建",
        "goal": "掌握Python开发环境搭建",
        "description": "本章将讲解...",
        "sections": [
          { "section": "Python语言简介", "knowledge_point": "了解Python是一种解释型语言" },
          { "section": "安装Python解释器", "knowledge_point": "学习下载并安装Python" }
        ]
      }
    ]
  },
  "message": "ok"
}
```

---

## 2. AI 生成小节内容

### 端点

```
POST /api/v1/knowledge/sections/{sectionId}/generate-content
```

### 请求体

```json
{
  "chapter": "第1章 Python初识与环境搭建",
  "section": "1.1 Python语言简介",
  "knowledge_point": "了解Python是一种解释型、面向对象的高级程序设计语言及其应用领域",
  "color_system": {
    "primary": "#FF6B00",
    "secondary": "#FFC107",
    ...
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `chapter` | string | 所属章节名称 |
| `section` | string | 小节标题 |
| `knowledge_point` | string | 知识点描述 |
| `color_system` | object? | 配色方案 |

### 响应

```json
{
  "code": 0,
  "data": {
    "section_html": "<!DOCTYPE html>..."
  },
  "message": "ok"
}
```

`section_html` 为完整的 HTML 文档字符串。

---

## 3. 图片重新生成

### 端点

```
POST /api/v1/knowledge/sections/{sectionId}/regenerate-image
```

### 请求体

```json
{
  "prompt": "original image alt text or prompt"
}
```

### 响应

```json
{
  "code": 0,
  "data": {
    "url": "https://cdn.example.com/images/xxx.png"
  },
  "message": "ok"
}
```

---

## 优先级

| 接口 | 优先级 | 说明 |
|------|--------|------|
| generate-outline | P1 | 当前仅工作流通路，无 REST 备用 |
| generate-content | P1 | 同上 |
| regenerate-image | P2 | 前端尚未实现图片重生成 UI |

## 当前状态

前端已通过 `sdk.workflow.executeWorkflow()` 流式调用，以上 3 个接口为 REST 备用需求。工作流失败时直接提示错误，不再使用本地 mock 数据。
