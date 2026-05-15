import { success, delay, paginate } from './base'

export const systemMock = {
  async changePassword(params: { oldPassword: string; newPassword: string }) {
    await delay(600)
    return success(null, '密码修改成功，请重新登录')
  },

  async bindPhone(params: { phone: string; code: string }) {
    await delay(600)
    return success({ phone: params.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') })
  },

  async getLoginLogs(params: { page: number; pageSize: number }) {
    await delay(400)
    const logs = [
      { id: 1, loginTime: '2026-05-13 08:30:00', ip: '192.168.1.100', device: 'Chrome / Windows', result: '成功' },
      { id: 2, loginTime: '2026-05-12 14:20:00', ip: '192.168.1.100', device: 'Firefox / macOS', result: '成功' },
      { id: 3, loginTime: '2026-05-12 09:15:00', ip: '10.0.0.55', device: 'Edge / Windows', result: '失败' },
      { id: 4, loginTime: '2026-05-11 08:00:00', ip: '192.168.1.100', device: 'Chrome / Windows', result: '成功' }
    ]
    return success(paginate(logs, { page: params.page, pageSize: params.pageSize }))
  },

  async getReviewRules() {
    await delay(300)
    return success({
      nodes: [
        { reviewTimes: 1, defaultInterval: 1, range: '1-3', current: 1 },
        { reviewTimes: 2, defaultInterval: 2, range: '2-5', current: 2 },
        { reviewTimes: 3, defaultInterval: 4, range: '3-7', current: 4 },
        { reviewTimes: 4, defaultInterval: 7, range: '5-15', current: 7 },
        { reviewTimes: 5, defaultInterval: 15, range: '10-30', current: 15 }
      ],
      params: {
        masteryExtendFactor: { default: 1.5, range: '1.2-2.0', current: 1.5 },
        poorShortenFactor: { default: 0.6, range: '0.3-0.8', current: 0.6 },
        fastCorrectTime: { default: 5, range: '3-10', current: 5 },
        maxInterval: { default: 30, range: '15-90', current: 30 }
      }
    })
  },

  async updateReviewNodes(data: { nodes: { reviewTimes: number; interval: number }[] }) {
    await delay(500)
    return success(null, '复习规则已更新')
  },

  async updateReviewParams(data: Record<string, number>) {
    await delay(500)
    return success(null, '复习参数已更新')
  },

  async resetReviewRules() {
    await delay(400)
    return success(null, '已重置为系统默认配置')
  },

  async previewReview() {
    await delay(300)
    return success({
      example: {
        learnDate: '2026-05-01',
        reviews: [
          { times: 1, date: '2026-05-02' },
          { times: 2, date: '2026-05-04' },
          { times: 3, date: '2026-05-08' },
          { times: 4, date: '2026-05-15' },
          { times: 5, date: '2026-05-30' }
        ]
      }
    })
  },

  async getAuditLogs(params: { page: number; pageSize: number; module?: string; type?: string; operator?: string }) {
    await delay(500)
    const logs = [
      { id: 1, operateTime: '2026-05-13 14:30:25', operator: 'Admin', module: '内容管理', type: '编辑', target: 'Python变量与数据类型', content: '更新了卡片内容', ip: '192.168.1.100' },
      { id: 2, operateTime: '2026-05-13 11:15:10', operator: 'Admin', module: '用户管理', type: '禁用', target: '已禁用用户(ID:10007)', content: '用户被禁用', ip: '192.168.1.100', sensitive: true },
      { id: 3, operateTime: '2026-05-13 10:00:00', operator: 'Admin', module: '内容管理', type: '上架', target: 'JavaScript变量作用域', content: '卡片已上架', ip: '192.168.1.100' },
      { id: 4, operateTime: '2026-05-12 16:45:00', operator: 'Admin', module: '运营管理', type: '编辑', target: '积分规则', content: '修改了每日登录积分', ip: '192.168.1.100' },
      { id: 5, operateTime: '2026-05-12 09:30:00', operator: 'Admin', module: '系统配置', type: '登录', target: '系统登录', content: '登录成功', ip: '192.168.1.100' }
    ]
    let filtered = logs
    if (params.module) filtered = filtered.filter((l) => l.module === params.module)
    if (params.type) filtered = filtered.filter((l) => l.type === params.type)
    if (params.operator) filtered = filtered.filter((l) => l.operator.includes(params.operator!))
    return success(paginate(filtered, { page: params.page, pageSize: params.pageSize }))
  }
}
