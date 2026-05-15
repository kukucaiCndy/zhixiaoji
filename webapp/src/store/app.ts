import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const pageTitle = ref('')
  const sidebarWidth = computed(() => sidebarCollapsed.value ? '64px' : '220px')

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setPageTitle(title: string) {
    pageTitle.value = title
    document.title = title ? `${title} - 知晓记管理后台` : '知晓记管理后台'
  }

  return { sidebarCollapsed, pageTitle, sidebarWidth, toggleSidebar, setPageTitle }
})
