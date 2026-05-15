import { dashboardMock } from '@/mock/dashboard'

export const dashboardApi = {
  getMetrics: () => dashboardMock.getMetrics(),
  getUserTrend: () => dashboardMock.getUserTrend(),
  getRetentionRate: () => dashboardMock.getRetentionRate(),
  getContentDistribution: () => dashboardMock.getContentDistribution(),
  getConversionFunnel: () => dashboardMock.getConversionFunnel(),
  getHotContent: () => dashboardMock.getHotContent(),
  getWeekSummary: () => dashboardMock.getWeekSummary()
}
