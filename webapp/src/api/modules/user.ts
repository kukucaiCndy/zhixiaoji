import { authApi as sdkAuth, sdk, checkAuthAndRedirect } from '@/api/sdk-client'
import type { AdminUserItem } from '@zhixiaoji/api-sdk-web'
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
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return userMock.getUsers(params)
    }
  },

  async getUserDetail(id: number | string) {
    try {
      const res = await sdk.client.get<AdminUserItem>(`/auth/admin/users/${id}`)
      if (res.code === 0 && res.data) {
        return {
          code: 0,
          data: {
            id: res.data.id,
            nickname: res.data.nickname || '',
            avatar: res.data.avatarUrl || '',
            level: res.data.level,
            levelTitle: '',
            registerTime: res.data.registeredAt,
            lastActiveTime: res.data.lastActiveAt || '',
            cardCount: res.data.learnedCards,
            points: res.data.points,
            stationeryCount: 0,
            status: res.data.status === 'normal' ? '正常' : '已禁用',
            studyDays: 0,
            totalAnswers: 0,
            correctRate: 0,
            streakDays: 0,
            inviteCount: 0,
            deviceInfo: ''
          },
          message: 'ok'
        }
      }
    } catch (ex) {
      checkAuthAndRedirect(ex)
      // fall through to mock
    }
    return userMock.getUserDetail(Number(id))
  },

  async getStudyRecords(userId: number | string, params?: { startDate?: string; endDate?: string }) {
    try {
      const res = await sdk.client.get(`/core/admin/users/${userId}/study-records`, params)
      if (res.code === 0 && res.data) {
        return res
      }
    } catch (ex) {
      checkAuthAndRedirect(ex)
      // fall through to mock
    }
    return userMock.getStudyRecords(Number(userId), params)
  },

  async getPointsRecords(userId: number | string, params?: { startDate?: string; endDate?: string; action?: string }) {
    try {
      const res = await sdk.client.get(`/core/admin/users/${userId}/points-records`, params)
      if (res.code === 0 && res.data) {
        return res
      }
    } catch (ex) {
      checkAuthAndRedirect(ex)
      // fall through to mock
    }
    return userMock.getPointsRecords(Number(userId), params)
  },

  async getStationeryItems(userId: number | string) {
    try {
      const res = await sdk.client.get(`/core/admin/users/${userId}/stationeries`)
      if (res.code === 0 && res.data) {
        return res
      }
    } catch (ex) {
      checkAuthAndRedirect(ex)
      // fall through to mock
    }
    return userMock.getStationeryItems(Number(userId))
  },

  async getLevelRecords(userId: number | string) {
    try {
      const res = await sdk.client.get(`/core/admin/users/${userId}/level-records`)
      if (res.code === 0 && res.data) {
        return res
      }
    } catch (ex) {
      checkAuthAndRedirect(ex)
      // fall through to mock
    }
    return userMock.getLevelRecords(Number(userId))
  },

  async updateUserStatus(id: number | string, status: string) {
    try {
      const mappedStatus = status === '正常' ? 'normal' : 'disabled'
      const res = await sdkAuth.updateUserStatus(String(id), { status: mappedStatus as 'normal' | 'disabled' })
      return res
    } catch (ex) {
      checkAuthAndRedirect(ex)
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
