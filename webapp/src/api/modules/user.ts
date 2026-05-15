import { authApi as sdkAuth } from '@/api/sdk-client'
import { userMock } from '@/mock/user'
import { noteMock } from '@/mock/note'

export const userApi = {
  async getUsers(params: { page: number; pageSize: number; nickname?: string; level?: number; status?: string }) {
    try {
      const res = await sdkAuth.getUsers({
        page: params.page,
        pageSize: params.pageSize,
        keyword: params.nickname,
        level: params.level,
        status: params.status as 'normal' | 'disabled' | undefined
      })
      if (res.code === 0 && res.data) {
        return {
          code: 0,
          data: {
            list: res.data.items,
            total: res.data.total,
            page: res.data.page,
            pageSize: res.data.pageSize
          },
          message: 'ok'
        }
      }
      return res
    } catch {
      return userMock.getUsers(params)
    }
  },

  getUserDetail: (id: number) => userMock.getUserDetail(id),

  async updateUserStatus(id: number, status: string) {
    try {
      const mappedStatus = status === '正常' ? 'normal' : 'disabled'
      const res = await sdkAuth.updateUserStatus(String(id), { status: mappedStatus as 'normal' | 'disabled' })
      return res
    } catch {
      return userMock.updateUserStatus(id, status)
    }
  },

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
