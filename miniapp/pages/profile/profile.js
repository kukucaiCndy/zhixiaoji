const mockApi = require('../../services/monk-api');

Page({
  data: {
    userInfo: {
      nickname: 'Jesse',
      userId: '10086',
      avatar: '',
      level: 5,
      levelTitle: '知识探索者',
      nextLevelExp: 320,
      points: '1,280',
      streakDays: 12,
      completedCards: 156,
      accuracy: '67%',
      learnDays: 42,
      wrongCount: 23,
      favoriteCount: 15,
      stationeryCount: 8,
      pendingAchievements: '6项未达成'
    }
  },

  onLoad() {
    this.loadUserProfile();
  },

  async loadUserProfile() {
    try {
      const res = await mockApi.getUserInfo();
      if (res.code === 0) {
        const data = res.data;
        this.setData({
          userInfo: {
            nickname: data.nickname || 'Jesse',
            userId: data.userId || '10086',
            avatar: data.avatarUrl || '',
            level: data.level || 5,
            levelTitle: data.levelTitle || '知识探索者',
            nextLevelExp: data.nextLevelExp || 320,
            points: (data.points || 1280).toLocaleString(),
            streakDays: data.stats?.streakDays || 12,
            completedCards: data.stats?.completedCards || 156,
            accuracy: data.stats?.accuracy || '67%',
            learnDays: data.stats?.learnDays || 42,
            wrongCount: data.stats?.wrongCount || 23,
            favoriteCount: data.stats?.favoriteCount || 15,
            stationeryCount: data.stats?.stationeryCount || 8,
            pendingAchievements: data.stats?.pendingAchievements || '6项未达成'
          }
        });
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  },

  onNavigate(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },

  onEditProfile() {
    wx.navigateTo({
      url: '/pages/profile/edit-profile/edit-profile'
    });
  },

  onMenuItem(e) {
    const action = e.currentTarget.dataset.action;
    const routes = {
      'rank': '/pages/rank/rank',
      'achievements': '/pages/achievements/achievements',
      'learn-stats': '/pages/learn-stats/learn-stats',
      'wrong-questions': '/pages/wrong-questions/wrong-questions',
      'favorites': '/pages/favorites/favorites',
      'desk': '/pages/desk/desk'
    };
    const url = routes[action];
    if (url) {
      wx.navigateTo({ url });
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  },

  onSetting(e) {
    const action = e.currentTarget.dataset.action;
    const routes = {
      'settings': '/pages/profile/settings/settings',
      'theme': '/pages/settings/theme/theme',
      'review-plan': '/pages/settings/review-plan/review-plan',
      'notification': '/pages/settings/notification/notification',
      'account': '/pages/settings/account/account',
      'help': '/pages/settings/help/help',
      'about': '/pages/settings/about/about'
    };
    const url = routes[action];
    if (url) {
      wx.navigateTo({ url });
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  },

  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '退出后需要重新登录',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.reLaunch({
            url: '/pages/auth/login-guide/login-guide'
          });
        }
      }
    });
  },

  onTabChange(e) {
    const { index } = e.detail;
    console.log('切换到 Tab:', index);
  }
});