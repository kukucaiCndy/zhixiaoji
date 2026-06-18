import { sdk, checkAuthAndRedirect } from '@/api/sdk-client'
import type {
  ApiResponse,
  Category, CategoryDetail, CreateCategoryRequest, UpdateCategoryRequest,
  Chapter, ChapterDetail, CreateChapterRequest, UpdateChapterRequest,
  Lesson, CreateLessonRequest, UpdateLessonRequest,
  ColorScheme, CreateColorSchemeRequest, UpdateColorSchemeRequest,
  CategoryQueryParams, ChapterQueryParams, LessonQueryParams,
  Subject, SubjectDetail, CreateSubjectRequest, UpdateSubjectRequest,
} from '@zhixiaoji/api-sdk-web'
import { knowledgeMock } from '@/mock/knowledge'

// ==================== Difficulty & Status Helpers ====================

type ApiDifficulty = 'beginner' | 'intermediate' | 'advanced'

function toApiDifficulty(d: string): ApiDifficulty {
  const map: Record<string, ApiDifficulty> = {
    '入门': 'beginner',
    '基础': 'intermediate',
    '进阶': 'advanced',
    'beginner': 'beginner',
    'intermediate': 'intermediate',
    'advanced': 'advanced',
  }
  return map[d] || 'beginner'
}

function toChineseDifficulty(d: string): string {
  const map: Record<string, string> = {
    'beginner': '入门',
    'intermediate': '基础',
    'advanced': '进阶',
  }
  return map[d] || d
}

function toChineseStatus(s: string): string {
  const map: Record<string, string> = {
    'draft': '草稿',
    'published': '展示',
    'inactive': '隐藏',
    'pending_delete': '删除等待中',
    'visible': '展示',
    'hidden': '隐藏',
  }
  return map[s] || s
}

function toApiStatus(s: string): string {
  const map: Record<string, string> = {
    '草稿': 'draft',
    '展示': 'published',
    '隐藏': 'inactive',
    '删除等待中': 'pending_delete',
  }
  return map[s] || s
}

function toApiCategoryStatus(s: string): 'visible' | 'hidden' | undefined {
  if (s === '展示' || s === 'published' || s === 'visible') return 'visible'
  if (s === '隐藏' || s === 'inactive' || s === 'hidden') return 'hidden'
  return undefined
}

// ==================== Category Mapper ====================

function mapCategory(raw: Category) {
  return {
    id: Number(raw.id) || raw.id,
    name: raw.name,
    icon: raw.icon || '📚',
    description: raw.description || '',
    sortOrder: raw.sortOrder ?? 0,
    subjectCount: raw.subjectCount ?? 0,
    status: toChineseStatus(raw.status),
    createdAt: raw.createdAt || '',
    updatedAt: raw.updatedAt || '',
  }
}

function mapCategoryDetail(raw: CategoryDetail) {
  const subjects = (raw.subjects || []).map((sub) => ({
    id: Number(sub.id) || sub.id,
    name: sub.name,
    icon: sub.icon || '📚',
    difficulty: toChineseDifficulty(sub.difficulty),
    sortOrder: sub.sortOrder ?? 0,
    status: toChineseStatus(sub.status),
  }))
  return {
    ...mapCategory(raw),
    subjectCount: subjects.length,
    subjects,
  }
}

// ==================== Chapter Mapper ====================

function mapChapter(raw: ChapterDetail | Chapter) {
  const lessons = (raw as ChapterDetail).lessons
  return {
    id: Number(raw.id) || raw.id,
    knowledgeSystemId: Number(raw.subjectId) || raw.subjectId,
    knowledgeSystemName: '',
    name: raw.title,
    goal: raw.goal || '',
    description: raw.description || raw.content || '',
    sortOrder: raw.sortOrder ?? 0,
    difficulty: '入门',
    sectionCount: lessons?.length ?? 0,
    unlockPoints: raw.unlockPoints ?? 0,
    lessons: lessons || [],
  }
}

// ==================== Lesson Mapper (对应旧 Section) ====================

function mapLesson(raw: Lesson) {
  return {
    id: Number(raw.id) || raw.id,
    chapterId: Number(raw.chapterId) || raw.chapterId,
    chapterName: '',
    title: raw.title,
    knowledgePoint: raw.knowledgePoint || '',
    sortOrder: raw.sortOrder ?? 0,
    htmlContent: raw.latestHtmlContent || '',
    htmlUrl: raw.htmlUrl || '',
    imageDesigns: '',
    createdAt: raw.createdAt || '',
    updatedAt: raw.updatedAt || '',
    number: raw.number || '',
    unlockPoints: raw.unlockPoints ?? 0,
  }
}

// ==================== Subject Mapper ====================

function mapSubject(raw: Subject) {
  return {
    id: Number(raw.id) || raw.id,
    categoryId: Number(raw.categoryId) || raw.categoryId,
    name: raw.name,
    icon: raw.icon || '📚',
    difficulty: toChineseDifficulty(raw.difficulty),
    sortOrder: raw.sortOrder ?? 0,
    chapterCount: raw.chapterCount ?? 0,
    lessonCount: raw.lessonCount ?? 0,
    status: toChineseStatus(raw.status),
    createdAt: raw.createdAt || '',
    updatedAt: raw.updatedAt || '',
  }
}

function mapSubjectDetail(raw: SubjectDetail) {
  const chapters = (raw.chapters || []).map((ch: { id: string; title: string; sortOrder: number }) => ({
    id: ch.id,
    title: ch.title,
    sortOrder: ch.sortOrder,
  }))
  return {
    ...mapSubject(raw),
    chapterCount: raw.chapterCount,
    lessonCount: raw.lessonCount,
    chapters,
  }
}

function isOk(res: ApiResponse<unknown>): boolean {
  return res.code === 0
}

export const knowledgeSdkApi = {
  // ==================== Category API ====================

  async getCategories(params?: { status?: string; keyword?: string }) {
    try {
      const apiParams: CategoryQueryParams = {}
      if (params?.keyword) (apiParams as Record<string, unknown>).keyword = params.keyword
      if (params?.status && params.status !== '全部') {
        (apiParams as Record<string, unknown>).status = toApiStatus(params.status)
      }
      const res = await sdk.knowledge.listCategories(apiParams)
      if (isOk(res) && res.data) {
        return { code: 0, data: res.data.map(mapCategory), message: 'ok' }
      }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.getKnowledgeSystems(params)
    }
  },

  async getCategory(id: string) {
    try {
      const res = await sdk.knowledge.getCategory(id)
      if (isOk(res) && res.data) {
        return { code: 0, data: mapCategoryDetail(res.data), message: 'ok' }
      }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.getKnowledgeSystem(Number(id))
    }
  },

  async createCategory(data: { name: string; icon?: string; description?: string; sortOrder?: number; status?: string }) {
    try {
      const sdkData: CreateCategoryRequest = { name: data.name }
      if (data.icon) sdkData.icon = data.icon
      if (data.description) sdkData.description = data.description
      if (data.sortOrder !== undefined) sdkData.sortOrder = data.sortOrder
      if (data.status) sdkData.status = toApiCategoryStatus(data.status)
      const res = await sdk.knowledge.createCategory(sdkData)
      if (isOk(res) && res.data) {
        return { code: 0, data: mapCategory(res.data), message: 'ok' }
      }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.createKnowledgeSystem({ name: data.name, icon: data.icon, difficulty: 'beginner' })
    }
  },

  async updateCategory(id: string, data: { name?: string; icon?: string; description?: string; sortOrder?: number; status?: string }) {
    try {
      const sdkData: UpdateCategoryRequest = {}
      if (data.name !== undefined) sdkData.name = data.name
      if (data.icon !== undefined) sdkData.icon = data.icon
      if (data.description !== undefined) sdkData.description = data.description
      if (data.sortOrder !== undefined) sdkData.sortOrder = data.sortOrder
      if (data.status) sdkData.status = toApiCategoryStatus(data.status)
      const res = await sdk.knowledge.updateCategory(id, sdkData)
      if (isOk(res) && res.data) {
        return { code: 0, data: mapCategory(res.data), message: 'ok' }
      }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.updateKnowledgeSystem(Number(id), data)
    }
  },

  async deleteCategory(id: string) {
    try {
      const res = await sdk.knowledge.deleteCategory(id)
      if (isOk(res)) return res
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.deleteKnowledgeSystem(Number(id))
    }
  },

  async showCategory(id: string) {
    try {
      const res = await sdk.knowledge.showCategory(id)
      if (isOk(res)) return res
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.showKnowledgeSystem(Number(id))
    }
  },

  async hideCategory(id: string) {
    try {
      const res = await sdk.knowledge.hideCategory(id)
      if (isOk(res)) return res
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.hideKnowledgeSystem(Number(id))
    }
  },

  // ==================== Subject API ====================

  async getSubjects(params?: { categoryId?: number; status?: string; keyword?: string }) {
    try {
      if (params?.keyword) {
        // SubjectQueryParams does not support keyword, use raw URL
        const queryParams: Record<string, string> = {}
        if (params?.categoryId) queryParams.categoryId = String(params.categoryId)
        if (params?.status && params.status !== '全部') queryParams.status = toApiStatus(params.status)
        if (params?.keyword) queryParams.keyword = params.keyword
        const query = new URLSearchParams(queryParams).toString()
        const res = await sdk.client.get<Subject[]>(`/knowledge/subjects${query ? '?' + query : ''}`)
        if (isOk(res) && res.data) {
          const list = Array.isArray(res.data) ? res.data.map(mapSubject).sort((a, b) => a.sortOrder - b.sortOrder) : []
          return { code: 0, data: list, message: 'ok' }
        }
        checkAuthAndRedirect(res)
        throw new Error('API error')
      }
      const apiParams: { categoryId?: string; status?: string } = {}
      if (params?.categoryId) apiParams.categoryId = String(params.categoryId)
      if (params?.status && params.status !== '全部') apiParams.status = toApiStatus(params.status)
      const res = await sdk.knowledge.listSubjects(apiParams)
      if (isOk(res) && res.data) {
        const list = Array.isArray(res.data) ? res.data.map(mapSubject).sort((a, b) => a.sortOrder - b.sortOrder) : []
        return { code: 0, data: list, message: 'ok' }
      }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.getSubjects(params)
    }
  },

  async getSubject(id: string) {
    try {
      const res = await sdk.knowledge.getSubject(id)
      if (isOk(res) && res.data) {
        return { code: 0, data: mapSubjectDetail(res.data), message: 'ok' }
      }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.getSubject(Number(id))
    }
  },

  async createSubject(data: {
    name: string
    categoryId: number | string
    icon?: string
    description?: string
    difficulty?: string
    sortOrder?: number
    status?: string
  }) {
    try {
      const sdkData: CreateSubjectRequest = {
        name: data.name || '',
        categoryId: String(data.categoryId || ''),
      }
      if (data.icon) sdkData.icon = data.icon
      if (data.description) sdkData.description = data.description
      if (data.difficulty) sdkData.difficulty = toApiDifficulty(data.difficulty)
      if (data.sortOrder !== undefined) sdkData.sortOrder = data.sortOrder
      if (data.status) sdkData.status = toApiStatus(data.status) as 'draft' | 'published'
      const res = await sdk.knowledge.createSubject(sdkData)
      if (isOk(res) && res.data) {
        return { code: 0, data: res.data, message: 'ok' }
      }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.createSubject(data as unknown as Parameters<typeof knowledgeMock.createSubject>[0])
    }
  },

  async updateSubject(id: string, data: {
    name?: string
    categoryId?: number | string
    icon?: string
    description?: string
    difficulty?: string
    sortOrder?: number
    status?: string
  }) {
    try {
      const sdkData: UpdateSubjectRequest = {}
      if (data.name !== undefined) sdkData.name = data.name
      if (data.categoryId !== undefined) sdkData.categoryId = String(data.categoryId)
      if (data.icon !== undefined) sdkData.icon = data.icon
      if (data.description !== undefined) sdkData.description = data.description
      if (data.difficulty) sdkData.difficulty = toApiDifficulty(data.difficulty)
      if (data.sortOrder !== undefined) sdkData.sortOrder = data.sortOrder
      if (data.status) sdkData.status = toApiStatus(data.status) as 'draft' | 'published'
      const res = await sdk.knowledge.updateSubject(id, sdkData)
      if (isOk(res) && res.data) {
        return { code: 0, data: res.data, message: 'ok' }
      }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.updateSubject(Number(id), data as unknown as Parameters<typeof knowledgeMock.updateSubject>[1])
    }
  },

  async deleteSubject(id: string) {
    try {
      const res = await sdk.knowledge.deleteSubject(id)
      if (isOk(res)) return res
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.deleteSubject(Number(id))
    }
  },

  async publishSubject(id: string) {
    try {
      const res = await sdk.knowledge.publishSubject(id)
      if (isOk(res)) return res
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return { code: 0, data: null, message: 'ok' }
    }
  },

  async unpublishSubject(id: string) {
    try {
      const res = await sdk.knowledge.unpublishSubject(id)
      if (isOk(res)) return res
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return { code: 0, data: null, message: 'ok' }
    }
  },

  // ==================== Chapter API ====================

  async getChapters(subjectId?: string | number) {
    try {
      const params: ChapterQueryParams = {}
      if (subjectId) params.subjectId = String(subjectId)
      const res = await sdk.knowledge.listChapters(params)
      if (isOk(res) && res.data) {
        return { code: 0, data: res.data.map(mapChapter), message: 'ok' }
      }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.getChapters(subjectId)
    }
  },

  async createChapter(data: {
    name?: string
    title?: string
    description?: string
    content?: string
    goal?: string
    categoryId?: number | string
    knowledgeSystemId?: number | string
    subjectId?: number | string
    sortOrder?: number
    unlockPoints?: number
  }) {
    try {
      const parentId = data.categoryId || data.knowledgeSystemId || data.subjectId
      const sdkData: CreateChapterRequest = {
        title: (data.name || data.title || '') as string,
        subjectId: parentId ? String(parentId) : '',
      }
      if (data.description || data.content) sdkData.description = (data.description || data.content || '') as string
      if (data.goal) sdkData.goal = data.goal
      if (data.sortOrder !== undefined) sdkData.sortOrder = data.sortOrder
      if (data.unlockPoints !== undefined) sdkData.unlockPoints = data.unlockPoints
      const res = await sdk.knowledge.createChapter(sdkData)
      if (isOk(res) && res.data) {
        return { code: 0, data: mapChapter(res.data), message: 'ok' }
      }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.createChapter(data as unknown as Parameters<typeof knowledgeMock.createChapter>[0])
    }
  },

  async updateChapter(id: string, data: {
    name?: string
    title?: string
    description?: string
    content?: string
    goal?: string
    categoryId?: number | string
    knowledgeSystemId?: number | string
    subjectId?: number | string
    sortOrder?: number
    unlockPoints?: number
  }) {
    try {
      const sdkData: UpdateChapterRequest = {}
      if (data.name !== undefined) sdkData.title = data.name
      if (data.title !== undefined) sdkData.title = data.title
      if (data.description !== undefined) sdkData.description = data.description
      if (data.content !== undefined) sdkData.content = data.content
      if (data.goal !== undefined) sdkData.goal = data.goal
      const parentId = data.categoryId || data.knowledgeSystemId || data.subjectId
      if (parentId !== undefined) sdkData.subjectId = String(parentId)
      if (data.sortOrder !== undefined) sdkData.sortOrder = data.sortOrder
      if (data.unlockPoints !== undefined) sdkData.unlockPoints = data.unlockPoints
      const res = await sdk.knowledge.updateChapter(id, sdkData)
      if (isOk(res) && res.data) return res
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.updateChapter(Number(id), data as unknown as Parameters<typeof knowledgeMock.updateChapter>[1])
    }
  },

  async deleteChapter(id: string) {
    try {
      const res = await sdk.knowledge.deleteChapter(id)
      if (isOk(res)) return res
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.deleteChapter(Number(id))
    }
  },

  async reorderChapters(subjectId: string, order: string[]) {
    try {
      const res = await sdk.knowledge.reorderChapters({ subjectId, order })
      if (isOk(res)) return res
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.reorderChapters(order)
    }
  },

  // ==================== Lesson API (对应旧 Section) ====================

  async getSections(chapterId?: string | number) {
    try {
      const params: LessonQueryParams = {}
      if (chapterId) params.chapterId = String(chapterId)
      const res = await sdk.knowledge.listLessons(params)
      if (isOk(res) && res.data) {
        return { code: 0, data: res.data.map(mapLesson), message: 'ok' }
      }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.getSections(chapterId)
    }
  },

  async getSection(id: string) {
    try {
      const res = await sdk.knowledge.getLesson(id)
      if (isOk(res) && res.data) {
        return { code: 0, data: mapLesson(res.data), message: 'ok' }
      }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.getSection(Number(id))
    }
  },

  async createSection(data: {
    title: string
    chapterId: number | string
    knowledgePoint?: string
    sortOrder?: number
    number?: string
    unlockPoints?: number
  }) {
    try {
      const sdkData: CreateLessonRequest = {
        title: data.title || '',
        chapterId: String(data.chapterId || ''),
      }
      if (data.knowledgePoint) sdkData.knowledgePoint = data.knowledgePoint
      if (data.sortOrder !== undefined) sdkData.sortOrder = data.sortOrder
      if (data.number) sdkData.number = data.number
      if (data.unlockPoints !== undefined) sdkData.unlockPoints = data.unlockPoints
      const res = await sdk.knowledge.createLesson(sdkData)
      if (isOk(res) && res.data) {
        return { code: 0, data: mapLesson(res.data), message: 'ok' }
      }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.createSection(data as unknown as Parameters<typeof knowledgeMock.createSection>[0])
    }
  },

  async updateSection(id: string, data: {
    title?: string
    chapterId?: number | string
    knowledgePoint?: string
    sortOrder?: number
    number?: string
    unlockPoints?: number
  }) {
    try {
      const sdkData: UpdateLessonRequest = {}
      if (data.title !== undefined) sdkData.title = data.title
      if (data.chapterId !== undefined) sdkData.chapterId = String(data.chapterId)
      if (data.sortOrder !== undefined) sdkData.sortOrder = data.sortOrder
      if (data.knowledgePoint !== undefined) sdkData.knowledgePoint = data.knowledgePoint
      if (data.number !== undefined) sdkData.number = data.number
      if (data.unlockPoints !== undefined) sdkData.unlockPoints = data.unlockPoints
      const res = await sdk.knowledge.updateLesson(id, sdkData)
      if (isOk(res) && res.data) return res
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.updateSection(Number(id), data as unknown as Parameters<typeof knowledgeMock.updateSection>[1])
    }
  },

  async deleteSection(id: string) {
    try {
      const res = await sdk.knowledge.deleteLesson(id)
      if (isOk(res)) return res
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.deleteSection(Number(id))
    }
  },

  async reorderSections(chapterId: string, order: string[]) {
    try {
      const res = await sdk.knowledge.reorderLessons({ chapterId, order })
      if (isOk(res)) return res
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.reorderSections(chapterId, order)
    }
  },

  async saveSectionHtml(id: string, htmlContent: string) {
    try {
      const res = await sdk.knowledge.saveLessonHtml(id, htmlContent)
      if (isOk(res)) return res
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.saveSectionHtml(Number(id), htmlContent)
    }
  },

  async generateSectionPage(id: string) {
    try {
      const res = await sdk.client.post(`/knowledge/lessons/${id}/page`)
      if (isOk(res) && res.data) return res
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return { code: 0, data: null, message: 'ok' }
    }
  },

  // ==================== ColorScheme API ====================

  async listColorSchemes() {
    try {
      const res = await sdk.knowledge.listColorSchemes()
      if (isOk(res) && res.data) return { code: 0, data: res.data, message: 'ok' }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.listColorSchemes()
    }
  },

  async getDefaultColorScheme() {
    try {
      const res = await sdk.knowledge.getDefaultColorScheme()
      if (isOk(res) && res.data) return { code: 0, data: res.data, message: 'ok' }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.getDefaultColorScheme()
    }
  },

  async getColorScheme(schemeId: string) {
    try {
      const res = await sdk.knowledge.getColorScheme(schemeId)
      if (isOk(res) && res.data) return { code: 0, data: res.data, message: 'ok' }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.getColorScheme(schemeId)
    }
  },

  async createColorScheme(data: Record<string, unknown>) {
    try {
      const res = await sdk.knowledge.createColorScheme(data as unknown as CreateColorSchemeRequest)
      if (isOk(res) && res.data) return { code: 0, data: res.data, message: 'ok' }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.createColorScheme(data)
    }
  },

  async updateColorScheme(schemeId: string, data: Record<string, unknown>) {
    try {
      const res = await sdk.knowledge.updateColorScheme(schemeId, data as unknown as UpdateColorSchemeRequest)
      if (isOk(res) && res.data) return { code: 0, data: res.data, message: 'ok' }
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.updateColorScheme(schemeId, data)
    }
  },

  async deleteColorScheme(schemeId: string) {
    try {
      const res = await sdk.knowledge.deleteColorScheme(schemeId)
      if (isOk(res)) return res
      checkAuthAndRedirect(res)
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return knowledgeMock.deleteColorScheme(schemeId)
    }
  },
}