<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

interface IMenuItem {
  path: string
  title: string
  icon?: string
  children?: { path: string; title: string }[]
}

const menuItems: IMenuItem[] = [
  {
    path: '/dashboard',
    title: '数据看板',
    icon: 'DataAnalysis'
  },
  {
    path: '/content',
    title: '内容管理',
    children: [
      { path: '/content/knowledge', title: '知识体系' },
      { path: '/content/cards', title: '知识卡片' },
      { path: '/content/questions', title: '题目管理' },
      { path: '/content/ai-generate', title: 'AI内容生成' }
    ]
  },
  {
    path: '/user',
    title: '用户管理',
    children: [
      { path: '/user/list', title: '用户列表' },
      { path: '/user/notes', title: '笔记管理' }
    ]
  },
  {
    path: '/operation',
    title: '运营管理',
    children: [
      { path: '/operation/ad-slots', title: '广告位管理' },
      { path: '/operation/banners', title: '页面装饰' },
      { path: '/operation/points', title: '积分规则' },
      { path: '/operation/stationery', title: '文具管理' },
      { path: '/operation/levels', title: '等级体系' },
      { path: '/operation/achievements', title: '成就系统' },
      { path: '/operation/leaderboard', title: '排行榜' },
      { path: '/operation/limited-items', title: '限定道具' },
      { path: '/operation/messages/templates', title: '消息推送' }
    ]
  },
  {
    path: '/system',
    title: '系统配置',
    children: [
      { path: '/system/account/password', title: '账号设置' },
      { path: '/system/review-rules', title: '复习规则配置' },
      { path: '/system/audit-logs', title: '日志审计' }
    ]
  }
]

function isMenuActive(item: IMenuItem): boolean {
  if (item.children) {
    return item.children.some((child) => child.path === route.path)
  }
  return item.path === route.path
}

function isChildActive(path: string): boolean {
  return route.path === path
}

function handleMenuClick(item: IMenuItem) {
  if (item.children && item.children.length > 0) {
    router.push(item.children[0].path)
  } else if (item.path) {
    router.push(item.path)
  }
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-layout">
    <header class="app-layout__navbar">
      <div class="app-layout__logo">
        <el-icon :size="22" color="#D4916E"><DataBoard /></el-icon>
        <span class="app-layout__logo-text">知晓记</span>
        <span class="app-layout__logo-sub">管理后台</span>
      </div>
      <div class="app-layout__navbar-right">
        <el-dropdown trigger="click">
          <div class="app-layout__user">
            <el-avatar :size="32" icon="UserFilled" />
            <span class="app-layout__username">{{ userStore.adminInfo?.username || 'Admin' }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="router.push('/system/account/password')">
                <el-icon><Key /></el-icon>
                修改密码
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <div class="app-layout__body">
      <aside class="app-layout__sidebar">
        <div
          v-for="item in menuItems"
          :key="item.title"
          class="app-layout__menu-category"
        >
          <div
            class="app-layout__menu-item"
            :class="{
              'app-layout__menu-item--active': isMenuActive(item),
              'app-layout__menu-item--has-children': !!item.children
            }"
            @click="handleMenuClick(item)"
          >
            <span class="app-layout__menu-title">{{ item.title }}</span>
          </div>
          <template v-if="item.children">
            <div
              v-for="child in item.children"
              :key="child.path"
              class="app-layout__menu-sub"
              :class="{ 'app-layout__menu-sub--active': isChildActive(child.path) }"
              @click="router.push(child.path)"
            >
              {{ child.title }}
            </div>
          </template>
        </div>
      </aside>

      <main class="app-layout__content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--app-bg-color);

  &__navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--app-navbar-height);
    padding: 0 24px;
    background-color: #fff;
    border-bottom: 1px solid var(--app-border-color);
    flex-shrink: 0;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__logo-text {
    font-family: var(--app-font-heading);
    font-size: 18px;
    font-weight: 700;
    color: var(--app-primary-color);
  }

  &__logo-sub {
    font-family: var(--app-font-body);
    font-size: 13px;
    color: var(--app-text-secondary);
  }

  &__navbar-right {
    display: flex;
    align-items: center;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 8px;

    &:hover {
      background-color: var(--app-primary-light);
    }
  }

  &__username {
    font-size: 13px;
    color: var(--app-text-regular);
  }

  &__body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  &__sidebar {
    width: var(--app-sidebar-width);
    flex-shrink: 0;
    background-color: #fff;
    border-right: 1px solid var(--app-border-color);
    overflow-y: auto;
    padding: 4px 0;
  }

  &__menu-category {
    border-bottom: 1px solid var(--app-border-color);

    &:last-child {
      border-bottom: none;
    }
  }

  &__menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 20px;
    cursor: pointer;
    font-family: var(--app-font-heading);
    font-size: 14px;
    color: var(--app-text-regular);
    transition: all 0.2s;

    &:hover {
      background-color: var(--app-bg-color);
    }

    &--active {
      color: var(--app-primary-color);
      background-color: var(--app-primary-light);
      font-weight: 600;
    }
  }

  &__menu-title {
    flex: 1;
  }

  &__menu-sub {
    padding: 10px 20px 10px 40px;
    font-size: 13px;
    color: var(--app-text-secondary);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: var(--app-primary-color);
      background-color: var(--app-bg-color);
    }

    &--active {
      color: var(--app-primary-color);
      background-color: var(--app-primary-light);
      font-weight: 500;
    }
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    padding: 28px;
  }
}
</style>
