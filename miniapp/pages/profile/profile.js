const mockApi = require('../../services/monk-api');

Page({
  data: {
    userInfo: {
      nickname: 'Jesse',
      avatar: '',
      level: 5,
      points: 1280,
      learnDays: 36,
      mastered: 47
    }
  },

  onLoad() {
    this.loadUserProfile();
  },

  async loadUserProfile() {
    try {
      const res = await mockApi.getUserInfo();
      if (res.code === 0) {
        this.setData({
          userInfo: {
            nickname: res.data.nickname || 'Jesse',
            avatar: res.data.avatarUrl || '',
            level: res.data.level || 5,
            points: res.data.points || 1280,
            learnDays: res.data.stats?.learnDays || 36,
            mastered: res.data.stats?.learnedCards || 47
          }
        });
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  },

  onEditProfile() {
    wx.navigateTo({
      url: '/pages/profile/edit-profile/edit-profile'
    });
  },

  onMenuItem(e) {
    const action = e.currentTarget.dataset.action;
    const routes = {
      'learn-record': '/pages/learn-record/learn-record',
      'favorites': '/pages/favorites/favorites',
      'wrong-questions': '/pages/wrong-questions/wrong-questions',
      'achievements': '/pages/achievements/achievements',
      'desk': '/pages/desk/desk',
      'invite': '/pages/invite/invite'
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
      'notification': '/pages/settings/notification/notification',
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
