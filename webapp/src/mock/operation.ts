import { success, delay, randomId, paginate } from './base'

export const operationMock = {
  async getAdSlots() {
    await delay(300)
    return success([
      { id: 1, name: '首页Banner下方广告', enabled: true, frequency: 5, frequencyUnit: '每次', startTime: '08:00', endTime: '22:00', targetUsers: '全部用户', exposure: 1234, clicks: 56, ctr: '4.5%' },
      { id: 2, name: '学习完成页激励视频', enabled: true, frequency: 1, frequencyUnit: '每次', startTime: '08:00', endTime: '22:00', targetUsers: '全部用户', exposure: 892, clicks: 180, ctr: '20.2%' },
      { id: 3, name: '卡片学习中间广告', enabled: false, frequency: 3, frequencyUnit: '每次', startTime: '08:00', endTime: '22:00', targetUsers: '仅活跃用户', exposure: 456, clicks: 23, ctr: '5.0%' },
      { id: 4, name: '测验结果页广告', enabled: true, frequency: 1, frequencyUnit: '每次', startTime: '08:00', endTime: '22:00', targetUsers: '全部用户', exposure: 678, clicks: 89, ctr: '13.1%' },
      { id: 5, name: '文具掉落时激励视频', enabled: true, frequency: 2, frequencyUnit: '每天', startTime: '08:00', endTime: '22:00', targetUsers: '全部用户', exposure: 321, clicks: 98, ctr: '30.5%' }
    ])
  },

  async updateAdSlot(id: number, data: Record<string, unknown>) {
    await delay(400)
    return success(null, '配置已保存')
  },

  async getBanners() {
    await delay(300)
    return success([
      { id: 1, imageUrl: '', targetType: '知识卡片', targetName: 'Python入门基础', sortOrder: 1, status: '已上架' },
      { id: 2, imageUrl: '', targetType: '每日挑战', targetName: '', sortOrder: 2, status: '已上架' },
      { id: 3, imageUrl: '', targetType: '无跳转', targetName: '', sortOrder: 3, status: '草稿' }
    ])
  },

  async getPointsRules() {
    await delay(300)
    return success({
      earnRules: [
        { action: '每日登录', points: 10, dailyLimit: 10, enabled: true },
        { action: '章节测验通过', points: 20, dailyLimit: 60, enabled: true },
        { action: '每日挑战完成', points: 15, dailyLimit: 15, enabled: true },
        { action: '连续打卡7天', points: 50, dailyLimit: 50, enabled: true },
        { action: '观看激励视频广告', points: 30, dailyLimit: 150, enabled: true },
        { action: '邀请新用户', points: 100, dailyLimit: 500, enabled: true }
      ],
      spendRules: [
        { action: '解锁知识卡片', points: '50-150', enabled: true },
        { action: '解锁进阶章节', points: '200-500', enabled: true },
        { action: '去广告特权', points: '500/7天', enabled: true }
      ],
      probabilityConfig: {
        luckyUnlockRate: 30,
        directPayRate: 70,
        insufficientAdOption: true
      }
    })
  },

  async getStationeries() {
    await delay(300)
    return success({
      list: [
        { id: 1, name: '铅笔', icon: '✏️', rarity: '⭐普通', category: '装饰道具', story: '一支普通的铅笔', usage: '基础文具', dropCount: 12580, holderCount: 8920, status: '已上架' },
        { id: 2, name: '钢笔', icon: '🖊️', rarity: '⭐⭐进阶', category: '装饰道具', story: '一支精致的钢笔', usage: '进阶文具', dropCount: 5234, holderCount: 3456, status: '已上架' },
        { id: 3, name: '编程键盘', icon: '⌨️', rarity: '⭐⭐⭐高级', category: '装饰道具', story: '专为编程设计的键盘', usage: '高级文具', dropCount: 1234, holderCount: 567, status: '已上架' },
        { id: 4, name: 'AI芯片', icon: '💾', rarity: '⭐⭐⭐⭐传说', category: '徽章道具', story: '传说级的AI芯片', usage: '传说级道具', dropCount: 456, holderCount: 89, status: '已上架' }
      ],
      dropRules: [
        { action: '完成知识卡片', normal: 80, advanced: 15, senior: 4, legendary: 1, guarantee: 10, guaranteeRarity: '进阶及以上' },
        { action: '章节测验通过', normal: 50, advanced: 35, senior: 12, legendary: 3, guarantee: 5, guaranteeRarity: '高级及以上' },
        { action: '每日挑战全对', normal: 30, advanced: 40, senior: 25, legendary: 5, guarantee: 7, guaranteeRarity: '高级及以上' }
      ]
    })
  },

  async getLevels() {
    await delay(300)
    return success([
      { level: 1, title: '编程小白', icon: '🌱', conditions: ['注册即获得'], privileges: ['基础章节免费学习'], userCount: 4820, percentage: '38.6%', editable: false, status: '启用' },
      { level: 2, title: '代码学徒', icon: '📝', conditions: ['累计学习10张卡片'], privileges: ['解锁学习统计功能'], userCount: 2850, percentage: '22.8%', editable: true, status: '启用' },
      { level: 3, title: '逻辑思考者', icon: '🧠', conditions: ['累计学习50张卡片', '收集10件文具'], privileges: ['解锁错题本功能'], userCount: 1800, percentage: '14.4%', editable: true, status: '启用' },
      { level: 4, title: '算法新手', icon: '⚡', conditions: ['累计学习100张卡片', '通过10次章节测验'], privileges: ['解锁快速路径学习模式'], userCount: 920, percentage: '7.4%', editable: true, status: '启用' },
      { level: 5, title: '程序达人', icon: '🔥', conditions: ['累计学习200张卡片', '收集1件高级文具'], privileges: ['解锁实战项目章节'], userCount: 450, percentage: '3.6%', editable: true, status: '启用' }
    ])
  },

  async getAchievements() {
    await delay(300)
    return success({
      list: [
        { id: 1, name: '初次见面', icon: '', category: '学习数量', condition: '完成1张卡片学习', reward: '铅笔×1', unlockCount: 12580, unlockRate: 100, status: '已上架' },
        { id: 2, name: '学富五车', icon: '', category: '学习数量', condition: '完成100张卡片学习', reward: '高级文具×1', unlockCount: 890, unlockRate: 7.1, status: '已上架' },
        { id: 3, name: '坚持不懈', icon: '', category: '连续学习', condition: '连续打卡7天', reward: '进阶文具×1', unlockCount: 3450, unlockRate: 27.5, status: '已上架' },
        { id: 4, name: '传道授业', icon: '', category: '社交达人', condition: '成功邀请3位好友', reward: '限定道具×1', unlockCount: 234, unlockRate: 1.9, status: '已上架' }
      ],
      categories: ['全部', '学习数量', '连续学习', '答题能手', '完美答题', '探索者', '社交达人', '文具收集', '特殊行为']
    })
  },

  async getLeaderboards() {
    await delay(300)
    return success([
      { id: 1, name: '学习达人榜', criteria: '本周完成知识卡片数', enabled: true, updateFrequency: '每周一重置', displayCount: 50, period: '本周' },
      { id: 2, name: '文具收藏家榜', criteria: '累计收集文具数量', enabled: true, updateFrequency: '实时更新', displayCount: 50, period: null },
      { id: 3, name: '连续打卡榜', criteria: '连续学习天数', enabled: true, updateFrequency: '实时更新', displayCount: 50, period: null },
      { id: 4, name: '答题正确率榜', criteria: '累计答题正确率', enabled: false, updateFrequency: '实时更新', displayCount: 50, period: null }
    ])
  },

  async getLimitedItems() {
    await delay(300)
    return success([
      { id: 1, name: '友谊之笔', icon: '🖊️', rarity: '⭐⭐⭐⭐', type: '装饰道具', effect: '解锁专属书桌主题「友谊时光」', inviteMilestone: '首次邀请', holderCount: 234, status: '已上架' },
      { id: 2, name: '知识传递者徽章', icon: '🏅', rarity: '⭐⭐⭐⭐⭐', type: '徽章道具', effect: '每日首次学习额外+5积分', inviteMilestone: '累计邀请3人', holderCount: 89, status: '已上架' }
    ])
  },

  async getMessageTemplates() {
    await delay(300)
    return success([
      { id: 1, type: '学习提醒', title: '每日学习提醒', content: '{用户名}，今天还有{今日待复习数}张卡片等你复习哦！', variables: ['用户名', '今日待复习数', '连续打卡天数'], status: '启用' },
      { id: 2, type: '复习提醒', title: '遗忘复习提醒', content: '{用户名}，你有{遗忘风险卡片数}张卡片可能快要忘记了，快来看看吧！', variables: ['用户名', '待复习卡片数', '遗忘风险卡片数'], status: '启用' }
    ])
  },

  async getPushRecords(params: { page: number; pageSize: number }) {
    await delay(400)
    const records = [
      { id: 1, pushTime: '2026-05-13 08:00', type: '学习提醒', title: '每日学习提醒', method: '自动', targetDesc: '全部用户', expectedCount: 12580, deliveredCount: 12450, openedCount: 4520, openRate: '36.3%' },
      { id: 2, pushTime: '2026-05-12 18:00', type: '活动通知', title: '新功能上线通知', method: '手动', targetDesc: '活跃用户', expectedCount: 8560, deliveredCount: 8450, openedCount: 3200, openRate: '37.9%' }
    ]
    return success(paginate(records, { page: params.page, pageSize: params.pageSize }))
  },

  // --- Banner CRUD ---
  async createBanner(data: Record<string, unknown>) {
    await delay(400)
    return success({ id: randomId(), ...data }, 'Banner创建成功')
  },

  async updateBanner(id: number, data: Record<string, unknown>) {
    await delay(400)
    return success(null, 'Banner更新成功')
  },

  async deleteBanner(id: number) {
    await delay(300)
    return success(null, 'Banner已删除')
  },

  // --- Theme Config ---
  async getThemeConfig() {
    await delay(300)
    return success({
      primaryColor: '#D4916E',
      accentColor: '#4A90D9',
      navbarBgColor: '#FAF7F2',
      navbarTextColor: '#1A1A1A'
    })
  },

  async updateThemeConfig(data: Record<string, unknown>) {
    await delay(400)
    return success(null, '主题色配置已保存')
  },

  // --- Home Modules ---
  async getHomeModules() {
    await delay(300)
    return success([
      { id: 1, name: '学习进度', description: '展示用户当前学习进度和关卡', enabled: true, sortOrder: 1 },
      { id: 2, name: '今日复习', description: '待复习卡片数量及快捷入口', enabled: true, sortOrder: 2 },
      { id: 3, name: '每日挑战', description: '每日答题挑战入口', enabled: true, sortOrder: 3 },
      { id: 4, name: '文具展示', description: '用户已收集的文具展示', enabled: true, sortOrder: 4 },
      { id: 5, name: '成就展示', description: '最近获得的成就徽章', enabled: true, sortOrder: 5 },
      { id: 6, name: '排行榜入口', description: '各类排行榜快捷入口', enabled: true, sortOrder: 6 },
      { id: 7, name: '邀请入口', description: '邀请好友得奖励入口', enabled: false, sortOrder: 7 }
    ])
  },

  async updateHomeModules(modules: Record<string, unknown>[]) {
    await delay(400)
    return success(null, '首页模块排序已保存')
  },

  // --- Shortcuts ---
  async getShortcuts() {
    await delay(300)
    return success([
      { id: 1, icon: 'Reading', name: '知识卡片', targetType: 'knowledge', targetId: '', sortOrder: 1 },
      { id: 2, icon: 'EditPen', name: '每日挑战', targetType: 'daily-challenge', targetId: '', sortOrder: 2 },
      { id: 3, icon: 'Star', name: '我的成就', targetType: 'achievements', targetId: '', sortOrder: 3 }
    ])
  },

  async createShortcut(data: Record<string, unknown>) {
    await delay(400)
    return success({ id: randomId(), ...data }, '快捷入口创建成功')
  },

  async updateShortcut(id: number, data: Record<string, unknown>) {
    await delay(400)
    return success(null, '快捷入口更新成功')
  },

  async deleteShortcut(id: number) {
    await delay(300)
    return success(null, '快捷入口已删除')
  },

  // --- Splash Config ---
  async getSplashConfig() {
    await delay(300)
    return success({
      logoUrl: '',
      slogan: '轻松学编程，从这里开始',
      bgColor: '#D4916E'
    })
  },

  async updateSplashConfig(data: Record<string, unknown>) {
    await delay(400)
    return success(null, '开屏页配置已保存')
  },

  // --- Announcements ---
  async getAnnouncements() {
    await delay(300)
    return success([
      { id: 1, title: '知晓记V2.0版本上线通知', content: '全新UI设计、新增每日挑战功能', jumpType: '无跳转', jumpTarget: '', publishTime: '2026-05-10 10:00', expireTime: '2026-06-10 23:59', status: '已发布' },
      { id: 2, title: '五一学习打卡活动预告', content: '五一期间连续打卡赢限定文具', jumpType: '知识卡片', jumpTarget: 'Python入门基础', publishTime: '2026-05-12 08:00', expireTime: '2026-05-15 23:59', status: '已过期' },
      { id: 3, title: '新功能：AI编程助手上线', content: '学习过程中可随时唤出AI助手', jumpType: '每日挑战', jumpTarget: '', publishTime: '', expireTime: '', status: '草稿' }
    ])
  },

  async createAnnouncement(data: Record<string, unknown>) {
    await delay(400)
    return success({ id: randomId(), ...data }, '公告创建成功')
  },

  async updateAnnouncement(id: number, data: Record<string, unknown>) {
    await delay(400)
    return success(null, '公告更新成功')
  },

  async deleteAnnouncement(id: number) {
    await delay(300)
    return success(null, '公告已删除')
  },

  // --- Points Rules ---
  async updatePointsRule(data: Record<string, unknown>) {
    await delay(400)
    return success(null, '积分规则已保存')
  },

  // --- Stationery CRUD ---
  async createStationery(data: Record<string, unknown>) {
    await delay(400)
    return success({ id: randomId(), ...data }, '文具创建成功')
  },

  async updateStationery(id: number, data: Record<string, unknown>) {
    await delay(400)
    return success(null, '文具更新成功')
  },

  async deleteStationery(id: number) {
    await delay(300)
    return success(null, '文具已删除')
  },

  async batchDeleteStationery(ids: number[]) {
    await delay(400)
    return success(null, `已删除${ids.length}件文具`)
  },

  async updateDropRules(rules: Record<string, unknown>[]) {
    await delay(400)
    return success(null, '掉落规则已保存')
  },

  // --- Levels ---
  async updateLevel(id: number, data: Record<string, unknown>) {
    await delay(400)
    return success(null, '等级配置已保存')
  },

  // --- Achievements ---
  async createAchievement(data: Record<string, unknown>) {
    await delay(400)
    return success({ id: randomId(), ...data }, '成就创建成功')
  },

  async updateAchievement(id: number, data: Record<string, unknown>) {
    await delay(400)
    return success(null, '成就更新成功')
  },

  async deleteAchievement(id: number) {
    await delay(300)
    return success(null, '成就已删除')
  },

  async batchAchievementOperation(ids: number[], action: string) {
    await delay(400)
    const actionMap: Record<string, string> = { online: '批量上架', offline: '批量下架', delete: '批量删除' }
    return success(null, `${actionMap[action] || '操作'}成功`)
  },

  // --- Leaderboard ---
  async updateLeaderboard(id: number, data: Record<string, unknown>) {
    await delay(400)
    return success(null, '排行榜配置已保存')
  },

  async saveAllLeaderboards(data: Record<string, unknown>[]) {
    await delay(500)
    return success(null, '所有排行榜配置已保存')
  },

  // --- Limited Items ---
  async createLimitedItem(data: Record<string, unknown>) {
    await delay(400)
    return success({ id: randomId(), ...data }, '限定道具创建成功')
  },

  async updateLimitedItem(id: number, data: Record<string, unknown>) {
    await delay(400)
    return success(null, '限定道具更新成功')
  },

  async deleteLimitedItem(id: number) {
    await delay(300)
    return success(null, '限定道具已删除')
  },

  // --- Message Templates ---
  async updateMessageTemplate(id: number, data: Record<string, unknown>) {
    await delay(400)
    return success(null, '模板保存成功')
  },

  async resetMessageTemplate(id: number) {
    await delay(400)
    return success(null, '模板已恢复默认')
  },

  // --- Message Settings ---
  getMessageSettings() {
    return delay(300).then(() => success({
      types: [
        { type: '学习提醒', enabled: true, startTime: '08:00', endTime: '22:00', frequencyLimit: 2, frequencyUnit: '次/天', paused: false, pauseStart: '', pauseEnd: '' },
        { type: '复习提醒', enabled: true, startTime: '08:00', endTime: '22:00', frequencyLimit: 3, frequencyUnit: '次/天', paused: false, pauseStart: '', pauseEnd: '' },
        { type: '活动通知', enabled: true, startTime: '08:00', endTime: '22:00', frequencyLimit: 1, frequencyUnit: '次/天', paused: false, pauseStart: '', pauseEnd: '' },
        { type: '积分变动', enabled: true, startTime: '08:00', endTime: '22:00', frequencyLimit: 5, frequencyUnit: '次/天', paused: false, pauseStart: '', pauseEnd: '' },
        { type: '成就解锁', enabled: true, startTime: '08:00', endTime: '22:00', frequencyLimit: 3, frequencyUnit: '次/天', paused: false, pauseStart: '', pauseEnd: '' },
        { type: '文具掉落', enabled: true, startTime: '08:00', endTime: '22:00', frequencyLimit: 5, frequencyUnit: '次/天', paused: false, pauseStart: '', pauseEnd: '' }
      ]
    }))
  },

  async updateMessageSettings(data: Record<string, unknown>) {
    await delay(400)
    return success(null, '推送设置已保存')
  },

  // --- Manual Push ---
  async sendManualPush(data: Record<string, unknown>) {
    await delay(500)
    return success(null, '推送任务已创建')
  }
}
