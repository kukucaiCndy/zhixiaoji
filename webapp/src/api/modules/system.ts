import { systemMock } from '@/mock/system'

export const systemApi = {
  changePassword: (data: { oldPassword: string; newPassword: string }) => systemMock.changePassword(data),
  bindPhone: (data: { phone: string; code: string }) => systemMock.bindPhone(data),
  getLoginLogs: (params: { page: number; pageSize: number }) => systemMock.getLoginLogs(params),
  getReviewRules: () => systemMock.getReviewRules(),
  updateReviewNodes: (data: { nodes: { reviewTimes: number; interval: number }[] }) => systemMock.updateReviewNodes(data),
  updateReviewParams: (data: Record<string, number>) => systemMock.updateReviewParams(data),
  resetReviewRules: () => systemMock.resetReviewRules(),
  previewReview: () => systemMock.previewReview(),
  getAuditLogs: (params: { page: number; pageSize: number; module?: string; type?: string; operator?: string }) => systemMock.getAuditLogs(params)
}
