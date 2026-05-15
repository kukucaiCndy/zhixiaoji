import { authApi as sdkAuth } from '@/api/sdk-client'
import { userMock } from '@/mock/user'
import { noteMock } from '@/mock/note'

export const userApi = {
  async getUsers(params: { page: number; pageSize: number; nickname?: string; level?: number; status?: string }) {
    try {
      const sdkParams: Record<string, unknown> = {
        page: params.page,
        pageSize: params.pageSize
      }
      if (params.nickname) sdkParams.keyword = params.nickname
      if (params.level) sdkParams.level = params.level
      if (params.status) sdkParams.status = params.status === '正常' ? 'normal' : 'disabled'

      const res = await sdkAuth.getUsers(sdkParams as {
        page?: number
        pageSize?: number
        keyword?: string
        level?: number
        status?: 'normal' | 'disabled'
      })
      if (res.code === 0 && res.data) {
        return {
          code: 0,
          data: {
            list: res.data.items.map((item) => ({
              id: item.id,
              nickname: item.nickname || '',
              avatar: item.avatarUrl || '',
              level: item.level,
              levelTitle: '',
              registerTime: item.registeredAt,
              lastActiveTime: item.lastActiveAt || '',
              cardCount: item.learnedCards,
              points: item.points,
              stationeryCount: 0,
              status: item.status === 'normal' ? '正常' : '已禁用'
            })),
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

  getUserDetail: (id: number | string) => userMock.getUserDetail(Number(id)),

  async updateUserStatus(id: number | string, status: string) {
    try {
      const mappedStatus = status === '正常' ? 'normal' : 'disabled'
      const res = await sdkAuth.updateUserStatus(String(id), { status: mappedStatus as 'normal' | 'disabled' })
      return res
    } catch {
      return userMock.updateUserStatus(Number(id), status)
    }
  },

  batchUpdateStatus: (ids: (number | string)[], status: string) => userMock.batchUpdateStatus(ids as number[], status),
  adjustPoints: (data: { userId: number | string; type: string; amount: number; reason: string }) => userMock.adjustPoints(data as { userId: number; type: string; amount: number; reason: string }),
}

export const noteApi = {
  getNotes: (params: { page: number; pageSize: number; title?: string; auditStatus?: string }) => noteMock.getNotes(params),
  getNoteDetail: (id: number) => noteMock.getNoteDetail(id),
  auditNote: (id: number, action: string, remark: string) => noteMock.auditNote(id, action, remark),
  deleteNote: (id: number) => noteMock.deleteNote(id),
  batchDelete: (ids: number[]) => noteMock.batchDelete(ids)
}
