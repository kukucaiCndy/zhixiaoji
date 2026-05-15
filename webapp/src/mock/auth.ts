import { success, fail, delay } from './base'

export const authMock = {
  async login(params: { username: string; password: string }) {
    await delay(800)
    if (params.username === 'admin' && params.password === 'admin123') {
      return success({
        token: 'mock-jwt-token-admin-2026',
        userInfo: {
          id: 1,
          nickname: 'Admin',
          avatar: '',
          role: 'admin'
        }
      })
    }
    return fail('用户名或密码错误')
  },

  async getUserInfo() {
    await delay(200)
    return success({
      id: 1,
      nickname: 'Admin',
      avatar: '',
      role: 'admin',
      permissions: ['*']
    })
  }
}
