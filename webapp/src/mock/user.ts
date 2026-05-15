import { success, delay, paginate } from './base'

const users = [
  { id: 10001, nickname: '编程小王子', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=编程小王子&backgroundColor=D4916E', level: 5, levelTitle: '程序达人', registerTime: '2026-03-15', lastActiveTime: '2026-05-13 10:30', cardCount: 256, points: 1580, stationeryCount: 28, status: '正常' },
  { id: 10002, nickname: '代码少女', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=代码少女&backgroundColor=7BA87F', level: 3, levelTitle: '逻辑思考者', registerTime: '2026-04-01', lastActiveTime: '2026-05-13 09:15', cardCount: 128, points: 890, stationeryCount: 15, status: '正常' },
  { id: 10003, nickname: '算法大师', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=算法大师&backgroundColor=4A90D9', level: 6, levelTitle: '代码高手', registerTime: '2026-02-10', lastActiveTime: '2026-05-12 22:00', cardCount: 520, points: 3500, stationeryCount: 45, status: '正常' },
  { id: 10004, nickname: '学习达人', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=学习达人&backgroundColor=8B7BA8', level: 4, levelTitle: '算法新手', registerTime: '2026-03-28', lastActiveTime: '2026-05-11 18:30', cardCount: 180, points: 1200, stationeryCount: 22, status: '正常' },
  { id: 10005, nickname: '前端萌新', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=前端萌新&backgroundColor=C4726F', level: 2, levelTitle: '代码学徒', registerTime: '2026-05-01', lastActiveTime: '2026-05-13 08:00', cardCount: 32, points: 350, stationeryCount: 5, status: '正常' },
  { id: 10006, nickname: 'BUG制造者', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=BUG制造者&backgroundColor=E8B84B', level: 1, levelTitle: '编程小白', registerTime: '2026-05-10', lastActiveTime: '2026-05-12 16:00', cardCount: 5, points: 50, stationeryCount: 1, status: '正常' },
  { id: 10007, nickname: '已禁用用户', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=已禁用用户&backgroundColor=A89880', level: 2, levelTitle: '代码学徒', registerTime: '2026-04-15', lastActiveTime: '2026-04-20 12:00', cardCount: 45, points: 200, stationeryCount: 8, status: '已禁用' }
]

export const userMock = {
  async getUsers(params: { page: number; pageSize: number; nickname?: string; level?: number; status?: string }) {
    await delay(500)
    let filtered = [...users]
    if (params.nickname) filtered = filtered.filter((u) => u.nickname.includes(params.nickname!))
    if (params.level) filtered = filtered.filter((u) => u.level === params.level)
    if (params.status) filtered = filtered.filter((u) => u.status === params.status)
    return success(paginate(filtered, { page: params.page, pageSize: params.pageSize }))
  },

  async getUserDetail(id: number) {
    await delay(400)
    const user = users.find((u) => u.id === id)
    if (!user) return { code: -1, data: null, message: '用户不存在' }
    return success({
      ...user,
      studyDays: 45,
      totalAnswers: 520,
      correctRate: 82.5,
      streakDays: 12,
      inviteCount: 3,
      deviceInfo: 'iPhone 15 Pro / iOS 18.0'
    })
  },

  async updateUserStatus(id: number, status: string) {
    await delay(400)
    const user = users.find((u) => u.id === id)
    if (!user) return { code: -1, data: null, message: '用户不存在' }
    user.status = status
    return success(null, '操作成功')
  },

  async batchUpdateStatus(ids: number[], status: string) {
    await delay(500)
    ids.forEach((id) => {
      const user = users.find((u) => u.id === id)
      if (user) user.status = status
    })
    return success(null, '操作成功')
  },

  async adjustPoints(params: { userId: number; type: string; amount: number; reason: string }) {
    await delay(400)
    return success(null, '积分调整成功')
  }
}
