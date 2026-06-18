import { questionMock } from '@/mock/question'
import { knowledgeSdkApi } from './knowledge'
import { sdk, checkAuthAndRedirect } from '@/api/sdk-client'
import type { Question, QuestionQueryParams, CreateQuestionRequest, UpdateQuestionRequest } from '@zhixiaoji/api-sdk-web'

function isSuccess<T>(res: { code: number; data: T; message?: string }): res is { code: 0; data: T; message?: string } {
  if (res.code === 0 && res.data != null) return true
  checkAuthAndRedirect(res)
  return false
}

export const knowledgeApi = {
  // ==================== Category API ====================
  getCategories: (params?: { status?: string; keyword?: string }) => knowledgeSdkApi.getCategories(params),
  getCategory: (id: string | number) => knowledgeSdkApi.getCategory(String(id)),
  createCategory: (data: { name: string; icon?: string; description?: string; sortOrder?: number; status?: string }) => knowledgeSdkApi.createCategory(data),
  updateCategory: (id: string | number, data: Record<string, unknown>) => knowledgeSdkApi.updateCategory(String(id), data),
  deleteCategory: (id: string | number) => knowledgeSdkApi.deleteCategory(String(id)),
  showCategory: (id: string | number) => knowledgeSdkApi.showCategory(String(id)),
  hideCategory: (id: string | number) => knowledgeSdkApi.hideCategory(String(id)),

  // ==================== Subject API ====================
  getSubjects: (params?: { categoryId?: number; status?: string; keyword?: string }) => knowledgeSdkApi.getSubjects(params),
  getSubject: (id: string | number) => knowledgeSdkApi.getSubject(String(id)),

  // ==================== Subject API ====================
  createSubject: (data: { name: string; categoryId: number | string; icon?: string; description?: string; difficulty?: string; sortOrder?: number; status?: string }) => knowledgeSdkApi.createSubject(data),
  updateSubject: (id: string | number, data: Record<string, unknown>) => knowledgeSdkApi.updateSubject(String(id), data),
  deleteSubject: (id: string | number) => knowledgeSdkApi.deleteSubject(String(id)),
  publishSubject: (id: string | number) => knowledgeSdkApi.publishSubject(String(id)),
  unpublishSubject: (id: string | number) => knowledgeSdkApi.unpublishSubject(String(id)),

  // ==================== Chapter API ====================
  getChapters: (subjectId?: string | number) => knowledgeSdkApi.getChapters(subjectId),
  createChapter: (data: Record<string, unknown>) => knowledgeSdkApi.createChapter(data),
  updateChapter: (id: string | number, data: Record<string, unknown>) => knowledgeSdkApi.updateChapter(String(id), data),
  deleteChapter: (id: string | number) => knowledgeSdkApi.deleteChapter(String(id)),
  reorderChapters: (subjectId: string, order: string[]) => knowledgeSdkApi.reorderChapters(subjectId, order),

  // ==================== Section API ====================
  getSections: (chapterId?: string | number) => knowledgeSdkApi.getSections(chapterId),
  getSection: (id: string | number) => knowledgeSdkApi.getSection(String(id)),
  createSection: (data: { title: string; chapterId: number | string; knowledgePoint?: string; sortOrder?: number; number?: string; unlockPoints?: number }) => knowledgeSdkApi.createSection(data),
  updateSection: (id: string | number, data: Record<string, unknown>) => knowledgeSdkApi.updateSection(String(id), data),
  deleteSection: (id: string | number) => knowledgeSdkApi.deleteSection(String(id)),
  reorderSections: (chapterId: string, order: string[]) => knowledgeSdkApi.reorderSections(chapterId, order),

  saveSectionHtml: (id: string | number, htmlContent: string) => knowledgeSdkApi.saveSectionHtml(String(id), htmlContent),
  generateSectionPage: (id: string | number) => knowledgeSdkApi.generateSectionPage(String(id)),

  // ---------- ColorScheme ----------
  listColorSchemes: () => knowledgeSdkApi.listColorSchemes(),
  getDefaultColorScheme: () => knowledgeSdkApi.getDefaultColorScheme(),
  getColorScheme: (schemeId: string) => knowledgeSdkApi.getColorScheme(schemeId),
  createColorScheme: (data: Record<string, unknown>) => knowledgeSdkApi.createColorScheme(data),
  updateColorScheme: (schemeId: string, data: Record<string, unknown>) => knowledgeSdkApi.updateColorScheme(schemeId, data),
  deleteColorScheme: (schemeId: string) => knowledgeSdkApi.deleteColorScheme(schemeId),
}

export const questionApi = {
  async getQuestions(params: { lessonId?: number | string; page?: number; pageSize?: number; type?: string; difficulty?: string; keyword?: string }) {
    try {
      const queryParams: QuestionQueryParams = {
        page: params.page,
        pageSize: params.pageSize,
        lessonId: params.lessonId ? String(params.lessonId) : undefined,
        type: params.type as QuestionQueryParams['type'],
        difficulty: params.difficulty,
        keyword: params.keyword,
      }
      const res = await sdk.knowledge.listQuestions(queryParams)
      if (isSuccess(res)) {
        return { code: 0, data: { list: res.data!.items, total: res.data!.total, page: res.data!.page, pageSize: res.data!.pageSize }, message: 'ok' }
      }
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return questionMock.getQuestions(params)
    }
  },

  async getQuestion(id: string) {
    try {
      const res = await sdk.knowledge.getQuestion(id)
      if (isSuccess(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return questionMock.getQuestion(id)
    }
  },

  async createQuestion(data: Record<string, unknown>) {
    try {
      const reqData: CreateQuestionRequest = {
        type: data.type as CreateQuestionRequest['type'],
        content: data.content as string,
        options: data.options as CreateQuestionRequest['options'],
        correctAnswer: data.correctAnswer as string,
        explanation: data.explanation as string | undefined,
        difficulty: data.difficulty as string | undefined,
        lessonId: data.lessonId as string,
      }
      const res = await sdk.knowledge.createQuestion(reqData)
      if (isSuccess(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return questionMock.createQuestion(data)
    }
  },

  async updateQuestion(id: string, data: Record<string, unknown>) {
    try {
      const reqData: UpdateQuestionRequest = {
        type: data.type as UpdateQuestionRequest['type'],
        content: data.content as string | undefined,
        options: data.options as UpdateQuestionRequest['options'],
        correctAnswer: data.correctAnswer as string | undefined,
        explanation: data.explanation as string | undefined,
        difficulty: data.difficulty as string | undefined,
      }
      const res = await sdk.knowledge.updateQuestion(id, reqData)
      if (isSuccess(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return questionMock.updateQuestion(id, data)
    }
  },

  async deleteQuestion(id: string) {
    try {
      const res = await sdk.knowledge.deleteQuestion(id)
      if (isSuccess(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return questionMock.deleteQuestion(id)
    }
  },

  batchUpdateStatus: (ids: string[], status: string) =>
    questionMock.batchUpdateStatus(ids, status),

  getLessonQuestionStats: () =>
    questionMock.getLessonQuestionStats(),

  aiImportQuestions: (lessonId: number | string, lessonTitle: string) =>
    questionMock.aiImportQuestions(lessonId, lessonTitle)
}