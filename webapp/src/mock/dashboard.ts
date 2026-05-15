import { success, delay } from './base'

export const dashboardMock = {
  async getMetrics() {
    await delay(400)
    return success({
      totalUsers: 12580,
      dau: 2340,
      newUsersToday: 156,
      studyCountToday: 3892,
      totalUsersTrend: 12.5,
      dauTrend: 8.3,
      newUsersTrend: 5.2,
      studyCountTrend: 15.8
    })
  },

  async getUserTrend() {
    await delay(600)
    return success({
      categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      values: [120, 180, 200, 240, 220, 260, 310]
    })
  },

  async getRetentionRate() {
    await delay(500)
    return success([
      { day: 1, rate: 92 },
      { day: 2, rate: 75 },
      { day: 3, rate: 58 },
      { day: 7, rate: 42 },
      { day: 14, rate: 28 },
      { day: 30, rate: 18 }
    ])
  },

  async getContentDistribution() {
    await delay(500)
    return success([
      { name: 'Python', value: 40 },
      { name: 'JavaScript', value: 30 },
      { name: '算法', value: 15 },
      { name: '数据结构', value: 10 },
      { name: '其他', value: 5 }
    ])
  },

  async getConversionFunnel() {
    await delay(500)
    return success([
      { stage: '访问课程', count: 12580 },
      { stage: '开始学习', count: 8920 },
      { stage: '完成课程', count: 4560 },
      { stage: '续学下章', count: 2890 }
    ])
  },

  async getHotContent() {
    await delay(400)
    return success([
      { rank: 1, name: 'Python入门基础', count: 3200 },
      { rank: 2, name: 'JavaScript核心概念', count: 2800 },
      { rank: 3, name: '数据结构与算法', count: 2500 },
      { rank: 4, name: 'AI编程入门', count: 2100 },
      { rank: 5, name: 'Web开发实践', count: 1900 },
      { rank: 6, name: '数据库基础', count: 1600 }
    ])
  },

  async getWeekSummary() {
    await delay(300)
    return success({
      newUsers: 1280,
      totalStudyCount: 24560,
      avgCorrectRate: 78.5,
      activeUsers: 8560
    })
  }
}
