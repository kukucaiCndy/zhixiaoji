# 知晓记管理后台 - SDK API 需求文档

> **版本**: 0.10.0 适配
> **日期**: 2026-06-07
> **说明**: 本文档记录前端项目在使用 `@zhixiaoji/api-sdk-web@0.10.0` 过程中发现的 SDK 与后端实际接口不匹配的问题，供后端整改参考。

---

## 一、已完成的 SDK 适配变更

### 1.1 版本更新

- `@zhixiaoji/api-sdk-web`: `0.9.0` -> `0.10.0`

### 1.2 SDK 0.10.0 新增/改进的 API

| 改进项 | 说明 |
|--------|------|
| `KnowledgeApi.getCategory(id)` | 新增，替代 `client.get` |
| `KnowledgeApi.getSubject(id)` | 新增，替代 `client.get` |
| `KnowledgeApi.getChapter(id)` | 新增，替代 `client.get` |
| `KnowledgeApi.getLesson(id)` | 新增，替代 `client.get` |
| `KnowledgeApi.publishLesson(id)` | 新增，课时上架 |
| `KnowledgeApi.unpublishLesson(id)` | 新增，课时下架 |
| `KnowledgeApi.saveLessonHtml(id, htmlContent)` | 新增，保存课时 HTML |
| `Chapter.goal` | 新增字段 |
| `Chapter.content` | 新增字段 |
| `Chapter.unlockPoints` | 新增字段 |
| `Lesson.number` | 新增字段 |
| `Lesson.unlockPoints` | 新增字段 |
| `Lesson.status` | 新增 `'draft' \| 'published'` |

### 1.3 前端已做的适配

- `src/api/modules/knowledge.ts` - 全面适配 0.10.0：
  - `mapChapter` 现在映射 `goal` 和 `unlockPoints` 字段
  - `mapLesson` 现在映射 `status`、`number` 和 `unlockPoints` 字段
  - `createChapter` / `updateChapter` 使用新的 `goal`、`unlockPoints` 字段，移除不存在的 `difficulty`
  - `createSection` / `updateSection` 使用新的 `number`、`unlockPoints`、`status` 字段
  - `saveSectionHtml` 改用 `sdk.knowledge.saveLessonHtml()`
- 类型检查全部通过

---

## 二、SDK 与后端接口不匹配问题（需后端确认）

### 2.1 `cancelPendingDelete` 接口缺失

**问题描述**:
前端之前有 `cancelPendingDelete` 功能（取消待删除状态），但 SDK 0.10.0 中 `KnowledgeApi` 未提供此方法。前端目前通过 `sdk.client.post()` 直接调用。

**当前前端处理**:
```typescript
const res = await sdk.client.post(`/knowledge/categories/${id}/cancel-pending-delete`)
```

**建议**:
请后端确认该接口是否仍然存在。如果存在，请在 SDK `KnowledgeApi` 中添加 `cancelPendingDelete(id)` 方法。

---

### 2.2 `Subject` 查询接口参数不一致

**问题描述**:
前端目前使用 `sdk.client.get()` 直接调用 `/knowledge/subjects?categoryId=xxx`，因为 SDK 的 `listSubjects` 方法参数类型为 `SubjectQueryParams`，但前端需要确认是否支持 `keyword` 参数。

**当前前端处理**:
```typescript
const res = await sdk.client.get(`/knowledge/subjects${query ? '?' + query : ''}`)
```

**建议**:
请后端确认 `SubjectQueryParams` 是否支持 `keyword` 字段，并更新 SDK 类型定义。

---

### 2.3 `generateSectionPage` 接口缺失

**问题描述**:
前端之前有 `generateSectionPage` 功能（生成课时页面），但 SDK 0.10.0 中未提供此方法。前端目前通过 `sdk.client.post()` 直接调用。

**当前前端处理**:
```typescript
const res = await sdk.client.post(`/knowledge/lessons/${id}/page`)
```

**建议**:
请后端确认该接口是否仍然存在。如果存在，请在 SDK `KnowledgeApi` 中添加 `generateLessonPage(id)` 方法。

---

### 2.4 `SubSection` 概念是否彻底废弃

**问题描述**:
SDK 0.10.0 已完全删除 `SubSection` 相关接口。前端目前将 `SubSection` 相关 API 做空实现处理。

**当前前端处理**:
```typescript
async getSubSections(sectionId?: string | number) {
  return { code: 0, data: [], message: 'ok' }
}
```

**建议**:
请后端确认 `SubSection` 概念是否彻底废弃。如果废弃，前端将清理相关代码；如果保留，请在 SDK 中恢复相关接口。

---

### 2.5 `WorkflowType` 缺少 `subject_generation`

**问题描述**:
前端之前有 AI 生成学科的功能，使用 `workflow.executeWorkflow({ type: 'subject_generation' })`，但 SDK 0.10.0 的 `WorkflowType` 中未包含此类型。

**当前前端处理**:
已移除 AI 生成学科按钮，该问题暂不紧急。

**建议**:
如果后端支持 `subject_generation` 工作流，请在 SDK `WorkflowType` 中添加。如果不需要，前端保持现状。

---

## 三、前端兜底策略

所有 SDK 调用均采用 `try-catch` + Mock 数据兜底：

```typescript
try {
  const res = await sdk.knowledge.xxx(...)
  if (res.code === 0) return res
} catch (ex) {
  // 记录错误
}
// 降级到 Mock 数据
return knowledgeMock.xxx(...)
```

这确保了即使后端接口与 SDK 不匹配，前端页面仍能正常展示和交互。

---

## 四、待确认事项清单

| 序号 | 事项 | 优先级 |
|------|------|--------|
| 1 | `cancelPendingDelete` 接口是否保留 | 低 |
| 2 | `SubjectQueryParams` 是否支持 `keyword` | 低 |
| 3 | `generateLessonPage` 接口是否保留 | 中 |
| 4 | `SubSection` 是否彻底废弃 | 高 |
| 5 | `subject_generation` 工作流是否需要 | 低 |
