var authService = require('../../services/auth-service');

Page({
  data: {
    userInfo: {
      nickname: '',
      userId: '',
      avatar: '',
      level: 0,
      points: 0,
      learnedCards: 0
    }
  },

  onLoad() {
    this.loadUserProfile();
  },

  onShow() {
    var app = getApp();
    if (app.globalData.userInfo) {
      this.setUserData(app.globalData.userInfo);
    }
  },

  loadUserProfile() {
    var app = getApp();
    if (app.globalData.userInfo) {
      this.setUserData(app.globalData.userInfo);
    }
    app.loadUserInfo().then(function (user) {
      if (user) {
        this.setUserData(user);
      }
    }.bind(this));
  },

  setUserData(data) {
    this.setData({
      userInfo: {
        nickname: data.nickname || '',
        userId: data.id || '',
        avatar: data.avatarUrl || '',
        level: data.level || 0,
        points: data.points || 0,
        learnedCards: data.learnedCards || 0
      }
    });
  },

  onNavigate(e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({ url: url });
  },

  onEditProfile() {
    wx.navigateTo({
      url: '/pages/profile/edit-profile/edit-profile'
    });
  },

  onMenuItem(e) {
    var action = e.currentTarget.dataset.action;
    var routes = {
      'rank': '/pages/rank/rank',
      'achievements': '/pages/achievements/achievements',
      'learn-stats': '/pages/learn-stats/learn-stats',
      'wrong-questions': '/pages/wrong-questions/wrong-questions',
      'favorites': '/pages/favorites/favorites',
      'desk': '/pages/desk/desk'
    };
    var url = routes[action];
    if (url) {
      wx.navigateTo({ url: url });
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  },

  onSetting(e) {
    var action = e.currentTarget.dataset.action;
    var routes = {
      'settings': '/pages/profile/settings/settings',
      'theme': '/pages/settings/theme/theme',
      'review-plan': '/pages/settings/review-plan/review-plan',
      'notification': '/pages/settings/notification/notification',
      'account': '/pages/settings/account/account',
      'help': '/pages/settings/help/help',
      'about': '/pages/settings/about/about'
    };
    var url = routes[action];
    if (url) {
      wx.navigateTo({ url: url });
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  },

  onLogout() {
    var that = this;
    wx.showModal({
      title: '确认退出',
      content: '退出后需要重新登录',
      confirmColor: '#EF4444',
      success: function (res) {
        if (res.confirm) {
          authService.logout().then(function () {
            wx.reLaunch({
              url: '/pages/auth/login-guide/login-guide'
            });
          });
        }
      }
    });
  },

  onTabChange(e) {
    var index = e.detail.index;
    console.log('切换到 Tab:', index);
  }
});
