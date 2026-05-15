import {
  createApiClient,
  setLoggerEnabled,
  localStorageAdapter
} from '@zhixiaoji/api-sdk-web'

setLoggerEnabled(true)

const api = createApiClient({
  baseURL: 'http://192.168.16.129:3001/api/v1',
  storage: localStorageAdapter,
  onAuthError: () => {
    localStorage.removeItem('accessToken')
    window.location.href = '/login'
  },
  enableLog: true
})

export const sdk = api
export const authApi = api.auth
export const setToken = api.setToken
export const clearToken = api.clearToken
