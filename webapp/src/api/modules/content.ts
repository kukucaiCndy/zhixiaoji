import { knowledgeMock } from '@/mock/knowledge'
import { contentMock } from '@/mock/content'
import { questionMock } from '@/mock/question'

export const knowledgeApi = {
  // ---- New API (three-level) ----

  // Category (大类)
  getCategories: () => knowledgeMock.getCategories(),
  createCategory: (data: { name: string; icon: string; description: string; sortOrder: number; status: string }) =>
    knowledgeMock.createCategory(data),
  updateCategory: (id: number, data: Record<string, unknown>) => knowledgeMock.updateCategory(id, data),
  deleteCategory: (id: number) => knowledgeMock.deleteCategory(id),

  // Chapter (章节)
  getChapters: (categoryId?: number) => knowledgeMock.getChapters(categoryId),
  createChapter: (data: Record<string, unknown>) => knowledgeMock.createChapter(data as { categoryId: number; categoryName: string; name: string; sortOrder: number; difficulty: string; status: string }),
  updateChapter: (id: number, data: Record<string, unknown>) => knowledgeMock.updateChapter(id, data),
  deleteChapter: (id: number) => knowledgeMock.deleteChapter(id),

  // Section (小节/知识卡片)
  getSections: (chapterId?: number) => knowledgeMock.getSections(chapterId),
  getSection: (id: number) => knowledgeMock.getSection(id),
  createSection: (data: Record<string, unknown>) => knowledgeMock.createSection(data as { chapterId: number; chapterName: string; title: string; sortOrder: number; content: string; coverImage?: string; summary?: string; status: string }),
  updateSection: (id: number, data: Record<string, unknown>) => knowledgeMock.updateSection(id, data),
  deleteSection: (id: number) => knowledgeMock.deleteSection(id),

  // AI generation
  generateCategoryContent: (categoryName: string) => knowledgeMock.generateCategoryContent(categoryName),

  // ---- Backward-compatible aliases (for existing pages not yet migrated) ----

  /** @deprecated use getCategories() */
  async getVolumes() {
    const res = await knowledgeMock.getCategories()
    if (res.code !== 0) return res
    return { ...res, data: res.data }
  },

  /** @deprecated use createCategory() */
  async createVolume(data: { name: string; sortOrder: number; status: string }) {
    return knowledgeMock.createCategory({ ...data, icon: '📁', description: '' })
  },

  /** @deprecated use updateCategory() */
  async updateVolume(id: number, data: Record<string, unknown>) {
    return knowledgeMock.updateCategory(id, data)
  },

  /** @deprecated use deleteCategory() */
  async deleteVolume(id: number) {
    return knowledgeMock.deleteCategory(id)
  }
}

export const cardApi = {
  getCards: (params: { page: number; pageSize: number; title?: string; chapterId?: number; difficulty?: string; status?: string }) => contentMock.getCards(params),
  getCard: (id: number) => contentMock.getCard(id),
  createCard: (data: Record<string, unknown>) => contentMock.createCard(data),
  updateCard: (id: number, data: Record<string, unknown>) => contentMock.updateCard(id, data),
  deleteCard: (id: number) => contentMock.deleteCard(id),
  batchUpdateStatus: (ids: number[], status: string) => contentMock.batchUpdateStatus(ids, status)
}

export const questionApi = {
  getQuestions: (params: { page: number; pageSize: number; type?: string; difficulty?: string; status?: string }) => questionMock.getQuestions(params),
  getQuestion: (id: number) => questionMock.getQuestion(id),
  createQuestion: (data: Record<string, unknown>) => questionMock.createQuestion(data),
  updateQuestion: (id: number, data: Record<string, unknown>) => questionMock.updateQuestion(id, data),
  deleteQuestion: (id: number) => questionMock.deleteQuestion(id),
  batchUpdateStatus: (ids: number[], status: string) => questionMock.batchUpdateStatus(ids, status),
  getImportTemplate: () => questionMock.getImportTemplate(),
  importQuestions: (file: File) => questionMock.importQuestions(file),
  exportQuestions: () => questionMock.exportQuestions()
}
