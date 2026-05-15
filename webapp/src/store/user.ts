import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface IUserInfo {
  id: number
  nickname: string
  avatar: string
  role: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const userInfo = ref<IUserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  function setToken(val: string) {
    token.value = val
    localStorage.setItem('token', val)
  }

  function loadToken() {
    const saved = localStorage.getItem('token')
    if (saved) token.value = saved
  }

  function setUserInfo(info: IUserInfo) {
    userInfo.value = info
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  loadToken()

  return { token, userInfo, isLoggedIn, setToken, setUserInfo, logout, loadToken }
})
