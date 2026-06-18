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

const studyRecords = [
  { id: 1, studyTime: '2026-05-13 10:30', cardName: 'Python变量与数据类型', chapterName: 'Python基础', status: '已完成', duration: 15 },
  { id: 2, studyTime: '2026-05-13 09:15', cardName: 'Python条件判断', chapterName: 'Python基础', status: '已完成', duration: 12 },
  { id: 3, studyTime: '2026-05-12 20:00', cardName: '数组排序算法', chapterName: '算法入门', status: '学习中', duration: 8 },
  { id: 4, studyTime: '2026-05-12 16:30', cardName: 'JavaScript变量作用域', chapterName: 'JavaScript基础', status: '已完成', duration: 10 },
  { id: 5, studyTime: '2026-05-11 14:00', cardName: '循环结构深入', chapterName: 'Python基础', status: '已完成', duration: 20 }
]

const pointsRecords = [
  { id: 1, time: '2026-05-13 10:30', action: '完成学习', pointsChange: 10, balance: 1580 },
  { id: 2, time: '2026-05-13 09:15', action: '完成答题', pointsChange: 5, balance: 1570 },
  { id: 3, time: '2026-05-12 20:00', action: '连续打卡', pointsChange: 20, balance: 1565 },
  { id: 4, time: '2026-05-12 16:30', action: '兑换文具', pointsChange: -50, balance: 1545 },
  { id: 5, time: '2026-05-11 14:00', action: '完成学习', pointsChange: 10, balance: 1595 }
]

const stationeryItems = [
  { id: 1, name: '代码笔记本', icon: '📓', rarity: 1, quantity: 3 },
  { id: 2, name: '金色钢笔', icon: '🖊️', rarity: 3, quantity: 1 },
  { id: 3, name: '橡皮擦', icon: '🧹', rarity: 1, quantity: 5 },
  { id: 4, name: '键盘贴纸', icon: '⌨️', rarity: 2, quantity: 2 },
  { id: 5, name: '程序员马克杯', icon: '☕', rarity: 4, quantity: 1 },
  { id: 6, name: '书签', icon: '🔖', rarity: 1, quantity: 8 },
  { id: 7, name: '限定鼠标垫', icon: '🖱️', rarity: 5, quantity: 0 }
]

const levelRecords = [
  { id: 1, time: '2026-05-10', fromLevel: 4, fromTitle: '算法新手', toLevel: 5, toTitle: '程序达人', reason: '累计学习卡片数达到200张' },
  { id: 2, time: '2026-04-20', fromLevel: 3, fromTitle: '逻辑思考者', toLevel: 4, toTitle: '算法新手', reason: '累计积分达到1000分' },
  { id: 3, time: '2026-04-05', fromLevel: 2, fromTitle: '代码学徒', toLevel: 3, toTitle: '逻辑思考者', reason: '连续打卡30天' },
  { id: 4, time: '2026-03-20', fromLevel: 1, fromTitle: '编程小白', toLevel: 2, toTitle: '代码学徒', reason: '完成新手引导' }
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

  async getStudyRecords(_userId: number, _params?: { startDate?: string; endDate?: string }) {
    await delay(300)
    return success(studyRecords)
  },

  async getPointsRecords(_userId: number, _params?: { startDate?: string; endDate?: string; action?: string }) {
    await delay(300)
    return success(pointsRecords)
  },

  async getStationeryItems(_userId: number) {
    await delay(300)
    return success(stationeryItems)
  },

  async getLevelRecords(_userId: number) {
    await delay(300)
    return success(levelRecords)
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

  async adjustPoints(_params: { userId: number; type: string; amount: number; reason: string }) {
    await delay(400)
    return success(null, '积分调整成功')
  }
}
