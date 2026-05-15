import { knowledgeMock } from '@/mock/knowledge'
import { contentMock } from '@/mock/content'
import { questionMock } from '@/mock/question'

export const knowledgeApi = {
  getVolumes: () => knowledgeMock.getVolumes(),
  getChapters: (volumeId?: number) => knowledgeMock.getChapters(volumeId),
  createVolume: (data: { name: string; sortOrder: number; status: string }) => knowledgeMock.createVolume(data),
  updateVolume: (id: number, data: { name: string; sortOrder: number; status: string }) => knowledgeMock.updateVolume(id, data),
  deleteVolume: (id: number) => knowledgeMock.deleteVolume(id),
  createChapter: (data: Record<string, unknown>) => knowledgeMock.createChapter(data),
  updateChapter: (id: number, data: Record<string, unknown>) => knowledgeMock.updateChapter(id, data),
  deleteChapter: (id: number) => knowledgeMock.deleteChapter(id)
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
