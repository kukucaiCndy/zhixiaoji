import { userMock } from '@/mock/user'
import { noteMock } from '@/mock/note'

export const userApi = {
  getUsers: (params: { page: number; pageSize: number; nickname?: string; level?: number; status?: string }) => userMock.getUsers(params),
  getUserDetail: (id: number) => userMock.getUserDetail(id),
  updateUserStatus: (id: number, status: string) => userMock.updateUserStatus(id, status),
  batchUpdateStatus: (ids: number[], status: string) => userMock.batchUpdateStatus(ids, status),
  adjustPoints: (data: { userId: number; type: string; amount: number; reason: string }) => userMock.adjustPoints(data)
}

export const noteApi = {
  getNotes: (params: { page: number; pageSize: number; title?: string; auditStatus?: string }) => noteMock.getNotes(params),
  getNoteDetail: (id: number) => noteMock.getNoteDetail(id),
  auditNote: (id: number, action: string, remark: string) => noteMock.auditNote(id, action, remark),
  deleteNote: (id: number) => noteMock.deleteNote(id),
  batchDelete: (ids: number[]) => noteMock.batchDelete(ids)
}
