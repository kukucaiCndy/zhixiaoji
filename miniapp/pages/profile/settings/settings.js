Page({
  data: {
    userInfo: {
      nickname: 'Jesse',
      userId: '10086',
      avatarUrl: ''
    }
  },

  onLoad() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    try {
      var app = getApp();
      if (app.globalData && app.globalData.userInfo) {
        var rawId = app.globalData.userInfo.id || '';
        var shortId = rawId.indexOf('-') !== -1 ? rawId.slice(rawId.lastIndexOf('-') + 1) : rawId;
        this.setData({
          userInfo: {
            nickname: app.globalData.userInfo.nickname || '',
            userId: shortId,
            avatarUrl: app.globalData.userInfo.avatarUrl || ''
          }
        });
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
    const routes = {};
    const url = routes[action];
    if (url) {
      wx.navigateTo({ url });
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  }
});