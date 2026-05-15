import { authApi as sdkAuthApi } from '@/api/sdk-client'
import { authMock } from '@/mock/auth'

export const authSdk = {
  login: (data: { username: string; password: string }) =>
    sdkAuthApi.adminLogin(data),

  refreshToken: (data: { refreshToken: string }) =>
    sdkAuthApi.refreshToken(data),

  logout: () => sdkAuthApi.logout(),

  getProfile: () => sdkAuthApi.getProfile(),

  getAdminProfile: () => sdkAuthApi.getAdminProfile()
}

export const authApi = {
  login: (data: { username: string; password: string }) => authMock.login(data),
  getUserInfo: () => authMock.getUserInfo()
}
