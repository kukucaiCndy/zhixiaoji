import { authMock } from '@/mock/auth'

export const authApi = {
  login: (data: { username: string; password: string }) => authMock.login(data),
  getUserInfo: () => authMock.getUserInfo()
}
