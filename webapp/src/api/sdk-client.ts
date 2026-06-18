import {
  createApiClient,
  setLoggerEnabled,
  localStorageAdapter,
} from '@zhixiaoji/api-sdk-web'

setLoggerEnabled(true)

function redirectToLogin(): void {
  localStorage.removeItem('accessToken')
  sessionStorage.setItem('auth_expired', '1')
  window.location.replace('/login')
}

export function checkAuthAndRedirect(resOrErr: unknown): boolean {
  if (!resOrErr) return false
  const err = resOrErr as Record<string, unknown>
  const code = (err as { code?: number }).code
  const message = ((err as { message?: string }).message || '') as string

  // Direct auth error code (HTTP 401 mapped to SDK)
  if (code === 401) {
    redirectToLogin()
    return true
  }

  // Error message contains auth keywords
  const msg = message.toLowerCase()
  if (msg.includes('token') || msg.includes('未授权') || msg.includes('unauthorized') || msg.includes('未登录') || msg.includes('invalid token')) {
    redirectToLogin()
    return true
  }

  // SdkError with AUTH_ERROR code
  const errorCode = (err as { code?: string }).code
  if (typeof errorCode === 'string' && errorCode === 'AUTH_ERROR') {
    redirectToLogin()
    return true
  }

  return false
}

const api = createApiClient({
  baseURL: 'http://192.168.16.129:12302/api/v1',
  storage: localStorageAdapter,
  enableLog: true,
})

export const sdk = api
export const authApi = api.auth
export const setToken = api.setToken
export const clearToken = api.clearToken
