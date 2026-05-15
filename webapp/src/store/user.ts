import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface IAdminInfo {
  id: string
  username: string
  role: string
  createdAt: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const adminInfo = ref<IAdminInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  function setToken(val: string) {
    token.value = val
  }

  function loadToken() {
    const saved = localStorage.getItem('accessToken')
    if (saved) token.value = saved
  }

  function setAdminInfo(info: IAdminInfo) {
    adminInfo.value = info
  }

  function logout() {
    token.value = ''
    adminInfo.value = null
    localStorage.removeItem('accessToken')
  }

  loadToken()

  return { token, adminInfo, isLoggedIn, setToken, setAdminInfo, logout, loadToken }
})
