import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/login/LoginPage.vue'),
      meta: { title: '登录', noAuth: true }
    },
    {
      path: '/',
      component: () => import('@/pages/AppLayout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/pages/dashboard/DashboardPage.vue'),
          meta: { title: '数据看板', icon: 'DataAnalysis' }
        },
        {
          path: 'content/knowledge',
          name: 'Knowledge',
          component: () => import('@/pages/content/KnowledgePage.vue'),
          meta: { title: '知识体系', parent: '内容管理' }
        },
        {
          path: 'content/cards',
          name: 'CardList',
          component: () => import('@/pages/content/CardListPage.vue'),
          meta: { title: '知识卡片', parent: '内容管理' }
        },
        {
          path: 'content/cards/create',
          name: 'CardCreate',
          component: () => import('@/pages/content/CardEditPage.vue'),
          meta: { title: '新增卡片', parent: '内容管理' }
        },
        {
          path: 'content/cards/:id/edit',
          name: 'CardEdit',
          component: () => import('@/pages/content/CardEditPage.vue'),
          meta: { title: '编辑卡片', parent: '内容管理' }
        },
        {
          path: 'content/questions',
          name: 'QuestionList',
          component: () => import('@/pages/content/QuestionListPage.vue'),
          meta: { title: '题目管理', parent: '内容管理' }
        },
        {
          path: 'content/questions/create',
          name: 'QuestionCreate',
          component: () => import('@/pages/content/QuestionEditPage.vue'),
          meta: { title: '新增题目', parent: '内容管理' }
        },
        {
          path: 'content/questions/:id/edit',
          name: 'QuestionEdit',
          component: () => import('@/pages/content/QuestionEditPage.vue'),
          meta: { title: '编辑题目', parent: '内容管理' }
        },
        {
          path: 'content/questions/import',
          name: 'QuestionImport',
          component: () => import('@/pages/content/QuestionImportPage.vue'),
          meta: { title: '批量导入', parent: '内容管理' }
        },
        {
          path: 'content/ai-generate',
          name: 'AIGenerate',
          component: () => import('@/pages/content/AIGeneratePage.vue'),
          meta: { title: 'AI内容生成', parent: '内容管理' }
        },
        {
          path: 'user/list',
          name: 'UserList',
          component: () => import('@/pages/user/UserListPage.vue'),
          meta: { title: '用户列表', parent: '用户管理' }
        },
        {
          path: 'user/:id/detail',
          name: 'UserDetail',
          component: () => import('@/pages/user/UserDetailPage.vue'),
          meta: { title: '用户详情', parent: '用户管理' }
        },
        {
          path: 'user/notes',
          name: 'NoteList',
          component: () => import('@/pages/user/NoteListPage.vue'),
          meta: { title: '笔记管理', parent: '用户管理' }
        },
        {
          path: 'user/notes/:id',
          name: 'NoteDetail',
          component: () => import('@/pages/user/NoteDetailPage.vue'),
          meta: { title: '笔记详情', parent: '用户管理' }
        },
        {
          path: 'operation/ad-slots',
          name: 'AdSlots',
          component: () => import('@/pages/operation/AdSlotsPage.vue'),
          meta: { title: '广告位管理', parent: '运营管理' }
        },
        {
          path: 'operation/banners',
          name: 'Banners',
          component: () => import('@/pages/operation/BannersPage.vue'),
          meta: { title: 'Banner管理', parent: '运营管理' }
        },
        {
          path: 'operation/theme',
          name: 'ThemeConfig',
          component: () => import('@/pages/operation/ThemeConfigPage.vue'),
          meta: { title: '主题色配置', parent: '运营管理' }
        },
        {
          path: 'operation/home-modules',
          name: 'HomeModules',
          component: () => import('@/pages/operation/HomeModulesPage.vue'),
          meta: { title: '首页模块排序', parent: '运营管理' }
        },
        {
          path: 'operation/shortcuts',
          name: 'Shortcuts',
          component: () => import('@/pages/operation/ShortcutsPage.vue'),
          meta: { title: '快捷入口配置', parent: '运营管理' }
        },
        {
          path: 'operation/splash',
          name: 'SplashConfig',
          component: () => import('@/pages/operation/SplashConfigPage.vue'),
          meta: { title: '开屏页配置', parent: '运营管理' }
        },
        {
          path: 'operation/announcements',
          name: 'Announcements',
          component: () => import('@/pages/operation/AnnouncementsPage.vue'),
          meta: { title: '公告管理', parent: '运营管理' }
        },
        {
          path: 'operation/points',
          name: 'PointsRules',
          component: () => import('@/pages/operation/PointsRulesPage.vue'),
          meta: { title: '积分规则', parent: '运营管理' }
        },
        {
          path: 'operation/stationery',
          name: 'Stationery',
          component: () => import('@/pages/operation/StationeryPage.vue'),
          meta: { title: '文具管理', parent: '运营管理' }
        },
        {
          path: 'operation/levels',
          name: 'Levels',
          component: () => import('@/pages/operation/LevelsPage.vue'),
          meta: { title: '等级体系', parent: '运营管理' }
        },
        {
          path: 'operation/achievements',
          name: 'Achievements',
          component: () => import('@/pages/operation/AchievementsPage.vue'),
          meta: { title: '成就系统', parent: '运营管理' }
        },
        {
          path: 'operation/leaderboard',
          name: 'Leaderboard',
          component: () => import('@/pages/operation/LeaderboardPage.vue'),
          meta: { title: '排行榜', parent: '运营管理' }
        },
        {
          path: 'operation/limited-items',
          name: 'LimitedItems',
          component: () => import('@/pages/operation/LimitedItemsPage.vue'),
          meta: { title: '限定道具', parent: '运营管理' }
        },
        {
          path: 'operation/messages/templates',
          name: 'MessageTemplates',
          component: () => import('@/pages/operation/MessageTemplatesPage.vue'),
          meta: { title: '模板管理', parent: '消息推送' }
        },
        {
          path: 'operation/messages/settings',
          name: 'MessageSettings',
          component: () => import('@/pages/operation/MessageSettingsPage.vue'),
          meta: { title: '推送设置', parent: '消息推送' }
        },
        {
          path: 'operation/messages/manual',
          name: 'MessageManual',
          component: () => import('@/pages/operation/MessageManualPage.vue'),
          meta: { title: '手动推送', parent: '消息推送' }
        },
        {
          path: 'operation/messages/records',
          name: 'MessageRecords',
          component: () => import('@/pages/operation/MessageRecordsPage.vue'),
          meta: { title: '推送记录', parent: '消息推送' }
        },
        {
          path: 'system/account/password',
          name: 'ChangePassword',
          component: () => import('@/pages/system/ChangePasswordPage.vue'),
          meta: { title: '修改密码', parent: '账号设置' }
        },
        {
          path: 'system/account/phone',
          name: 'BindPhone',
          component: () => import('@/pages/system/BindPhonePage.vue'),
          meta: { title: '绑定手机号', parent: '账号设置' }
        },
        {
          path: 'system/account/login-logs',
          name: 'LoginLogs',
          component: () => import('@/pages/system/LoginLogsPage.vue'),
          meta: { title: '登录日志', parent: '账号设置' }
        },
        {
          path: 'system/review-rules',
          name: 'ReviewRules',
          component: () => import('@/pages/system/ReviewRulesPage.vue'),
          meta: { title: '复习规则配置', parent: '系统配置' }
        },
        {
          path: 'system/audit-logs',
          name: 'AuditLogs',
          component: () => import('@/pages/system/AuditLogsPage.vue'),
          meta: { title: '日志审计', parent: '系统配置' }
        }
      ]
    },
    {
      path: '/403',
      name: 'Forbidden',
      component: () => import('@/pages/error/Error403Page.vue'),
      meta: { title: '无权访问', noAuth: true }
    },
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/pages/error/Error404Page.vue'),
      meta: { title: '页面不存在', noAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (!to.meta.noAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    const title = (to.meta.title as string) || ''
    document.title = title ? `${title} - 知晓记管理后台` : '知晓记管理后台'
    next()
  }
})

export default router
