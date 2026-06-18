# 知识体系 - 后端 API 需求文档

> **文档版本**：V1.0
> **创建日期**：2026-05-25
> **关联服务**：core-service（端口 12302）
> **SDK 版本**：`@zhixiaoji/api-sdk-web@0.4.0`
> **目标页面**：内容管理 → 知识体系 / 章节 / 小节

---

## 一、概述

SDK v0.4.0 新增了 `KnowledgeApi`，提供了章节（Chapter）和小节（Section）的基础 CRUD 接口。但前端业务中还存在大量"知识体系（KnowledgeSystem）"相关的概念和操作，SDK 中完全缺失。以下逐条列出 SDK 需要新增或完善的内容。

---

## 二、SDK 需新增的 API 方法

### 2.1 知识体系（KnowledgeSystem）— 全部缺失

当前 SDK 没有任何 KnowledgeSystem 相关接口。前端需要以下接口来管理知识体系：

```typescript
class KnowledgeApi {
  /** 获取知识体系列表 */
  listKnowledgeSystems(params?: { status?: string; keyword?: string }): Promise<ApiResponse<KnowledgeSystem[]>>

  /** 获取单个知识体系详情（含章节列表） */
  getKnowledgeSystem(id: string): Promise<ApiResponse<KnowledgeSystemDetail>>

  /** 创建知识体系 */
  createKnowledgeSystem(data: CreateKnowledgeSystemRequest): Promise<ApiResponse<KnowledgeSystem>>

  /** 更新知识体系 */
  updateKnowledgeSystem(id: string, data: UpdateKnowledgeSystemRequest): Promise<ApiResponse<KnowledgeSystem>>

  /** 删除知识体系 */
  deleteKnowledgeSystem(id: string): Promise<ApiResponse<null>>

  /** 上架知识体系（status → published） */
  publishKnowledgeSystem(id: string): Promise<ApiResponse<null>>

  /** 下架知识体系（status → draft） */
  unpublishKnowledgeSystem(id: string): Promise<ApiResponse<null>>

  /** 取消待删除状态 */
  cancelPendingDelete(id: string): Promise<ApiResponse<null>>
}
```

**类型定义**：

```typescript
interface KnowledgeSystem {
  id: string
  name: string
  icon: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  sortOrder: number
  chapterCount: number
  sectionCount: number
  status: string          // 'draft' | 'published' | 'pending_delete'
  createdAt: string
  updatedAt: string
}

interface KnowledgeSystemDetail extends KnowledgeSystem {
  chapters: ChapterSummary[]
}

interface ChapterSummary {
  id: string
  title: string
  sortOrder: number
  difficulty: string
  sectionCount: number
  status: string
}

interface CreateKnowledgeSystemRequest {
  name: string
  icon?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  sortOrder?: number
  status?: string
}

interface UpdateKnowledgeSystemRequest {
  name?: string
  icon?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  sortOrder?: number
  status?: string
}
```

**优先级**：P0 — 知识体系列表页（KnowledgePage）和编辑页（KnowledgeEditPage）的核心功能完全依赖此接口。

---

### 2.2 小节列表查询（listSections）— 缺失

SDK 的 `getChapter(chapterId)` 返回 `ChapterDetail` 包含 `sections: SectionSummary[]`，但前端需要：

- **按 chapterId 查询所有小节列表**（带完整字段，不仅是 Summary）
- 在 `QuestionEditPage` 中按章节获取小节下拉列表

```typescript
class KnowledgeApi {
  /** 获取指定章节下的小节列表 */
  listSections(params?: { chapterId: string }): Promise<ApiResponse<Section[]>>
}
```

**优先级**：P0 — QuestionEditPage、KnowledgeEditPage、KnowledgeDetailPage 都需要此接口。

---

### 2.3 小节 HTML 内容保存（saveSectionHtml）— 缺失

前端富文本编辑器编辑小节内容后，需要单独保存 HTML 内容：

```typescript
class KnowledgeApi {
  /** 保存小节 HTML 内容 */
  saveSectionHtml(id: string, htmlContent: string): Promise<ApiResponse<Section>>
}
```

**优先级**：P0 — SectionEditPage 核心功能。

---

### 2.4 AI 生成接口 — 缺失

前端有 3 个 AI 生成功能，全部缺失：

```typescript
class KnowledgeApi {
  /** AI 生成大纲（根据知识体系名称自动生成章节结构） */
  generateOutline(knowledgeSystemName: string): Promise<ApiResponse<GeneratedChapter[]>>

  /** AI 生成小节内容 */
  generateSectionContent(params: {
    chapter: string
    section: string
    knowledgePoint: string
  }): Promise<ApiResponse<GeneratedSectionContent>>

  /** AI 重新生成图片 */
  regenerateImage(prompt: string): Promise<ApiResponse<{ url: string }>>
}
```

**优先级**：P1 — AI 内容生成功能，涉及 KnowledgeEditPage 和 SectionEditPage。

---

### 2.5 分页参数 — listChapters 缺少 knowledgeSystemId

当前 `listChapters` 不支持按知识体系筛选：

```typescript
interface ChapterQueryParams {
  status?: string
  sortBy?: string
  knowledgeSystemId?: string    // ← 需新增
}
```

**优先级**：P0 — KnowledgeDetailPage、KnowledgeEditPage 需要通过此参数获取指定知识体系下的章节。

---

## 三、已对接的 SDK 接口

| SDK 方法 | 前端调用 | 状态 |
|---------|---------|------|
| `listChapters()` | `knowledgeSdkApi.getChapters()` | ⚠️ 缺 knowledgeSystemId 筛选参数 |
| `getChapter(id)` | `knowledgeSdkApi.getChapter()` | ✅ |
| `createChapter(data)` | `knowledgeSdkApi.createChapter()` | ✅ |
| `updateChapter(id, data)` | `knowledgeSdkApi.updateChapter()` | ✅ |
| `deleteChapter(id)` | `knowledgeSdkApi.deleteChapter()` | ✅ |
| `reorderChapters(order)` | `knowledgeSdkApi.reorderChapters()` | ✅ |
| `getSection(id)` | `knowledgeSdkApi.getSection()` | ✅ |
| `createSection(data)` | `knowledgeSdkApi.createSection()` | ✅ |
| `updateSection(id, data)` | `knowledgeSdkApi.updateSection()` | ✅ |
| `deleteSection(id)` | `knowledgeSdkApi.deleteSection()` | ✅ |
| `reorderSections(data)` | `knowledgeSdkApi.reorderSections()` | ✅ |

---

## 四、需求优先级汇总

| 优先级 | 需求 | 影响 |
|--------|------|------|
| **P0** | KnowledgeSystem CRUD（list/get/create/update/delete） | 知识体系列表/编辑/详情页无法使用 |
| **P0** | `publishKnowledgeSystem` / `unpublishKnowledgeSystem` | 上下架操作不可用 |
| **P0** | `cancelPendingDelete` | 取消删除操作不可用 |
| **P0** | `listSections(chapterId)` | 按章节查询小节不可用 |
| **P0** | `saveSectionHtml(id, html)` | 保存富文本内容不可用 |
| **P0** | `ChapterQueryParams.knowledgeSystemId` | 按知识体系筛选章节不可用 |
| **P1** | `generateOutline` | AI 大纲生成不可用 |
| **P1** | `generateSectionContent` | AI 小节内容生成不可用 |
| **P1** | `regenerateImage` | AI 重新生图不可用 |

---

## 五、完整 SDK KnowledgeApi 目标接口

```typescript
class KnowledgeApi {
  // KnowledgeSystem
  listKnowledgeSystems(params?: { status?: string; keyword?: string }): Promise<ApiResponse<KnowledgeSystem[]>>
  getKnowledgeSystem(id: string): Promise<ApiResponse<KnowledgeSystemDetail>>
  createKnowledgeSystem(data: CreateKnowledgeSystemRequest): Promise<ApiResponse<KnowledgeSystem>>
  updateKnowledgeSystem(id: string, data: UpdateKnowledgeSystemRequest): Promise<ApiResponse<KnowledgeSystem>>
  deleteKnowledgeSystem(id: string): Promise<ApiResponse<null>>
  publishKnowledgeSystem(id: string): Promise<ApiResponse<null>>
  unpublishKnowledgeSystem(id: string): Promise<ApiResponse<null>>
  cancelPendingDelete(id: string): Promise<ApiResponse<null>>

  // Chapter (已有)
  listChapters(params?: ChapterQueryParams): Promise<ApiResponse<Chapter[]>>
  getChapter(chapterId: string): Promise<ApiResponse<ChapterDetail>>
  createChapter(data: CreateChapterRequest): Promise<ApiResponse<Chapter>>
  updateChapter(chapterId: string, data: UpdateChapterRequest): Promise<ApiResponse<Chapter>>
  deleteChapter(chapterId: string): Promise<ApiResponse<null>>
  reorderChapters(data: ReorderChaptersRequest): Promise<ApiResponse<null>>

  // Section
  listSections(params?: { chapterId: string }): Promise<ApiResponse<Section[]>>
  getSection(sectionId: string): Promise<ApiResponse<Section>>
  createSection(data: CreateSectionRequest): Promise<ApiResponse<Section>>
  updateSection(sectionId: string, data: UpdateSectionRequest): Promise<ApiResponse<Section>>
  deleteSection(sectionId: string): Promise<ApiResponse<null>>
  reorderSections(data: ReorderSectionsRequest): Promise<ApiResponse<null>>
  saveSectionHtml(id: string, htmlContent: string): Promise<ApiResponse<Section>>

  // AI Generation
  generateOutline(name: string): Promise<ApiResponse<GeneratedChapter[]>>
  generateSectionContent(params: GenerateSectionContentParams): Promise<ApiResponse<GeneratedSectionContent>>
  regenerateImage(prompt: string): Promise<ApiResponse<{ url: string }>>
}
```