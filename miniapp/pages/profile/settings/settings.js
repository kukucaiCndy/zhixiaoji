Page({
  data: {
    userInfo: {
      nickname: 'Jesse',
      userId: '10086'
    }
  },

  onLoad() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    try {
      const app = getApp();
      if (app.globalData?.userInfo) {
        this.setData({ userInfo: app.globalData.userInfo });
      }
    } catch (e) {}
  },

  onBack() {
    wx.navigateBack();
  },

  onEditProfile() {
    wx.navigateTo({
      url: '/pages/profile/edit-profile/edit-profile'
    });
  },

  onSetting(e) {
    const action = e.currentTarget.dataset.action;
    const routes = {
      'home-layout': '/pages/settings/home-layout/home-layout',
      'review-plan': '/pages/settings/review-plan/review-plan',
      'notification': '/pages/settings/notification/notification',
      'messages': '/pages/settings/messages/messages',
      'account': '/pages/settings/account/account',
      'help': '/pages/settings/help/help',
      'about': '/pages/settings/about/about',
      'clear-cache': '/pages/settings/clear-cache/clear-cache'
    };
    const url = routes[action];
    if (url) {
      wx.navigateTo({ url });
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  }
});